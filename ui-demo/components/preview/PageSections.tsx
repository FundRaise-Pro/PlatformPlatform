import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NarrativeSection } from "@/types";

interface PageSectionsProps {
  sections: NarrativeSection[];
}

export function PageSections({ sections }: PageSectionsProps) {
  if (!sections.length) {
    return null;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <Card key={section.id} className="overflow-hidden border-white/90 bg-white/85 shadow-soft">
          <img src={section.image} alt={section.title} className="h-44 w-full object-cover" loading="lazy" />
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-xl text-slate-900">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">{section.description}</p>
            <Button variant="outline" className="rounded-full">
              {section.ctaLabel}
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
