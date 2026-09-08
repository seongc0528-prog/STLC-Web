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
  const [{ data: churchInfo }, { data }] = await Promise.all([
    supabase.from("church_info").select("bank_name, bank_account_number, bank_account_holder").eq("id", 1).single(),
    supabase.from("donations").select("*").eq("member_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">온라인 헌금</h1>

      <div className="mb-8 rounded border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-500">계좌 안내</h2>
        {churchInfo?.bank_account_number ? (
          <dl className="flex flex-col gap-1 text-lg text-gray-900">
            <div>
              <dt className="inline text-sm text-gray-500">은행 </dt>
              <dd className="inline">{churchInfo.bank_name}</dd>
            </div>
            <div>
              <dt className="inline text-sm text-gray-500">계좌번호 </dt>
              <dd className="inline">{churchInfo.bank_account_number}</dd>
            </div>
            <div>
              <dt className="inline text-sm text-gray-500">예금주 </dt>
              <dd className="inline">{churchInfo.bank_account_holder}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-400">계좌 정보 준비 중입니다.</p>
        )}
        <p className="mt-3 text-sm text-gray-500">
          위 계좌로 헌금해 주시면 사무실에서 확인 후 아래 내역에 반영해 드립니다.
        </p>
      </div>

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
