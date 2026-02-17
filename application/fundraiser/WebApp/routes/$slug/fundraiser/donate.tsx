import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { Form } from "@repo/ui/components/Form";
import { Heading } from "@repo/ui/components/Heading";
import { Text } from "@repo/ui/components/Text";
import { TextField } from "@repo/ui/components/TextField";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api, type FundraisingTargetType, type TransactionType } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/donate")({
  component: DonatePage
});

export default function DonatePage() {
  const slug = useUserInfo()?.tenantSlug;
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentData, setPaymentData] = useState<{ actionUrl: string; formFields: Record<string, string> } | null>(null);

  const createTransactionMutation = api.useMutation("post", "/api/fundraiser/donations/transactions");
  const initiatePaymentMutation = api.useMutation("post", "/api/fundraiser/donations/transactions/{id}/initiate-payment");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const returnUrl = `${baseUrl}/${slug}/fundraiser/payment-return`;
  const cancelUrl = `${baseUrl}/${slug}/fundraiser/transactions`;

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    try {
      const transactionId = await createTransactionMutation.mutateAsync({
        body: {
          name: String(data.name || t`Online donation`),
          description: String(data.description || ""),
          type: "Donation" as TransactionType,
          amount: Number(data.amount),
          payeeName: String(data.payeeName || "") || null,
          payeeEmail: String(data.payeeEmail || "") || null,
          targetType: "Campaign" as FundraisingTargetType,
          targetId: ""
        }
      });

      if (transactionId) {
        const paymentResult = await initiatePaymentMutation.mutateAsync({
          params: { path: { id: String(transactionId) } },
          body: {
            transactionId: transactionId as unknown as string,
            returnUrl: `${returnUrl}?txId=${String(transactionId)}`,
            cancelUrl
          }
        });

        if (paymentResult) {
          setPaymentData({
            actionUrl: (paymentResult as { actionUrl: string }).actionUrl,
            formFields: (paymentResult as { formFields: Record<string, string> }).formFields
          });
        }
      }
    } catch {
      // errors shown via mutation state
    }
  }, [createTransactionMutation, initiatePaymentMutation, returnUrl, cancelUrl]);

  useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);

  const isPending = createTransactionMutation.isPending || initiatePaymentMutation.isPending;
  const combinedErrors = createTransactionMutation.error?.errors ?? initiatePaymentMutation.error?.errors;

  if (paymentData) {
    return (
      <>
        <FundraiserSideMenu />
        <AppLayout
          topMenu={<TopMenu breadcrumbs={[{ label: t`Donate` }]} />}
          title={t`Redirecting to payment...`}
        >
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>You are being redirected to the payment gateway...</Trans>
            </Text>
          </div>
          <form ref={formRef} method="POST" action={paymentData.actionUrl}>
            {Object.entries(paymentData.formFields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          </form>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Donate` }]} />}
        title={t`Initiate payment`}
        subtitle={t`Create a new online donation and redirect to the payment gateway.`}
      >
        <Card className="mx-auto max-w-lg p-6">
          <Heading level={3} className="mb-4 font-semibold">
            <Trans>Payment details</Trans>
          </Heading>
          <Form
            onSubmit={handleSubmit}
            validationBehavior="aria"
            validationErrors={combinedErrors}
          >
            <div className="flex flex-col gap-4">
              <TextField name="name" label={t`Description`} isRequired placeholder={t`E.g., Campaign donation`} />
              <TextField name="amount" label={t`Amount (ZAR)`} type="number" isRequired placeholder="0.00" />
              <div className="grid grid-cols-2 gap-4">
                <TextField name="payeeName" label={t`Your name`} placeholder={t`Optional`} />
                <TextField name="payeeEmail" label={t`Your email`} placeholder={t`Optional`} />
              </div>
              <TextField name="description" label={t`Notes`} placeholder={t`Optional`} />
              <Button type="submit" disabled={isPending} className="mt-2">
                {isPending ? <Trans>Processing...</Trans> : <Trans>Pay now</Trans>}
              </Button>
            </div>
          </Form>
        </Card>
      </AppLayout>
    </>
  );
}
