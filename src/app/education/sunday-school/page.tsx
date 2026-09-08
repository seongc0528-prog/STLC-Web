import { requireUser } from "@/lib/auth";
import { EducationApplyForm } from "@/components/EducationApplyForm";

export default async function SundaySchoolPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("education_programs")
    .select("id, title")
    .eq("category", "sunday_school")
    .eq("is_active", true);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">주일학교</h1>
      <EducationApplyForm programs={data ?? []} />
    </main>
  );
}
