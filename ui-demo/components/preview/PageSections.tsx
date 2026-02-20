import { MouseEvent, useMemo, useRef, useState } from "react";
import { GripHorizontal, MoveHorizontal, MoveVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MAX_SECTION_COLUMN_SPAN,
  MAX_SECTION_HEIGHT_REM,
  MIN_SECTION_COLUMN_SPAN,
  MIN_SECTION_HEIGHT_REM,
  getSectionLayout,
  isDirectVideoFile,
  normalizeVideoUrl,
  sortSectionsForBuilder,
} from "@/lib/builderLayout";
import { NarrativeSection } from "@/types";

export interface PageSectionsBuilderProps {
  enabled: boolean;
  focusedSectionId: string | null;
  onFocusSection: (sectionId: string | null) => void;
  onUpdateSection: (sectionId: string, updates: Partial<NarrativeSection>) => void;
  onReorderSections: (orderedSectionIds: string[]) => void;
}

interface PageSectionsProps {
  sections: NarrativeSection[];
  builder?: PageSectionsBuilderProps;
}

type ResizeDirection = "left" | "right" | "bottom";

export function PageSections({ sections, builder }: PageSectionsProps) {
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const gridRef = useRef<HTMLElement | null>(null);

  const orderedSections = useMemo(() => sortSectionsForBuilder(sections), [sections]);

  if (!orderedSections.length) {
    return null;
  }

  const reorderSections = (targetSectionId: string | null) => {
    if (!builder?.enabled || !draggedSectionId) {
      return;
    }

    const sectionIds = orderedSections.map((section) => section.id);
    const draggedIndex = sectionIds.indexOf(draggedSectionId);
    if (draggedIndex === -1) {
      return;
    }

    const nextIds = [...sectionIds];
    const [draggedId] = nextIds.splice(draggedIndex, 1);
    const targetIndex = targetSectionId ? nextIds.indexOf(targetSectionId) : nextIds.length;
    if (targetIndex === -1) {
      nextIds.push(draggedId);
    } else {
      nextIds.splice(targetIndex, 0, draggedId);
    }

    builder.onReorderSections(nextIds);
  };

  const startResize = (
    section: NarrativeSection,
    sectionIndex: number,
    direction: ResizeDirection,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    if (!builder?.enabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const sectionLayout = getSectionLayout(section, sectionIndex);
    const startSpan = sectionLayout.columnSpan;
    const startMinHeight = sectionLayout.minHeightRem;
    const containerWidth = gridRef.current?.getBoundingClientRect().width ?? 1200;
    const columnWidth = containerWidth / 12;

    const handleMove = (moveEvent: globalThis.MouseEvent) => {
      if (direction === "bottom") {
        const deltaRem = Math.round((moveEvent.clientY - startY) / 8) / 2;
        const nextMinHeight = Math.min(
          MAX_SECTION_HEIGHT_REM,
          Math.max(MIN_SECTION_HEIGHT_REM, startMinHeight + deltaRem),
        );

        builder.onUpdateSection(section.id, {
          layout: {
            ...sectionLayout,
            minHeightRem: nextMinHeight,
          },
        });
        return;
      }

      const deltaColumns = Math.round((moveEvent.clientX - startX) / columnWidth);
      const nextSpan =
        direction === "left"
          ? Math.min(MAX_SECTION_COLUMN_SPAN, Math.max(MIN_SECTION_COLUMN_SPAN, startSpan - deltaColumns))
          : Math.min(MAX_SECTION_COLUMN_SPAN, Math.max(MIN_SECTION_COLUMN_SPAN, startSpan + deltaColumns));

      builder.onUpdateSection(section.id, {
        layout: {
          ...sectionLayout,
          columnSpan: nextSpan,
        },
      });
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  return (
    <section
      ref={gridRef}
      className="grid grid-cols-12 gap-4"
      onDragOver={(event) => {
        if (!builder?.enabled || !draggedSectionId) {
          return;
        }
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!builder?.enabled || !draggedSectionId) {
          return;
        }
        event.preventDefault();
        reorderSections(null);
        setDraggedSectionId(null);
      }}
    >
      {orderedSections.map((section, index) => {
        const layout = getSectionLayout(section, index);
        const isFocused = Boolean(builder?.enabled && builder.focusedSectionId === section.id);
        const sectionMediaType = section.mediaType ?? "image";
        const sectionMediaUrl = (section.mediaUrl ?? section.image).trim();

        return (
          <div
            key={section.id}
            className="relative"
            style={{
              gridColumn: `span ${layout.columnSpan} / span ${layout.columnSpan}`,
              minHeight: `${layout.minHeightRem}rem`,
            }}
            draggable={Boolean(builder?.enabled)}
            onClick={() => builder?.onFocusSection(section.id)}
            onDragStart={() => {
              if (!builder?.enabled) {
                return;
              }
              setDraggedSectionId(section.id);
              builder.onFocusSection(section.id);
            }}
            onDragEnd={() => setDraggedSectionId(null)}
            onDragOver={(event) => {
              if (!builder?.enabled || !draggedSectionId || draggedSectionId === section.id) {
                return;
              }
              event.preventDefault();
            }}
            onDrop={(event) => {
              if (!builder?.enabled || !draggedSectionId) {
                return;
              }
              event.preventDefault();
              reorderSections(section.id);
              setDraggedSectionId(null);
            }}
          >
            <Card
              className={`h-full overflow-hidden border-white/90 bg-white/85 shadow-soft transition ${isFocused ? "ring-2 ring-emerald-500" : ""}`}
            >
              {sectionMediaType === "video" && sectionMediaUrl ? (
                isDirectVideoFile(sectionMediaUrl) ? (
                  <video
                    src={sectionMediaUrl}
                    className="h-44 w-full bg-black object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <iframe
                    src={normalizeVideoUrl(sectionMediaUrl)}
                    title={section.title}
                    className="h-44 w-full border-0 bg-black"
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <img
                  src={sectionMediaUrl || section.image}
                  alt={section.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              )}

              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xl text-slate-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">{section.description}</p>
                {builder?.enabled ? (
                  <div className="space-y-1">
                    <Button variant="outline" className="rounded-full">
                      {section.ctaLabel}
                    </Button>
                    {section.ctaUrl?.trim() ? (
                      <p className="text-xs text-slate-500">Redirect: {section.ctaUrl}</p>
                    ) : null}
                  </div>
                ) : section.ctaUrl?.trim() ? (
                  <Button variant="outline" className="rounded-full" asChild>
                    <a
                      href={section.ctaUrl}
                      target={section.ctaOpenInNewTab ? "_blank" : undefined}
                      rel={section.ctaOpenInNewTab ? "noreferrer noopener" : undefined}
                    >
                      {section.ctaLabel}
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full">
                    {section.ctaLabel}
                  </Button>
                )}
              </CardContent>
            </Card>

            {builder?.enabled ? (
              <>
                <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-white">
                  <GripHorizontal className="size-3" />
                  {layout.columnSpan}/12
                </div>

                {isFocused ? (
                  <>
                    <button
                      type="button"
                      className="absolute bottom-0 left-0 top-0 z-20 w-2 cursor-ew-resize rounded-l-lg bg-emerald-500/30"
                      onMouseDown={(event) => startResize(section, index, "left", event)}
                      aria-label="Resize section width from left"
                    />
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 top-0 z-20 w-2 cursor-ew-resize rounded-r-lg bg-emerald-500/30"
                      onMouseDown={(event) => startResize(section, index, "right", event)}
                      aria-label="Resize section width from right"
                    />
                    <button
                      type="button"
                      className="absolute bottom-0 left-1/2 z-20 inline-flex h-2 w-14 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-lg bg-emerald-500/50"
                      onMouseDown={(event) => startResize(section, index, "bottom", event)}
                      aria-label="Resize section height"
                    >
                      <MoveVertical className="size-3 text-white" />
                    </button>
                    <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-white">
                      <MoveHorizontal className="size-3" />
                      Focus mode
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
