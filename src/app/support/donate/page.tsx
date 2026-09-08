import { requireUser } from "@/lib/auth";

const typeLabels: Record<string, string> = {
  tithe: "십일조",
  thanksgiving: "감사헌금",
  mission: "선교헌금",
  building: "건축헌금",
  other: "기타",
};

export default async function DonatePage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("donations")
    .select("*")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">온라인 헌금</h1>
      <p className="mb-8 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
        온라인 결제 기능은 준비 중입니다. 헌금은 계좌이체 등 기존 방식으로 진행해 주시고, 사무실에서 확인 후 아래
        내역에 반영해 드립니다.
      </p>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">나의 헌금 내역</h2>
      <ul className="flex flex-col divide-y divide-gray-100">
        {data?.map((d) => (
          <li key={d.id} className="flex justify-between py-3 text-sm">
            <span>
              {typeLabels[d.donation_type] ?? d.donation_type} · {new Date(d.created_at).toLocaleDateString()}
            </span>
            <span className="font-medium text-gray-900">${Number(d.amount).toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {data?.length === 0 && <p className="text-sm text-gray-400">등록된 내역이 없습니다.</p>}
    </main>
  );
}
