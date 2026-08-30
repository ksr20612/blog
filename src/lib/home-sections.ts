export const HOME_SECTION_POST_LIMIT = 5;

export const homeSections = [
  { id: "human", title: "좀더 인간적인." },
  { id: "technical", title: "좀더 기술적인." },
] as const;

export type HomeSectionId = (typeof homeSections)[number]["id"];
