import type { Metadata } from "next";
import { EducationMaterials } from "@/components/EducationMaterials";

export const metadata: Metadata = {
  title: "주일학교",
};

export default function Page() {
  return <EducationMaterials category="sunday_school" />;
}
