// supabase/functions/run-scheduled-push/index.ts 에서 그대로 복사한 로직
const CATCH_UP_MINUTES = 120;
function localNow(timeZone, now) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", hour12:false, weekday:"short",
  }).formatToParts(now);
  const get = t => parts.find(p => p.type === t)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return { date:`${get("year")}-${get("month")}-${get("day")}`,
           minutes: hour*60+minute, weekday: weekdays.indexOf(get("weekday")) };
}
const timeToMinutes = t => { const [h,m]=t.split(":"); return Number(h)*60+Number(m); };
function isDue(s, now) {
  const local = localNow(s.timezone, now);
  if (s.last_sent_on === local.date) return { due:false, local, why:"오늘 이미 발송" };
  if (s.days_of_week?.length && !s.days_of_week.includes(local.weekday))
    return { due:false, local, why:"해당 요일 아님" };
  const elapsed = local.minutes - timeToMinutes(s.send_time);
  if (elapsed < 0) return { due:false, local, why:`아직 ${-elapsed}분 남음` };
  if (elapsed > CATCH_UP_MINUTES) return { due:false, local, why:`${elapsed}분 지나 캐치업 초과` };
  return { due:true, local, why:`발송 (예정+${elapsed}분)` };
}

const S = { timezone:"Australia/Sydney", send_time:"07:00:00", days_of_week:null, last_sent_on:null };
const cases = [
  ["2026-09-10T20:59:00Z", "시드니 06:59 — 1분 전"],
  ["2026-09-10T21:00:00Z", "시드니 07:00 — 정각"],
  ["2026-09-10T21:04:00Z", "시드니 07:04 — 크론이 5분마다라 실제론 여기서 잡힘"],
  ["2026-09-10T22:59:00Z", "시드니 08:59 — 캐치업 경계 직전"],
  ["2026-09-10T23:01:00Z", "시드니 09:01 — 캐치업 초과"],
  ["2026-09-10T14:00:00Z", "시드니 자정 00:00 — hour='24' 버그 확인용"],
  ["2026-09-10T13:59:00Z", "시드니 23:59 — 날짜 경계"],
];
console.log("[기본 예약: 매일 07:00 Australia/Sydney]");
for (const [iso, label] of cases) {
  const r = isDue(S, new Date(iso));
  console.log(` ${r.due?"발송":"  - "} | ${label.padEnd(42)} | 현지 ${r.local.date} ${String(Math.floor(r.local.minutes/60)).padStart(2,"0")}:${String(r.local.minutes%60).padStart(2,"0")} ${["일","월","화","수","목","금","토"][r.local.weekday]} | ${r.why}`);
}
console.log("\n[DST 전환 확인 — 시드니는 10/4 새벽 2시에 +10 → +11]");
for (const iso of ["2026-10-03T21:00:00Z","2026-10-04T21:00:00Z","2026-10-04T20:00:00Z"]) {
  const r = isDue(S, new Date(iso));
  const lt = `${String(Math.floor(r.local.minutes/60)).padStart(2,"0")}:${String(r.local.minutes%60).padStart(2,"0")}`;
  console.log(` ${r.due?"발송":"  - "} | UTC ${iso} → 시드니 ${r.local.date} ${lt} | ${r.why}`);
}
console.log("\n[요일 지정: 일요일(0)만]");
const sun = {...S, days_of_week:[0]};
for (const iso of ["2026-09-12T21:04:00Z","2026-09-13T21:04:00Z"]) {
  const r = isDue(sun, new Date(iso));
  console.log(` ${r.due?"발송":"  - "} | 시드니 ${r.local.date} ${["일","월","화","수","목","금","토"][r.local.weekday]}요일 | ${r.why}`);
}
console.log("\n[오늘 이미 보낸 경우]");
const s2 = {...S, last_sent_on:"2026-09-11"};
const r2 = isDue(s2, new Date("2026-09-10T21:04:00Z"));
console.log(` ${r2.due?"발송":"  - "} | ${r2.why}`);
