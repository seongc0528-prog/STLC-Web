import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { NAV_SECTIONS } from "@/lib/nav";
import { SITE_URL } from "@/lib/site";

// 게시물이 올라오면 sitemap 에도 반영되도록 한 시간마다 다시 만든다
export const revalidate = 3600;

/**
 * /sitemap.xml — 검색엔진용. (사람이 보는 /sitemap 페이지와는 별개)
 * 로그인해야 보이는 메뉴는 크롤러가 로그인 화면으로 튕기므로 뺀다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...NAV_SECTIONS.flatMap((section) => section.items)
      .filter((item) => !item.requiresAuth)
      .map((item) => ({
        url: `${SITE_URL}${item.href}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];

  // 쿠키가 필요 없는 공개 조회라 서버용(쿠키) 클라이언트 대신 익명 클라이언트를 쓴다
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [{ data: sermons }, { data: notices }, { data: albums }, { data: bulletins }] =
    await Promise.all([
      supabase.from("sermons").select("id, service_type, published_at").eq("is_active", true),
      supabase.from("notices").select("id, created_at").eq("is_active", true),
      supabase.from("photo_albums").select("id, created_at").eq("is_active", true),
      supabase.from("bulletins").select("id, sunday_date").eq("is_active", true),
    ]);

  const entries = (
    rows: Record<string, string>[] | null,
    path: (row: Record<string, string>) => string,
    dateKey: string,
  ): MetadataRoute.Sitemap =>
    (rows ?? []).map((row) => ({
      url: `${SITE_URL}${path(row)}`,
      lastModified: row[dateKey] ?? undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...entries(
      sermons,
      (s) => `/tv/${s.service_type === "wednesday" ? "wednesday" : "sunday"}/${s.id}`,
      "published_at",
    ),
    ...entries(notices, (n) => `/support/news/${n.id}`, "created_at"),
    ...entries(albums, (a) => `/community/photos/${a.id}`, "created_at"),
    ...entries(bulletins, (b) => `/support/bulletin/${b.id}`, "sunday_date"),
  ];
}
