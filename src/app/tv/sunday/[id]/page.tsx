import { SermonDetail } from "@/components/SermonDetail";

export default async function SundaySermonDetailPage(props: PageProps<"/tv/sunday/[id]">) {
  const { id } = await props.params;
  return <SermonDetail id={id} serviceType="sunday" basePath="/tv/sunday" />;
}
