"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Program = { id: string; title: string };

export function EducationApplyForm({ programs }: { programs: Program[] }) {
  const [programId, setProgramId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("education_applications").insert({
      program_id: programId,
      applicant_id: userData.user.id,
      applicant_name: name,
      phone,
      email,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("신청이 접수되었습니다.");
    setName("");
    setPhone("");
    setEmail("");
  }

  if (programs.length === 0) {
    return <p className="text-sm text-gray-400">현재 신청 가능한 프로그램이 없습니다.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-3 rounded border border-gray-200 p-4">
      <select
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="" disabled>
          신청할 프로그램 선택
        </option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
        required
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="연락처"
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "신청 중..." : "신청하기"}
      </button>
    </form>
  );
}
