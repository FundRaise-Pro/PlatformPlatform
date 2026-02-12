import { Trans } from "@lingui/react/macro";
import { adminPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { Breadcrumb, Breadcrumbs } from "@repo/ui/components/Breadcrumbs";
import type { ReactNode } from "react";
import FederatedTopMenu from "@/federated-modules/topMenu/FederatedTopMenu";

interface TopMenuProps {
  children?: ReactNode;
}

export function TopMenu({ children }: Readonly<TopMenuProps>) {
  const slug = useUserInfo()?.tenantSlug;
  return (
    <FederatedTopMenu>
      <Breadcrumbs>
        <Breadcrumb href={adminPath(slug)}>
          <Trans>Home</Trans>
        </Breadcrumb>
        {children}
      </Breadcrumbs>
    </FederatedTopMenu>
  );
}
