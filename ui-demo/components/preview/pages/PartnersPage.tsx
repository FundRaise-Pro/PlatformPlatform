import { Award, Handshake, MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections } from "@/components/preview/PageSections";

interface PartnersPageProps {
  config: FundraiserConfig;
}

export function PartnersPage({ config }: PartnersPageProps) {
  const customization = config.pageCustomizations.partners;

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero customization={customization} campaignLabel="Partnership ecosystem" />
      <PageSections sections={customization.sections} />

      <Card className="border-white/90 bg-white/90 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Partner tiers and commitment levels</CardTitle>
          <CardDescription>
            Tier definitions are explicit so organizations can select benefits that match their contribution strategy.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {config.partnerTiers.map((tier) => (
            <Card key={tier.id} className="border-slate-200/80 bg-white">
              <CardHeader>
                <div className="mb-3 inline-flex size-11 items-center justify-center rounded-full" style={{ backgroundColor: `${tier.color}20` }}>
                  <Award className="size-5" style={{ color: tier.color }} />
                </div>
                <CardTitle className="font-display text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-lg font-semibold text-slate-900">
                  ${tier.minCommitment.toLocaleString()} minimum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tier.benefits.map((benefit) => (
                  <p key={benefit} className="text-sm text-slate-600">
                    - {benefit}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-white/90 bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Partner mentions wall</CardTitle>
            <CardDescription>Public trust indicators that show how partners talk about impact delivery.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {config.partnerMentions.map((mention) => {
              const partner = config.partners.find((entry) => entry.id === mention.partnerId);
              if (!partner) {
                return null;
              }

              return (
                <Card key={mention.id} className={mention.highlighted ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquareQuote className="size-4 text-emerald-700" />
                      {partner.name}
                    </CardTitle>
                    <CardDescription>{mention.context}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">"{mention.quote}"</p>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/90 bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Join as partner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-slate-600">
              Build an outcome-led partnership with transparent mentions, tiered visibility, and compliance-ready reporting.
            </p>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active partners</p>
              <p className="font-display text-4xl font-semibold text-slate-900">{config.partners.length}</p>
            </div>
            <Button className="w-full rounded-full">
              <Handshake className="size-4" />
              Start conversation
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/90 bg-white/90 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Partner roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Total Contribution</TableHead>
                <TableHead>Mentions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.partners.map((partner) => {
                const tier = config.partnerTiers.find((entry) => entry.id === partner.tierId);
                const mentionCount = config.partnerMentions.filter((entry) => entry.partnerId === partner.id).length;
                return (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>
                      <Badge className="rounded-full bg-slate-100 text-slate-700">{tier?.name ?? "Unassigned tier"}</Badge>
                    </TableCell>
                    <TableCell>${partner.totalContributed.toLocaleString()}</TableCell>
                    <TableCell>{mentionCount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
