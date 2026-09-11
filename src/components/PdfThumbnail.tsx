'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/icons'

type Status = 'idle' | 'loading' | 'done' | 'error'

/**
 * PDF 1페이지를 캔버스에 그려 표지 스냅샷처럼 보여준다.
 *
 * 주보 PDF 한 건이 800KB 안팎이라 목록에 있는 걸 전부 받으면 무겁다.
 * IntersectionObserver로 화면에 들어온 것만 렌더링한다.
 */
export function PdfThumbnail({ url, alt }: { url: string; alt: string }) {
  const holderRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const holder = holderRef.current
    if (!holder) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect()
          setStatus((s) => (s === 'idle' ? 'loading' : s))
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(holder)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (status !== 'loading') return
    let cancelled = false
    // destroy()는 문서가 아니라 로딩 태스크에 있다(네트워크 요청 + 워커 정리)
    let task: { destroy: () => Promise<void> } | null = null

    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const loadingTask = pdfjs.getDocument({ url })
        task = loadingTask
        const loaded = await loadingTask.promise
        if (cancelled) return

        const pdfPage = await loaded.getPage(1)
        const canvas = canvasRef.current
        if (cancelled || !canvas) return

        // 카드 폭(약 320px) 기준으로 배율을 맞추고 DPR만큼 더 키운다
        const base = pdfPage.getViewport({ scale: 1 })
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const viewport = pdfPage.getViewport({ scale: (320 / base.width) * dpr })

        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)

        const context = canvas.getContext('2d')
        if (!context) return

        await pdfPage.render({ canvas, canvasContext: context, viewport }).promise
        if (!cancelled) setStatus('done')
      } catch (err) {
        console.error('pdf thumbnail failed:', err)
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
      task?.destroy().catch(() => {})
    }
  }, [status, url])

  return (
    // 주보는 가로형(A4 landscape)이지만 세로형이 올라올 수도 있어서, 렌더링 전에만
    // 가로 비율로 자리를 잡아 두고 그린 뒤에는 캔버스가 실제 비율을 정하게 둔다
    <div
      ref={holderRef}
      className={`relative flex items-center justify-center overflow-hidden bg-cream-200 ${
        status === 'done' ? '' : 'aspect-[1.414/1]'
      }`}
    >
      <canvas
        ref={canvasRef}
        aria-label={alt}
        className={`h-auto w-full ${status === 'done' ? 'block' : 'hidden'}`}
      />

      {status !== 'done' && (
        <div className="flex flex-col items-center gap-2 text-ink-muted">
          <Icon name="document" className="size-8 text-brand-200" />
          <span className="text-xs">
            {status === 'error' ? '미리보기를 불러오지 못했습니다' : '미리보기 준비 중'}
          </span>
        </div>
      )}
    </div>
  )
}
