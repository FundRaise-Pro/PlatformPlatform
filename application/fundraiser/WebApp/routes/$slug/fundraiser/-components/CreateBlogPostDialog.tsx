import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@repo/ui/components/Dialog";
import { Form } from "@repo/ui/components/Form";
import { TextField } from "@repo/ui/components/TextField";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type CreateBlogPostDialogProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

export function CreateBlogPostDialog({ isOpen, onClose }: CreateBlogPostDialogProps) {
  const queryClient = useQueryClient();

  const createMutation = api.useMutation("post", "/api/fundraiser/blogs", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/blogs"] });
      toast.success(t`Success`, { description: t`Blog post created successfully.` });
      onClose();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    await createMutation.mutateAsync({
      body: {
        categoryId: String(data.categoryId),
        title: String(data.title),
        slug: String(data.slug),
        content: String(data.content),
        summary: String(data.summary || "") || null,
        featuredImageUrl: String(data.featuredImageUrl || "") || null,
        metaTitle: String(data.metaTitle || "") || null,
        metaDescription: String(data.metaDescription || "") || null,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle><Trans>New blog post</Trans></DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} validationBehavior="aria" validationErrors={createMutation.error?.errors}>
          <div className="flex flex-col gap-4 p-4">
            <TextField name="title" label={t`Title`} placeholder={t`Post title`} isRequired />
            <TextField name="slug" label={t`Slug`} placeholder={t`url-friendly-slug`} isRequired />
            <TextField name="categoryId" label={t`Category ID`} placeholder={t`Blog category`} isRequired />
            <TextField name="content" label={t`Content`} placeholder={t`Write your blog post...`} isRequired />
            <TextField name="summary" label={t`Summary`} placeholder={t`A brief summary (optional)`} />
            <TextField name="featuredImageUrl" label={t`Featured image URL`} placeholder={t`https://... (optional)`} />
            <TextField name="metaTitle" label={t`Meta title`} placeholder={t`SEO title (optional)`} />
            <TextField name="metaDescription" label={t`Meta description`} placeholder={t`SEO description (optional)`} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Trans>Creating...</Trans> : <Trans>Create post</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
