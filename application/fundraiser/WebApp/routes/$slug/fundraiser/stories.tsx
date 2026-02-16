import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { BookHeartIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";
import { CreateStoryDialog } from "./-components/CreateStoryDialog";
import { StoryDetailPane } from "./-components/StoryDetailPane";

export const Route = createFileRoute("/$slug/fundraiser/stories")({
  component: StoriesPage
});

function fundraisingStatusVariant(status: string) {
  switch (status) {
    case "Draft": return "neutral";
    case "RequiresScreening": return "secondary";
    case "Approved": return "info";
    case "Raising": return "success";
    case "Funded": return "outline";
    case "Archived": return "neutral";
    default: return "outline";
  }
}

function fulfilmentStatusVariant(status: string) {
  switch (status) {
    case "Pending": return "neutral";
    case "InProgress": return "info";
    case "Fulfilled": return "success";
    default: return "outline";
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function StoriesPage() {
  const { data: stories, isLoading } = api.useQuery("get", "/api/fundraiser/stories");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Stories` }]} />}
        title={t`Stories`}
        subtitle={t`Manage impact stories from your beneficiaries.`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">
            {stories ? t`${stories.length} stories` : t`Loading...`}
          </Text>
          <Button variant="primary" onPress={() => setShowCreateDialog(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            <Trans>Create story</Trans>
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground"><Trans>Loading stories...</Trans></Text>
          </div>
        ) : stories && stories.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm"><Trans>Title</Trans></th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm"><Trans>Fundraising</Trans></th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm"><Trans>Fulfilment</Trans></th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm"><Trans>Goal</Trans></th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm"><Trans>Created</Trans></th>
                </tr>
              </thead>
              <tbody>
                {stories.map((story) => (
                  <tr
                    key={String(story.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedStoryId(String(story.id))}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {story.featuredImageUrl ? (
                          <img src={story.featuredImageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                            <BookHeartIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{story.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={fundraisingStatusVariant(story.fundraisingStatus)}>
                        {story.fundraisingStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={fulfilmentStatusVariant(story.fulfilmentStatus)}>
                        {story.fulfilmentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatCurrency(story.goalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <BookHeartIcon className="mb-3 h-8 w-8 text-muted-foreground" />
            <Text className="mb-2 text-muted-foreground"><Trans>No stories yet</Trans></Text>
            <Text className="text-muted-foreground text-sm"><Trans>Create your first impact story to start fundraising for a beneficiary.</Trans></Text>
          </div>
        )}
      </AppLayout>
      <CreateStoryDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
      {selectedStoryId && (
        <StoryDetailPane
          storyId={selectedStoryId}
          isOpen={!!selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
        />
      )}
    </>
  );
}
