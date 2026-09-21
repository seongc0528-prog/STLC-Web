import type { Metadata } from "next";
import { EducationMaterials } from "@/components/EducationMaterials";

export const metadata: Metadata = {
  title: "직분자 제자훈련",
};

export default function Page() {
  return <EducationMaterials category="officer_training" />;
}
