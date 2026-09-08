// Cloudflare caches range-request responses separately from full-object
// responses. Files touched by any Range request before the content-type
// fix (e.g. a PDF viewer's progressive load, or my own earlier curl
// testing) can still serve a stale "text/plain" response to Range requests
// even though a plain GET/HEAD now looks correct — which is exactly what
// broke Chrome's built-in PDF viewer here. Detecting which files are
// affected from the outside isn't reliable, so this just unconditionally
// re-uploads every file referenced by file_url/attachment_url/image_url
// columns under a brand-new path (a cache key Cloudflare has never seen)
// and updates the DB row, then removes the old object.

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

const MIME_TYPES = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" };
function guessContentType(objectPath) {
  const ext = objectPath.split(".").pop()?.toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

function parseBucketAndPath(publicUrl) {
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return { bucket: match[1], objectPath: decodeURIComponent(match[2]) };
}

async function rekey(bucket, objectPath) {
  const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(objectPath);
  if (downloadError) throw new Error(`download failed: ${downloadError.message}`);
  const buffer = Buffer.from(await blob.arrayBuffer());

  const ext = (objectPath.match(/\.[a-zA-Z0-9]+$/) ?? [""])[0];
  const dir = objectPath.split("/").slice(0, -1).join("/");
  const newPath = `${dir ? `${dir}/` : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(newPath, buffer, { contentType: guessContentType(objectPath) });
  if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

  await supabase.storage.from(bucket).remove([objectPath]);
  return supabase.storage.from(bucket).getPublicUrl(newPath).data.publicUrl;
}

async function fixColumn(table, column) {
  const { data, error } = await supabase.from(table).select(`id, ${column}`).not(column, "is", null);
  if (error) throw new Error(`select ${table} failed: ${error.message}`);

  let fixed = 0;
  for (const row of data) {
    const url = row[column];
    const parsed = parseBucketAndPath(url);
    if (!parsed) {
      console.warn(`  URL 파싱 실패, 건너뜀: ${url}`);
      continue;
    }
    const newUrl = await rekey(parsed.bucket, parsed.objectPath);
    const { error: updateError } = await supabase.from(table).update({ [column]: newUrl }).eq("id", row.id);
    if (updateError) throw new Error(`update ${table} failed: ${updateError.message}`);
    fixed++;
  }
  console.log(`${table}.${column}: ${data.length}건 중 ${fixed}건 재발급`);
}

async function fixPhotoItems() {
  // image_url and thumb_url point at the *same* underlying object (the
  // migration didn't generate separate thumbnails), so each row's file
  // must be rekeyed exactly once and both columns updated together —
  // otherwise the second column's pass tries to download an object the
  // first pass already deleted.
  const { data, error } = await supabase.from("photo_items").select("id, image_url, thumb_url, album_id");
  if (error) throw new Error(`select photo_items failed: ${error.message}`);

  const coverUpdates = new Map(); // album_id -> old cover url that needs the same new url
  let fixed = 0;
  for (const row of data) {
    const parsed = parseBucketAndPath(row.image_url);
    if (!parsed) {
      console.warn(`  URL 파싱 실패, 건너뜀: ${row.image_url}`);
      continue;
    }
    const newUrl = await rekey(parsed.bucket, parsed.objectPath);
    const { error: updateError } = await supabase
      .from("photo_items")
      .update({ image_url: newUrl, thumb_url: newUrl })
      .eq("id", row.id);
    if (updateError) throw new Error(`update photo_items failed: ${updateError.message}`);
    if (row.image_url === row.thumb_url) coverUpdates.set(row.album_id, { oldUrl: row.image_url, newUrl });
    fixed++;
  }
  console.log(`photo_items: ${data.length}건 중 ${fixed}건 재발급`);
  return coverUpdates;
}

async function fixAlbumCovers(coverUpdates) {
  const { data, error } = await supabase.from("photo_albums").select("id, cover_url");
  if (error) throw new Error(`select photo_albums failed: ${error.message}`);
  let fixed = 0;
  for (const album of data) {
    const match = coverUpdates.get(album.id);
    if (!match || match.oldUrl !== album.cover_url) continue;
    await supabase.from("photo_albums").update({ cover_url: match.newUrl }).eq("id", album.id);
    fixed++;
  }
  console.log(`photo_albums.cover_url: ${fixed}건 갱신 (photo_items 재발급과 동일 파일 재사용)`);
}

await fixColumn("sermons", "file_url");
await fixColumn("notices", "attachment_url");
const coverUpdates = await fixPhotoItems();
await fixAlbumCovers(coverUpdates);
