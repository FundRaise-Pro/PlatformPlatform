import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { NewspaperIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { BlogPostDetailPane } from "./-components/BlogPostDetailPane";
import { CreateBlogPostDialog } from "./-components/CreateBlogPostDialog";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/blogs")({
  component: BlogsPage
});

function blogStatusVariant(status: string) {
  switch (status) {
    case "Draft": return "neutral";
    case "Published": return "success";
    case "Archived": return "secondary";
    default: return "outline";
  }
}

export default function BlogsPage() {
  const { data: blogPosts, isLoading } = api.useQuery("get", "/api/fundraiser/blogs");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Blog` }]} />}
        title={t`Blog posts`}
        subtitle={t`Create and manage blog content for your organization.`}
        sidePane={
          selectedId ? (
            <BlogPostDetailPane
              blogPostId={selectedId}
              isOpen={!!selectedId}
              onClose={() => setSelectedId(null)}
            />
          ) : undefined
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">{blogPosts ? t`${blogPosts.length} posts` : t`Loading...`}</Text>
          <Button onPress={() => setIsCreateOpen(true)}>
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
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Title</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Published</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Created</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {blogPosts.map((post) => (
                  <tr
                    key={String(post.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedId(String(post.id))}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {post.featuredImageUrl ? (
                          <img src={post.featuredImageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                            <NewspaperIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <Text className="font-medium text-foreground">{post.title}</Text>
                          {post.summary && (
                            <Text className="line-clamp-1 text-muted-foreground text-xs">{post.summary}</Text>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={blogStatusVariant(post.status)}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.publishedAt ? new Date(String(post.publishedAt)).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <NewspaperIcon className="mb-3 h-8 w-8 text-muted-foreground" />
            <Text className="mb-2 text-muted-foreground">
              <Trans>No blog posts yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Start writing blog posts to engage your audience.</Trans>
            </Text>
          </div>
        )}

        <CreateBlogPostDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </AppLayout>
    </>
  );
}
