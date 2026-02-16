import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import {
  GlobeIcon, NewspaperIcon, SendIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type BlogPostDetailPaneProps = Readonly<{
  blogPostId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

function blogStatusVariant(status: string) {
  switch (status) {
    case "Draft": return "neutral";
    case "Published": return "success";
    case "Archived": return "secondary";
    default: return "outline";
  }
}

export function BlogPostDetailPane({ blogPostId, isOpen, onClose }: BlogPostDetailPaneProps) {
  const queryClient = useQueryClient();
  const { data: post, isLoading } = api.useQuery("get", "/api/fundraiser/blogs/{id}", {
    params: { path: { id: blogPostId } },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/blogs"] });
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/blogs/{id}"] });
  };

  const publishMutation = api.useMutation("post", "/api/fundraiser/blogs/{id}/publish", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Blog post published`);
    },
  });

  const anyPending = publishMutation.isPending;
  const pathParams = { params: { path: { id: blogPostId } } };

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SidePaneHeader>{post?.title ?? t`Blog post`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground"><Trans>Loading...</Trans></Text>
        ) : post ? (
          <div className="flex flex-col gap-6">
            {/* Featured image */}
            {post.featuredImageUrl ? (
              <img src={post.featuredImageUrl} alt={post.title} className="h-48 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
                <NewspaperIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3">
              <Badge variant={blogStatusVariant(post.status)} className="text-sm">
                {post.status}
              </Badge>
              {post.publishedAt && (
                <Text className="text-muted-foreground text-sm">
                  {new Date(String(post.publishedAt)).toLocaleDateString()}
                </Text>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t`Slug`} value={post.slug} />
              <DetailField label={t`Category`} value={String(post.categoryId)} />
              <DetailField label={t`Created`} value={new Date(post.createdAt).toLocaleDateString()} />
              {post.modifiedAt && (
                <DetailField label={t`Modified`} value={new Date(post.modifiedAt).toLocaleDateString()} />
              )}
            </div>

            {/* Summary */}
            {post.summary && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Summary</Trans></Text>
                  <Text className="text-muted-foreground text-sm">{post.summary}</Text>
                </div>
              </>
            )}

            {/* Content */}
            {post.content && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Content</Trans></Text>
                  <Text className="line-clamp-8 text-muted-foreground text-sm">{post.content}</Text>
                </div>
              </>
            )}

            {/* SEO */}
            {(post.metaTitle || post.metaDescription) && (
              <>
                <Separator />
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <GlobeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <Text className="font-medium text-sm"><Trans>SEO</Trans></Text>
                  </div>
                  <div className="flex flex-col gap-2">
                    {post.metaTitle && (
                      <div>
                        <Text className="text-muted-foreground text-xs"><Trans>Meta title</Trans></Text>
                        <Text className="text-sm">{post.metaTitle}</Text>
                      </div>
                    )}
                    {post.metaDescription && (
                      <div>
                        <Text className="text-muted-foreground text-xs"><Trans>Meta description</Trans></Text>
                        <Text className="text-sm">{post.metaDescription}</Text>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Tags</Trans></Text>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <Separator />
            <div>
              <Text className="mb-3 font-medium text-sm"><Trans>Actions</Trans></Text>
              <div className="flex flex-wrap gap-2">
                {post.status === "Draft" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => publishMutation.mutate(pathParams)}
                  >
                    <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Publish</Trans>
                  </Button>
                )}
                {post.status === "Published" && (
                  <Badge variant="success" className="px-3 py-1.5">
                    <Trans>Published</Trans>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground"><Trans>Blog post not found.</Trans></Text>
        )}
      </SidePaneBody>
    </SidePane>
  );
}

function DetailField({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div>
      <Text className="text-muted-foreground text-xs">{label}</Text>
      <Text className="font-medium text-sm">{String(value)}</Text>
    </div>
  );
}
