import { SermonDetail } from "@/components/SermonDetail";

export default async function WednesdaySermonDetailPage(
  props: PageProps<"/tv/wednesday/[id]">,
) {
  const { id } = await props.params;
  return <SermonDetail id={id} serviceType="wednesday" basePath="/tv/wednesday" />;
}
