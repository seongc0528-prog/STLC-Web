"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/supabase/storage";

export function NewAlbumForm() {
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("사진을 1장 이상 선택해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("로그인이 필요합니다.");

      const { data: album, error: albumError } = await supabase
        .from("photo_albums")
        .insert({ caption, author_id: userData.user.id })
        .select()
        .single();
      if (albumError) throw albumError;

      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile("member-uploads", file, userData.user.id);
        urls.push(url);
      }

      const { error: itemsError } = await supabase.from("photo_items").insert(
        urls.map((url, i) => ({ album_id: album.id, image_url: url, thumb_url: url, sort_order: i })),
      );
      if (itemsError) throw itemsError;

      await supabase.from("photo_albums").update({ cover_url: urls[0] }).eq("id", album.id);

      setCaption("");
      setFiles(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 rounded border border-gray-200 p-4">
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="앨범 캡션"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "업로드 중..." : "앨범 만들기"}
      </button>
    </form>
  );
}
