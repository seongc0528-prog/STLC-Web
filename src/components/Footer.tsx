import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FOUNDED_LABEL } from '@/lib/church'
import { Logomark } from '@/components/icons'
import { FooterBody } from '@/components/FooterBody'

export async function Footer() {
  const supabase = await createClient()
  const { data: church } = await supabase
    .from('church_info')
    .select('address, address_en, phone, email, sunday_service, wednesday_service')
    .eq('id', 1)
    .single()

  return (
    <FooterBody>
      {/* 교회 정보 */}
      <div>
        <div className="flex items-center gap-3">
          <Logomark className="size-10" />
          <span className="leading-tight">
            <span className="block font-serif text-base font-semibold text-white">
              시드니 주님의 교회
            </span>
            <span className="eyebrow eyebrow-on-dark block text-[0.5625rem] tracking-[0.16em]">
              Sydney The Lord&apos;s Church in Australia
            </span>
          </span>
        </div>

        <dl className="mt-7 space-y-2 text-sm text-brand-200">
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 text-brand-300">창립</dt>
            <dd className="text-brand-100">{FOUNDED_LABEL}</dd>
          </div>
          {church?.address && (
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 text-brand-300">주소</dt>
              <dd className="text-brand-100">{church.address}</dd>
            </div>
          )}
          {church?.phone && (
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 text-brand-300">전화</dt>
              <dd className="text-brand-100">{church.phone}</dd>
            </div>
          )}
          {church?.email && (
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 text-brand-300">이메일</dt>
              <dd className="text-brand-100">{church.email}</dd>
            </div>
          )}
          {(church?.sunday_service || church?.wednesday_service) && (
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 text-brand-300">예배</dt>
              <dd className="text-brand-100">
                {church?.sunday_service && <>주일 {church.sunday_service}</>}
                {church?.sunday_service && church?.wednesday_service && (
                  <span className="mx-2 text-brand-300/50">|</span>
                )}
                {church?.wednesday_service && <>수요 {church.wednesday_service}</>}
              </dd>
            </div>
          )}
        </dl>

        <Link href="/about/location" className="btn btn-ghost-light mt-7">
          오시는 길
        </Link>
      </div>
    </FooterBody>
  )
}
