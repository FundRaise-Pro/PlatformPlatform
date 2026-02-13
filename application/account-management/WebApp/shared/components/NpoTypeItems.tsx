import { Trans } from "@lingui/react/macro";
import { SelectItem } from "@repo/ui/components/Select";
import { NpoType } from "@/shared/lib/api/client";

export function NpoTypeItems() {
  return (
    <>
      <SelectItem value={NpoType.Charity}>
        <Trans>Charity</Trans>
      </SelectItem>
      <SelectItem value={NpoType.Foundation}>
        <Trans>Foundation</Trans>
      </SelectItem>
      <SelectItem value={NpoType.Ngo}>
        <Trans>NGO</Trans>
      </SelectItem>
      <SelectItem value={NpoType.Religious}>
        <Trans>Religious organization</Trans>
      </SelectItem>
      <SelectItem value={NpoType.Educational}>
        <Trans>Educational institution</Trans>
      </SelectItem>
      <SelectItem value={NpoType.CommunityBased}>
        <Trans>Community-based organization</Trans>
      </SelectItem>
      <SelectItem value={NpoType.Other}>
        <Trans>Other</Trans>
      </SelectItem>
    </>
  );
}
