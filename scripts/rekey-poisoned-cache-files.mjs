// A handful of migrated files were curled directly (by me, during testing)
// before the content-type fix was applied, which caused Cloudflare's edge
// to cache a stale "text/plain" response for those specific URLs (up to
// 1h, per the bucket's cache-control: max-age=3600). The underlying
// storage object metadata is already correct — only those exact cached
// URLs are stale. Rather than wait out the TTL, this re-uploads every
// sermons.file_url / notices.attachment_url file under a brand-new path
// (fresh cache key) and updates the DB row to point at it, then removes
// the old (poisoned) object.

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

function parseBucketAndPath(publicUrl) {
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return { bucket: match[1], objectPath: decodeURIComponent(match[2]) };
}

async function isStale(url) {
  const res = await fetch(url, { method: "HEAD" });
  const contentType = res.headers.get("content-type") ?? "";
  return contentType.startsWith("text/plain");
}

async function rekey(bucket, objectPath) {
  const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(objectPath);
  if (downloadError) throw new Error(`download failed: ${downloadError.message}`);
  const buffer = Buffer.from(await blob.arrayBuffer());

  const ext = (objectPath.match(/\.[a-zA-Z0-9]+$/) ?? [""])[0];
  const dir = objectPath.split("/").slice(0, -1).join("/");
  const newPath = `${dir ? `${dir}/` : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const contentType = ext === ".pdf" ? "application/pdf" : blob.type || "application/octet-stream";
  const { error: uploadError } = await supabase.storage.from(bucket).upload(newPath, buffer, { contentType });
  if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

  await supabase.storage.from(bucket).remove([objectPath]);
  return supabase.storage.from(bucket).getPublicUrl(newPath).data.publicUrl;
}

async function fixColumn(table, column) {
  const { data, error } = await supabase.from(table).select(`id, ${column}`).not(column, "is", null);
  if (error) throw new Error(`select ${table} failed: ${error.message}`);

  let checked = 0;
  let fixed = 0;
  for (const row of data) {
    const url = row[column];
    checked++;
    if (!(await isStale(url))) continue;

    const parsed = parseBucketAndPath(url);
    if (!parsed) {
      console.warn(`  URL 파싱 실패, 건너뜀: ${url}`);
      continue;
    }
    const newUrl = await rekey(parsed.bucket, parsed.objectPath);
    const { error: updateError } = await supabase.from(table).update({ [column]: newUrl }).eq("id", row.id);
    if (updateError) throw new Error(`update ${table} failed: ${updateError.message}`);
    console.log(`  재발급: ${url} -> ${newUrl}`);
    fixed++;
  }
  console.log(`${table}.${column}: ${checked}건 확인, ${fixed}건 재발급`);
}

await fixColumn("sermons", "file_url");
await fixColumn("notices", "attachment_url");
