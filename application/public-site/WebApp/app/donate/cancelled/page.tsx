import { XCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function DonationCancelledPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-amber-100">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto rounded-full bg-amber-100 p-3 mb-4 w-fit">
            <XCircle className="size-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-700">Donation Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your donation process was cancelled and no funds were deducted.
          </p>
          <p className="text-sm text-muted-foreground">
            If this was a mistake, you can try again below. Or contact us if you need assistance.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button className="w-full" asChild>
            <Link href="/donate">
              <RefreshCcw className="mr-2 size-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
