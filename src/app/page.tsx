import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayInSydney, formatKoreanDate } from "@/lib/date";
import { FOUNDED_DATE, FOUNDED_YEAR } from "@/lib/church";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_URL,
  YOUTUBE_CHANNEL_URL,
} from "@/lib/site";
import { Icon, type IconName } from "@/components/icons";
import { SermonList } from "@/components/SermonList";
import { HomePopup } from "@/components/HomePopup";

const QUICK_LINKS: { icon: IconName; label: string; href: string }[] = [
  { icon: "user", label: "담임목사 소개", href: "/about/pastor" },
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

  const [{ data: church }, { data: verseData }, { data: sermons }, { data: notices }, { data: popups }] =
    await Promise.all([
      supabase.from("church_info").select("*").eq("id", 1).single(),
      supabase.rpc("daily_verse_for", { d: date }),
      supabase
        .from("sermons")
        .select("id, title, preacher, scripture, summary, video_url, published_at")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(3),
      supabase
        .from("notices")
        .select("id, title, created_at")
        .eq("is_active", true)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4),
      // 게시 기간(시드니 날짜) 안의 홈 팝업
      supabase
        .from("popups")
        .select("id, title, image_url, link_url")
        .eq("is_active", true)
        .lte("starts_on", date)
        .or(`ends_on.is.null,ends_on.gte.${date}`)
        .order("sort_order", { ascending: true })
        .order("starts_on", { ascending: false }),
    ]);

  const verse = Array.isArray(verseData) ? verseData[0] : verseData;

  // 구조화 데이터 — WebSite 는 구글 검색결과의 사이트 이름, Church 는 교회 정보(지식 패널)의 근거가 된다.
  // sameAs 로 유튜브 채널이 이 홈페이지와 같은 교회라는 걸 알린다.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: [SITE_NAME_EN, "시드니주님의교회", "STLC"],
      url: `${SITE_URL}/`,
      inLanguage: "ko-KR",
    },
    {
      "@context": "https://schema.org",
      "@type": "Church",
      "@id": `${SITE_URL}/#church`,
      name: SITE_NAME,
      alternateName: SITE_NAME_EN,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon-512.png`,
      image: `${SITE_URL}/videos/hero-poster.jpg`,
      description: SITE_DESCRIPTION,
      foundingDate: FOUNDED_DATE,
      sameAs: [YOUTUBE_CHANNEL_URL],
      ...(church?.address && {
        address: {
          "@type": "PostalAddress",
          streetAddress: church.address_en ?? church.address,
          addressLocality: "Sydney",
          addressRegion: "NSW",
          addressCountry: "AU",
        },
      }),
      ...(church?.latitude != null &&
        church?.longitude != null && {
          geo: { "@type": "GeoCoordinates", latitude: church.latitude, longitude: church.longitude },
        }),
      ...(church?.phone && { telephone: church.phone }),
      ...(church?.email && { email: church.email }),
    },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HomePopup popups={popups ?? []} today={date} />

      {/* ================= 히어로 ================= */}
      <section className="relative overflow-hidden bg-brand-800">
        {/* 오프닝 동영상 — 원본(src/assets/images/대문동영상.mp4)에서 음성을 빼고 압축해
            public/videos 에 둔다. 자동재생은 muted + playsInline 이어야 브라우저·iOS 에서 막히지 않는다.
            움직임 줄이기 설정 사용자에게는 영상 대신 첫 프레임(포스터)만 깔린다. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/videos/hero-poster.jpg)" }}
        />
        <video
          aria-hidden
          className="absolute inset-0 size-full object-cover motion-reduce:hidden"
          src="/videos/hero.mp4"
          poster="/videos/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* 영상은 원래 색 그대로 보이게 하고, 딥그린은 가장자리 테두리로만 남긴다.
            흰 글씨의 가독성은 아래 본문에 준 검정 그림자가 맡는다 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ boxShadow: "inset 0 0 4rem 0.75rem rgb(23 77 26 / 0.85)" }}
        />

        {/* text-shadow 는 상속되므로 여기 한 번 주면 제목·안내 문구·버튼 글씨에 모두 걸린다.
            밝은 수채화 위에서도 글자가 뜨도록 가까운 진한 그림자와 넓게 퍼지는 그림자를 겹친다 */}
        <div className="container-page relative flex min-h-[clamp(30rem,72vh,42rem)] flex-col justify-center py-24 text-center [text-shadow:0_1px_2px_rgb(0_0_0/0.9),0_2px_12px_rgb(0_0_0/0.7)]">
          {/* 좁은 화면에서는 "·" 자리에서 두 줄로 나누고 자간을 줄여 교회 이름이 한 줄에 들어가게 한다 —
              그대로 두면 "CHURCH / IN AUSTRALIA"처럼 이름 중간이 끊긴다 */}
          <p className="eyebrow animate-rise font-semibold text-white max-sm:tracking-[0.16em]">
            Since {FOUNDED_YEAR}
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            Sydney The Lord&apos;s Church in Australia
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
            className="mx-auto mt-7 max-w-xl animate-rise break-keep text-sm font-medium leading-relaxed text-white sm:text-base"
          >
            {/* 좁은 화면에서는 <br>이 숨어서 줄이 이어지므로 공백을 따로 넣는다 —
                JSX는 줄 끝 공백을 지워 "곳,시드니"처럼 붙어 버린다 */}
            누구든지 처음 오신 분도 편안하게 예배드릴 수 있는 곳,{" "}
            <br className="hidden sm:block" />
            시드니 주님의 교회에 오신 것을 환영합니다.
          </p>

          <p
            style={{ animationDelay: "220ms" }}
            className="mt-4 animate-rise font-serif text-xs font-semibold tracking-widest text-white"
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

        {/* 유튜브 채널 바로가기 — 가운데 문구·버튼과 시선을 다투지 않게 영상 왼쪽 아래 구석에 둔다.
            좁은 화면에서는 한쪽으로 치우치면 어색해서 가운데로 옮긴다.
            위 본문의 text-shadow 밖이라 반투명 유리 배경 위 글씨가 번지지 않는다 */}
        <div className="container-page pointer-events-none absolute inset-x-0 bottom-6 flex justify-center sm:bottom-8 sm:justify-start">
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener"
            aria-label="유튜브 채널 바로가기 (새 창에서 열림)"
            style={{ animationDelay: "380ms" }}
            className="group pointer-events-auto inline-flex animate-rise items-center gap-3 rounded-full border border-white/20 bg-black/40 py-2 pl-2.5 pr-4 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-black/55"
          >
            {/* 유튜브 로고 마크 — 브랜드 색(#FF0000)은 바꾸지 않는다 */}
            <svg viewBox="0 0 28 20" aria-hidden="true" className="h-5 w-7 shrink-0">
              <rect width="28" height="20" rx="5" fill="#FF0000" />
              <path d="M11.5 5.5v9l7.5-4.5z" fill="#fff" />
            </svg>
            유튜브 채널 바로가기
            <Icon
              name="arrowRight"
              className="size-4 -rotate-45 opacity-80 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            />
          </a>
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
              <p className="eyebrow">Sermons</p>
              <h2 className="display rule mt-2 text-2xl md:text-3xl">최근 설교</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener"
                className="btn btn-outline inline-flex items-center gap-2"
              >
                <Icon name="play" className="size-4" />
                유튜브 채널
              </a>
              <Link href="/tv/sunday" className="btn btn-outline">
                전체 보기
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <SermonList sermons={sermons ?? []} basePath="/tv/sunday" />
          </div>
        </div>
      </section>

      {/* ================= 공지사항 (게시된 글이 있을 때만) ================= */}
      {notices && notices.length > 0 && (
        <section className="container-page py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Notice</p>
              <h2 className="display rule mt-2 text-2xl md:text-3xl">공지사항</h2>
            </div>
            <Link href="/support/news" className="btn btn-outline">
              전체 보기
            </Link>
          </div>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/support/news/${notice.id}`}
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

      {/* ================= 처음 오셨나요 CTA =================
          딥그린 밴드였으나 바로 아래 푸터도 딥그린이라 어두운 초록이 연달아 겹쳤다.
          위쪽 예배 안내·오늘의 말씀과 같은 밝은 계열로 맞추고, 옅은 브랜드 틴트로만
          앞 섹션(흰색)과 구분한다. */}
      <section className="border-t border-line bg-brand-50">
        <div className="container-page flex flex-col items-center py-20 text-center md:py-24">
          <span className="flex size-14 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft">
            <Icon name="cross" className="size-7" />
          </span>
          <p className="eyebrow mt-6">Welcome</p>
          <h2 className="display rule rule-center mt-2 text-2xl text-ink md:text-3xl">
            처음 오셨나요?
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-muted">
            새가족으로 등록하시면 교회 생활 전반을 안내해 드립니다.
            예배·교육·공동체에 대해 궁금한 점은 언제든 문의해 주세요.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/auth/signup" className="btn btn-primary">
              회원가입
            </Link>
            <Link href="/about/location" className="btn btn-outline">
              오시는 길
            </Link>
          </div>
        </div>
      </section>

      {/* 전체 메뉴 그리드는 바로 아래 푸터가 같은 내용을 그대로 들고 있어서 뺐다.
          전 페이지에 깔리는 푸터 쪽을 단일 출처로 삼는다. */}
    </main>
  );
}
