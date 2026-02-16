import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { adminPath, tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import {
  FederatedMenuButton,
  MenuButton,
  SideMenu,
  SideMenuSeparator,
  SideMenuSpacer
} from "@repo/ui/components/SideMenu";
import {
  ArrowLeftRightIcon,
  BookHeartIcon,
  BookOpenIcon,
  CalendarIcon,
  CreditCardIcon,
  FileTextIcon,
  GitBranchIcon,
  HeartIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  QrCodeIcon,
  SettingsIcon,
  UsersIcon
} from "lucide-react";

type FundraiserSideMenuProps = {
  currentSystem?: string;
};

export function FundraiserSideMenu({ currentSystem = "fundraiser" }: Readonly<FundraiserSideMenuProps>) {
  const slug = useUserInfo()?.tenantSlug;
  return (
    <SideMenu sidebarToggleAriaLabel={t`Toggle sidebar`} mobileMenuAriaLabel={t`Open menu`}>
      <MenuButton icon={LayoutDashboardIcon} label={t`Dashboard`} href={tenantPath(slug, "fundraiser")} />

      <SideMenuSeparator>
        <Trans>Fundraising</Trans>
      </SideMenuSeparator>
      <MenuButton icon={HeartIcon} label={t`Campaigns`} href={tenantPath(slug, "fundraiser", "campaigns")} />
      <MenuButton icon={BookHeartIcon} label={t`Stories`} href={tenantPath(slug, "fundraiser", "stories")} />
      <MenuButton icon={CreditCardIcon} label={t`Donations`} href={tenantPath(slug, "fundraiser", "donations")} />
      <MenuButton icon={ArrowLeftRightIcon} label={t`Transactions`} href={tenantPath(slug, "fundraiser", "transactions")} />
      <MenuButton icon={CalendarIcon} label={t`Events`} href={tenantPath(slug, "fundraiser", "events")} />
      <MenuButton icon={QrCodeIcon} label={t`QR codes`} href={tenantPath(slug, "fundraiser", "qr-codes")} />

      <SideMenuSeparator>
        <Trans>Content</Trans>
      </SideMenuSeparator>
      <MenuButton icon={BookOpenIcon} label={t`Blog`} href={tenantPath(slug, "fundraiser", "blogs")} />
      <MenuButton icon={FileTextIcon} label={t`Forms`} href={tenantPath(slug, "fundraiser", "forms")} />
      <MenuButton icon={FileTextIcon} label={t`Applications`} href={tenantPath(slug, "fundraiser", "applications")} />

      <SideMenuSeparator>
        <Trans>Organization</Trans>
      </SideMenuSeparator>
      <MenuButton icon={MapPinIcon} label={t`Branches`} href={tenantPath(slug, "fundraiser", "branches")} />
      <MenuButton icon={UsersIcon} label={t`Users`} href={tenantPath(slug, "fundraiser", "users")} />

      <SideMenuSpacer />

      <SideMenuSeparator>
        <Trans>Settings</Trans>
      </SideMenuSeparator>
      <MenuButton icon={SettingsIcon} label={t`Settings`} href={tenantPath(slug, "fundraiser", "settings")} />
      <MenuButton icon={CreditCardIcon} label={t`Subscription`} href={tenantPath(slug, "fundraiser", "subscription")} />

      <FederatedMenuButton
        icon={GitBranchIcon}
        label={t`Account`}
        href={adminPath(slug)}
        isCurrentSystem={currentSystem === "account-management"}
      />
    </SideMenu>
  );
}
