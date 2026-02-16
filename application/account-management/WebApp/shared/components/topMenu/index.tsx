import { Trans } from "@lingui/react/macro";
import { adminPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@repo/ui/components/Breadcrumb";
import { Link } from "@repo/ui/components/Link";
import type { ReactNode } from "react";
import FederatedTopMenu from "@/federated-modules/topMenu/FederatedTopMenu";

interface TopMenuProps {
  children?: ReactNode;
}

export function TopMenu({ children }: Readonly<TopMenuProps>) {
  const slug = useUserInfo()?.tenantSlug;
  return (
    <FederatedTopMenu>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={adminPath(slug)} variant="secondary" underline={false} />}>
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {children}
        </BreadcrumbList>
      </Breadcrumb>
    </FederatedTopMenu>
  );
}
