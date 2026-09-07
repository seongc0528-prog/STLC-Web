import Link from "next/link";
import { NAV_SECTIONS } from "@/lib/nav";

export default function Home() {
  return (
    <main>
      <section className="flex flex-col items-center justify-center gap-4 border-b border-gray-200 bg-gray-900 px-4 py-24 text-center text-white">
        {/* 오프닝 동영상 삽입 위치 */}
        <h1 className="text-3xl font-semibold">Sydney The Lord&apos;s Church</h1>
        <p className="text-gray-300">시드니한인교회에 오신 것을 환영합니다</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <h2 className="mb-3 text-sm font-semibold text-gray-900">{section.label}</h2>
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-gray-600 hover:text-gray-900">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
