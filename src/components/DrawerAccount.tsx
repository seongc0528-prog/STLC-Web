'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { subscribeToPush } from '@/lib/push'
import { useIsStandalone } from '@/lib/useIsStandalone'

/**
 * 모바일 드로어 맨 위의 계정 영역.
 *
 * 하단 고정 바에 두었더니 모바일 브라우저 크롬(주소창·제스처 바) 뒤로 잘려서
 * 아무것도 안 보인다는 제보가 계속 나왔다. 스크롤되는 목록 맨 위로 올려서
 * 뷰포트 높이 계산과 무관하게 항상 첫 화면에 들어오도록 한다.
 */

const rowClass =
  'flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-[0.9375rem] leading-normal whitespace-nowrap transition hover:bg-white'

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0 text-[#c8a04a]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function DrawerAccount({ onNavigate }: { onNavigate: () => void }) {
  const isStandalone = useIsStandalone()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pushState, setPushState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [pushError, setPushError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    // getUser()는 매번 서버를 찌른다. 설치된 앱은 지하철이나 예배당 안처럼
    // 신호가 나쁜 곳에서 열리는 일이 잦아서, 여기서 네트워크를 기다리면 메뉴가
    // 로딩 상태로 멈춰 선다. 로컬에 저장된 세션을 읽는 getSession()으로 먼저
    // 그리고, 실패하더라도 finally에서 반드시 로딩을 푼다.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setUserId(data.session?.user.id ?? null)
      })
      .catch((err) => {
        console.error('session lookup failed:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // 토큰 갱신 요청이 응답 없이 매달려 있으면 위 promise 는 영영 끝나지 않는다.
    // 그 경우에도 스켈레톤이 남지 않도록 로그아웃 상태로 확정한다.
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 6000)

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (cancelled) return
      setUserId(session?.user.id ?? null)
      setLoading(false)
    })
    return () => {
      cancelled = true
      clearTimeout(timeout)
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleEnablePush() {
    setPushState('working')
    setPushError(null)
    try {
      const subscription = await subscribeToPush()
      if (!userId) throw new Error('로그인이 필요합니다.')

      const supabase = createClient()
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          device_type: 'web',
        },
        { onConflict: 'user_id,endpoint' },
      )
      if (error) throw error
      setPushState('done')
    } catch (err) {
      console.error('push subscribe failed:', err)
      setPushError(err instanceof Error ? err.message : '알 수 없는 오류')
      setPushState('error')
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    onNavigate()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="border-b-2 border-[#c8a04a]">
      <div className="flex items-baseline gap-2 border-y border-[#e0d7bf] bg-[#ece5d1] px-5 py-2.5">
        <span className="font-serif text-sm font-semibold text-brand-700">내 계정</span>
        <span className="text-[0.625rem] font-medium tracking-[0.2em] text-[#a98a3f] uppercase">
          Account
        </span>
      </div>

      {/* 인증 상태를 읽어오는 동안에도 빈 칸으로 두지 않는다 — 예전에 여기가
          통째로 비어 보인다는 제보의 절반은 이 로딩 구간이었다. */}
      {loading ? (
        <div className="space-y-2 px-5 py-4" aria-hidden>
          <div className="h-4 w-24 animate-pulse rounded bg-[#e6dfcc]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[#e6dfcc]" />
        </div>
      ) : userId ? (
        <ul>
          <li className="border-b border-[#e6dfcc]">
            <Link href="/install" onClick={onNavigate} className={`${rowClass} text-ink-soft`}>
              <span>앱 설치 안내</span>
              <Chevron />
            </Link>
          </li>

          {/* 설치된 앱에서만 내놓는다. 브라우저 탭에서는 iOS 가 웹 푸시를 아예
              지원하지 않아서, 눌러도 설치 안내로 되돌려 보내는 것 말고는 할 수
              있는 게 없다 — 그럴 바에는 메뉴에 없는 편이 덜 헷갈린다. 설치를
              권하는 일은 바로 위 '앱 설치 안내' 가 맡는다. */}
          {isStandalone && (
            <li className="border-b border-[#e6dfcc]">
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={pushState === 'working' || pushState === 'done'}
                className={`${rowClass} text-ink-soft disabled:text-ink-muted`}
              >
                <span>
                  알림 설정
                  {pushState === 'done' && (
                    <span className="ml-2 text-xs text-brand-600">켜짐</span>
                  )}
                </span>
                <span className="text-xs text-ink-muted">
                  {pushState === 'working'
                    ? '요청 중…'
                    : pushState === 'done'
                      ? ''
                      : pushState === 'error'
                        ? '다시 시도'
                        : '켜기'}
                </span>
              </button>
            </li>
          )}

          {pushError && (
            <li className="border-b border-[#e6dfcc] px-5 py-2 text-xs leading-relaxed text-red-600">
              {pushError}
            </li>
          )}

          <li>
            <button type="button" onClick={handleLogout} className={`${rowClass} text-ink-soft`}>
              <span>로그아웃</span>
              <Chevron />
            </button>
          </li>
        </ul>
      ) : (
        <ul>
          <li className="border-b border-[#e6dfcc]">
            <Link href="/auth/login" onClick={onNavigate} className={`${rowClass} text-ink-soft`}>
              <span>로그인</span>
              <Chevron />
            </Link>
          </li>
          <li>
            <Link
              href="/auth/signup"
              onClick={onNavigate}
              className={`${rowClass} font-medium text-brand-700`}
            >
              <span>회원가입</span>
              <Chevron />
            </Link>
          </li>
        </ul>
      )}
    </div>
  )
}
