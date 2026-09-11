import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InstallPrompt } from "@/components/InstallPrompt";

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
  title: "Sydney The Lord's Church in Australia",
  description: "시드니 주님의 교회 (Sydney The Lord's Church in Australia) 공식 홈페이지",
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
