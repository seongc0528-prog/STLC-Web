/**
 * 성구 전체를 질의어로 하는 구글 검색 URL.
 *
 * "성경"을 덧붙이는 건 "잠언 3:9"처럼 짧은 표기가 다른 뜻으로 해석되는 걸 막기 위해서다.
 */
export function scriptureSearchUrl(scripture: string) {
  const query = `${scripture.trim()} 성경`
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}
