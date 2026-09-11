// 설교 제목 끝의 "(YYMMDD)"는 실제 설교가 있었던 주일이고, published_at은
// Flutter 앱에서 DB에 올린 날짜다. 사용자에게 의미 있는 쪽은 앞의 것이므로
// 괄호 날짜를 제목에서 떼어내 published_at으로 옮긴다.
//
//   node scripts/fix-sermon-dates.mjs          # 드라이런 — 바뀔 내용만 출력
//   node scripts/fix-sermon-dates.mjs --apply  # 실제 반영
//
// 시각은 시드니 주일 오전 10시(=00:00 UTC)로 박는다. 어느 타임존에서 렌더링해도
// 시드니 기준 날짜가 유지되는 값이다.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");

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

/** 제목 끝의 (YYMMDD) 를 떼고 { title, date } 로 나눈다. 형식이 아니면 null. */
function splitTrailingDate(rawTitle) {
  const trimmed = rawTitle.trim();
  const match = trimmed.match(/^(.*?)\s*\((\d{6})\)$/s);
  if (!match) return null;

  const [, title, digits] = match;
  const year = 2000 + Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));

  // 실재하는 날짜인지 확인한다 — 251340 같은 오타를 조용히 통과시키지 않는다.
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }

  const pad = (n) => String(n).padStart(2, "0");
  return {
    title: title.trim(),
    date: `${year}-${pad(month)}-${pad(day)}`,
  };
}

const { data: sermons, error } = await supabase
  .from("sermons")
  .select("id, service_type, title, title_en, published_at")
  .order("published_at", { ascending: false });
if (error) throw new Error(error.message);

const updates = [];
const skipped = [];

for (const sermon of sermons) {
  const parsed = splitTrailingDate(sermon.title);
  if (!parsed) {
    skipped.push(sermon);
    continue;
  }

  const patch = {
    title: parsed.title,
    published_at: `${parsed.date}T10:00:00+10:00`,
  };

  // 영문 제목에도 같은 꼬리표가 붙어 있으면 함께 떼어낸다.
  const parsedEn = sermon.title_en ? splitTrailingDate(sermon.title_en) : null;
  if (parsedEn) patch.title_en = parsedEn.title;

  updates.push({ sermon, patch, date: parsed.date });
}

for (const { sermon, patch, date } of updates) {
  console.log(
    `${sermon.service_type}  ${sermon.published_at.slice(0, 10)} -> ${date}  ${JSON.stringify(sermon.title)} -> ${JSON.stringify(patch.title)}`,
  );
}

if (skipped.length > 0) {
  console.log(`\n형식이 달라 건너뛴 ${skipped.length}건:`);
  for (const sermon of skipped) {
    console.log(`  ${sermon.id}  ${JSON.stringify(sermon.title)}`);
  }
}

console.log(
  `\n대상 ${sermons.length}건 중 ${updates.length}건 변경, ${skipped.length}건 유지`,
);

if (!apply) {
  console.log("드라이런입니다. 반영하려면 --apply 를 붙여 다시 실행하세요.");
  process.exit(0);
}

for (const { sermon, patch } of updates) {
  const { error: updateError } = await supabase
    .from("sermons")
    .update(patch)
    .eq("id", sermon.id);
  if (updateError) {
    throw new Error(`${sermon.id} 갱신 실패: ${updateError.message}`);
  }
}

console.log(`${updates.length}건 반영 완료.`);
