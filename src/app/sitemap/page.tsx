import Link from "next/link";
import { NAV_SECTIONS } from "@/lib/nav";

export default function SitemapPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">사이트맵</h1>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <h2 className="mb-2 text-sm font-semibold text-gray-900">{section.label}</h2>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
                    {item.label}
                    {item.requiresAuth && <span className="ml-1 text-xs text-gray-400">(로그인)</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
