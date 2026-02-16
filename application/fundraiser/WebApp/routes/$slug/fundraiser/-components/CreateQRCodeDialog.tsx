import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@repo/ui/components/Dialog";
import { Form } from "@repo/ui/components/Form";
import { TextField } from "@repo/ui/components/TextField";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type CreateQRCodeDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateQRCodeDialog({ isOpen, onClose }: CreateQRCodeDialogProps) {
  const queryClient = useQueryClient();

  const createMutation = api.useMutation("post", "/api/fundraiser/qrcodes", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/qrcodes"] });
      toast.success(t`Success`, { description: t`QR code created successfully.` });
      onClose();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createMutation.mutateAsync({
      body: {
        name: String(data.name),
        redirectUrl: String(data.redirectUrl),
        qrCodeType: String(data.qrCodeType || "DonationPage"),
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><Trans>Create QR code</Trans></DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="name" label={t`Name`} placeholder={t`QR code name`} isRequired />
            <TextField name="redirectUrl" label={t`Redirect URL`} placeholder="https://..." isRequired />
            <TextField name="qrCodeType" label={t`Type`} placeholder={t`Clinic, Event, Campaign, or DonationPage`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create QR code</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
