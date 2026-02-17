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

type CreateApplicationDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateApplicationDialog({ isOpen, onClose }: CreateApplicationDialogProps) {
  const queryClient = useQueryClient();

  const createMutation = api.useMutation("post", "/api/fundraiser/applications", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/applications"] });
      toast.success(t`Success`, { description: t`Application created successfully.` });
      onClose();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createMutation.mutateAsync({
      body: {
        campaignId: String(data.campaignId),
        formVersionId: String(data.formVersionId || "") || null,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><Trans>New application</Trans></DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="campaignId" label={t`Campaign ID`} placeholder={t`Campaign to apply for`} isRequired />
            <TextField name="formVersionId" label={t`Form version ID`} placeholder={t`Link to a form version (optional)`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create application</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
