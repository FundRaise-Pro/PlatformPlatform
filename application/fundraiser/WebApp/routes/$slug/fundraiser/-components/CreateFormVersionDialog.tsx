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

type CreateFormVersionDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateFormVersionDialog({ isOpen, onClose }: CreateFormVersionDialogProps) {
  const queryClient = useQueryClient();

  const createMutation = api.useMutation("post", "/api/fundraiser/forms/versions", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/forms/versions"] });
      toast.success(t`Success`, { description: t`Form version created successfully.` });
      onClose();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createMutation.mutateAsync({
      body: {
        versionNumber: String(data.versionNumber),
        name: String(data.name),
        description: String(data.description || "") || null,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><Trans>New form version</Trans></DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="name" label={t`Name`} placeholder={t`Form name`} isRequired />
            <TextField name="versionNumber" label={t`Version number`} placeholder="1.0" isRequired />
            <TextField name="description" label={t`Description`} placeholder={t`Describe this form version (optional)`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create form</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
