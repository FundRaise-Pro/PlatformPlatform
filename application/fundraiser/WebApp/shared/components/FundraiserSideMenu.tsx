import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FederatedMenuButton, MenuButton, SideMenu, SideMenuSeparator, SideMenuSpacer } from "@repo/ui/components/SideMenu";
import {
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
  return (
    <SideMenu sidebarToggleAriaLabel={t`Toggle sidebar`} mobileMenuAriaLabel={t`Open menu`}>
      <MenuButton icon={LayoutDashboardIcon} label={t`Dashboard`} href="/fundraiser" />

      <SideMenuSeparator>
        <Trans>Fundraising</Trans>
      </SideMenuSeparator>
      <MenuButton icon={HeartIcon} label={t`Campaigns`} href="/fundraiser/campaigns" />
      <MenuButton icon={CreditCardIcon} label={t`Donations`} href="/fundraiser/donations" />
      <MenuButton icon={CalendarIcon} label={t`Events`} href="/fundraiser/events" />
      <MenuButton icon={QrCodeIcon} label={t`QR codes`} href="/fundraiser/qrcodes" />

      <SideMenuSeparator>
        <Trans>Content</Trans>
      </SideMenuSeparator>
      <MenuButton icon={BookOpenIcon} label={t`Blog`} href="/fundraiser/blogs" />
      <MenuButton icon={FileTextIcon} label={t`Forms`} href="/fundraiser/forms" />
      <MenuButton icon={FileTextIcon} label={t`Applications`} href="/fundraiser/applications" />

      <SideMenuSeparator>
        <Trans>Organization</Trans>
      </SideMenuSeparator>
      <MenuButton icon={MapPinIcon} label={t`Branches`} href="/fundraiser/branches" />
      <MenuButton icon={UsersIcon} label={t`Users`} href="/fundraiser/users" />

      <SideMenuSpacer />

      <SideMenuSeparator>
        <Trans>Settings</Trans>
      </SideMenuSeparator>
      <MenuButton icon={SettingsIcon} label={t`Settings`} href="/fundraiser/settings" />
      <MenuButton icon={CreditCardIcon} label={t`Subscription`} href="/fundraiser/subscription" />

      <FederatedMenuButton
        icon={GitBranchIcon}
        label={t`Account`}
        href="/admin"
        isCurrentSystem={currentSystem === "account-management"}
      />
    </SideMenu>
  );
}
