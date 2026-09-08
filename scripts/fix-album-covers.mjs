// photo_albums.cover_url still points at the pre-rekey (now-deleted) file
// for every album, because the previous script's old-url-to-new-url
// matching logic had a bug (it only tracked the last-processed item per
// album, not necessarily the sort_order=0 one, so nothing matched). This
// just resets every album's cover_url to its current sort_order=0 (or
// first available) photo_item.image_url.

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

const { data: albums, error } = await supabase.from("photo_albums").select("id");
if (error) throw new Error(error.message);

let fixed = 0;
for (const album of albums) {
  const { data: items, error: itemsError } = await supabase
    .from("photo_items")
    .select("image_url")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true })
    .limit(1);
  if (itemsError) throw new Error(itemsError.message);
  const cover_url = items[0]?.image_url ?? null;
  await supabase.from("photo_albums").update({ cover_url }).eq("id", album.id);
  fixed++;
}
console.log(`photo_albums.cover_url: ${fixed}개 앨범 갱신`);
