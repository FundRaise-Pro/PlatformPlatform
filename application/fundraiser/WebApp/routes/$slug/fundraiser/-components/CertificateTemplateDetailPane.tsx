import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { api } from "@/shared/lib/api/client";

type CertificateTemplateDetailPaneProps = Readonly<{
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

export function CertificateTemplateDetailPane({ templateId, isOpen, onClose }: CertificateTemplateDetailPaneProps) {
  const { data: template, isLoading } = api.useQuery("get", "/api/fundraiser/certificates/templates/{id}", {
    params: { path: { id: templateId } }
  });

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SidePaneHeader>{template?.name ?? t`Certificate Template`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground"><Trans>Loading...</Trans></Text>
        ) : template ? (
          <div className="flex flex-col gap-6">
            {/* Status */}
            <div className="flex items-center gap-2">
              {template.isDefault && <Badge variant="success"><Trans>Default</Trans></Badge>}
            </div>

            {/* Description */}
            {template.description && (
              <div>
                <Text className="text-muted-foreground text-sm"><Trans>Description</Trans></Text>
                <Text className="text-sm">{template.description}</Text>
              </div>
            )}

            <Separator />

            {/* Organisation details */}
            <div>
              <Text className="mb-3 font-medium"><Trans>Organisation Details</Trans></Text>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Text className="text-muted-foreground"><Trans>Organisation Name</Trans></Text>
                  <Text className="font-medium">{template.organisationName ?? "—"}</Text>
                </div>
                <div>
                  <Text className="text-muted-foreground"><Trans>PBO Number</Trans></Text>
                  <Text className="font-medium">{template.pboNumber ?? "—"}</Text>
                </div>
                <div>
                  <Text className="text-muted-foreground"><Trans>Registration Number</Trans></Text>
                  <Text className="font-medium">{template.registrationNumber ?? "—"}</Text>
                </div>
                <div>
                  <Text className="text-muted-foreground"><Trans>Address</Trans></Text>
                  <Text className="font-medium">{template.organisationAddress ?? "—"}</Text>
                </div>
              </div>
            </div>

            <Separator />

            {/* Signatory */}
            <div>
              <Text className="mb-3 font-medium"><Trans>Signatory</Trans></Text>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Text className="text-muted-foreground"><Trans>Name</Trans></Text>
                  <Text className="font-medium">{template.signatoryName ?? "—"}</Text>
                </div>
                <div>
                  <Text className="text-muted-foreground"><Trans>Title</Trans></Text>
                  <Text className="font-medium">{template.signatoryTitle ?? "—"}</Text>
                </div>
              </div>
            </div>

            {template.logoUrl && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 text-muted-foreground text-sm"><Trans>Logo</Trans></Text>
                  <img src={template.logoUrl} alt={t`Organisation logo`} className="h-16 rounded" />
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Text className="text-muted-foreground"><Trans>Created</Trans></Text>
                <Text className="font-medium">{new Date(template.createdAt).toLocaleString()}</Text>
              </div>
              {template.modifiedAt && (
                <div>
                  <Text className="text-muted-foreground"><Trans>Modified</Trans></Text>
                  <Text className="font-medium">{new Date(template.modifiedAt).toLocaleString()}</Text>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground"><Trans>Template not found.</Trans></Text>
        )}
      </SidePaneBody>
    </SidePane>
  );
}
