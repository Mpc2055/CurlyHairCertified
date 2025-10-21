import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Flag, MoreVertical } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/query";
import type { ReplyWithChildren } from "server/storage";

const replyFormSchema = z.object({
  content: z.string().min(20, "Reply must be at least 20 characters").max(5000),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional().or(z.literal("")),
});

type ReplyFormValues = z.infer<typeof replyFormSchema>;

interface ReplyProps {
  reply: ReplyWithChildren;
  topicId: number;
  depth?: number;
}

/**
 * Reply component displays a single reply with nested replies
 * Supports up to 2 levels of nesting (topic -> reply -> sub-reply)
 */
export function Reply({ reply, topicId, depth = 0 }: ReplyProps) {
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
            <Reply
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
