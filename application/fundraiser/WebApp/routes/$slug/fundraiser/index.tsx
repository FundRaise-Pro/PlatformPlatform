import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Card } from "@repo/ui/components/Card";
import { Heading } from "@repo/ui/components/Heading";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenIcon, CalendarIcon, CreditCardIcon, FileTextIcon, HeartIcon, QrCodeIcon } from "lucide-react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/")({
  component: Dashboard
});

function StatCard({
  icon: Icon,
  label,
  value,
  description
}: Readonly<{ icon: React.ElementType; label: string; value: string | number; description?: string }>) {
  return (
    <Card className="flex flex-col gap-2 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <Text className="text-muted-foreground">{label}</Text>
      </div>
      <div className="flex items-baseline gap-2">
        <Heading level={2} className="text-3xl font-bold">
          {value}
        </Heading>
        {description && <Text className="text-muted-foreground">{description}</Text>}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const slug = useUserInfo()?.tenantSlug;
  const { data: campaigns } = api.useQuery("get", "/api/fundraiser/campaigns");
  const { data: donations } = api.useQuery("get", "/api/fundraiser/donations");
  const { data: blogPosts } = api.useQuery("get", "/api/fundraiser/blogs");
  const { data: events } = api.useQuery("get", "/api/fundraiser/events");

  const campaignCount = campaigns?.length ?? 0;
  const donationCount = donations?.length ?? 0;
  const blogPostCount = blogPosts?.length ?? 0;
  const eventCount = events?.length ?? 0;

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout topMenu={<TopMenu />} title={t`Dashboard`} subtitle={t`Overview of your fundraising platform.`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={HeartIcon} label={t`Campaigns`} value={campaignCount} />
          <StatCard icon={CreditCardIcon} label={t`Donations`} value={donationCount} />
          <StatCard icon={BookOpenIcon} label={t`Blog posts`} value={blogPostCount} />
          <StatCard icon={CalendarIcon} label={t`Events`} value={eventCount} />
          <StatCard icon={FileTextIcon} label={t`Applications`} value="-" description={t`Coming soon`} />
          <StatCard icon={QrCodeIcon} label={t`QR codes`} value="-" description={t`Coming soon`} />
        </div>

        <div className="mt-8">
          <Heading level={3} className="mb-4 text-lg font-semibold">
            <Trans>Quick actions</Trans>
          </Heading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              href={tenantPath(slug, "fundraiser", "campaigns")}
              label={t`Create campaign`}
              icon={HeartIcon}
            />
            <QuickActionCard
              href={tenantPath(slug, "fundraiser", "blogs")}
              label={t`Write blog post`}
              icon={BookOpenIcon}
            />
            <QuickActionCard
              href={tenantPath(slug, "fundraiser", "events")}
              label={t`Plan event`}
              icon={CalendarIcon}
            />
            <QuickActionCard
              href={tenantPath(slug, "fundraiser", "forms")}
              label={t`Design form`}
              icon={FileTextIcon}
            />
          </div>
        </div>
      </AppLayout>
    </>
  );
}

function QuickActionCard({
  href,
  label,
  icon: Icon
}: Readonly<{ href: string; label: string; icon: React.ElementType }>) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-hover-background"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <Text>{label}</Text>
    </a>
  );
}
