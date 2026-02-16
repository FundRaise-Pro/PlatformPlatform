import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/Dialog";
import { Form } from "@repo/ui/components/Form";
import { TextField } from "@repo/ui/components/TextField";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type CreateCampaignDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateCampaignDialog({ isOpen, onClose }: CreateCampaignDialogProps) {
  const queryClient = useQueryClient();

  const createCampaignMutation = api.useMutation("post", "/api/fundraiser/campaigns", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/campaigns"] });
      toast.success(t`Success`, { description: t`Campaign created successfully.` });
      onClose();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createCampaignMutation.mutateAsync({
      body: {
        title: String(data.title),
        content: String(data.content),
        summary: String(data.summary || "") || null,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create campaign</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createCampaignMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="title" label={t`Title`} placeholder={t`Campaign title`} isRequired />
            <TextField
              name="content"
              label={t`Content`}
              placeholder={t`Describe this campaign...`}
              isRequired
            />
            <TextField name="summary" label={t`Summary`} placeholder={t`A brief summary (optional)`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createCampaignMutation.isPending}>
              {createCampaignMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create campaign</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
