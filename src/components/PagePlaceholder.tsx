import { PageHero } from '@/components/PageHero'
import { Icon } from '@/components/icons'

export function PagePlaceholder({
  title,
  description,
  href,
}: {
  title: string
  description?: string
  href?: string
}) {
  return (
    <main>
      <PageHero title={title} description={description} href={href} />
      <div className="container-page py-20">
        <div className="card flex flex-col items-center gap-4 border-dashed px-6 py-20 text-center">
          <Icon name="cross" className="size-8 text-brand-200" />
          <p className="text-sm text-ink-muted">구현 예정 (Supabase 데이터 연동 전)</p>
        </div>
      </div>
    </main>
  )
}
