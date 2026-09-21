import type { Metadata } from "next";
import { EducationMaterials } from "@/components/EducationMaterials";

export const metadata: Metadata = {
  title: "대학청년",
};

export default function Page() {
  return <EducationMaterials category="young_adult" />;
}
