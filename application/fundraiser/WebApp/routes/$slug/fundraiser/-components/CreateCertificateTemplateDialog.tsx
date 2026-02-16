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

type CreateCertificateTemplateDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateCertificateTemplateDialog({ isOpen, onClose }: CreateCertificateTemplateDialogProps) {
  const queryClient = useQueryClient();

  const createMutation = api.useMutation("post", "/api/fundraiser/certificates/templates", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/certificates/templates"] });
      toast.success(t`Success`, { description: t`Certificate template created successfully.` });
      onClose();
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createMutation.mutateAsync({
      body: {
        name: String(data.name),
        description: String(data.description || "") || null,
        organisationName: String(data.organisationName || "") || null,
        pboNumber: String(data.pboNumber || "") || null,
        organisationAddress: String(data.organisationAddress || "") || null,
        registrationNumber: String(data.registrationNumber || "") || null,
        logoUrl: String(data.logoUrl || "") || null,
        signatoryName: String(data.signatoryName || "") || null,
        signatoryTitle: String(data.signatoryTitle || "") || null
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><Trans>Create certificate template</Trans></DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="name" label={t`Template name`} placeholder={t`e.g. Standard Section 18A`} isRequired />
            <TextField name="description" label={t`Description`} placeholder={t`Optional description`} />
            <TextField name="organisationName" label={t`Organisation name`} placeholder={t`Your NPO name`} />
            <TextField name="pboNumber" label={t`PBO number`} placeholder={t`Public Benefit Organisation number`} />
            <TextField name="registrationNumber" label={t`Registration number`} placeholder={t`NPO registration number`} />
            <TextField name="organisationAddress" label={t`Organisation address`} placeholder={t`Full address`} />
            <TextField name="signatoryName" label={t`Signatory name`} placeholder={t`Name of authorised signatory`} />
            <TextField name="signatoryTitle" label={t`Signatory title`} placeholder={t`e.g. Director, Treasurer`} />
            <TextField name="logoUrl" label={t`Logo URL`} placeholder={t`https://...`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create template</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
