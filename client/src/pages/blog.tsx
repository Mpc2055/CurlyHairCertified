import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { PageLayout } from "@/layouts/PageLayout";
import { PageHeader, LoadingState, EmptyState } from "@/components/shared";
import { usePosts } from "@/hooks/api";
import { BlogCard } from "@/features/blog";

export default function Blog() {
  const [tagFilter, setTagFilter] = useState<string>("all");

  const { data: posts, isLoading } = usePosts({ tag: tagFilter === "all" ? undefined : tagFilter });

  // Extract unique tags from all posts
  const allTags = Array.from(new Set(posts?.flatMap(post => post.tags || []) || [])).sort();

  return (
    <PageLayout>
      {/* Page Header */}
      <PageHeader
        title="Blog"
        description="Stories, insights, and resources for the curly hair community in Rochester"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-tag-filter">
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {tagFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTagFilter("all")}
                data-testid="button-clear-filter"
              >
                Clear filter
              </Button>
            )}
          </div>
        )}

        {/* Blog Posts List */}
        {isLoading ? (
          <LoadingState message="Loading blog posts..." />
        ) : !posts || posts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={tagFilter !== "all" ? "No posts with this tag" : "No blog posts yet"}
            description={tagFilter !== "all" ? "Try selecting a different tag" : "Check back soon for updates"}
            action={tagFilter !== "all" ? {
              label: "Clear filter",
              onClick: () => setTagFilter("all")
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
