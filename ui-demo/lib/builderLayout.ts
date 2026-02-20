import { NarrativeSection } from "@/types";

export const DEFAULT_SECTION_COLUMN_SPAN = 6;
export const DEFAULT_SECTION_MIN_HEIGHT_REM = 18;
export const MIN_SECTION_COLUMN_SPAN = 2;
export const MAX_SECTION_COLUMN_SPAN = 12;
export const MIN_SECTION_HEIGHT_REM = 12;
export const MAX_SECTION_HEIGHT_REM = 40;

export function getSectionLayout(section: NarrativeSection, index: number) {
  return {
    columnSpan: clamp(
      section.layout?.columnSpan ?? DEFAULT_SECTION_COLUMN_SPAN,
      MIN_SECTION_COLUMN_SPAN,
      MAX_SECTION_COLUMN_SPAN,
    ),
    minHeightRem: clamp(
      section.layout?.minHeightRem ?? DEFAULT_SECTION_MIN_HEIGHT_REM,
      MIN_SECTION_HEIGHT_REM,
      MAX_SECTION_HEIGHT_REM,
    ),
    order: section.layout?.order ?? index,
  };
}

export function sortSectionsForBuilder(sections: NarrativeSection[]): NarrativeSection[] {
  return [...sections].sort((left, right) => {
    const leftOrder = left.layout?.order ?? 0;
    const rightOrder = right.layout?.order ?? 0;
    return leftOrder - rightOrder;
  });
}

export function normalizeVideoUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  if (!url) {
    return "";
  }

  if (/youtube\.com\/watch\?v=([^&]+)/i.test(url)) {
    const match = url.match(/youtube\.com\/watch\?v=([^&]+)/i);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  if (/youtu\.be\/([^?&]+)/i.test(url)) {
    const match = url.match(/youtu\.be\/([^?&]+)/i);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  if (/vimeo\.com\/(\d+)/i.test(url)) {
    const match = url.match(/vimeo\.com\/(\d+)/i);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  }

  return url;
}

export function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
