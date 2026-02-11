import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { adminPath, tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { FederatedMenuButton, SideMenuSeparator } from "@repo/ui/components/SideMenu";
import { BoxIcon, CircleUserIcon, HeartIcon, HomeIcon, UsersIcon } from "lucide-react";
import type { FederatedSideMenuProps } from "./FederatedSideMenu";

// Navigation items shared between mobile and desktop menus
export function NavigationMenuItems({
  currentSystem
}: Readonly<{ currentSystem: FederatedSideMenuProps["currentSystem"] }>) {
  const userInfo = useUserInfo();
  const slug = userInfo?.tenantSlug;

  return (
    <>
      <FederatedMenuButton
        icon={HomeIcon}
        label={t`Home`}
        href={adminPath(slug)}
        isCurrentSystem={currentSystem === "account-management"}
      />

      <SideMenuSeparator>
        <Trans>Organization</Trans>
      </SideMenuSeparator>

      <FederatedMenuButton
        icon={CircleUserIcon}
        label={t`Account`}
        href={adminPath(slug, "account")}
        isCurrentSystem={currentSystem === "account-management"}
      />
      <FederatedMenuButton
        icon={UsersIcon}
        label={t`Users`}
        href={adminPath(slug, "users")}
        isCurrentSystem={currentSystem === "account-management"}
      />

      <SideMenuSeparator>
        <Trans>Fundraiser</Trans>
      </SideMenuSeparator>

      <FederatedMenuButton
        icon={HeartIcon}
        label={t`Fundraiser`}
        href={tenantPath(slug, "fundraiser")}
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
            href={tenantPath(slug, "back-office")}
            isCurrentSystem={currentSystem === "back-office"}
          />
        </>
      )}
    </>
  );
}
