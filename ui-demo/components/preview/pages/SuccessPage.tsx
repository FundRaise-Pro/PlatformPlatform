import { CheckCircle2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FundraiserConfig } from "@/types";

interface SuccessPageProps {
  config: FundraiserConfig;
  onContinue: () => void;
}

export function SuccessPage({ config, onContinue }: SuccessPageProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-10 text-center">
      <Card className="w-full border-white/90 bg-white/90 shadow-soft">
        <CardHeader className="items-center">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-9" />
          </span>
          <Badge className="rounded-full bg-emerald-50 text-emerald-700">Contribution logged</Badge>
          <CardTitle className="font-display text-3xl">Thank you for supporting {config.tenantName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Your {config.terminology.donation.toLowerCase()} is now linked to the campaign ledger and ready for certificate processing.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="rounded-full">
              <Download className="size-4" />
              Download certificate
            </Button>
            <Button className="rounded-full" onClick={onContinue}>
              Back to website
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
