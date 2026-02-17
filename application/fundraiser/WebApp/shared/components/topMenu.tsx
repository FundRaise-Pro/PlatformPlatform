import { Trans } from "@lingui/react/macro";
import { tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@repo/ui/components/Breadcrumb";
import { Link } from "@repo/ui/components/Link";
import { lazy, Suspense } from "react";

const FederatedTopMenu = lazy(() => import("account-management/FederatedTopMenu"));

type TopMenuProps = {
  breadcrumbs?: { label: string }[];
};

export function TopMenu({ breadcrumbs }: Readonly<TopMenuProps>) {
  const slug = useUserInfo()?.tenantSlug;
  return (
    <Suspense fallback={null}>
      <FederatedTopMenu>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={tenantPath(slug, "fundraiser")} variant="secondary" underline={false} />}>
                <Trans>FundRaise OS</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs?.map((breadcrumb) => (
              <BreadcrumbItem key={breadcrumb.label}>
                <BreadcrumbSeparator />
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </FederatedTopMenu>
    </Suspense>
  );
}
