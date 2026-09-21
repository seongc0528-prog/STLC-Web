/**
 * 교육 자료의 세 갈래. DB의 education_materials.category(이넘)와 값이 같아야 한다.
 * href는 NAV_SECTIONS와 맞춰 두어 PageHero가 영문 라벨·브레드크럼을 찾아 쓴다.
 */
export const EDUCATION_CATEGORIES = {
  officer_training: {
    label: "직분자 제자훈련",
    href: "/education/officer",
    description: "직분자 제자훈련에서 나눈 교재와 강의 자료입니다.",
  },
  young_adult: {
    label: "대학청년",
    href: "/education/young-adult",
    description: "대학청년부 모임에서 쓰는 교재와 나눔 자료입니다.",
  },
  sunday_school: {
    label: "주일학교",
    href: "/education/sunday-school",
    description: "주일학교 공과와 활동 자료입니다.",
  },
} as const;

export type EducationCategory = keyof typeof EDUCATION_CATEGORIES;
