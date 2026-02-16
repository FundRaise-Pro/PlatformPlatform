import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@repo/ui/components/Dialog";
import { Form } from "@repo/ui/components/Form";
import { TextField } from "@repo/ui/components/TextField";
import { mutationSubmitter } from "@repo/ui/forms/mutationSubmitter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type FundraisingTargetType, type TransactionType } from "@/shared/lib/api/client";

type RecordDonationDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function RecordDonationDialog({ isOpen, onClose }: RecordDonationDialogProps) {
  const queryClient = useQueryClient();

  const createTransactionMutation = api.useMutation("post", "/api/fundraiser/donations/transactions");
  const recordDonationMutation = api.useMutation("post", "/api/fundraiser/donations", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/donations"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/donations/transactions"] });
      toast.success(t`Success`, { description: t`Donation recorded successfully.` });
      onClose();
    }
  });

  const isPending = createTransactionMutation.isPending || recordDonationMutation.isPending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    try {
      const txResult = await createTransactionMutation.mutateAsync({
        body: {
          name: String(data.name || t`Offline donation`),
          description: String(data.description || ""),
          type: "Donation" as TransactionType,
          amount: Number(data.amount),
          payeeName: String(data.payeeName || "") || null,
          payeeEmail: String(data.payeeEmail || "") || null,
          targetType: "Campaign" as FundraisingTargetType,
          targetId: ""
        }
      });

      if (txResult) {
        await recordDonationMutation.mutateAsync({
          body: {
            transactionId: txResult as unknown as string,
            donorProfileId: null,
            isRecurring: false,
            message: String(data.message || "") || null,
            isAnonymous: data.isAnonymous === "true"
          }
        });
      }
    } catch {
      // errors handled by mutation error state
    }
  };

  const combinedErrors = createTransactionMutation.error?.errors ?? recordDonationMutation.error?.errors;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Record offline donation</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form
          onSubmit={handleSubmit}
          validationBehavior="aria"
          validationErrors={combinedErrors}
        >
          <div className="flex flex-col gap-4 p-4">
            <TextField name="name" label={t`Description`} placeholder={t`E.g., EFT donation`} isRequired />
            <TextField name="amount" label={t`Amount (ZAR)`} type="number" placeholder="0.00" isRequired />
            <div className="grid grid-cols-2 gap-4">
              <TextField name="payeeName" label={t`Donor name`} placeholder={t`Optional`} />
              <TextField name="payeeEmail" label={t`Donor email`} placeholder={t`Optional`} />
            </div>
            <TextField name="message" label={t`Message`} placeholder={t`Optional message from donor`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Trans>Recording...</Trans> : <Trans>Record donation</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
