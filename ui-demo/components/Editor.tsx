import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Focus,
  ImagePlus,
  LayoutTemplate,
  MoveHorizontal,
  MoveVertical,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Type,
  Users,
  Video,
} from "lucide-react";
import { IMAGE_FILE_ACCEPT, PUBLIC_PAGE_ORDER } from "@/lib/constants";
import {
  DEFAULT_SECTION_COLUMN_SPAN,
  DEFAULT_SECTION_MIN_HEIGHT_REM,
  MAX_SECTION_COLUMN_SPAN,
  MAX_SECTION_HEIGHT_REM,
  MIN_SECTION_COLUMN_SPAN,
  MIN_SECTION_HEIGHT_REM,
  getSectionLayout,
  sortSectionsForBuilder,
} from "@/lib/builderLayout";
import { readImageFile } from "@/lib/fileUploads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EventCalendar } from "@/components/EventCalendar";
import { FundraiserConfig, NarrativeSection, PublicPageId } from "@/types";

interface EditorProps {
  config: FundraiserConfig;
  activePage: PublicPageId;
  focusedSectionId: string | null;
  onActivePageChange: (pageId: PublicPageId) => void;
  onFocusedSectionChange: (sectionId: string | null) => void;
  onChange: (config: FundraiserConfig) => void;
}

const EMPTY_MENTION = {
  partnerId: "",
  quote: "",
  context: "",
};

