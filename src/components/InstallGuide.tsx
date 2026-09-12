'use client'

import { useState } from 'react'
import { consumeInstallPrompt, useInstallPromptEvent } from '@/lib/installPrompt'
import {
  getPlatform,
  inAppBrowserName,
  openExternalUrl,
  SERVER_PLATFORM,
} from '@/lib/platform'
import { useClientValue } from '@/lib/useClientValue'
import { useIsStandalone } from '@/lib/useIsStandalone'

/**
 * 앱(PWA) 설치 안내. 아이폰 사용자가 옆에서 도와주는 사람 없이도 끝까지
 * 따라올 수 있도록, 각 단계마다 그 순간 화면이 어떻게 보이는지를 그림으로 같이 준다.
 *
 * 그림은 실제 스크린샷이 아니라 SVG 삽화다. iOS·안드로이드 버전마다 실제 화면이
 * 조금씩 다르고, 스크린샷은 OS가 바뀔 때마다 낡기 때문에 눌러야 할 것의 위치와
 * 모양만 남긴 그림으로 그렸다.
 */

type Tab = 'ios' | 'android' | 'inapp'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ios', label: '아이폰 · 아이패드' },
  { id: 'android', label: '안드로이드' },
  { id: 'inapp', label: '카카오톡 등에서 열었다면' },
]

/* ------------------------------------------------------------------ 삽화 */

const GOLD = '#c8a04a'
const FRAME = '#d8d3c4'
const SCREEN = '#ffffff'
const MUTED = '#b9b4a6'
const INK = '#3f3f3f'

/** 공통 휴대폰 목업. 안에 들어가는 좌표계는 20,16 ~ 220,284. */
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 240 300"
      role="img"
      className="h-56 w-auto shrink-0"
      aria-hidden
    >
      <rect
        x="20"
        y="8"
        width="200"
        height="284"
        rx="24"
        fill={SCREEN}
        stroke={FRAME}
        strokeWidth="2"
      />
      <rect x="98" y="16" width="44" height="5" rx="2.5" fill={FRAME} />
      {children}
    </svg>
  )
}

/** 눌러야 할 곳을 감싸는 금색 원 + 그 옆 화살표. */
function Tap({ x, y, r = 16 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill="none" stroke={GOLD} strokeWidth="2.5" />
      <circle cx={x} cy={y} r={r + 6} fill="none" stroke={GOLD} strokeWidth="1" opacity="0.45" />
    </>
  )
}

function ShareGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x - 8} ${y - 9})`}
      fill="none"
      stroke={INK}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 11V2" />
      <path d="m5 5 3-3 3 3" />
      <path d="M4 9H3v8h10V9h-1" />
    </g>
  )
}

function AppIcon({ x, y, size = 34 }: { x: number; y: number; size?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.28} fill="#1b5e20" />
      <path
        d={`M${x + size / 2} ${y + size * 0.2}V${y + size * 0.8}M${x + size * 0.28} ${y + size * 0.4}H${x + size * 0.72}`}
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  )
}

function Line({
  x,
  y,
  w,
  color = MUTED,
  h = 5,
}: {
  x: number
  y: number
  w: number
  color?: string
  h?: number
}) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={color} />
}

/** 사파리에서 우리 사이트를 띄운 상태 + 하단 공유 버튼 강조. */
function IosShareBar() {
  return (
    <Phone>
      <rect x="28" y="30" width="184" height="18" rx="9" fill="#f2f0ea" />
      <Line x={72} y={36} w={96} h={6} />
      <rect x="28" y="58" width="184" height="52" rx="6" fill="#16331a" />
      <Line x={40} y={74} w={104} h={7} color="#a5d6a7" />
      <Line x={40} y={88} w={72} h={6} color="#4caf50" />
      <Line x={28} y={124} w={150} h={6} />
      <Line x={28} y={140} w={184} h={6} />
      <Line x={28} y={156} w={120} h={6} />
      {/* 하단 툴바 */}
      <rect x="20" y="248" width="200" height="44" rx="0" fill="#f2f0ea" />
      <path d="M20 248h200" stroke={FRAME} />
      <path
        d="M52 264l-8 6 8 6M76 264l8 6-8 6"
        fill="none"
        stroke={MUTED}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ShareGlyph x={120} y={270} />
      <rect x="152" y="262" width="14" height="14" rx="3" fill="none" stroke={MUTED} strokeWidth="1.6" />
      <rect x="180" y="262" width="14" height="14" rx="3" fill="none" stroke={MUTED} strokeWidth="1.6" />
      <Tap x={120} y={270} r={15} />
    </Phone>
  )
}

/** 공유 시트가 올라온 상태 + '홈 화면에 추가' 행 강조. */
function IosShareSheet() {
  return (
    <Phone>
      <rect x="28" y="40" width="184" height="40" rx="6" fill="#f7f7f5" />
      <rect x="20" y="96" width="200" height="196" rx="18" fill="#f2f0ea" />
      <path d="M20 96h200" stroke={FRAME} />
      <rect x="104" y="104" width="32" height="4" rx="2" fill={MUTED} />
      <rect x="32" y="120" width="176" height="28" rx="8" fill="#fff" />
      <Line x={44} y={131} w={80} h={6} />
      {['복사', '읽기 목록에 추가', '북마크 추가'].map((_, i) => (
        <g key={i}>
          <rect x="32" y={158 + i * 26} width="176" height="22" rx="6" fill="#fff" />
          <Line x={44} y={166 + i * 26} w={70 + i * 14} h={5} />
        </g>
      ))}
      {/* 홈 화면에 추가 */}
      <rect x="32" y="236" width="176" height="26" rx="6" fill="#fff" stroke={GOLD} strokeWidth="1.5" />
      <text x="44" y="253" fontSize="11" fill={INK} fontWeight="600">
        홈 화면에 추가
      </text>
      <rect x="184" y="242" width="14" height="14" rx="3" fill="none" stroke={INK} strokeWidth="1.4" />
      <path d="M191 245v8M187 249h8" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      {/* 강조는 원이 아니라 행 테두리로 — 가로로 긴 목록 항목이라 원이 안 맞는다. */}
      <path d="M120 220v10M116 226l4 4 4-4" stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" />
    </Phone>
  )
}

/** 이름 확인 후 오른쪽 위 '추가'. */
function IosAddConfirm() {
  return (
    <Phone>
      <rect x="20" y="30" width="200" height="120" rx="14" fill="#f2f0ea" />
      <text x="36" y="52" fontSize="11" fill={MUTED}>
        취소
      </text>
      <text x="94" y="52" fontSize="11" fill={INK} fontWeight="600">
        홈 화면에 추가
      </text>
      <text x="182" y="52" fontSize="11" fill="#1b5e20" fontWeight="700">
        추가
      </text>
      <AppIcon x={36} y={72} size={34} />
      <rect x="82" y="74" width="118" height="22" rx="5" fill="#fff" stroke={FRAME} />
      <text x="90" y="89" fontSize="10" fill={INK}>
        시드니 주님의 교회
      </text>
      <Line x={82} y={106} w={112} h={5} />
      <Tap x={190} y={48} r={17} />
    </Phone>
  )
}

/** 홈 화면에 아이콘이 생긴 상태. */
function IosHomeIcon() {
  return (
    <Phone>
      <rect x="20" y="8" width="200" height="284" rx="24" fill="#16331a" />
      <rect x="98" y="16" width="44" height="5" rx="2.5" fill="#0f2412" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={38 + (i % 4) * 42}
            y={56}
            width="34"
            height="34"
            rx="9"
            fill="#ffffff"
            opacity="0.18"
          />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={38 + i * 42}
          y={112}
          width="34"
          height="34"
          rx="9"
          fill="#ffffff"
          opacity="0.18"
        />
      ))}
      <AppIcon x={164} y={112} size={34} />
      <text x="150" y="160" fontSize="8" fill="#ffffff">
        주님의 교회
      </text>
      <Tap x={181} y={129} r={26} />
    </Phone>
  )
}

/** 앱을 처음 열었을 때의 알림 허용 안내. */
function AllowNotifications() {
  return (
    <Phone>
      <rect x="28" y="40" width="184" height="60" rx="8" fill="#16331a" />
      <Line x={40} y={58} w={110} h={7} color="#a5d6a7" />
      <Line x={40} y={74} w={80} h={6} color="#4caf50" />
      <rect x="42" y="120" width="156" height="96" rx="14" fill="#f7f7f5" stroke={FRAME} />
      <text x="120" y="146" fontSize="10" fill={INK} fontWeight="600" textAnchor="middle">
        알림을 보내려고 합니다
      </text>
      <Line x={62} y={158} w={116} h={5} />
      <Line x={78} y={170} w={84} h={5} />
      <path d="M42 186h156" stroke={FRAME} />
      <path d="M120 186v30" stroke={FRAME} />
      <text x="81" y="205" fontSize="10" fill={MUTED} textAnchor="middle">
        허용 안 함
      </text>
      <text x="159" y="205" fontSize="10" fill="#1b5e20" fontWeight="700" textAnchor="middle">
        허용
      </text>
      <Tap x={159} y={201} r={22} />
    </Phone>
  )
}

/** 크롬 우측 상단 ⋮ 강조. */
function AndroidMenuButton() {
  return (
    <Phone>
      <rect x="28" y="30" width="184" height="20" rx="10" fill="#f2f0ea" />
      <Line x={44} y={37} w={110} h={6} />
      <circle cx="196" cy="34" r="1.8" fill={INK} />
      <circle cx="196" cy="40" r="1.8" fill={INK} />
      <circle cx="196" cy="46" r="1.8" fill={INK} />
      <rect x="28" y="62" width="184" height="52" rx="6" fill="#16331a" />
      <Line x={40} y={78} w={104} h={7} color="#a5d6a7" />
      <Line x={40} y={92} w={72} h={6} color="#4caf50" />
      <Line x={28} y={128} w={150} h={6} />
      <Line x={28} y={144} w={184} h={6} />
      <Line x={28} y={160} w={120} h={6} />
      <Tap x={196} y={40} r={15} />
    </Phone>
  )
}

/** 크롬 메뉴에서 '앱 설치' 강조. */
function AndroidInstallItem() {
  return (
    <Phone>
      <rect x="28" y="30" width="184" height="20" rx="10" fill="#f2f0ea" />
      <rect x="104" y="40" width="104" height="176" rx="10" fill="#fff" stroke={FRAME} />
      {[0, 1, 2].map((i) => (
        <Line key={i} x={116} y={60 + i * 22} w={60 - i * 8} h={5} />
      ))}
      <rect x="108" y="122" width="96" height="24" rx="6" fill="#fdf7e8" stroke={GOLD} strokeWidth="1.5" />
      <text x="118" y="138" fontSize="10" fill={INK} fontWeight="600">
        앱 설치
      </text>
      {[0, 1, 2].map((i) => (
        <Line key={i} x={116} y={162 + i * 22} w={54 + i * 10} h={5} />
      ))}
      <path d="M96 134h-14M88 128l-6 6 6 6" stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" />
    </Phone>
  )
}

/** 안드로이드 설치 확인 다이얼로그. */
function AndroidInstallConfirm() {
  return (
    <Phone>
      <rect x="36" y="96" width="168" height="112" rx="14" fill="#f7f7f5" stroke={FRAME} />
      <AppIcon x={52} y={116} size={30} />
      <text x="92" y="130" fontSize="10" fill={INK} fontWeight="600">
        시드니 주님의 교회
      </text>
      <Line x={92} y={138} w={82} h={5} />
      <Line x={52} y={162} w={140} h={5} />
      <text x="130" y="192" fontSize="10" fill={MUTED} textAnchor="middle">
        취소
      </text>
      <text x="176" y="192" fontSize="10" fill="#1b5e20" fontWeight="700" textAnchor="middle">
        설치
      </text>
      <Tap x={176} y={188} r={20} />
    </Phone>
  )
}

/** 인앱 웹뷰에서 바깥 브라우저로 나가기. */
function InAppEscape() {
  return (
    <Phone>
      <rect x="20" y="8" width="200" height="34" rx="0" fill="#f2f0ea" />
      <path d="M20 42h200" stroke={FRAME} />
      <text x="36" y="30" fontSize="11" fill={INK}>
        ✕
      </text>
      <Line x={64} y={22} w={92} h={6} />
      <circle cx="192" cy="25" r="1.8" fill={INK} />
      <circle cx="198" cy="25" r="1.8" fill={INK} />
      <circle cx="186" cy="25" r="1.8" fill={INK} />
      <rect x="120" y="52" width="92" height="86" rx="10" fill="#fff" stroke={FRAME} />
      {[0, 1].map((i) => (
        <Line key={i} x={132} y={68 + i * 20} w={54 - i * 8} h={5} />
      ))}
      <rect x="124" y="102" width="84" height="24" rx="6" fill="#fdf7e8" stroke={GOLD} strokeWidth="1.5" />
      <text x="132" y="118" fontSize="9" fill={INK} fontWeight="600">
        다른 브라우저로 열기
      </text>
      <Tap x={192} y={25} r={14} />
    </Phone>
  )
}

/* ------------------------------------------------------------------ 단계 */

function Step({
  index,
  title,
  body,
  figure,
}: {
  index: number
  title: string
  body: React.ReactNode
  figure: React.ReactNode
}) {
  return (
    <li className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {index}
          </span>
          <h3 className="display text-base text-ink">{title}</h3>
        </div>
        <div className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</div>
      </div>
      <div className="flex justify-center rounded-xl bg-cream-200 p-3 sm:justify-end">
        {figure}
      </div>
    </li>
  )
}

const b = (text: string) => <b className="font-semibold text-ink">{text}</b>

/* ------------------------------------------------------------------ 본문 */

export function InstallGuide() {
  const isStandalone = useIsStandalone()
  const platform = useClientValue(getPlatform, SERVER_PLATFORM)
  const installEvent = useInstallPromptEvent()
  const [override, setOverride] = useState<Tab | null>(null)

  const detected: Tab = platform.inApp ? 'inapp' : platform.ios ? 'ios' : 'android'
  const tab = override ?? detected

  if (isStandalone) {
    return (
      <div className="card p-8 text-center">
        <p className="display text-lg text-ink">이미 앱으로 실행 중입니다</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          설치가 끝났습니다. 알림을 아직 켜지 않으셨다면 메뉴의 {b('알림 설정')}에서 켤 수
          있습니다.
        </p>
      </div>
    )
  }

  return (
    <div>
      {platform.inApp && tab !== 'inapp' && (
        <p className="mb-6 rounded-xl border border-[#c8a04a] bg-[#fdf7e8] px-5 py-4 text-sm leading-relaxed text-ink-soft">
          지금 {inAppBrowserName(platform.inApp)} 안에서 보고 계셔서 여기서는 설치할 수
          없습니다. 먼저{' '}
          <button
            type="button"
            onClick={() => setOverride('inapp')}
            className="font-semibold text-brand-600 underline"
          >
            브라우저로 나가는 방법
          </button>
          을 봐주세요.
        </p>
      )}

      <div
        role="tablist"
        aria-label="기기 선택"
        className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setOverride(t.id)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              tab === t.id
                ? 'bg-brand-600 font-medium text-white'
                : 'border border-line bg-white text-ink-soft hover:border-brand-600 hover:text-brand-600'
            }`}
          >
            {t.label}
            {detected === t.id && (
              <span className={tab === t.id ? 'ml-1.5 text-brand-200' : 'ml-1.5 text-ink-muted'}>
                · 현재 기기
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'ios' && (
        <ol className="grid gap-5">
          <Step
            index={1}
            title="사파리(Safari)로 이 페이지를 엽니다"
            body={
              <>
                아이폰에서는 {b('사파리에서만')} 홈 화면에 추가할 수 있습니다. 크롬이나
                네이버 앱에서 보고 계시다면 주소({b('stlc.church')})를 사파리에 직접
                입력해 주세요.
              </>
            }
            figure={<IosShareBar />}
          />
          <Step
            index={2}
            title="화면 아래 가운데 공유 버튼을 누릅니다"
            body={
              <>
                네모에서 화살표가 위로 나가는 모양의 버튼입니다. 버튼이 보이지 않으면
                화면을 {b('아래로 한 번 쓸어내리면')} 툴바가 다시 나타납니다.
              </>
            }
            figure={<IosShareBar />}
          />
          <Step
            index={3}
            title="목록을 내려서 ‘홈 화면에 추가’를 누릅니다"
            body={
              <>
                올라온 목록을 {b('위로 쓸어올려')} 한참 내려야 나옵니다. 복사·북마크 추가
                아래쪽에 있습니다.
              </>
            }
            figure={<IosShareSheet />}
          />
          <Step
            index={4}
            title="오른쪽 위 ‘추가’를 누릅니다"
            body="이름은 그대로 두셔도 됩니다."
            figure={<IosAddConfirm />}
          />
          <Step
            index={5}
            title="홈 화면에 생긴 아이콘으로 실행합니다"
            body={
              <>
                여기서부터가 중요합니다. {b('반드시 홈 화면의 아이콘으로')} 열어야 앱처럼
                동작하고 알림도 받을 수 있습니다. 사파리로 들어오면 알림이 오지 않습니다.
              </>
            }
            figure={<IosHomeIcon />}
          />
          <Step
            index={6}
            title="로그인한 뒤 알림을 허용합니다"
            body={
              <>
                아이콘으로 연 앱에서 로그인하고, 메뉴의 {b('알림 설정')}을 누른 뒤 나오는
                안내창에서 {b('허용')}을 선택하세요.
              </>
            }
            figure={<AllowNotifications />}
          />
        </ol>
      )}

      {tab === 'android' && (
        <ol className="grid gap-5">
          {installEvent && (
            <li className="card flex flex-wrap items-center justify-between gap-4 p-6">
              <p className="text-sm leading-relaxed text-ink-soft">
                이 브라우저는 바로 설치할 수 있습니다. 아래 단계를 따라갈 필요 없이
                버튼을 누르세요.
              </p>
              <button
                type="button"
                onClick={async () => {
                  await installEvent.prompt()
                  await installEvent.userChoice
                  consumeInstallPrompt()
                }}
                className="btn btn-primary"
              >
                지금 설치하기
              </button>
            </li>
          )}
          <Step
            index={1}
            title="크롬 오른쪽 위 ⋮ 버튼을 누릅니다"
            body="주소창 오른쪽 끝의 점 세 개입니다."
            figure={<AndroidMenuButton />}
          />
          <Step
            index={2}
            title="‘앱 설치’ 또는 ‘홈 화면에 추가’를 누릅니다"
            body={
              <>
                기기와 크롬 버전에 따라 이름이 조금 다릅니다. {b('앱 설치')},{' '}
                {b('홈 화면에 추가')}, {b('앱으로 설치')} 중 보이는 것을 누르세요.
              </>
            }
            figure={<AndroidInstallItem />}
          />
          <Step
            index={3}
            title="‘설치’를 눌러 확인합니다"
            body="홈 화면과 앱 서랍에 아이콘이 생깁니다."
            figure={<AndroidInstallConfirm />}
          />
          <Step
            index={4}
            title="로그인한 뒤 알림을 허용합니다"
            body={
              <>
                생긴 아이콘으로 앱을 열고 로그인한 다음, 메뉴의 {b('알림 설정')}을 눌러
                {b(' 허용')}을 선택하세요.
              </>
            }
            figure={<AllowNotifications />}
          />
        </ol>
      )}

      {tab === 'inapp' && (
        <ol className="grid gap-5">
          <Step
            index={1}
            title="먼저 바깥 브라우저로 나갑니다"
            body={
              <>
                카카오톡·인스타그램·네이버 앱 안에서 열린 화면에서는 홈 화면에 추가하는
                기능 자체가 없습니다. 화면 구석의 {b('⋮ 또는 ⋯ 메뉴')}를 누르고{' '}
                {b('‘다른 브라우저로 열기’')}를 선택하세요.
                {platform.inApp === 'kakaotalk' && (
                  <button
                    type="button"
                    onClick={() => openExternalUrl('kakaotalk')}
                    className="btn btn-primary mt-4"
                  >
                    브라우저로 열기
                  </button>
                )}
              </>
            }
            figure={<InAppEscape />}
          />
          <Step
            index={2}
            title="열린 브라우저에서 설치를 진행합니다"
            body={
              <>
                사파리가 열렸다면 위의{' '}
                <button
                  type="button"
                  onClick={() => setOverride('ios')}
                  className="font-semibold text-brand-600 underline"
                >
                  아이폰 안내
                </button>
                를, 크롬이 열렸다면{' '}
                <button
                  type="button"
                  onClick={() => setOverride('android')}
                  className="font-semibold text-brand-600 underline"
                >
                  안드로이드 안내
                </button>
                를 따라 하시면 됩니다.
              </>
            }
            figure={<AndroidMenuButton />}
          />
        </ol>
      )}

      <div className="card mt-10 p-6">
        <h3 className="display text-base text-ink">잘 안 되시나요?</h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
          <li>
            · {b('공유 목록에 ‘홈 화면에 추가’가 없어요')} — 사파리가 아닌 앱에서 열려
            있을 가능성이 큽니다. 사파리로 다시 열어보세요.
          </li>
          <li>
            · {b('알림이 오지 않아요')} — 홈 화면 아이콘이 아니라 브라우저로 들어오면
            알림을 받을 수 없습니다. 아이콘으로 연 뒤 알림 설정을 다시 확인해 주세요.
          </li>
          <li>
            · {b('그래도 어렵다면')} — 주일에 교회에서 봉사자에게 이 화면을 보여주시면
            함께 설치해 드립니다.
          </li>
        </ul>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-muted">
        그림은 이해를 돕기 위한 예시입니다. 기기와 OS 버전에 따라 실제 화면의 모양과
        글자는 조금씩 다를 수 있습니다.
      </p>
    </div>
  )
}
