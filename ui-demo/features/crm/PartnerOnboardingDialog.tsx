import { Dispatch, SetStateAction } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IMAGE_FILE_ACCEPT } from "@/lib/constants";
import { FundraiserConfig, Partner } from "@/types";

interface PartnerOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPartner: Partial<Partner>;
  setNewPartner: Dispatch<SetStateAction<Partial<Partner>>>;
  partnerTiers: FundraiserConfig["partnerTiers"];
  onUploadLogo: (file?: File) => void | Promise<void>;
  onSubmit: () => void;
}

export function PartnerOnboardingDialog({
  open,
  onOpenChange,
  newPartner,
  setNewPartner,
  partnerTiers,
  onUploadLogo,
  onSubmit,
}: PartnerOnboardingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Onboard Partner</DialogTitle>
          <DialogDescription>Attach partner details, logo, and tier so mentions can be surfaced in preview pages.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-[6rem_1fr] items-center gap-3">
            <div className="size-20 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-2">
              <img src={newPartner.logo} alt="Partner logo preview" className="h-full w-full object-contain" />
            </div>
            <Button variant="outline" className="justify-start rounded-full" asChild>
              <label className="cursor-pointer">
                <Upload className="size-4" />
                Upload logo
                <input
                  type="file"
                  accept={IMAGE_FILE_ACCEPT}
                  className="hidden"
                  onChange={(event) => onUploadLogo(event.target.files?.[0])}
                />
              </label>
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerName">Partner name</Label>
            <Input
              id="partnerName"
              value={newPartner.name}
              onChange={(event) => setNewPartner((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnerEmail">Partner email</Label>
            <Input
              id="partnerEmail"
              value={newPartner.email}
              onChange={(event) => setNewPartner((current) => ({ ...current, email: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnerContact">Contact person</Label>
            <Input
              id="partnerContact"
              value={newPartner.contactPerson}
              onChange={(event) => setNewPartner((current) => ({ ...current, contactPerson: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Tier assignment</Label>
            <Select
              value={newPartner.tierId}
              onValueChange={(value) => setNewPartner((current) => ({ ...current, tierId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose tier" />
              </SelectTrigger>
              <SelectContent>
                {partnerTiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full" onClick={onSubmit} disabled={!newPartner.name || !newPartner.email || !newPartner.tierId}>
            <Plus className="size-4" />
            Add partner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
