import { requireUser } from "@/lib/auth";
import { PageHero } from "@/components/PageHero";
import { Icon } from "@/components/icons";
import { formatChurchDate, formatKoreanDate } from "@/lib/date";
import { downloadUrl, fileExtension } from "@/lib/files";
import { EDUCATION_CATEGORIES, type EducationCategory } from "@/lib/education";

/**
 * 교육 자료 목록. 세 교육 페이지가 category만 바꿔 같은 화면을 쓴다.
 * 성도 대상 자료라 requireUser()로 로그인을 먼저 확인한다.
 */
export async function EducationMaterials({ category }: { category: EducationCategory }) {
  const { label, href, description } = EDUCATION_CATEGORIES[category];
  const { supabase } = await requireUser();

  const { data } = await supabase
    .from("education_materials")
    .select("id, title, description, file_url, material_date, created_at")
    .eq("category", category)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const materials = data ?? [];

  return (
    <main>
      <PageHero title={label} href={href} description={description} />

      <div className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          {materials.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {materials.map((material) => {
                const ext = material.file_url ? fileExtension(material.file_url) : null;
                const date = material.material_date
                  ? formatKoreanDate(material.material_date, false)
                  : formatChurchDate(material.created_at);

                return (
                  <li key={material.id}>
                    <article className="card flex items-start gap-4 px-5 py-5 sm:px-6">
                      <Icon name="document" className="mt-0.5 size-5 shrink-0 text-brand-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-ink-muted">{date}</p>
                        <h2 className="mt-1 text-[0.9375rem] font-medium text-ink">{material.title}</h2>
                        {material.description && (
                          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                            {material.description}
                          </p>
                        )}
                        {material.file_url && (
                          <div className="mt-4 flex items-center gap-4 text-sm">
                            <a
                              href={material.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-brand-600 transition hover:gap-2.5"
                            >
                              보기 <Icon name="arrowRight" className="size-3.5" />
                            </a>
                            <a
                              href={downloadUrl(material.file_url, material.title)}
                              className="text-ink-muted transition hover:text-brand-600"
                            >
                              다운로드{ext && ` (${ext})`}
                            </a>
                          </div>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
              등록된 자료가 없습니다.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
