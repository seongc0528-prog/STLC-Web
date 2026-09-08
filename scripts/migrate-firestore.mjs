// One-time migration: Firestore (my_app1 / stlc-church-app) -> Supabase
//
// Usage:
//   node scripts/migrate-firestore.mjs           (aborts if target tables aren't empty)
//   node scripts/migrate-firestore.mjs --force    (migrates anyway)
//
// Reads secrets from supabase/keys/ (gitignored):
//   - a Firebase service account *.json file
//   - a plain-text file named "service_role" containing the Supabase service_role key
//
// Existing app users are NOT migrated (per decision: too few users to bother,
// self-signup with email verification is the new flow). Rows that need an
// author are attributed to the current admin account, with the original
// author's name preserved in the text.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const keysDir = path.join(rootDir, "supabase", "keys");
const FORCE = process.argv.includes("--force");

function readEnvLocal(key) {
  const content = readFileSync(path.join(rootDir, ".env.local"), "utf8");
  const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) throw new Error(`${key} not found in .env.local`);
  return match[1].trim();
}

function loadServiceAccount() {
  const file = readdirSync(keysDir).find((f) => f.endsWith(".json"));
  if (!file) throw new Error("No Firebase service account *.json found in supabase/keys/");
  return JSON.parse(readFileSync(path.join(keysDir, file), "utf8"));
}

function loadServiceRoleKey() {
  return readFileSync(path.join(keysDir, "service_role"), "utf8").trim();
}

function tsToIso(ts) {
  if (!ts) return new Date().toISOString();
  if (typeof ts.toDate === "function") return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

const serviceAccount = loadServiceAccount();
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
});
const db = getFirestore();
const bucket = getStorage().bucket();

