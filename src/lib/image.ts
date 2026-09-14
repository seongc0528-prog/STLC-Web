const OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

type ResizeOptions = {
  width: number;
  height: number;
  /** cover: 채우고 잘라냄(섬네일) / contain: 잘리지 않게 안에 맞춤(크게 보기) */
  resize?: "cover" | "contain";
  quality?: number;
};

/** Supabase Storage 공개 URL을 이미지 변환 URL로 바꾼다. 원본 대신 작은 사본을 받는다.
 *
 *  - width 와 height 를 **항상 둘 다** 넘긴다. width 만 주면 문서와 달리 높이가 원본대로
 *    남아 비율이 깨진다(1689×3000 → 800×3000, 2026-09-14 실측).
 *  - 브라우저가 webp 를 받으면 Supabase 가 알아서 webp 로 준다.
 *  - Storage 공개 URL이 아니면(외부 주소 등) 그대로 돌려준다. */
export function resizedImage(url: string, { width, height, resize = "cover", quality = 70 }: ResizeOptions) {
  if (!url.includes(OBJECT_PATH)) return url;
  const resized = new URL(url.replace(OBJECT_PATH, RENDER_PATH));
  resized.searchParams.set("width", String(width));
  resized.searchParams.set("height", String(height));
  resized.searchParams.set("resize", resize);
  resized.searchParams.set("quality", String(quality));
  return resized.toString();
}