export default function Editor({
  config,
  activePage,
  focusedSectionId,
  onActivePageChange,
  onFocusedSectionChange,
  onChange,
}: EditorProps) {
  const [newMention, setNewMention] = useState(EMPTY_MENTION);

  const pageCustomization = config.pageCustomizations[activePage];
  const orderedSections = useMemo(
    () => sortSectionsForBuilder(pageCustomization.sections),
    [pageCustomization.sections],
  );
  const focusedSection = orderedSections.find((section) => section.id === focusedSectionId) ?? null;

  const updateConfig = (updates: Partial<FundraiserConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updatePageCustomization = (page: PublicPageId, updates: Partial<FundraiserConfig["pageCustomizations"][PublicPageId]>) => {
    updateConfig({
      pageCustomizations: {
        ...config.pageCustomizations,
        [page]: {
          ...config.pageCustomizations[page],
          ...updates,
        },
      },
    });
  };

  const updatePageSection = (page: PublicPageId, sectionId: string, updates: Partial<NarrativeSection>) => {
    updatePageCustomization(page, {
      sections: config.pageCustomizations[page].sections.map((section, index) => {
        if (section.id !== sectionId) {
          return section;
        }

        const currentLayout = getSectionLayout(section, index);
        return {
          ...section,
          ...updates,
          layout: updates.layout
            ? {
                ...currentLayout,
                ...updates.layout,
              }
            : section.layout,
        };
      }),
    });
  };

  const applySectionOrder = (page: PublicPageId, orderedIds: string[]) => {
    const orderLookup = orderedIds.reduce<Record<string, number>>((accumulator, id, index) => {
      accumulator[id] = index;
      return accumulator;
    }, {});

    updatePageCustomization(page, {
      sections: config.pageCustomizations[page].sections.map((section, index) => ({
        ...section,
        layout: {
          ...getSectionLayout(section, index),
          order: orderLookup[section.id] ?? index,
        },
      })),
    });
  };

  const moveFocusedSection = (direction: "up" | "down") => {
    if (!focusedSection) {
      return;
    }

    const index = orderedSections.findIndex((section) => section.id === focusedSection.id);
    if (index < 0) {
      return;
    }

    const targetIndex = direction === "up" ? Math.max(0, index - 1) : Math.min(orderedSections.length - 1, index + 1);
    if (targetIndex === index) {
      return;
    }

    const orderedIds = orderedSections.map((section) => section.id);
    const [movedId] = orderedIds.splice(index, 1);
    orderedIds.splice(targetIndex, 0, movedId);
    applySectionOrder(activePage, orderedIds);
  };

  const addPageSection = (page: PublicPageId) => {
    const nextIndex = config.pageCustomizations[page].sections.length + 1;
    const section: NarrativeSection = {
      id: `${page}-section-${Date.now()}`,
      title: `New ${config.pageCustomizations[page].navigationLabel} section`,
      description: "Add context for this section.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=900&auto=format&fit=crop",
      ctaLabel: "Learn more",
      ctaUrl: "",
      ctaOpenInNewTab: false,
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=900&auto=format&fit=crop",
      layout: {
        columnSpan: DEFAULT_SECTION_COLUMN_SPAN,
        minHeightRem: DEFAULT_SECTION_MIN_HEIGHT_REM,
        order: nextIndex - 1,
      },
    };

    updatePageCustomization(page, {
      sections: [...config.pageCustomizations[page].sections, section],
      heading: config.pageCustomizations[page].heading || `Page ${nextIndex}`,
    });
    onFocusedSectionChange(section.id);
  };

  const removePageSection = (page: PublicPageId, sectionId: string) => {
    updatePageCustomization(page, {
      sections: config.pageCustomizations[page].sections.filter((section) => section.id !== sectionId),
    });

    if (focusedSectionId === sectionId) {
      onFocusedSectionChange(null);
    }
  };

  const uploadPageHero = async (page: PublicPageId, file?: File) => {
    const image = await readImageFile(file);
    if (!image) {
      return;
    }

    updatePageCustomization(page, {
      heroImage: image,
      heroMediaType: "image",
      heroMediaUrl: image,
    });
  };

  const uploadSectionImage = async (page: PublicPageId, sectionId: string, file?: File) => {
    const image = await readImageFile(file);
    if (!image) {
      return;
    }

    updatePageSection(page, sectionId, {
      image,
      mediaType: "image",
      mediaUrl: image,
    });
  };

  const updateTierBenefitString = (tierId: string, nextValue: string) => {
    updateConfig({
      partnerTiers: config.partnerTiers.map((tier) =>
        tier.id === tierId
          ? {
              ...tier,
              benefits: nextValue
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
            }
          : tier,
      ),
    });
  };

  const addPartnerMention = () => {
    if (!newMention.partnerId || !newMention.quote.trim()) {
      return;
    }

    updateConfig({
      partnerMentions: [
        ...config.partnerMentions,
        {
          id: `mention-${Date.now()}`,
          partnerId: newMention.partnerId,
          quote: newMention.quote.trim(),
          context: newMention.context.trim() || "Partner mention",
          highlighted: false,
        },
      ],
    });

    setNewMention(EMPTY_MENTION);
  };

  const partnerLookup = useMemo(
    () =>
      config.partners.reduce<Record<string, string>>((accumulator, partner) => {
        accumulator[partner.id] = partner.name;
        return accumulator;
      }, {}),
    [config.partners],
  );

  return (
    <div className="flex h-full w-[27rem] shrink-0 flex-col border-r border-white/70 bg-white/85 backdrop-blur-xl xl:w-[31rem]">
      <div className="border-b border-slate-200/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Website Builder</p>
            <h2 className="font-display text-2xl text-slate-900">Visual Composer</h2>
          </div>
          <Sparkles className="size-6 text-emerald-600" />
        </div>
      </div>

      <Tabs defaultValue="builder" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-5 mt-4 grid grid-cols-3 rounded-xl">
          <TabsTrigger value="builder" className="gap-1">
            <LayoutTemplate className="size-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1">
            <Settings2 className="size-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-1">
            <Users className="size-4" />
            Partners
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="min-h-0 flex-1">
          <TabsContent value="general" className="space-y-4 px-5 pb-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Campaign narrative baseline</CardTitle>
                <CardDescription>These settings provide global consistency across every public page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Organization Name</Label>
                  <Input
                    id="tenantName"
                    value={config.tenantName}
                    onChange={(event) => updateConfig({ tenantName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignTitle">Campaign Title</Label>
                  <Input id="campaignTitle" value={config.title} onChange={(event) => updateConfig({ title: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignSubtitle">Campaign Subtitle</Label>
                  <Textarea
                    id="campaignSubtitle"
                    value={config.subtitle}
                    onChange={(event) => updateConfig({ subtitle: event.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignStory">Narrative Body</Label>
                  <Textarea
                    id="campaignStory"
                    value={config.story}
                    onChange={(event) => updateConfig({ story: event.target.value })}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Brand Accent</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      className="h-10 w-14 p-1"
                      value={config.primaryColor}
                      onChange={(event) => updateConfig({ primaryColor: event.target.value })}
                    />
                    <Input value={config.primaryColor} onChange={(event) => updateConfig({ primaryColor: event.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Terminology</CardTitle>
                <CardDescription>Use language that fits each tenant while keeping workflow consistency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label className="inline-flex items-center gap-2 text-sm">
                  <Type className="size-4 text-slate-500" />
                  Public labels
                </Label>
                <div className="space-y-2">
                  <Input
                    value={config.terminology.donation}
                    onChange={(event) =>
                      updateConfig({ terminology: { ...config.terminology, donation: event.target.value } })
                    }
                    placeholder="Donation label"
                  />
                  <Input
                    value={config.terminology.donor}
                    onChange={(event) => updateConfig({ terminology: { ...config.terminology, donor: event.target.value } })}
                    placeholder="Donor label"
                  />
                  <Input
                    value={config.terminology.campaign}
                    onChange={(event) =>
                      updateConfig({ terminology: { ...config.terminology, campaign: event.target.value } })
                    }
                    placeholder="Campaign label"
                  />
                  <Input
                    value={config.terminology.goal}
                    onChange={(event) => updateConfig({ terminology: { ...config.terminology, goal: event.target.value } })}
                    placeholder="Goal label"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4 px-5 pb-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Live canvas controls</CardTitle>
                <CardDescription>
                  Drag components on preview in a 12-column grid. Click any component to open focus mode editing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Active page</Label>
                  <Select
                    value={activePage}
                    onValueChange={(value) => {
                      onActivePageChange(value as PublicPageId);
                      onFocusedSectionChange(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose page" />
                    </SelectTrigger>
                    <SelectContent>
                      {PUBLIC_PAGE_ORDER.map((pageId) => (
                        <SelectItem key={pageId} value={pageId}>
                          {config.pageCustomizations[pageId].navigationLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button type="button" className="rounded-full" onClick={() => addPageSection(activePage)}>
                    <Plus className="size-4" />
                    Add section
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => onFocusedSectionChange(null)}>
                    Clear focus
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Show in navigation</p>
                    <p className="text-xs text-slate-500">Page can remain editable while hidden.</p>
                  </div>
                  <Switch
                    checked={pageCustomization.isVisible}
                    onCheckedChange={(checked) => updatePageCustomization(activePage, { isVisible: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="navigationLabel">Navigation label</Label>
                  <Input
                    id="navigationLabel"
                    value={pageCustomization.navigationLabel}
                    onChange={(event) => updatePageCustomization(activePage, { navigationLabel: event.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Focus mode inspector</CardTitle>
                <CardDescription>
                  Selected component controls appear here. Width and height map directly to preview resize handles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {focusedSection ? (
                  <>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      Editing: {focusedSection.title || "Untitled section"}
                    </div>
                    <div className="space-y-2">
                      <Label>Section title</Label>
                      <Input
                        value={focusedSection.title}
                        onChange={(event) => updatePageSection(activePage, focusedSection.id, { title: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Section description</Label>
                      <Textarea
                        rows={3}
                        value={focusedSection.description}
                        onChange={(event) => updatePageSection(activePage, focusedSection.id, { description: event.target.value })}
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>CTA label</Label>
                        <Input
                          value={focusedSection.ctaLabel}
                          onChange={(event) => updatePageSection(activePage, focusedSection.id, { ctaLabel: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA URL</Label>
                        <Input
                          value={focusedSection.ctaUrl ?? ""}
                          onChange={(event) => updatePageSection(activePage, focusedSection.id, { ctaUrl: event.target.value })}
                          placeholder="/internal-path or https://example.com"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Open CTA in new tab</p>
                        <p className="text-xs text-slate-500">Works for internal and external links.</p>
                      </div>
                      <Switch
                        checked={focusedSection.ctaOpenInNewTab ?? false}
                        onCheckedChange={(checked) => updatePageSection(activePage, focusedSection.id, { ctaOpenInNewTab: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Media type</Label>
                      <Select
                        value={focusedSection.mediaType ?? "image"}
                        onValueChange={(value) =>
                          updatePageSection(activePage, focusedSection.id, { mediaType: value as "image" | "video" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Embedded video URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{(focusedSection.mediaType ?? "image") === "video" ? "Video embed URL" : "Image URL"}</Label>
                      <Input
                        value={focusedSection.mediaUrl ?? focusedSection.image}
                        onChange={(event) =>
                          updatePageSection(activePage, focusedSection.id, {
                            mediaUrl: event.target.value,
                            image: event.target.value,
                          })
                        }
                      />
                      {(focusedSection.mediaType ?? "image") === "image" ? (
                        <Button type="button" variant="outline" className="w-full rounded-full" asChild>
                          <label className="cursor-pointer">
                            <ImagePlus className="size-4" />
                            Upload section image
                            <input
                              type="file"
                              accept={IMAGE_FILE_ACCEPT}
                              className="hidden"
                              onChange={(event) => uploadSectionImage(activePage, focusedSection.id, event.target.files?.[0])}
                            />
                          </label>
                        </Button>
                      ) : null}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="inline-flex items-center gap-2">
                        <MoveHorizontal className="size-4 text-slate-500" />
                        Width ({getSectionLayout(focusedSection, 0).columnSpan}/12)
                      </Label>
                      <Input
                        type="range"
                        min={String(MIN_SECTION_COLUMN_SPAN)}
                        max={String(MAX_SECTION_COLUMN_SPAN)}
                        value={String(getSectionLayout(focusedSection, 0).columnSpan)}
                        onChange={(event) =>
                          updatePageSection(activePage, focusedSection.id, {
                            layout: {
                              ...getSectionLayout(focusedSection, 0),
                              columnSpan: Number(event.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="inline-flex items-center gap-2">
                        <MoveVertical className="size-4 text-slate-500" />
                        Height ({getSectionLayout(focusedSection, 0).minHeightRem.toFixed(1)}rem)
                      </Label>
                      <Input
                        type="range"
                        min={String(MIN_SECTION_HEIGHT_REM)}
                        max={String(MAX_SECTION_HEIGHT_REM)}
                        step="0.5"
                        value={String(getSectionLayout(focusedSection, 0).minHeightRem)}
                        onChange={(event) =>
                          updatePageSection(activePage, focusedSection.id, {
                            layout: {
                              ...getSectionLayout(focusedSection, 0),
                              minHeightRem: Number(event.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Button type="button" variant="outline" onClick={() => moveFocusedSection("up")}>
                        Move up
                      </Button>
                      <Button type="button" variant="outline" onClick={() => moveFocusedSection("down")}>
                        Move down
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                      onClick={() => removePageSection(activePage, focusedSection.id)}
                    >
                      <Trash2 className="size-4" />
                      Remove component
                    </Button>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    Click any section in preview to open focus mode editing here.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Page frame controls</CardTitle>
                <CardDescription>Hero media and heading controls for the current page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pageHeading">Page heading</Label>
                  <Input
                    id="pageHeading"
                    value={pageCustomization.heading}
                    onChange={(event) => updatePageCustomization(activePage, { heading: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pageSubheading">Page subheading</Label>
                  <Textarea
                    id="pageSubheading"
                    value={pageCustomization.subheading}
                    rows={3}
                    onChange={(event) => updatePageCustomization(activePage, { subheading: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero media type</Label>
                  <Select
                    value={pageCustomization.heroMediaType ?? "image"}
                    onValueChange={(value) =>
                      updatePageCustomization(activePage, { heroMediaType: value as "image" | "video" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Embedded video URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroMediaUrl">
                    {(pageCustomization.heroMediaType ?? "image") === "video" ? "Hero video URL" : "Hero image URL"}
                  </Label>
                  <Input
                    id="heroMediaUrl"
                    value={pageCustomization.heroMediaUrl ?? pageCustomization.heroImage}
                    onChange={(event) =>
                      updatePageCustomization(activePage, {
                        heroMediaUrl: event.target.value,
                        heroImage: event.target.value,
                      })
                    }
                  />
                  {(pageCustomization.heroMediaType ?? "image") === "image" ? (
                    <Button type="button" variant="outline" className="w-full rounded-full" asChild>
                      <label className="cursor-pointer">
                        <ImagePlus className="size-4" />
                        Upload hero image
                        <input
                          type="file"
                          accept={IMAGE_FILE_ACCEPT}
                          className="hidden"
                          onChange={(event) => uploadPageHero(activePage, event.target.files?.[0])}
                        />
                      </label>
                    </Button>
                  ) : (
                    <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <Video className="size-4" />
                      Supports embedded URLs like YouTube and Vimeo.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Component map</CardTitle>
                <CardDescription>Jump focus to any section in this page layout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {orderedSections.length ? (
                  orderedSections.map((section, index) => {
                    const layout = getSectionLayout(section, index);
                    return (
                      <button
                        type="button"
                        key={section.id}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                          focusedSectionId === section.id
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                        onClick={() => onFocusedSectionChange(section.id)}
                      >
                        <p className="text-sm font-medium text-slate-900">{section.title || `Section ${index + 1}`}</p>
                        <p className="text-xs text-slate-500">
                          Span {layout.columnSpan}/12 | Min height {layout.minHeightRem}rem
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No sections yet. Add one to start designing.</p>
                )}
              </CardContent>
            </Card>

            {activePage === "events" ? (
              <EventCalendar
                events={config.events}
                title="Event calendar sync"
                description="Highlighted dates come from dashboard events and match public preview scheduling."
              />
            ) : null}

            {activePage === "apply" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Application forms</CardTitle>
                  <CardDescription>
                    Volunteer, help, and sponsor form fields are managed in Dashboard under Applications.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="partners" className="space-y-4 px-5 pb-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Tier clarity controls</CardTitle>
                <CardDescription>Define commitments and benefits so sponsors immediately understand value.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.partnerTiers.map((tier) => (
                  <Card key={tier.id} className="border-dashed border-slate-300">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <Label>{tier.name}</Label>
                        <BadgeCheck className="size-4 text-emerald-600" />
                      </div>
                      <Input
                        value={tier.name}
                        onChange={(event) =>
                          updateConfig({
                            partnerTiers: config.partnerTiers.map((entry) =>
                              entry.id === tier.id ? { ...entry, name: event.target.value } : entry,
                            ),
                          })
                        }
                        placeholder="Tier name"
                      />
                      <Input
                        type="number"
                        value={tier.minCommitment}
                        onChange={(event) =>
                          updateConfig({
                            partnerTiers: config.partnerTiers.map((entry) =>
                              entry.id === tier.id ? { ...entry, minCommitment: Number(event.target.value || 0) } : entry,
                            ),
                          })
                        }
                        placeholder="Minimum commitment"
                      />
                      <Textarea
                        rows={2}
                        value={tier.benefits.join(", ")}
                        onChange={(event) => updateTierBenefitString(tier.id, event.target.value)}
                        placeholder="Benefits separated by commas"
                      />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Partner mentions</CardTitle>
                <CardDescription>Mentions appear in the public partners page to strengthen credibility.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <Label>Add mention</Label>
                  <Select value={newMention.partnerId} onValueChange={(value) => setNewMention({ ...newMention, partnerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newMention.context}
                    onChange={(event) => setNewMention({ ...newMention, context: event.target.value })}
                    placeholder="Mention context"
                  />
                  <Textarea
                    rows={2}
                    value={newMention.quote}
                    onChange={(event) => setNewMention({ ...newMention, quote: event.target.value })}
                    placeholder="Quote"
                  />
                  <Button type="button" className="w-full rounded-full" onClick={addPartnerMention}>
                    <Plus className="size-4" />
                    Add mention
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  {config.partnerMentions.map((mention) => (
                    <Card key={mention.id}>
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{partnerLookup[mention.partnerId] ?? "Unknown partner"}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-slate-500 hover:text-destructive"
                            onClick={() =>
                              updateConfig({
                                partnerMentions: config.partnerMentions.filter((entry) => entry.id !== mention.id),
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{mention.context}</p>
                        <Textarea
                          rows={2}
                          value={mention.quote}
                          onChange={(event) =>
                            updateConfig({
                              partnerMentions: config.partnerMentions.map((entry) =>
                                entry.id === mention.id ? { ...entry, quote: event.target.value } : entry,
                              ),
                            })
                          }
                        />
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                          <p className="text-sm text-slate-700">Feature as highlighted mention</p>
                          <Switch
                            checked={mention.highlighted}
                            onCheckedChange={(checked) =>
                              updateConfig({
                                partnerMentions: config.partnerMentions.map((entry) =>
                                  entry.id === mention.id ? { ...entry, highlighted: checked } : entry,
                                ),
                              })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="border-t border-slate-200/60 px-5 py-4">
        <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
          <Focus className="size-4" />
          Publish preview updates
        </Button>
      </div>
    </div>
  );
}
