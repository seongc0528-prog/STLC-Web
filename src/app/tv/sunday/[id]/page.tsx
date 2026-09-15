import { SermonDetail, sermonMetadata } from "@/components/SermonDetail";

export async function generateMetadata(props: PageProps<"/tv/sunday/[id]">) {
  const { id } = await props.params;
  return sermonMetadata(id, "sunday");
}

export default async function SundaySermonDetailPage(props: PageProps<"/tv/sunday/[id]">) {
  const { id } = await props.params;
  return <SermonDetail id={id} serviceType="sunday" basePath="/tv/sunday" />;
}
