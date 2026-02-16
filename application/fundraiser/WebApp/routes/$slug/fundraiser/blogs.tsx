import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/blogs")({
  component: BlogsPage
});

export default function BlogsPage() {
  const { data: blogPosts, isLoading } = api.useQuery("get", "/api/fundraiser/blogs");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Blog` }]} />}
        title={t`Blog posts`}
        subtitle={t`Create and manage blog content for your organization.`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">{blogPosts ? t`${blogPosts.length} posts` : t`Loading...`}</Text>
          <Button onPress={() => {}}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>New post</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading blog posts...</Trans>
            </Text>
          </div>
        ) : blogPosts && blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <div key={String(post.id)} className="overflow-hidden rounded-lg border border-border">
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant={post.status === "Published" ? "success" : "neutral"}>{post.status}</Badge>
                  </div>
                  <Text className="font-medium">{post.title}</Text>
                  {post.summary && (
                    <Text className="mt-1 line-clamp-2 text-muted-foreground text-sm">{post.summary}</Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No blog posts yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Start writing blog posts to engage your audience.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>
    </>
  );
}
