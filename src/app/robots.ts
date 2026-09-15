import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 로그인·회원가입은 검색 결과에 나올 이유가 없다
      disallow: ["/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
