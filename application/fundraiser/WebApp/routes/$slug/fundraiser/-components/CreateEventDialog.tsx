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

type CreateEventDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateEventDialog({ isOpen, onClose }: CreateEventDialogProps) {
  const queryClient = useQueryClient();

  const createEventMutation = api.useMutation("post", "/api/fundraiser/events", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/events"] });
      toast.success(t`Success`, { description: t`Event created successfully.` });
      onClose();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createEventMutation.mutateAsync({
      body: {
        name: String(data.name),
        description: String(data.description),
        eventDate: String(data.eventDate),
        location: String(data.location || "") || null,
        targetAmount: Number(data.targetAmount) || 0,
        campaignId: String(data.campaignId || "") || null,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create event</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createEventMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="name" label={t`Name`} placeholder={t`Event name`} isRequired />
            <TextField
              name="description"
              label={t`Description`}
              placeholder={t`Describe this event...`}
              isRequired
            />
            <TextField name="eventDate" label={t`Event date`} type="datetime-local" isRequired />
            <TextField name="location" label={t`Location`} placeholder={t`Event location (optional)`} />
            <TextField
              name="targetAmount"
              label={t`Target amount (ZAR)`}
              type="number"
              placeholder="0.00"
            />
            <TextField name="campaignId" label={t`Campaign ID`} placeholder={t`Link to a campaign (optional)`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create event</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
