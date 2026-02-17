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

type CreateStoryDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateStoryDialog({ isOpen, onClose }: CreateStoryDialogProps) {
  const queryClient = useQueryClient();

  const createStoryMutation = api.useMutation("post", "/api/fundraiser/stories", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/stories"] });
      toast.success(t`Success`, { description: t`Story created successfully.` });
      onClose();
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createStoryMutation.mutateAsync({
      body: {
        title: String(data.title),
        content: String(data.content),
        summary: String(data.summary || "") || null,
        goalAmount: Number(data.goalAmount),
        campaignId: String(data.campaignId || "") || null
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><Trans>Create story</Trans></DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createStoryMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="title" label={t`Title`} placeholder={t`Story title`} isRequired />
            <TextField name="content" label={t`Content`} placeholder={t`Tell the beneficiary's story...`} isRequired />
            <TextField name="summary" label={t`Summary`} placeholder={t`A brief summary (optional)`} />
            <TextField name="goalAmount" label={t`Goal amount (ZAR)`} type="number" placeholder="0.00" isRequired />
            <TextField name="campaignId" label={t`Campaign ID`} placeholder={t`Link to a campaign (optional)`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createStoryMutation.isPending}>
              {createStoryMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create story</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
