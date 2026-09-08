import { requireUser } from "@/lib/auth";
import { EducationApplyForm } from "@/components/EducationApplyForm";

export default async function OfficerTrainingPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("education_programs")
    .select("id, title")
    .eq("category", "officer_training")
    .eq("is_active", true);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">직분자 제자훈련</h1>
      <EducationApplyForm programs={data ?? []} />
    </main>
  );
}
