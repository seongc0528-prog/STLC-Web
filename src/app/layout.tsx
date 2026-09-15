import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_EN, SITE_URL } from "@/lib/site";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // 페이지가 title 만 주면 "담임목사 소개 | 시드니 주님의 교회" 가 된다.
  // 홈(default)에는 한글·영문 이름을 모두 넣어 어느 쪽으로 검색해도 제목에 걸리게 한다.
  title: {
    default: `${SITE_NAME} | ${SITE_NAME_EN}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    SITE_NAME,
    "시드니주님의교회",
    SITE_NAME_EN,
    "Sydney The Lord's Church",
    "시드니 한인교회",
    "시드니 교회",
    "호주 한인교회",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    // og:title·og:description 은 일부러 비워 둔다 — 여기 고정하면 모든 하위 페이지가 홈 제목으로
    // 공유된다. 비어 있으면 카카오톡·페이스북 미리보기가 페이지마다의 <title>·description 을 쓴다.
    images: [{ url: "/videos/hero-poster.jpg", width: 1280, height: 720, alt: SITE_NAME }],
  },
  // 구글 서치 콘솔 "HTML 태그" 소유권 확인 값. Vercel 환경변수로 넣는다.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    // iOS 는 apple-touch-icon 으로 SVG 를 받지 않는다. PNG 를 주지 않으면
    // 홈 화면에 아이콘 대신 페이지 스크린샷이 박힌다.
    // PNG 는 `node scripts/generate-icons.mjs` 로 icon.svg 에서 굽는다.
    apple: "/icon-180.png",
  },
};

export const viewport = {
  themeColor: "#1B5E20",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${notoSerifKr.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* 크로미움은 페이지 로드 직후 beforeinstallprompt 를 한 번 쏘고 마는데,
            그 시점이 리액트 하이드레이션보다 빠를 때가 있다. InstallPrompt 가
            리스너를 붙이기 전에 지나가버리면 설치 배너가 영영 안 뜨므로,
            여기서 먼저 잡아두고 컴포넌트가 읽어가게 한다.
            읽는 쪽은 src/lib/installPrompt.ts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function publish(e) {
                  window.__stlcInstallPrompt = e;
                  window.dispatchEvent(new Event('stlc:installpromptready'));
                }
                window.addEventListener('beforeinstallprompt', function (e) {
                  e.preventDefault();
                  publish(e);
                });
                window.addEventListener('appinstalled', function () {
                  publish(null);
                });
              })();
            `,
          }}
        />
        <InstallPrompt />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
