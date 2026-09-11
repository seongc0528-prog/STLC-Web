import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { Icon } from "@/components/icons";
import { SENIOR_PASTOR, type CareerEntry } from "@/lib/pastor";
import pastorPhoto from "@/assets/images/위임목사.jpg";

/** 빈 줄로 나뉜 본문을 문단 배열로. DB의 bio를 인사말로 쓸 때 사용한다. */
function toParagraphs(text: string | null | undefined) {
  if (!text) return null;
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : null;
}

/**
 * 이력은 `src/lib/pastor.ts`(이력서 원본 기준)를 쓰되,
 * 관리자가 staff 테이블에 위임목사 행을 넣으면 이름/직분/사진/인사말은 그쪽을 우선한다.
 */
export default async function PastorPage() {
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("staff")
    .select("name, name_en, position, position_en, bio, bio_en, photo_url")
    .eq("is_senior_pastor", true)
    .eq("is_active", true)
    .maybeSingle();

  const name = staff?.name ?? SENIOR_PASTOR.name.ko;
  const nameEn = staff?.name_en ?? `${SENIOR_PASTOR.honorific} ${SENIOR_PASTOR.name.en}`;
  const position = staff?.position ?? SENIOR_PASTOR.position.ko;
  const positionEn = staff?.position_en ?? SENIOR_PASTOR.position.en;

  const greetingKo = toParagraphs(staff?.bio) ?? [...SENIOR_PASTOR.greeting.ko];
  const greetingEn = toParagraphs(staff?.bio_en) ?? [...SENIOR_PASTOR.greeting.en];

  return (
    <main>
      <PageHero title="위임목사 소개" href="/about/pastor" />

      <div className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* 왼쪽: 사진 + 이름 / 오른쪽: 인사말. 너비비 1:3 */}
          <div className="grid gap-10 sm:grid-cols-[1fr_3fr] sm:items-start">
            <div>
              <div className="overflow-hidden rounded-card border border-line bg-cream-200 shadow-card">
                {staff?.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={staff.photo_url}
                    alt={`${position} ${name}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : (
                  <Image
                    src={pastorPhoto}
                    alt={`${position} ${name}`}
                    placeholder="blur"
                    sizes="(min-width: 640px) 25vw, 100vw"
                    className="aspect-[3/4] w-full object-cover"
                    priority
                  />
                )}
              </div>

              <p className="eyebrow mt-6">{positionEn}</p>
              <h2 className="display mt-2 text-xl text-ink">
                {name} <span className="text-sm text-ink-muted">{position}</span>
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{nameEn}</p>
            </div>

            {/* 인사말 */}
            <section>
              <p className="eyebrow">Welcome</p>
              <h3 className="display rule mt-2 text-xl text-ink">인사말</h3>

              <div className="mt-9">
                {greetingKo.map((paragraph, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "display text-lg leading-[1.9] text-ink md:text-xl"
                      : "mt-6 text-[0.9375rem] leading-[2] text-ink-soft"
                  }
                >
                  {paragraph}
                </p>
              ))}

              <p className="mt-10 font-serif text-sm text-ink">
                시드니 주님의 교회 위임목사{" "}
                <span className="font-semibold">{name}</span>
              </p>

              {/* 한/영 전환 기능이 생기기 전까지는 영문을 접어 둔다 —
                  한글 본문이 길어서 그대로 이어 붙이면 모바일에서 너무 늘어진다 */}
              <details className="group mt-10 border-t border-line pt-6">
                <summary className="eyebrow inline-flex cursor-pointer list-none items-center gap-2">
                  English
                  <Icon
                    name="arrowRight"
                    className="size-3 rotate-90 transition group-open:-rotate-90"
                  />
                </summary>
                <div className="mt-6">
                  {greetingEn.map((paragraph, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? "text-base leading-relaxed text-ink"
                          : "mt-5 text-sm leading-[1.9] text-ink-muted"
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                  <p className="mt-8 font-serif text-sm text-ink-muted">
                    {SENIOR_PASTOR.honorific} {SENIOR_PASTOR.name.en}, {SENIOR_PASTOR.position.en}
                  </p>
                </div>
              </details>
              </div>
            </section>
          </div>

          {/* 이력 */}
          <div className="mt-16 space-y-14 border-t border-line pt-16">
            <CareerSection title="목회 이력" titleEn="Ministry" entries={SENIOR_PASTOR.ministry} />
            <CareerSection title="학력" titleEn="Academic" entries={SENIOR_PASTOR.education} />
            <CareerSection title="강의 이력" titleEn="Teaching" entries={SENIOR_PASTOR.teaching} />
            <CareerSection
              title="학위 논문"
              titleEn="Thesis & Dissertation"
              entries={SENIOR_PASTOR.theses}
            />
            <CareerSection title="논고" titleEn="Articles" entries={SENIOR_PASTOR.articles} />
          </div>
        </div>
      </div>
    </main>
  );
}

function CareerSection({
  title,
  titleEn,
  entries,
}: {
  title: string;
  titleEn: string;
  entries: readonly CareerEntry[];
}) {
  return (
    <section>
      <p className="eyebrow">{titleEn}</p>
      <h3 className="display rule mt-2 text-xl text-ink">{title}</h3>

      <ul className="mt-8 space-y-6">
        {entries.map((entry) => (
          <li
            key={`${entry.period ?? ""}${entry.ko}`}
            className="grid gap-x-6 gap-y-1 border-b border-line pb-6 last:border-0 sm:grid-cols-[7rem_1fr]"
          >
            <span className="pt-0.5 font-serif text-sm text-brand-600">
              {entry.period ?? <Icon name="cross" className="size-3.5 text-brand-200" />}
            </span>
            <div>
              <p className="text-[0.9375rem] leading-relaxed text-ink">
                {entry.ko}
                {entry.note && (
                  <span className="ml-2 text-sm text-ink-muted">{entry.note.ko}</span>
                )}
              </p>
              {/* 한/영 전환이 생기기 전까지는 영문을 보조로 함께 노출한다 */}
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {entry.en}
                {entry.note && entry.note.en !== entry.note.ko && ` · ${entry.note.en}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
