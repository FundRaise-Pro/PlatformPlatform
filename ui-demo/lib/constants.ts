import { PublicPageId } from "@/types";

export const PUBLIC_PAGE_ORDER: PublicPageId[] = ["landing", "stories", "events", "blog", "partners", "apply"];

export const PUBLIC_PAGE_LABELS: Record<PublicPageId, string> = {
  landing: "Home",
  stories: "Stories",
  events: "Events",
  blog: "Media",
  partners: "Partners",
  apply: "Apply",
};

export const IMAGE_FILE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
