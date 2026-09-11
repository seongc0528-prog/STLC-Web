// pdf.js는 워커를 별도 파일로 로드한다. 번들러 설정에 의존하지 않도록
// node_modules의 워커를 public/으로 복사해서 /pdf.worker.min.mjs 로 서빙한다.
// pdfjs-dist를 업그레이드하면 postinstall이 다시 복사한다.
import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const dest = resolve(root, 'public/pdf.worker.min.mjs')

try {
  await mkdir(dirname(dest), { recursive: true })
  await copyFile(src, dest)
  console.log('copied pdf.worker.min.mjs -> public/')
} catch (err) {
  // 의존성이 아직 설치되지 않은 상태(clone 직후 등)에서 install을 막지 않는다
  console.warn('skip copying pdf worker:', err.message)
}
