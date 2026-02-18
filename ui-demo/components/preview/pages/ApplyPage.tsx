import { ReactNode, useEffect, useMemo, useState } from "react";
import { BadgeCheck, HandHeart, Handshake, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ApplyPathId, FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections } from "@/components/preview/PageSections";

interface ApplyPageProps {
  config: FundraiserConfig;
  activePath: ApplyPathId;
  onPathChange: (path: ApplyPathId) => void;
  onSubmitApplication?: (categoryId: ApplyPathId, values: Record<string, string>) => void;
}

const APPLY_PATH_ORDER: ApplyPathId[] = ["volunteer", "help", "sponsor"];

const APPLY_PATH_META: Record<ApplyPathId, { label: string; icon: ReactNode; path: string }> = {
  volunteer: {
    label: "Volunteer",
    icon: <UsersRound className="size-4" />,
    path: "/apply/volunteer",
  },
  help: {
    label: "Request Help",
    icon: <HandHeart className="size-4" />,
    path: "/apply/help",
  },
  sponsor: {
    label: "Partner / Sponsor",
    icon: <Handshake className="size-4" />,
    path: "/apply/sponsor",
  },
};

export function ApplyPage({ config, activePath, onPathChange, onSubmitApplication }: ApplyPageProps) {
  const customization = config.pageCustomizations.apply;
  const category = config.applicationForms[activePath];
  const [valuesByPath, setValuesByPath] = useState<Record<ApplyPathId, Record<string, string>>>({
    volunteer: {},
    help: {},
    sponsor: {},
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const currentValues = valuesByPath[activePath];

  useEffect(() => {
    setMessage(null);
  }, [activePath]);

  const requiredFieldsMissing = useMemo(
    () => category.fields.some((field) => field.required && !String(currentValues[field.id] ?? "").trim()),
    [category.fields, currentValues],
  );

  const updateValue = (fieldId: string, value: string) => {
    setValuesByPath((current) => ({
      ...current,
      [activePath]: {
        ...current[activePath],
        [fieldId]: value,
      },
    }));
  };

  const handleSubmit = () => {
    if (requiredFieldsMissing) {
      setMessageTone("error");
      setMessage("Please complete all required fields before submitting.");
      return;
    }

    onSubmitApplication?.(activePath, currentValues);
    setValuesByPath((current) => ({
      ...current,
      [activePath]: {},
    }));
    setMessageTone("success");
    setMessage("Application sent. Your dashboard inbox now has this submission.");
  };

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero customization={customization} campaignLabel="Application center" />
      <PageSections sections={customization.sections} />

      <Card className="border-white/90 bg-white/90 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Choose an application path</CardTitle>
          <CardDescription>Each path has its own form and appears in the dashboard application inbox.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs value={activePath} onValueChange={(value) => onPathChange(value as ApplyPathId)}>
            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 md:grid-cols-3">
              {APPLY_PATH_ORDER.map((path) => (
                <TabsTrigger key={path} value={path} className="h-12 gap-2 text-sm">
                  {APPLY_PATH_META[path].icon}
                  {APPLY_PATH_META[path].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            Active path: {APPLY_PATH_META[activePath].path}
          </div>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="font-display text-2xl">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      rows={3}
                      value={currentValues[field.id] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => updateValue(field.id, event.target.value)}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <Select value={currentValues[field.id] ?? ""} onValueChange={(value) => updateValue(field.id, value)}>
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder={field.placeholder || "Select option"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  {field.type !== "textarea" && field.type !== "select" ? (
                    <Input
                      id={field.id}
                      type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                      value={currentValues[field.id] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => updateValue(field.id, event.target.value)}
                    />
                  ) : null}
                </div>
              ))}

              {message ? (
                <p
                  className={
                    messageTone === "success"
                      ? "inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700"
                      : "inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700"
                  }
                >
                  <BadgeCheck className="size-4" />
                  {message}
                </p>
              ) : null}

              <Button type="button" className="rounded-full" onClick={handleSubmit}>
                {category.submitLabel}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
