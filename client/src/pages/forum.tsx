import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ThumbsUp, Plus, Search } from "lucide-react";
import { PageLayout } from "@/layouts/PageLayout";
import { PageHeader, LoadingState, EmptyState } from "@/components/shared";
import { useTopics } from "@/hooks/api";

export default function Forum() {
  const [sortBy, setSortBy] = useState<'recent' | 'replies' | 'newest'>('recent');
  const [searchQuery, setSearchQuery] = useState("");

  const { data: topics, isLoading } = useTopics({ sortBy, searchQuery });

  const filteredTopics = topics || [];

  return (
    <PageLayout>
      {/* Page Header */}
      <PageHeader
        title="Community Forum"
        description="Share experiences and ask questions about curly hair care"
        actions={
          <Link href="/forum/new">
            <Button data-testid="button-new-topic" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Button>
          </Link>
        }
      />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent Activity</SelectItem>
              <SelectItem value="replies">Most Replies</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topics List */}
        {isLoading ? (
          <LoadingState message="Loading topics..." />
        ) : filteredTopics.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No topics yet"
            description="Be the first to start a discussion!"
            action={{
              label: "Create First Topic",
              onClick: () => window.location.href = "/forum/new"
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <Link key={topic.id} href={`/forum/${topic.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-topic-${topic.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2 truncate">{topic.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {topic.content.substring(0, 200)}
                          {topic.content.length > 200 && '...'}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {topic.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{topic.repliesCount} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{topic.upvotesCount} upvotes</span>
                      </div>
                      {topic.authorName && (
                        <span>by {topic.authorName}</span>
                      )}
                      <span>•</span>
                      <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
