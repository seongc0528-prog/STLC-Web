import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { InstallGuide } from '@/components/InstallGuide'

export const metadata: Metadata = {
  title: '앱 설치 안내',
  description:
    '시드니 주님의 교회 홈페이지를 홈 화면에 앱으로 설치하고 알림을 받는 방법을 기기별로 안내합니다.',
}

export default function InstallPage() {
  return (
    <main>
      <PageHero
        title="앱 설치 안내"
        titleEn="Install the App"
        description="홈 화면에 추가하면 앱처럼 빠르게 열리고, 주보·설교·교회 소식 알림을 받을 수 있습니다. 쓰시는 기기에 맞춰 순서대로 따라와 주세요."
      />

      <div className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <InstallGuide />
        </div>
      </div>
    </main>
  )
}
