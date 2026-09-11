import { createClient } from "@/lib/supabase/server";
import { todayInSydney, formatKoreanDate } from "@/lib/date";
import { PageHero } from "@/components/PageHero";
import { Icon } from "@/components/icons";

export default async function DailyVersePage() {
  const supabase = await createClient();
  const date = todayInSydney();
  const { data } = await supabase.rpc("daily_verse_for", { d: date });
  const verse = Array.isArray(data) ? data[0] : data;

  return (
    <main>
      <PageHero
        title="오늘의 말씀"
        href="/daily-verse"
        description="매일 아침, 하루를 여는 한 구절을 전해드립니다."
      />

      <div className="container-page py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-xs tracking-wide text-ink-muted">
            {formatKoreanDate(date)}
          </p>

          {verse ? (
            <article className="card mt-8 px-7 py-12 text-center md:px-12 md:py-16">
              <Icon name="book" className="mx-auto size-8 text-brand-300" />
              <p className="display mt-8 text-lg leading-[2] text-ink md:text-xl">
                {verse.text_kr}
              </p>
              {verse.text_en && (
                <p className="mt-8 text-sm leading-relaxed text-ink-muted">{verse.text_en}</p>
              )}
              <p className="eyebrow mt-12">{verse.type === "quote" ? "Quote" : "Bible"}</p>
            </article>
          ) : (
            <p className="mt-8 text-center text-sm text-ink-muted">등록된 말씀이 없습니다.</p>
          )}
        </div>
      </div>
    </main>
  );
}
