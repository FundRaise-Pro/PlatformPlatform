import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections } from "@/components/preview/PageSections";

interface BlogPageProps {
  config: FundraiserConfig;
}

export function BlogPage({ config }: BlogPageProps) {
  const customization = config.pageCustomizations.blog;

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero customization={customization} campaignLabel="Media and updates" />
      <PageSections sections={customization.sections} />
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {config.blogPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden border-white/90 bg-white/90 shadow-soft">
            <img src={post.image} alt={post.title} className="h-48 w-full object-cover" loading="lazy" />
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                {post.date} | {post.author}
              </p>
              <CardTitle className="font-display text-2xl text-slate-900">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-slate-600">{post.excerpt}</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="rounded-full p-0 text-slate-800">
                Read update <ArrowRight className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
