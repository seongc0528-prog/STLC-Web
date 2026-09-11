// public/icon.svg 를 홈 화면용 PNG 로 굽는다.
//
// iOS 는 apple-touch-icon 으로 SVG 를 받지 않는다 (무시하고 페이지 스크린샷을
// 홈 화면에 박아버린다). Android/Chrome 의 manifest 아이콘도 SVG 지원이
// 들쭉날쭉해서, 설치 아이콘은 PNG 로 고정해두는 편이 안전하다.
//
// 아이콘 도형이 사각형 두 개짜리 십자가라 sharp 같은 래스터라이저 없이
// 직접 그린다. 의존성 추가 없이 `node scripts/generate-icons.mjs` 로 언제든
// 다시 만들 수 있다. icon.svg 의 도형이나 색을 바꾸면 아래 상수도 같이 고칠 것.

import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/** icon.svg 의 viewBox 한 변. 아래 좌표는 전부 이 기준이다. */
const VIEWBOX = 512;
/** <rect fill="#1B5E20"> */
const BACKGROUND = [0x1b, 0x5e, 0x20];
/** <path fill="#ffffff" fill-opacity="0.95"> 를 배경 위에 미리 합성한 색. */
const FOREGROUND = BACKGROUND.map((c) => Math.round(0.95 * 255 + 0.05 * c));

/** 십자가 = 세로 막대 + 가로 막대. viewBox 좌표의 [x0, y0, x1, y1]. */
const BARS = [
  [230, 96, 282, 416],
  [140, 186, 372, 238],
];

/** 한 변당 서브샘플 수. 4 면 픽셀당 16 샘플이라 가장자리가 충분히 매끄럽다. */
const SUPERSAMPLE = 4;

const SIZES = [
  // iOS 홈 화면. 아이폰 최대 해상도 기준이고 iOS 가 알아서 줄여 쓴다.
  { size: 180, name: "icon-180.png" },
  // manifest 최소 권장 크기 (Android 홈 화면).
  { size: 192, name: "icon-192.png" },
  // manifest 스플래시 화면 및 스토어 노출용.
  { size: 512, name: "icon-512.png" },
];

function isInsideCross(x, y) {
  return BARS.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
}

/** 지정한 크기의 RGBA 픽셀 버퍼를 만든다 (PNG 스캔라인 필터 바이트 포함). */
function renderPixels(size) {
  const scale = VIEWBOX / size;
  const step = 1 / SUPERSAMPLE;
  const samplesPerPixel = SUPERSAMPLE * SUPERSAMPLE;
  // 행마다 맨 앞에 필터 타입 바이트(0 = None)가 붙는다.
  const raw = Buffer.alloc(size * (1 + size * 4));

  for (let py = 0; py < size; py++) {
    const rowStart = py * (1 + size * 4);
    raw[rowStart] = 0;

    for (let px = 0; px < size; px++) {
      let hits = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        const y = (py + (sy + 0.5) * step) * scale;
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const x = (px + (sx + 0.5) * step) * scale;
          if (isInsideCross(x, y)) hits++;
        }
      }

      const coverage = hits / samplesPerPixel;
      const offset = rowStart + 1 + px * 4;
      for (let channel = 0; channel < 3; channel++) {
        const value = BACKGROUND[channel] + (FOREGROUND[channel] - BACKGROUND[channel]) * coverage;
        raw[offset + channel] = Math.round(value);
      }
      // 배경이 꽉 찬 불투명 아이콘이다. iOS 는 투명 아이콘을 검게 칠해버리므로
      // 알파를 남겨두면 안 된다.
      raw[offset + 3] = 0xff;
    }
  }

  return raw;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(size, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 채널당 8비트
  ihdr[9] = 6; // 컬러 타입 6 = RGBA
  ihdr[10] = 0; // 압축: deflate
  ihdr[11] = 0; // 필터: 표준
  ihdr[12] = 0; // 인터레이스: 없음

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const { size, name } of SIZES) {
  const png = encodePng(size, renderPixels(size));
  writeFileSync(join(PUBLIC_DIR, name), png);
  console.log(`${name} (${size}x${size}, ${png.length} bytes)`);
}
