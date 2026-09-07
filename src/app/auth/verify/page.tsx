import Link from "next/link";

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900">이메일 인증 완료</h1>
      <p className="mt-2 text-sm text-gray-500">
        이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.
      </p>
      <Link
        href="/auth/login"
        className="mt-6 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        로그인하러 가기
      </Link>
    </main>
  );
}
