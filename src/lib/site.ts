/**
 * 검색엔진·공유 미리보기에 쓰는 사이트 기본 정보.
 *
 * SITE_URL 은 canonical·sitemap·og:url 의 기준이 된다. 커스텀 도메인을 붙이면
 * Vercel 환경변수 NEXT_PUBLIC_SITE_URL 만 바꾸면 된다(끝 슬래시 없이).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://stlc-web.vercel.app").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "시드니 주님의 교회";
export const SITE_NAME_EN = "Sydney The Lord's Church in Australia";

export const SITE_DESCRIPTION =
  "시드니 주님의 교회(Sydney The Lord's Church in Australia) 공식 홈페이지입니다. 호주 시드니의 한인 교회로 주일·수요 예배 안내, 설교, 주보, 교회 소식을 전합니다.";

/** 교회 공식 유튜브 채널 — 헤더·푸터·홈 설교 섹션과 구조화 데이터(sameAs)에 쓴다. */
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@-sydneythelordschurch9847";
