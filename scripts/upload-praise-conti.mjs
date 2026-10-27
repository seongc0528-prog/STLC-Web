// extract-praise-conti.py 가 만든 콘티 PPTX와 곡 목록을 홈페이지에 올린다.
//
//   1. <폴더>/<YYMMDD>.json 을 읽는다. 곡 제목(title)이 비어 있으면 그 주는 건너뛴다
//      — 제목은 가사판 이미지를 보고 사람이 채워 넣는 값이다.
//   2. 이미 올라간 주일(service_date)이면 건너뛴다. 다시 돌려도 중복되지 않는다.
//   3. PPTX 를 public-assets/praise_setlists/ 에 올리고 praise_setlists 행을 넣는다.
//      파일 이름은 관리자 페이지(uploadFile)와 같은 규칙으로 무작위로 짓는다 —
//      Storage 키가 한글·공백을 받지 않기 때문이다.
//
// 실행: node scripts/upload-praise-conti.mjs <폴더>            (올릴 목록만 출력)
//       node scripts/upload-praise-conti.mjs <폴더> --apply    (실제 업로드)

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const keysDir = path.join(rootDir, "supabase", "keys");

function readEnvLocal(key) {
  const content = readFileSync(path.join(rootDir, ".env.local"), "utf8");
  return content.match(new RegExp(`^${key}=(.*)$`, "m"))[1].trim();
}

const supabase = createClient(
  readEnvLocal("NEXT_PUBLIC_SUPABASE_URL"),
  readFileSync(path.join(keysDir, "service_role"), "utf8").trim(),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const dir = args.find((a) => !a.startsWith("--"));
if (!dir) {
  console.error("콘티 폴더를 지정하세요: node scripts/upload-praise-conti.mjs <폴더> [--apply]");
  process.exit(1);
}

const BUCKET = "public-assets";
const FOLDER = "praise_setlists";

const metas = readdirSync(dir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(readFileSync(path.join(dir, name), "utf8")))
  .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));

const { data: existing, error: existingError } = await supabase
  .from("praise_setlists")
  .select("service_date");
if (existingError) throw new Error(existingError.message);
const uploaded = new Set(existing.map((row) => row.service_date));

const pending = [];
for (const meta of metas) {
  const missing = meta.songs.filter((song) => !song.title);
  if (missing.length > 0) {
    console.log(`${meta.serviceDate}  건너뜀 — 제목이 비어 있는 곡 ${missing.length}개`);
    continue;
  }
  if (uploaded.has(meta.serviceDate)) {
    console.log(`${meta.serviceDate}  건너뜀 — 이미 올라가 있음`);
    continue;
  }
  pending.push(meta);
  console.log(`${meta.serviceDate}  ${meta.title}`);
  for (const song of meta.songs) console.log(`    - ${song.title}`);
}

if (pending.length === 0) {
  console.log("\n올릴 콘티가 없습니다.");
  process.exit(0);
}

if (!apply) {
  console.log(`\n미리보기입니다. ${pending.length}개를 올리려면 --apply 를 붙여 다시 실행하세요.`);
  process.exit(0);
}

for (const meta of pending) {
  const file = readFileSync(path.join(dir, meta.file));
  const key = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pptx`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(key, file, {
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
  if (uploadError) throw new Error(`${meta.serviceDate} 업로드 실패: ${uploadError.message}`);
  const fileUrl = supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;

  const { error: insertError } = await supabase.from("praise_setlists").insert({
    service_date: meta.serviceDate,
    title: meta.title,
    songs: meta.songs.map((song) => song.title).join("\n"),
    file_url: fileUrl,
    is_active: true,
  });
  if (insertError) {
    // 행을 못 넣었으면 방금 올린 파일은 아무도 못 찾으므로 바로 치운다.
    await supabase.storage.from(BUCKET).remove([key]);
    throw new Error(`${meta.serviceDate} 저장 실패: ${insertError.message}`);
  }
  console.log(`${meta.serviceDate} 올림 (${(file.length / 1024 / 1024).toFixed(1)}MB)`);
}
