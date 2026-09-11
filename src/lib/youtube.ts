/** YouTube URL에서 영상 ID를 뽑는다. watch?v=, youtu.be/, /embed/, /live/ 형태 지원. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null
    if (!u.hostname.includes('youtube.com')) return null

    const v = u.searchParams.get('v')
    if (v) return v

    const match = u.pathname.match(/\/(?:embed|live|shorts)\/([^/?]+)/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/** 설교 카드 썸네일. 유튜브 영상이 아니면 null → 호출부에서 플레이스홀더 처리. */
export function youtubeThumbnail(url: string | null | undefined): string | null {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
