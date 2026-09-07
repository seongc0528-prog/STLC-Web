export function PagePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      <div className="mt-8 rounded border border-dashed border-gray-300 p-12 text-center text-sm text-gray-400">
        구현 예정 (Supabase 데이터 연동 전)
      </div>
    </div>
  )
}
