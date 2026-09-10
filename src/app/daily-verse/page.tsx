import { createClient } from "@/lib/supabase/server";

const TIME_ZONE = "Australia/Sydney";

/** 시드니 기준 오늘 날짜(YYYY-MM-DD). 서버가 어느 타임존에 떠 있든
 *  푸시(run-scheduled-push)와 같은 날짜의 말씀이 나오도록 맞춘다. */
function todayInSydney() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function DailyVersePage() {
  const supabase = await createClient();
  const date = todayInSydney();
  const { data } = await supabase.rpc("daily_verse_for", { d: date });
  const verse = Array.isArray(data) ? data[0] : data;

  const displayDate = new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-20">
      <p className="text-center text-sm text-gray-400">{displayDate}</p>
      <h1 className="mb-10 mt-1 text-center text-2xl font-semibold text-gray-900">오늘의 말씀</h1>

      {verse ? (
        <article className="rounded-lg border border-gray-200 bg-white px-6 py-10 text-center">
          <p className="text-lg leading-relaxed text-gray-900">{verse.text_kr}</p>
          {verse.text_en && (
            <p className="mt-5 text-sm leading-relaxed text-gray-500">{verse.text_en}</p>
          )}
          <p className="mt-8 text-xs uppercase tracking-wide text-gray-400">
            {verse.type === "quote" ? "Quote" : "Bible"}
          </p>
        </article>
      ) : (
        <p className="text-center text-sm text-gray-400">등록된 말씀이 없습니다.</p>
      )}
    </main>
  );
}
