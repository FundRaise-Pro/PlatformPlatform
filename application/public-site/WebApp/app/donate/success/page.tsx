import { CheckCircle2, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function DonationSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-green-100">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto rounded-full bg-green-100 p-3 mb-4 w-fit">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Donation Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your generous contribution. Your support makes a real difference.
          </p>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to you.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button className="w-full" asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/donate">
              <ArrowLeft className="mr-2 size-4" />
              Make Another Donation
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
