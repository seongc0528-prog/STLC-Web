export const CHURCH_TIME_ZONE = "Australia/Sydney";

/** 시드니 기준 오늘 날짜(YYYY-MM-DD). 서버가 어느 타임존에 떠 있든
 *  푸시(run-scheduled-push)와 같은 날짜의 말씀이 나오도록 맞춘다. */
export function todayInSydney() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHURCH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** 'YYYY-MM-DD' → '2026년 9월 11일 금요일' */
export function formatKoreanDate(date: string, withWeekday = true) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withWeekday ? { weekday: "long" as const } : {}),
  });
}