const supabaseUrl = readEnvLocal("NEXT_PUBLIC_SUPABASE_URL");
const supabase = createClient(supabaseUrl, loadServiceRoleKey(), {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function insertChunked(table, rows, chunkSize = 50) {
  const inserted = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { data, error } = await supabase.from(table).insert(chunk).select();
    if (error) throw new Error(`insert into ${table} failed: ${error.message}`);
    inserted.push(...data);
  }
  return inserted;
}

/** Downloads a Firebase Storage file (from its download URL) and re-uploads
 *  it to a Supabase Storage bucket, returning the new public URL. Returns
 *  null (and logs a warning) if anything about the source file can't be read. */
async function migrateFile(downloadUrl, destBucket, destFolder) {
  if (!downloadUrl) return null;
  const match = downloadUrl.match(/\/o\/([^?]+)/);
  if (!match) {
    console.warn(`  (파일 경로 인식 실패, 원본 URL 그대로 둠: ${downloadUrl})`);
    return downloadUrl;
  }
  const srcPath = decodeURIComponent(match[1]);
  try {
    const [buffer] = await bucket.file(srcPath).download();
    const originalName = srcPath.split("/").pop();
    const ext = (originalName.match(/\.[a-zA-Z0-9]+$/) ?? [""])[0];
    const destPath = `${destFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const { error } = await supabase.storage.from(destBucket).upload(destPath, buffer, { upsert: true });
    if (error) throw error;
    return supabase.storage.from(destBucket).getPublicUrl(destPath).data.publicUrl;
  } catch (err) {
    console.warn(`  파일 이관 실패 (${srcPath}): ${err.message}`);
    return null;
  }
}

async function assertTablesEmpty() {
  const tables = ["sermons", "photo_albums", "photo_items", "photo_comments", "notices"];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) throw new Error(`count check on ${table} failed: ${error.message}`);
    if (count > 0 && !FORCE) {
      throw new Error(
        `${table} already has ${count} row(s). Re-running would duplicate data.\n` +
          `Pass --force if you really want to migrate again anyway.`,
      );
    }
  }
}

async function getAdminId() {
  const { data, error } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
  if (error) throw new Error(`profiles lookup failed: ${error.message}`);
  if (!data) throw new Error("No admin profile found — bootstrap an admin account first.");
  return data.id;
}

async function migrateChurchInfo() {
  const snap = await db.collection("church_info").limit(1).get();
  if (snap.empty) return console.log("church_info: 이관할 데이터 없음");
  const data = snap.docs[0].data();
  const { error } = await supabase
    .from("church_info")
    .update({
      sunday_service: data.Sunday ?? null,
      wednesday_service: data.Wednesday ?? null,
      address: data.venue ?? null,
    })
    .eq("id", 1);
  if (error) throw new Error(`church_info update failed: ${error.message}`);
  console.log("church_info: 이관 완료");
}

async function migrateSermons() {
  const snap = await db.collection("weekly").get();
  console.log(`sermons: weekly ${snap.size}건 발견`);
  const rows = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const detailSnap = await db.collection("weekly_detail").doc(doc.id).get();
    const detail = detailSnap.exists ? detailSnap.data() : {};
    const file_url = await migrateFile(detail.file_url, "public-assets", "sermons");
    rows.push({
      service_type: "sunday",
      title: data.title ?? "(제목 없음)",
      title_en: data.title_en ?? null,
      preacher: detail["ser-preacher"] ?? null,
      preacher_en: detail["ser-preacher_en"] ?? null,
      scripture: detail["ser-verse"] ?? null,
      scripture_en: detail["ser-verse_en"] ?? null,
      summary: detail["ser-summary"] ?? null,
      summary_en: detail["ser-summary_en"] ?? null,
      file_url,
      views: data.views ?? 0,
      is_active: data.isActive ?? true,
      published_at: tsToIso(data.registeredAt),
    });
  }
  await insertChunked("sermons", rows);
  console.log(`sermons: ${rows.length}건 이관 완료`);
}

async function migratePhotos(adminId) {
  const snap = await db.collection("photo").get();
  console.log(`photo_albums: photo ${snap.size}건 발견`);
  const idMap = new Map(); // old firestore doc id -> new supabase uuid

  for (const doc of snap.docs) {
    const data = doc.data();
    const [album] = await insertChunked("photo_albums", [
      {
        caption: data.caption ?? "(제목 없음)",
        author_id: adminId,
        views: data.views ?? 0,
        is_active: data.isActive ?? true,
        created_at: tsToIso(data.registeredAt),
      },
    ]);
    idMap.set(doc.id, album.id);

    const detailSnap = await db.collection("photo").doc(doc.id).collection("photo_detail").get();
    const picDocs = detailSnap.docs.sort((a, b) => (a.data().picture_id ?? "").localeCompare(b.data().picture_id ?? ""));
    const itemRows = [];
    for (let i = 0; i < picDocs.length; i++) {
      const picData = picDocs[i].data();
      const image_url = await migrateFile(picData.image_url, "member-uploads", `${adminId}/${doc.id}`);
      if (!image_url) continue;
      itemRows.push({ album_id: album.id, image_url, thumb_url: image_url, sort_order: i });
    }
    if (itemRows.length > 0) {
      await insertChunked("photo_items", itemRows);
      await supabase.from("photo_albums").update({ cover_url: itemRows[0].image_url }).eq("id", album.id);
    }
  }
  console.log(`photo_albums: ${idMap.size}건 이관 완료`);
  return idMap;
}

async function migratePhotoComments(adminId, albumIdMap) {
  const snap = await db.collection("photo_reply").get();
  console.log(`photo_comments: photo_reply ${snap.size}건 발견`);
  const rows = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const newAlbumId = albumIdMap.get(data.content_id);
    if (!newAlbumId) continue;
    rows.push({
      album_id: newAlbumId,
      author_id: adminId,
      content: `[${data.userName ?? "익명"}] ${data.content ?? ""}`,
      is_active: data.isActive ?? true,
      created_at: tsToIso(data.registeredAt),
    });
  }
  if (rows.length > 0) await insertChunked("photo_comments", rows);
  console.log(`photo_comments: ${rows.length}건 이관 완료`);
}

async function migrateNotices() {
  const snap = await db.collection("notice").get();
  console.log(`notices: notice ${snap.size}건 발견`);
  const rows = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const detailSnap = await db.collection("notice_detail").doc(doc.id).get();
    const detail = detailSnap.exists ? detailSnap.data() : {};
    const attachment_url = await migrateFile(detail.file_url, "admin-only-uploads", "notices");
    const authorNote = data.userName ? `[원작성자: ${data.userName}]\n\n` : "";
    rows.push({
      title: data.title ?? "(제목 없음)",
      content: `${authorNote}${detail.content ?? ""}`,
      attachment_url,
      pinned: false,
      views: data.views ?? 0,
      is_active: data.isActive ?? true,
      created_at: tsToIso(data.registeredAt),
    });
  }
  await insertChunked("notices", rows);
  console.log(`notices: ${rows.length}건 이관 완료`);
}

async function main() {
  await assertTablesEmpty();
  const adminId = await getAdminId();
  console.log(`관리자 계정으로 이관 데이터 귀속: ${adminId}`);

  await migrateChurchInfo();
  await migrateSermons();
  const albumIdMap = await migratePhotos(adminId);
  await migratePhotoComments(adminId, albumIdMap);
  await migrateNotices();

  console.log("\n마이그레이션 완료. (calendar / account_request / notice 댓글 / 기존 사용자 계정은 이관하지 않음)");
}

main().catch((err) => {
  console.error("마이그레이션 실패:", err.message);
  process.exit(1);
});
