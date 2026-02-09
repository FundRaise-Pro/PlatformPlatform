import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { FederatedMenuButton, SideMenuSeparator } from "@repo/ui/components/SideMenu";
import { BoxIcon, CircleUserIcon, HeartIcon, HomeIcon, UsersIcon } from "lucide-react";
import type { FederatedSideMenuProps } from "./FederatedSideMenu";

// Navigation items shared between mobile and desktop menus
export function NavigationMenuItems({
  currentSystem
}: Readonly<{ currentSystem: FederatedSideMenuProps["currentSystem"] }>) {
  const userInfo = useUserInfo();

  return (
    <>
      <FederatedMenuButton
        icon={HomeIcon}
        label={t`Home`}
        href="/admin"
        isCurrentSystem={currentSystem === "account-management"}
      />

      <SideMenuSeparator>
        <Trans>Organization</Trans>
      </SideMenuSeparator>

      <FederatedMenuButton
        icon={CircleUserIcon}
        label={t`Account`}
        href="/admin/account"
        isCurrentSystem={currentSystem === "account-management"}
      />
      <FederatedMenuButton
        icon={UsersIcon}
        label={t`Users`}
        href="/admin/users"
        isCurrentSystem={currentSystem === "account-management"}
      />

      <SideMenuSeparator>
        <Trans>Fundraiser</Trans>
      </SideMenuSeparator>

      <FederatedMenuButton
        icon={HeartIcon}
        label={t`Fundraiser`}
        href="/fundraiser"
        isCurrentSystem={currentSystem === "fundraiser"}
      />

      {userInfo?.isInternalUser && (
        <>
          <SideMenuSeparator>
            <Trans>Back Office</Trans>
          </SideMenuSeparator>

          <FederatedMenuButton
            icon={BoxIcon}
            label={t`Dashboard`}
            href="/back-office"
            isCurrentSystem={currentSystem === "back-office"}
          />
        </>
      )}
    </>
  );
}
