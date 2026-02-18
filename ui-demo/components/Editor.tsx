import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ImagePlus,
  LayoutTemplate,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Type,
  Users,
} from "lucide-react";
import { IMAGE_FILE_ACCEPT, PUBLIC_PAGE_ORDER } from "@/lib/constants";
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
import { FundraiserConfig, NarrativeSection, PublicPageId } from "@/types";

interface EditorProps {
  config: FundraiserConfig;
  onChange: (config: FundraiserConfig) => void;
}

const EMPTY_MENTION = {
  partnerId: "",
  quote: "",
  context: "",
};

export default function Editor({ config, onChange }: EditorProps) {
  const [activePage, setActivePage] = useState<PublicPageId>("landing");
  const [newMention, setNewMention] = useState(EMPTY_MENTION);

  const pageCustomization = config.pageCustomizations[activePage];

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
      sections: config.pageCustomizations[page].sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    });
  };

  const addPageSection = (page: PublicPageId) => {
    const nextIndex = config.pageCustomizations[page].sections.length + 1;
    const section: NarrativeSection = {
      id: `${page}-section-${Date.now()}`,
      title: `New ${config.pageCustomizations[page].navigationLabel} section`,
      description: "Add context for this section.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=900&auto=format&fit=crop",
      ctaLabel: "Learn more",
    };

    updatePageCustomization(page, {
      sections: [...config.pageCustomizations[page].sections, section],
      heading: config.pageCustomizations[page].heading || `Page ${nextIndex}`,
    });
  };

  const removePageSection = (page: PublicPageId, sectionId: string) => {
    updatePageCustomization(page, {
      sections: config.pageCustomizations[page].sections.filter((section) => section.id !== sectionId),
    });
  };

  const uploadPageHero = async (page: PublicPageId, file?: File) => {
    const image = await readImageFile(file);
    if (!image) {
      return;
    }

    updatePageCustomization(page, { heroImage: image });
  };

  const uploadSectionImage = async (page: PublicPageId, sectionId: string, file?: File) => {
    const image = await readImageFile(file);
    if (!image) {
      return;
    }

    updatePageSection(page, sectionId, { image });
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
    <div className="flex h-full w-[27rem] shrink-0 flex-col border-r border-white/70 bg-white/85 backdrop-blur-xl xl:w-[30rem]">
      <div className="border-b border-slate-200/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Website Builder</p>
            <h2 className="font-display text-2xl text-slate-900">Narrative Editor</h2>
          </div>
          <Sparkles className="size-6 text-emerald-600" />
        </div>
      </div>

      <Tabs defaultValue="pages" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-5 mt-4 grid grid-cols-3 rounded-xl">
          <TabsTrigger value="general" className="gap-1">
            <Settings2 className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-1">
            <LayoutTemplate className="size-4" />
            Pages
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

          <TabsContent value="pages" className="space-y-4 px-5 pb-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Page customization studio</CardTitle>
                <CardDescription>
                  Every public page has independent controls for navigation naming, hero visuals, and custom sections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Page target</Label>
                  <Select value={activePage} onValueChange={(value) => setActivePage(value as PublicPageId)}>
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
                <div className="space-y-2">
                  <Label htmlFor="navigationLabel">Navigation Label</Label>
                  <Input
                    id="navigationLabel"
                    value={pageCustomization.navigationLabel}
                    onChange={(event) => updatePageCustomization(activePage, { navigationLabel: event.target.value })}
                  />
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
                  <Label htmlFor="pageHeading">Page Heading</Label>
                  <Input
                    id="pageHeading"
                    value={pageCustomization.heading}
                    onChange={(event) => updatePageCustomization(activePage, { heading: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pageSubheading">Page Subheading</Label>
                  <Textarea
                    id="pageSubheading"
                    value={pageCustomization.subheading}
                    rows={3}
                    onChange={(event) => updatePageCustomization(activePage, { subheading: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroImage">Hero Image URL</Label>
                  <Input
                    id="heroImage"
                    value={pageCustomization.heroImage}
                    onChange={(event) => updatePageCustomization(activePage, { heroImage: event.target.value })}
                  />
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="font-display text-xl">Custom Sections</CardTitle>
                  <CardDescription>Add context blocks for this page.</CardDescription>
                </div>
                <Button type="button" size="sm" className="rounded-full" onClick={() => addPageSection(activePage)}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {pageCustomization.sections.map((section) => (
                  <Card key={section.id} className="border-dashed border-slate-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-base">Section block</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePageSection(activePage, section.id)}
                        className="rounded-full text-slate-500 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Input
                        value={section.title}
                        onChange={(event) => updatePageSection(activePage, section.id, { title: event.target.value })}
                        placeholder="Section title"
                      />
                      <Textarea
                        rows={2}
                        value={section.description}
                        onChange={(event) => updatePageSection(activePage, section.id, { description: event.target.value })}
                        placeholder="Section description"
                      />
                      <Input
                        value={section.ctaLabel}
                        onChange={(event) => updatePageSection(activePage, section.id, { ctaLabel: event.target.value })}
                        placeholder="CTA label"
                      />
                      <Input
                        value={section.image}
                        onChange={(event) => updatePageSection(activePage, section.id, { image: event.target.value })}
                        placeholder="Image URL"
                      />
                      <Button type="button" variant="outline" className="w-full rounded-full" asChild>
                        <label className="cursor-pointer">
                          <ImagePlus className="size-4" />
                          Upload section image
                          <input
                            type="file"
                            accept={IMAGE_FILE_ACCEPT}
                            className="hidden"
                            onChange={(event) => uploadSectionImage(activePage, section.id, event.target.files?.[0])}
                          />
                        </label>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
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
          Publish preview updates
        </Button>
      </div>
    </div>
  );
}
