import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@repo/ui/components/Dialog";
import { Form } from "@repo/ui/components/Form";
import { TextField } from "@repo/ui/components/TextField";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type GenerateCertificatesDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function GenerateCertificatesDialog({ isOpen, onClose }: GenerateCertificatesDialogProps) {
  const queryClient = useQueryClient();
  const { data: templates } = api.useQuery("get", "/api/fundraiser/certificates/templates");

  const generateMutation = api.useMutation("post", "/api/fundraiser/certificates/generate", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/certificates/batches"] });
      toast.success(t`Success`, { description: t`Certificates generated successfully.` });
      onClose();
    },
    onError: () => {
      toast.error(t`Generation failed`, { description: t`Could not generate certificates. Check your subscription plan.` });
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await generateMutation.mutateAsync({
      body: {
        taxYear: Number(data.taxYear),
        templateId: String(data.templateId)
      }
    });
  };

  const currentYear = new Date().getFullYear();
  const defaultTaxYear = new Date().getMonth() < 2 ? currentYear - 2 : currentYear - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><Trans>Generate tax certificates</Trans></DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={generateMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <p className="text-muted-foreground text-sm">
              <Trans>This will generate Section 18A tax certificates for all eligible donors in the selected tax year. This is a premium feature.</Trans>
            </p>
            <TextField
              name="taxYear"
              label={t`Tax Year (start year)`}
              type="number"
              placeholder={String(defaultTaxYear)}
              defaultValue={String(defaultTaxYear)}
              isRequired
            />
            <div>
              <label htmlFor="templateId" className="mb-1 block font-medium text-foreground text-sm">
                <Trans>Certificate template</Trans>
              </label>
              <select
                id="templateId"
                name="templateId"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">{t`Select a template...`}</option>
                {templates?.map((template) => (
                  <option key={String(template.id)} value={String(template.id)}>
                    {template.name} {template.isDefault ? `(${t`default`})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? <Trans>Generating...</Trans> : <Trans>Generate certificates</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
