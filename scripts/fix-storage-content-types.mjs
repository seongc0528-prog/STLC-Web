// One-time repair: the migration script uploaded files without a contentType,
// so Supabase Storage served everything as text/plain. This walks the
// buckets touched by the migration and re-uploads each object with the
// correct contentType inferred from its extension.

import { readFileSync } from "node:fs";
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

const MIME_TYPES = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  hwp: "application/x-hwp",
};

function guessContentType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

async function listAllFiles(bucket, prefix = "") {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw new Error(`list ${bucket}/${prefix} failed: ${error.message}`);
  let files = [];
  for (const entry of data) {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      // folder (no id) -> recurse
      files = files.concat(await listAllFiles(bucket, fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function fixBucket(bucket) {
  const files = await listAllFiles(bucket);
  console.log(`${bucket}: ${files.length}개 파일 발견`);
  let fixed = 0;
  for (const filePath of files) {
    const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(filePath);
    if (downloadError) {
      console.warn(`  다운로드 실패 (${filePath}): ${downloadError.message}`);
      continue;
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    const contentType = guessContentType(filePath);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, { upsert: true, contentType });
    if (uploadError) {
      console.warn(`  재업로드 실패 (${filePath}): ${uploadError.message}`);
      continue;
    }
    fixed++;
  }
  console.log(`${bucket}: ${fixed}/${files.length}개 content-type 수정 완료`);
}

for (const bucket of ["public-assets", "admin-only-uploads", "member-uploads"]) {
  await fixBucket(bucket);
}
