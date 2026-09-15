import type { Metadata } from "next";

// 로그인·회원가입 페이지는 클라이언트 컴포넌트라 metadata 를 여기서 준다
export const metadata: Metadata = {
  title: "회원 서비스",
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return children;
}
