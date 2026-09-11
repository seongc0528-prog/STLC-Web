import Link from "next/link";
import { NAV_SECTIONS } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { todayInSydney, formatKoreanDate } from "@/lib/date";
import { FOUNDED_YEAR } from "@/lib/church";
import { Icon, type IconName } from "@/components/icons";
import { SermonList } from "@/components/SermonList";

const QUICK_LINKS: { icon: IconName; label: string; href: string }[] = [
  { icon: "user", label: "위임목사 소개", href: "/about/pastor" },
  { icon: "clock", label: "예배 안내", href: "/about/worship" },
  { icon: "play", label: "주일 설교", href: "/tv/sunday" },
  { icon: "music", label: "찬양", href: "/tv/praise" },
  { icon: "document", label: "주보", href: "/support/bulletin" },
  { icon: "image", label: "행사 사진", href: "/community/photos" },
  { icon: "heart", label: "온라인 헌금", href: "/support/donate" },
  { icon: "pin", label: "오시는 길", href: "/about/location" },
];

export default async function Home() {
  const supabase = await createClient();
  const date = todayInSydney();

  const [{ data: church }, { data: verseData }, { data: sermons }, { data: notices }] =
    await Promise.all([
      supabase.from("church_info").select("*").eq("id", 1).single(),
      supabase.rpc("daily_verse_for", { d: date }),
      supabase
        .from("sermons")
        .select("id, title, preacher, scripture, summary, video_url, published_at")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(3),
      // notices는 로그인 사용자만 조회 가능(RLS) — 비로그인일 땐 빈 배열이 와서 섹션이 숨겨진다
      supabase
        .from("notices")
        .select("id, title, created_at")
        .eq("is_active", true)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const verse = Array.isArray(verseData) ? verseData[0] : verseData;

  return (
    <main>
      {/* ================= 히어로 ================= */}
      <section className="relative overflow-hidden bg-brand-800">
        {/* 오프닝 동영상 삽입 위치 — <video> 를 이 자리에 absolute inset-0 object-cover 로 넣으면
            아래 그라데이션 오버레이가 그대로 가독성을 잡아준다. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60rem 40rem at 75% 15%, #2e7d32 0%, transparent 60%), radial-gradient(40rem 30rem at 10% 90%, #174d1a 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-900/60 to-transparent"
        />

        <div className="container-page relative flex min-h-[clamp(30rem,72vh,42rem)] flex-col justify-center py-24 text-center">
          <p className="eyebrow eyebrow-on-dark animate-rise">
            Since {FOUNDED_YEAR} · Sydney The Lord&apos;s Church in Australia
          </p>

          <h1
            style={{ animationDelay: "80ms" }}
            className="display mt-6 animate-rise text-3xl text-white sm:text-4xl md:text-5xl md:leading-[1.3]"
          >
            {/* 줄바꿈을 직접 잡는다 — 자동 줄바꿈에 맡기면 좁은 화면에서
                "나눔과 섬김과 좋 / 은 만남이 있는"처럼 단어 중간이 끊긴다.
                sm:hidden 인 <br>은 넓은 화면에서 display:none 이라 줄을 바꾸지 않는다 */}
            나눔과 섬김,
            <br className="sm:hidden" />{" "}
            좋은 만남이 있는
            <br />
            시드니 주님의
            <br className="sm:hidden" />{" "}
            교회입니다.
          </h1>

          <p
            style={{ animationDelay: "160ms" }}
            className="mx-auto mt-7 max-w-xl animate-rise text-sm leading-relaxed text-brand-100 sm:text-base"
          >
            누구든지 처음 오신 분도 편안하게 예배드릴 수 있는 곳,
            <br className="hidden sm:block" />
            시드니 주님의 교회에 오신 것을 환영합니다.
          </p>

          <p
            style={{ animationDelay: "220ms" }}
            className="mt-4 animate-rise font-serif text-xs tracking-widest text-brand-300"
          >
            요한복음 4장 24절
          </p>

          <div
            style={{ animationDelay: "300ms" }}
            className="mt-10 flex animate-rise flex-wrap justify-center gap-3"
          >
            <Link href="/about/worship" className="btn btn-primary">
              예배 안내
            </Link>
            <Link href="/tv/sunday" className="btn btn-ghost-light">
              최근 설교 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 퀵메뉴 ================= */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid grid-cols-4 gap-px overflow-hidden bg-line sm:grid-cols-4 lg:grid-cols-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col items-center gap-3 bg-white px-2 py-7 transition hover:bg-brand-50"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={link.icon} className="size-5" />
              </span>
              <span className="text-center text-xs font-medium text-ink-soft transition group-hover:text-brand-600">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 예배 안내 + 오늘의 말씀 ================= */}
      <section className="container-page py-20 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* 예배 시간 */}
          <div>
            <p className="eyebrow">Worship</p>
            <h2 className="display rule mt-2 text-2xl md:text-3xl">예배 안내</h2>
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              말씀과 찬양으로 함께 드리는 예배입니다. 처음 방문하시는 분은 예배 20분 전에
              오시면 안내를 받으실 수 있습니다.
            </p>

            <dl className="mt-8 space-y-3">
              {[
                { label: "주일 예배", en: "Sunday", value: church?.sunday_service },
                { label: "수요 예배", en: "Wednesday", value: church?.wednesday_service },
              ].map((row) => (
                <div
                  key={row.label}
                  className="card card-hover flex items-center justify-between gap-4 px-6 py-5"
                >
                  <div>
                    <dt className="font-serif text-base font-semibold text-ink">{row.label}</dt>
                    <p className="eyebrow mt-1 text-[0.5625rem]">{row.en}</p>
                  </div>
                  <dd className="text-right text-sm font-medium text-brand-600">
                    {row.value ?? "정보 준비 중입니다."}
                  </dd>
                </div>
              ))}
            </dl>

            {church?.address && (
              <div className="mt-4 flex items-start gap-3 rounded-card bg-brand-50 px-6 py-5">
                <Icon name="pin" className="mt-0.5 size-5 shrink-0 text-brand-600" />
                <div className="text-sm">
                  <p className="text-ink">{church.address}</p>
                  <Link
                    href="/about/location"
                    className="mt-1 inline-flex items-center gap-1 text-brand-600 transition hover:gap-2"
                  >
                    오시는 길 <Icon name="arrowRight" className="size-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 오늘의 말씀 */}
          <div>
            <p className="eyebrow">Daily Verse</p>
            <h2 className="display rule mt-2 text-2xl md:text-3xl">오늘의 말씀</h2>

            <article className="card mt-6 overflow-hidden">
              <div className="border-b border-line bg-cream-200 px-7 py-4">
                <p className="text-xs text-ink-muted">{formatKoreanDate(date)}</p>
              </div>
              <div className="px-7 py-10 md:px-9 md:py-12">
                {verse ? (
                  <>
                    <Icon name="book" className="size-7 text-brand-300" />
                    <p className="display mt-6 text-lg leading-[1.9] text-ink md:text-xl">
                      {verse.text_kr}
                    </p>
                    {verse.text_en && (
                      <p className="mt-6 text-sm leading-relaxed text-ink-muted">{verse.text_en}</p>
                    )}
                    <p className="eyebrow mt-9">
                      {verse.type === "quote" ? "Quote" : "Bible"}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">등록된 말씀이 없습니다.</p>
                )}
              </div>
            </article>

            <Link
              href="/daily-verse"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand-600 transition hover:gap-2.5"
            >
              말씀 전체 보기 <Icon name="arrowRight" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 최근 설교 ================= */}
      <section className="border-y border-line bg-white py-20 md:py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Joyful TV</p>
              <h2 className="display rule mt-2 text-2xl md:text-3xl">최근 설교</h2>
            </div>
            <Link href="/tv/sunday" className="btn btn-outline">
              전체 보기
            </Link>
          </div>

          <div className="mt-10">
            <SermonList sermons={sermons ?? []} basePath="/tv/sunday" />
          </div>
        </div>
      </section>

      {/* ================= 교회 소식 (로그인 시 노출) ================= */}
      {notices && notices.length > 0 && (
        <section className="container-page py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Notice</p>
              <h2 className="display rule mt-2 text-2xl md:text-3xl">교회 소식</h2>
            </div>
            <Link href="/support/news" className="btn btn-outline">
              전체 보기
            </Link>
          </div>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href="/support/news"
                  className="group flex items-center justify-between gap-6 py-5 transition"
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <Icon name="megaphone" className="size-4 shrink-0 text-brand-400" />
                    <span className="truncate text-sm text-ink transition group-hover:text-brand-600">
                      {notice.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= 처음 오셨나요 CTA ================= */}
      <section className="relative overflow-hidden bg-brand-600">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(35rem 25rem at 85% 0%, #2e7d32 0%, transparent 65%)",
          }}
        />
        <div className="container-page relative flex flex-col items-center py-20 text-center md:py-24">
          <Icon name="cross" className="size-8 text-brand-300" />
          <h2 className="display rule rule-center mt-6 text-2xl text-white md:text-3xl">
            처음 오셨나요?
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-brand-100">
            새가족으로 등록하시면 교회 생활 전반을 안내해 드립니다.
            예배·교육·공동체에 대해 궁금한 점은 언제든 문의해 주세요.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="btn bg-white text-brand-700 hover:bg-brand-50"
            >
              회원가입
            </Link>
            <Link href="/about/location" className="btn btn-ghost-light">
              오시는 길
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 전체 메뉴 ================= */}
      <section className="container-page py-20 md:py-24">
        <p className="eyebrow">Sitemap</p>
        <h2 className="display rule mt-2 text-2xl md:text-3xl">전체 메뉴</h2>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="eyebrow mb-2">{section.labelEn}</p>
              <h3 className="mb-4 border-b border-line pb-3 font-serif text-base font-semibold text-ink">
                {section.label}
              </h3>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-ink-muted transition hover:text-brand-600"
                    >
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
