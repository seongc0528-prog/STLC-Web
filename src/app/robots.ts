import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 로그인·회원가입은 검색 결과에 나올 이유가 없고,
      // 행사 사진은 성도들의 얼굴이 담겨 있어 로그인한 사람만 본다
      disallow: ["/auth/", "/community/photos"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
