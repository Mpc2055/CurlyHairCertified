import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { api } from "@/lib/api-client";
import { queryClient } from "@/lib/query";
import { queryKeys } from "@/lib/query-keys";
import { PageLayout } from "@/layouts/PageLayout";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title must be less than 200 characters"),
  content: z.string().min(20, "Content must be at least 20 characters").max(5000, "Content must be less than 5000 characters"),
  authorName: z.string().optional(),
  authorEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForumNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      authorName: "",
      authorEmail: "",
      tags: "",
    },
  });

  const createTopicMutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Convert tags string to array
      const tags = data.tags
        ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      return api.forum.createTopic({
        title: data.title,
        content: data.content,
        authorName: data.authorName || undefined,
        authorEmail: data.authorEmail || undefined,
        tags,
      });
    },
    onSuccess: (topic) => {
      toast({
        title: "Topic created!",
        description: "Your topic has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.topics() });
      setLocation(`/forum/${topic.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createTopicMutation.mutate(data);
  };

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/forum">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold">Create New Topic</h1>
              <p className="text-sm text-muted-foreground">Start a new discussion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>New Discussion Topic</CardTitle>
            <CardDescription>
              Share your experiences, ask questions, or start a conversation about curly hair care.
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What's your topic about?"
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive title for your topic
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts, experiences, or questions..."
                          className="min-h-[200px] resize-y"
                          {...field}
                          data-testid="textarea-content"
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 20 characters. You can mention stylists by name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rochester, 3C curls, DevaCurl, recommendations"
                          {...field}
                          data-testid="input-tags"
                        />
                      </FormControl>
                      <FormDescription>
                        Separate tags with commas (e.g., Rochester, 3C curls, recommendations)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Author Name (Optional) */}
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Anonymous"
                          {...field}
                          data-testid="input-author-name"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to post anonymously
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Author Email (Optional) */}
                <FormField
                  control={form.control}
                  name="authorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional, Not Public)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          data-testid="input-author-email"
                        />
                      </FormControl>
                      <FormDescription>
                        Your email is never displayed publicly
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex justify-between">
                <Link href="/forum">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createTopicMutation.isPending}
                  data-testid="button-submit"
                >
                  {createTopicMutation.isPending ? "Posting..." : "Post Topic"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </PageLayout>
  );
}
