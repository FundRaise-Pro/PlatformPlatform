import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { Heading } from "@repo/ui/components/Heading";
import { Separator } from "@repo/ui/components/Separator";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/settings")({
  component: SettingsPage
});

export default function SettingsPage() {
  const { data: settings, isLoading } = api.useQuery("get", "/api/fundraiser/tenant-settings");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Settings` }]} />}
        title={t`Settings`}
        subtitle={t`Configure your organization's branding, theme, and integrations.`}
        variant="center"
        maxWidth="800px"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading settings...</Trans>
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <SettingsSection
              title={t`Branding`}
              description={t`Customize your organization's name, tagline, and contact information.`}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SettingsField label={t`Organization name`} value={settings?.brand?.organizationName} />
                <SettingsField label={t`Tagline`} value={settings?.brand?.tagline} />
                <SettingsField label={t`Support email`} value={settings?.brand?.supportEmail} />
                <SettingsField label={t`Phone number`} value={settings?.brand?.phoneNumber} />
              </div>
              <div className="mt-4">
                <Button variant="secondary" onPress={() => {}}>
                  <Trans>Edit branding</Trans>
                </Button>
              </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title={t`Theme`} description={t`Customize colors, fonts, and visual appearance.`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ColorPreview label={t`Primary`} color={settings?.theme?.primaryColor ?? "#10b981"} />
                <ColorPreview label={t`Secondary`} color={settings?.theme?.secondaryColor ?? "#6366f1"} />
                <ColorPreview label={t`Accent`} color={settings?.theme?.accentColor ?? "#f59e0b"} />
              </div>
              <div className="mt-4">
                <Button variant="secondary" onPress={() => {}}>
                  <Trans>Edit theme</Trans>
                </Button>
              </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title={t`Domain`} description={t`Configure your subdomain and custom domains.`}>
              <SettingsField
                label={t`Subdomain`}
                value={settings?.domain?.subdomain ? `${settings.domain.subdomain}.fundraiseos.com` : undefined}
              />
              <div className="mt-4">
                <Button variant="secondary" onPress={() => {}}>
                  <Trans>Edit domain</Trans>
                </Button>
              </div>
            </SettingsSection>

            <Separator />

            <SettingsSection
              title={t`Payment configuration`}
              description={t`Configure payment gateway for receiving donations.`}
            >
              <SettingsField label={t`Payment provider`} value={settings?.payment?.provider ?? t`Not configured`} />
              <div className="mt-4">
                <Button variant="secondary" onPress={() => {}}>
                  <Trans>Configure payments</Trans>
                </Button>
              </div>
            </SettingsSection>
          </div>
        )}
      </AppLayout>
    </>
  );
}

function SettingsSection({
  title,
  description,
  children
}: Readonly<{ title: string; description: string; children: React.ReactNode }>) {
  return (
    <div>
      <Heading level={3} className="mb-1 font-semibold text-lg">
        {title}
      </Heading>
      <Text className="mb-4 text-muted-foreground text-sm">{description}</Text>
      {children}
    </div>
  );
}

function SettingsField({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  return (
    <div>
      <Text className="text-muted-foreground text-sm">{label}</Text>
      <Text className="font-medium">{value ?? "-"}</Text>
    </div>
  );
}

function ColorPreview({ label, color }: Readonly<{ label: string; color: string }>) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-md border border-border" style={{ backgroundColor: color }} />
      <div>
        <Text className="text-sm">{label}</Text>
        <Text className="font-mono text-muted-foreground text-xs">{color}</Text>
      </div>
    </div>
  );
}
