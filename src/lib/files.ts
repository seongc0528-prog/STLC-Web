/**
 * Supabase Storage 공개 URL에 ?download=<파일명>을 붙이면
 * Content-Disposition: attachment 로 내려온다. 다른 호스트면 원본을 그대로 쓴다.
 *
 * 확장자는 원본 경로에서 그대로 가져온다 — 주보는 PDF지만 찬양 콘티·교육 자료는
 * PPTX·DOCX·이미지도 올라온다.
 */
export function downloadUrl(fileUrl: string, label: string) {
  try {
    const url = new URL(fileUrl);
    if (!url.pathname.includes("/storage/v1/object/")) return fileUrl;
    const ext = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
    url.searchParams.set("download", ext ? `${label}.${ext}` : label);
    return url.toString();
  } catch {
    return fileUrl;
  }
}

/** 파일 URL의 확장자를 대문자로 — "PDF" 배지 표시용. 확장자가 없으면 null. */
export function fileExtension(fileUrl: string) {
  const match = fileUrl.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toUpperCase() : null;
}
