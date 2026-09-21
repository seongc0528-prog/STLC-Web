/** 찬양 콘티 카드 제목 — 제목을 따로 적지 않으면 그 주일 날짜가 제목이 된다. */
export function praiseLabel(serviceDate: string, title?: string | null) {
  if (title) return title;
  // 'YYYY-MM-DD' date 컬럼 — Date로 파싱하면 UTC 자정이 되어 렌더링 타임존에 따라
  // 하루 밀릴 수 있으므로 문자열 그대로 읽는다(주보와 같은 방식).
  const [y, m, d] = serviceDate.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 찬양`;
}

/** 관리자가 한 줄에 한 곡씩 적은 목록을 배열로. 앞에 붙인 '-'·번호는 떼어 낸다. */
export function parseSongs(songs: string | null | undefined) {
  return (songs ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^(?:[-•*]|\d+[.)])\s*/, ""))
    .filter((line) => line.length > 0);
}
