import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { Icon } from "@/components/icons";
import Link from "next/link";

export default async function WorshipPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("church_info").select("*").eq("id", 1).single();

  const services = [
    { label: "주일 예배", en: "Sunday Service", value: data?.sunday_service },
    { label: "수요 예배", en: "Wednesday Service", value: data?.wednesday_service },
  ];

  return (
    <main>
      <PageHero
        title="예배 안내"
        href="/about/worship"
        description="말씀과 찬양으로 함께 드리는 예배입니다. 처음 방문하시는 분은 예배 20분 전에 오시면 안내를 받으실 수 있습니다."
      />

      <div className="container-page py-20">
        <div className="mx-auto max-w-3xl">
          <dl className="space-y-4">
            {services.map((service) => (
              <div
                key={service.label}
                className="card card-hover flex flex-wrap items-center justify-between gap-4 px-7 py-7"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name="clock" className="size-5" />
                  </span>
                  <div>
                    <dt className="font-serif text-lg font-semibold text-ink">{service.label}</dt>
                    <p className="eyebrow mt-1 text-[0.5625rem]">{service.en}</p>
                  </div>
                </div>
                <dd className="text-base font-medium text-brand-600">
                  {service.value ?? "정보 준비 중입니다."}
                </dd>
              </div>
            ))}
          </dl>

          {data?.address && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-card bg-brand-50 px-7 py-7">
              <div className="flex items-start gap-4">
                <Icon name="pin" className="mt-0.5 size-5 shrink-0 text-brand-600" />
                <div className="text-sm">
                  <p className="text-ink">{data.address}</p>
                  {data.address_en && data.address_en !== data.address && (
                    <p className="mt-1 text-ink-muted">{data.address_en}</p>
                  )}
                </div>
              </div>
              <Link href="/about/location" className="btn btn-primary">
                오시는 길
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
