import { SermonDetail, sermonMetadata } from "@/components/SermonDetail";

export async function generateMetadata(props: PageProps<"/tv/wednesday/[id]">) {
  const { id } = await props.params;
  return sermonMetadata(id, "wednesday");
}

export default async function WednesdaySermonDetailPage(
  props: PageProps<"/tv/wednesday/[id]">,
) {
  const { id } = await props.params;
  return <SermonDetail id={id} serviceType="wednesday" basePath="/tv/wednesday" />;
}
