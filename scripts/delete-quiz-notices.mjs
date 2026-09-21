// 공지사항에 쌓인 성경 퀴즈 글을 일괄 삭제한다.
//
// 홈페이지에서 퀴즈를 올리고 댓글로 답을 받던 운영을 접기로 했다. 제목이
// "성경 단어 퀴즈 (…)" 또는 옛 제목 "그림연상 성경퀴즈 (…)" 인 글이 대상이다.
//
//   1. 지울 행을 JSON 으로 백업한다(scripts/backups/ — gitignore 되어 있다).
//   2. 첨부 파일을 Storage 에서 지운다. 행만 지우면 파일이 버킷에 남아 용량을 먹는다.
//   3. 행을 지운다. 댓글은 on delete cascade 로 함께 사라진다.
//
// 실행: node scripts/delete-quiz-notices.mjs            (먼저 무엇이 지워지는지 출력)
//       node scripts/delete-quiz-notices.mjs --apply    (실제 삭제)

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const supabaseUrl = readEnvLocal("NEXT_PUBLIC_SUPABASE_URL");
const supabase = createClient(
  supabaseUrl,
  readFileSync(path.join(keysDir, "service_role"), "utf8").trim(),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const TITLE_PATTERNS = ["성경 단어 퀴즈%", "그림연상 성경퀴즈%"];
const apply = process.argv.includes("--apply");

const { data: notices, error } = await supabase
  .from("notices")
  .select("*")
  .or(TITLE_PATTERNS.map((p) => `title.like.${p}`).join(","))
  .order("created_at", { ascending: false });
if (error) throw new Error(error.message);

console.log(`대상 공지 ${notices.length}건`);
for (const n of notices) console.log(`  - ${n.title}`);

if (notices.length === 0) process.exit(0);

// 댓글도 같이 백업한다 — 행을 지우면 cascade 로 사라져 되돌릴 수 없다.
const { data: comments, error: commentsError } = await supabase
  .from("notice_comments")
  .select("*")
  .in("notice_id", notices.map((n) => n.id));
if (commentsError) throw new Error(commentsError.message);
console.log(`함께 지워질 댓글 ${comments.length}건`);

/** 공개 URL → { bucket, path }. 우리 프로젝트의 Storage URL 이 아니면 null. */
function parseStorageUrl(url) {
  const marker = "/storage/v1/object/public/";
  const at = url?.indexOf?.(marker) ?? -1;
  if (!url?.startsWith(supabaseUrl) || at === -1) return null;
  const rest = url.slice(at + marker.length).split("?")[0];
  const slash = rest.indexOf("/");
  if (slash === -1) return null;
  return { bucket: rest.slice(0, slash), path: decodeURIComponent(rest.slice(slash + 1)) };
}

const attachments = notices
  .map((n) => parseStorageUrl(n.attachment_url))
  .filter((f) => f !== null);
console.log(`함께 지워질 첨부 파일 ${attachments.length}건`);

if (!apply) {
  console.log("\n미리보기입니다. 실제로 지우려면 --apply 를 붙여 다시 실행하세요.");
  process.exit(0);
}

const backupDir = path.join(__dirname, "backups");
mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `quiz-notices-${new Date().toISOString().slice(0, 10)}.json`);
writeFileSync(backupPath, JSON.stringify({ notices, comments }, null, 2), "utf8");
console.log(`백업: ${backupPath}`);

const byBucket = new Map();
for (const f of attachments) {
  if (!byBucket.has(f.bucket)) byBucket.set(f.bucket, []);
  byBucket.get(f.bucket).push(f.path);
}
for (const [bucket, paths] of byBucket) {
  const { error: removeError } = await supabase.storage.from(bucket).remove(paths);
  if (removeError) throw new Error(`${bucket} 파일 삭제 실패: ${removeError.message}`);
  console.log(`${bucket}: 파일 ${paths.length}건 삭제`);
}

const { error: deleteError } = await supabase
  .from("notices")
  .delete()
  .in("id", notices.map((n) => n.id));
if (deleteError) throw new Error(deleteError.message);
console.log(`공지 ${notices.length}건 삭제 완료`);
