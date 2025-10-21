import { useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ThumbsUp, Flag, MoreVertical } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/query";
import { PageLayout } from "@/layouts/PageLayout";
import { LoadingState, ErrorState } from "@/components/shared";
import { Reply } from "@/features/forum";
import { useTopic } from "@/hooks/api";

const replyFormSchema = z.object({
  content: z.string().min(20, "Reply must be at least 20 characters").max(5000),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional().or(z.literal("")),
});

type ReplyFormValues = z.infer<typeof replyFormSchema>;

export default function ForumTopic() {
  const [, params] = useRoute("/forum/:id");
  const topicId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();

  const { data: topic, isLoading } = useTopic(topicId);

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: "",
      authorName: "",
      authorEmail: "",
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/forum/upvote', { topicId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', topicId] });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/forum/flag', { contentType: 'topic', contentId: topicId });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Topic flagged",
        description: "Thank you for helping keep our community safe.",
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (data: ReplyFormValues) => {
      const response = await apiRequest('POST', `/api/forum/topics/${topicId}/reply`, {
        ...data,
        authorName: data.authorName || undefined,
        authorEmail: data.authorEmail || undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reply posted!",
        description: "Your reply has been added to the discussion.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', topicId] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply.",
        variant: "destructive",
      });
    },
  });

  if (!topicId) {
    return <div>Invalid topic ID</div>;
  }

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/forum">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <LoadingState message="Loading topic..." />
        ) : !topic ? (
          <ErrorState
            title="Topic not found"
            message="This topic doesn't exist or has been removed."
            onRetry={() => window.location.href = "/forum"}
            retryText="Back to Forum"
          />
        ) : (
          <div className="space-y-6">
            {/* Topic */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-4">{topic.title}</CardTitle>
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {topic.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid="button-topic-menu">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => flagMutation.mutate()}>
                        <Flag className="h-4 w-4 mr-2" />
                        Flag as inappropriate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-lg mb-6">{topic.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {topic.authorName && <span className="font-medium">{topic.authorName}</span>}
                  <span>•</span>
                  <span>{new Date(topic.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{topic.repliesCount} replies</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => upvoteMutation.mutate()}
                    disabled={upvoteMutation.isPending}
                    data-testid="button-upvote"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {topic.upvotesCount} Upvotes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reply Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add a Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => replyMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Share your thoughts..."
                              className="min-h-[150px]"
                              {...field}
                              data-testid="textarea-new-reply"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="authorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Your name (optional)" {...field} data-testid="input-reply-author-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="authorEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="email" placeholder="Email (optional, not public)" {...field} data-testid="input-reply-author-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" disabled={replyMutation.isPending} data-testid="button-submit-reply">
                      {replyMutation.isPending ? "Posting..." : "Post Reply"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Replies */}
            {topic.replies && topic.replies.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">{topic.repliesCount} Replies</h2>
                {topic.replies.map((reply) => (
                  <Reply key={reply.id} reply={reply} topicId={topic.id} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
