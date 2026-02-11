import { Trans } from "@lingui/react/macro";
import { SelectItem } from "@repo/ui/components/Select";
import { NpoType } from "@/shared/lib/api/client";

export function NpoTypeItems() {
  return (
    <>
      <SelectItem id={NpoType.Charity}>
        <Trans>Charity</Trans>
      </SelectItem>
      <SelectItem id={NpoType.Foundation}>
        <Trans>Foundation</Trans>
      </SelectItem>
      <SelectItem id={NpoType.Ngo}>
        <Trans>NGO</Trans>
      </SelectItem>
      <SelectItem id={NpoType.Religious}>
        <Trans>Religious organization</Trans>
      </SelectItem>
      <SelectItem id={NpoType.Educational}>
        <Trans>Educational institution</Trans>
      </SelectItem>
      <SelectItem id={NpoType.CommunityBased}>
        <Trans>Community-based organization</Trans>
      </SelectItem>
      <SelectItem id={NpoType.Other}>
        <Trans>Other</Trans>
      </SelectItem>
    </>
  );
}
