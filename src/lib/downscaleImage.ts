/** 긴 변이 이보다 크면 줄여서 올린다. Supabase 이미지 변환의 한도(2500px 출력, 원본 50MP)
 *  안에 들고, 크게 보기(1600px)에도 충분하다. */
const MAX_EDGE = 2500;

/** 휴대폰 원본(4000px, 수 MB)을 업로드 전에 브라우저에서 줄인다.
 *  - EXIF 회전을 픽셀에 반영한 뒤 다시 인코딩하므로 위치정보 같은 메타데이터도 빠진다.
 *  - 이미 작거나, 브라우저가 못 여는 형식이면 원본 파일을 그대로 돌려준다. */
export async function downscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = MAX_EDGE / Math.max(bitmap.width, bitmap.height);
  if (scale >= 1) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  if (!blob || blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${type === "image/png" ? "png" : "jpg"}`, { type });
}
