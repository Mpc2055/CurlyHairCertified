import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, ThumbsUp, Flag, MoreVertical } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TopicWithReplies, ReplyWithChildren } from "server/storage";
import type { SelectReply } from "@shared/schema";
import { Navigation } from "@/components/navigation";

const replyFormSchema = z.object({
  content: z.string().min(20, "Reply must be at least 20 characters").max(5000),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional().or(z.literal("")),
});

type ReplyFormValues = z.infer<typeof replyFormSchema>;

function ReplyComponent({
  reply,
  topicId,
  depth = 0,
}: {
  reply: ReplyWithChildren;
  topicId: number;
  depth?: number;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: "",
      authorName: "",
      authorEmail: "",
    },
  });

  const flagMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/forum/flag', { contentType: 'reply', contentId: reply.id });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reply flagged",
        description: "Thank you for helping keep our community safe.",
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (data: ReplyFormValues) => {
      const response = await apiRequest('POST', `/api/forum/topics/${topicId}/reply`, {
        ...data,
        parentReplyId: reply.id,
        authorName: data.authorName || undefined,
        authorEmail: data.authorEmail || undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reply posted!",
        description: "Your reply has been added.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', topicId] });
      setIsReplying(false);
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

  const canReply = depth < 2; // Max 2 levels (topic -> reply -> sub-reply)

  return (
    <div className={depth > 0 ? "ml-8 mt-4" : "mt-4"}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                {reply.authorName && <span className="font-medium">{reply.authorName}</span>}
                <span>•</span>
                <span>{new Date(reply.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap">{reply.content}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-reply-menu-${reply.id}`}>
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

          {canReply && !isReplying && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(true)}
              data-testid={`button-reply-to-${reply.id}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}

          {isReplying && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => replyMutation.mutate(data))} className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write your reply..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid={`textarea-reply-${reply.id}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Your name (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={replyMutation.isPending}
                    data-testid={`button-submit-reply-${reply.id}`}
                  >
                    {replyMutation.isPending ? "Posting..." : "Post Reply"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReplying(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Nested replies */}
      {reply.children && reply.children.length > 0 && (
        <div>
          {reply.children.map((child) => (
            <ReplyComponent
              key={child.id}
              reply={child as ReplyWithChildren}
              topicId={topicId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumTopic() {
  const [, params] = useRoute("/forum/:id");
  const topicId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();

  const { data: topic, isLoading } = useQuery<TopicWithReplies>({
    queryKey: ['/api/forum/topics', topicId],
    queryFn: async () => {
      const response = await fetch(`/api/forum/topics/${topicId}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
    enabled: !!topicId,
  });

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
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded w-3/4 mb-4" />
              <div className="h-32 bg-muted rounded" />
            </CardHeader>
          </Card>
        ) : !topic ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Topic not found</h3>
              <Link href="/forum">
                <Button>Back to Forum</Button>
              </Link>
            </CardContent>
          </Card>
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
                  <ReplyComponent key={reply.id} reply={reply} topicId={topic.id} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
