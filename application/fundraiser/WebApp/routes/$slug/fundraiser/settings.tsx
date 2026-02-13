import { useState } from "react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { Form } from "@repo/ui/components/Form";
import { Separator } from "@repo/ui/components/Separator";
import { Skeleton } from "@repo/ui/components/Skeleton";
import { Text } from "@repo/ui/components/Text";
import { TextField } from "@repo/ui/components/TextField";
import { mutationSubmitter } from "@repo/ui/forms/mutationSubmitter";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api, type Schemas } from "@/shared/lib/api/client";

type TenantSettings = Schemas["TenantSettingsResponse"];

export const Route = createFileRoute("/$slug/fundraiser/settings")({
  component: SettingsPage
});

export default function SettingsPage() {
  const { data: settings, isLoading } = api.useQuery("get", "/api/fundraiser/tenant-settings");
  const { slug } = Route.useParams();

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Settings` }]} />}
        title={t`Settings`}
        subtitle={t`Configure your organization's branding, theme, and integrations.`}
      >
        {isLoading ? (
          <SettingsLoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <ThemeEditor
                settings={settings}
                slug={slug}
              />

              <Separator />

              <BrandEditor settings={settings} />

              <Separator />

              <SettingsSection
                title={t`Domain`}
                description={t`Configure your subdomain and custom domains.`}
              >
                <SettingsField
                  label={t`Subdomain`}
                  value={settings?.domain?.subdomain ? `${settings.domain.subdomain}.fundraiseos.com` : undefined}
                />
              </SettingsSection>

              <Separator />

              <SettingsSection
                title={t`Payment configuration`}
                description={t`Configure payment gateway for receiving donations.`}
              >
                <SettingsField label={t`Payment provider`} value={settings?.payment?.provider ?? t`Not configured`} />
              </SettingsSection>
            </div>

            <div className="hidden lg:block">
              <LivePreviewPanel slug={slug} />
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}

function ThemeEditor({
  settings,
  slug
}: Readonly<{
  settings: TenantSettings | undefined;
  slug: string;
}>) {
  const queryClient = useQueryClient();
  const [primaryColor, setPrimaryColor] = useState(settings?.theme?.primaryColor ?? "#10b981");
  const [secondaryColor, setSecondaryColor] = useState(settings?.theme?.secondaryColor ?? "#6366f1");
  const [accentColor, setAccentColor] = useState(settings?.theme?.accentColor ?? "#f59e0b");

  const updateThemeMutation = api.useMutation("put", "/api/fundraiser/tenant-settings/theme", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/tenant-settings"] });
      toast.success(t`Success`, { description: t`Theme updated successfully.` });
    }
  });

  const sendPreviewMessage = (primary: string, secondary: string, accent: string) => {
    const previewIframe = document.querySelector<HTMLIFrameElement>("[data-preview-iframe]");
    previewIframe?.contentWindow?.postMessage(
      { type: "preview-settings", theme: { primaryColor: primary, secondaryColor: secondary, accentColor: accent } },
      "*"
    );
  };

  const handlePrimaryColorChange = (value: string) => {
    setPrimaryColor(value);
    sendPreviewMessage(value, secondaryColor, accentColor);
  };

  const handleSecondaryColorChange = (value: string) => {
    setSecondaryColor(value);
    sendPreviewMessage(primaryColor, value, accentColor);
  };

  const handleAccentColorChange = (value: string) => {
    setAccentColor(value);
    sendPreviewMessage(primaryColor, secondaryColor, value);
  };

  return (
    <SettingsSection title={t`Theme`} description={t`Customize colors, fonts, and visual appearance.`}>
      <Form
        onSubmit={mutationSubmitter(updateThemeMutation)}
        validationBehavior="aria"
        validationErrors={updateThemeMutation.error?.errors}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ColorPickerField
              name="primaryColor"
              label={t`Primary color`}
              value={primaryColor}
              onChange={handlePrimaryColorChange}
            />
            <ColorPickerField
              name="secondaryColor"
              label={t`Secondary color`}
              value={secondaryColor}
              onChange={handleSecondaryColorChange}
            />
            <ColorPickerField
              name="accentColor"
              label={t`Accent color`}
              value={accentColor}
              onChange={handleAccentColorChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="fontFamily"
              label={t`Font family`}
              defaultValue={settings?.theme?.fontFamily ?? ""}
              placeholder={t`E.g., Inter, Roboto`}
            />
            <TextField
              name="fontUrl"
              label={t`Font URL`}
              defaultValue={settings?.theme?.fontUrl ?? ""}
              placeholder={t`E.g., https://fonts.googleapis.com/...`}
            />
          </div>

          <TextField
            name="faviconUrl"
            label={t`Favicon URL`}
            defaultValue={settings?.theme?.faviconUrl ?? ""}
            placeholder={t`E.g., https://example.com/favicon.ico`}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={updateThemeMutation.isPending}>
              {updateThemeMutation.isPending ? <Trans>Saving...</Trans> : <Trans>Save theme</Trans>}
            </Button>
          </div>
        </div>
      </Form>
    </SettingsSection>
  );
}

function BrandEditor({
  settings
}: Readonly<{
  settings: TenantSettings | undefined;
}>) {
  const queryClient = useQueryClient();

  const updateBrandMutation = api.useMutation("put", "/api/fundraiser/tenant-settings/brand", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/tenant-settings"] });
      toast.success(t`Success`, { description: t`Branding updated successfully.` });
    }
  });

  return (
    <SettingsSection
      title={t`Branding`}
      description={t`Customize your organization's name, tagline, and contact information.`}
    >
      <Form
        onSubmit={mutationSubmitter(updateBrandMutation)}
        validationBehavior="aria"
        validationErrors={updateBrandMutation.error?.errors}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="organizationName"
              label={t`Organization name`}
              defaultValue={settings?.brand?.organizationName ?? ""}
              placeholder={t`E.g., Save the Children`}
            />
            <TextField
              name="tagline"
              label={t`Tagline`}
              defaultValue={settings?.brand?.tagline ?? ""}
              placeholder={t`E.g., Every child deserves a future`}
            />
            <TextField
              name="supportEmail"
              label={t`Support email`}
              defaultValue={settings?.brand?.supportEmail ?? ""}
              placeholder={t`E.g., support@example.org`}
            />
            <TextField
              name="phoneNumber"
              label={t`Phone number`}
              defaultValue={settings?.brand?.phoneNumber ?? ""}
              placeholder={t`E.g., +1 (555) 123-4567`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="termsUrl"
              label={t`Terms URL`}
              defaultValue={settings?.brand?.termsUrl ?? ""}
              placeholder={t`E.g., https://example.org/terms`}
            />
            <TextField
              name="privacyUrl"
              label={t`Privacy URL`}
              defaultValue={settings?.brand?.privacyUrl ?? ""}
              placeholder={t`E.g., https://example.org/privacy`}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateBrandMutation.isPending}>
              {updateBrandMutation.isPending ? <Trans>Saving...</Trans> : <Trans>Save branding</Trans>}
            </Button>
          </div>
        </div>
      </Form>
    </SettingsSection>
  );
}

function LivePreviewPanel({ slug }: Readonly<{ slug: string }>) {
  const previewUrl = `${window.location.protocol}//${slug}.${window.location.host}`;

  return (
    <div className="sticky top-6 flex w-[22rem] flex-col gap-3">
      <h3 className="mb-1">
        <Trans>Live preview</Trans>
      </h3>
      <Text className="text-muted-foreground">
        <Trans>See real-time changes as you edit your theme colors.</Trans>
      </Text>
      <Card className="overflow-hidden rounded-lg border">
        <iframe
          data-preview-iframe
          src={previewUrl}
          title={t`Website preview`}
          className="h-[28rem] w-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </Card>
    </div>
  );
}

function ColorPickerField({
  name,
  label,
  value,
  onChange
}: Readonly<{
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text className="text-muted-foreground text-sm">{label}</Text>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-8 cursor-pointer rounded-md border border-border"
          aria-label={label}
        />
        <TextField
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1"
          aria-label={label}
        />
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children
}: Readonly<{ title: string; description: string; children: React.ReactNode }>) {
  return (
    <div>
      <h3 className="mb-1">{title}</h3>
      <Text className="mb-4 text-muted-foreground">{description}</Text>
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

function SettingsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-24" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
