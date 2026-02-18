"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createPublicTransaction } from "@/actions/donations.server";
import { Loader2, Heart } from "lucide-react";

interface DonateFormProps {
  targetType: string;
  targetId: string;
  targetName: string;
}

export function DonateForm({ targetType, targetId, targetName }: DonateFormProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payFastFormRef = useRef<HTMLFormElement>(null);
  const [payFastData, setPayFastData] = useState<{ url: string; fields: Record<string, string> } | null>(null);

  // Auto-submit PayFast form when data is ready
  useEffect(() => {
    if (payFastData && payFastFormRef.current) {
      payFastFormRef.current.submit();
    }
  }, [payFastData]);

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount("");
    setIsCustom(false);
    setError(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setIsCustom(true);
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
        setAmount(val);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (amount < 10) { 
        setError("Minimum donation amount is R10.");
        setIsLoading(false);
        return;
    }

    try {
        // Read channel from URL if present
        const searchParams = new URLSearchParams(window.location.search);
        const channel = searchParams.get("channel") || "Web";

        const response = await createPublicTransaction({
            amount,
            targetType,
            targetId,
            name: name || undefined,
            email: email || undefined,
            description: message || undefined,
            channel: channel
        });

        // Backend returns the signed form fields for PayFast
        setPayFastData({ url: response.actionUrl, fields: response.formFields });
    } catch (err) {
        console.error(err);
        setError("Failed to initiate donation. The system may be unavailable.");
        setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg border-muted/40">
        <CardHeader className="text-center pb-6">
           <div className="mx-auto rounded-full bg-primary/10 p-3 mb-2 w-fit">
             <Heart className="size-6 text-primary" fill="currentColor" />
           </div>
           <CardTitle className="text-2xl">Donate to {targetName}</CardTitle>
           <CardDescription>Securely processed by PayFast</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Amount Selection */}
            <div className="space-y-3">
              <Label>Select Amount</Label>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200, 500, 1000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant={amount === val && !isCustom ? "default" : "outline"}
                    className={amount === val && !isCustom ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"}
                    onClick={() => handleAmountSelect(val)}
                  >
                    R{val}
                  </Button>
                ))}
                <div className="relative col-span-1">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <span className="text-muted-foreground text-sm">R</span>
                   </div>
                   <Input 
                      type="number" 
                      placeholder="Other" 
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className={`pl-7 ${isCustom ? "border-primary ring-1 ring-primary" : ""}`}
                   />
                </div>
              </div>
            </div>

            {/* Donor Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input 
                  id="name" 
                  placeholder="Your Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Input 
                  id="message" 
                  placeholder="Leave a message of support..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full text-lg h-12" 
              disabled={isLoading || (isCustom && !amount)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Donate R${amount}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Hidden PayFast Form */}
      {payFastData && (
        <form ref={payFastFormRef} action={payFastData.url} method="POST">
            {Object.entries(payFastData.fields).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
            ))}
        </form>
      )}
    </>
  );
}
