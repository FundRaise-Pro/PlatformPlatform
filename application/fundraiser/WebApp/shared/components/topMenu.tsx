import { Trans } from "@lingui/react/macro";
import { tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { Breadcrumb, Breadcrumbs } from "@repo/ui/components/Breadcrumbs";
import { Link } from "@repo/ui/components/Link";
import { ChevronRightIcon } from "lucide-react";

type TopMenuProps = {
  breadcrumbs?: { label: string; href?: string }[];
};

export function TopMenu({ breadcrumbs }: Readonly<TopMenuProps>) {
  const slug = useUserInfo()?.tenantSlug;
  return (
    <div className="flex items-center gap-2">
      <Breadcrumbs>
        <Breadcrumb>
          <Link href={tenantPath(slug, "fundraiser")} variant="ghost">
            <Trans>FundRaise OS</Trans>
          </Link>
        </Breadcrumb>
        {breadcrumbs?.map((crumb) => (
          <Breadcrumb key={crumb.label}>
            <ChevronRightIcon className="mx-1 h-4 w-4 text-muted-foreground" />
            {crumb.href ? (
              <Link href={crumb.href} variant="ghost">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground text-sm">{crumb.label}</span>
            )}
          </Breadcrumb>
        ))}
      </Breadcrumbs>
    </div>
  );
}
