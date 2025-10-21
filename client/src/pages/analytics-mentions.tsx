import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { MentionStats } from "server/storage";
import { PageLayout } from "@/layouts/PageLayout";
import { PageHeader, LoadingState, EmptyState } from "@/components/shared";

export default function AnalyticsMentions() {
  const { data: mentions, isLoading } = useQuery<MentionStats[]>({
    queryKey: ['/api/analytics/mentions'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/mentions');
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
  });

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Stylist Mentions Analytics</h1>
              <p className="text-muted-foreground mt-1">See which stylists are trending in community discussions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <LoadingState message="Loading analytics..." />
        ) : !mentions || mentions.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No mentions yet"
            description="Stylists mentioned in forum topics will appear here."
          />
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  {mentions.length} stylists have been mentioned in community discussions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Mentions List */}
            <div className="space-y-4">
              {mentions.map((mention, index) => (
                <Card key={mention.stylistId} data-testid={`card-mention-${mention.stylistId}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="default" className="text-lg px-3 py-1">
                            #{index + 1}
                          </Badge>
                          <CardTitle>{mention.stylistName}</CardTitle>
                        </div>
                        <CardDescription className="text-lg">
                          <span className="font-semibold text-primary">
                            {mention.mentionCount}
                          </span>
                          {' '}mention{mention.mentionCount !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {mention.recentTopics.length > 0 && (
                    <CardContent>
                      <h4 className="font-semibold mb-3">Recent Mentions</h4>
                      <div className="space-y-2">
                        {mention.recentTopics.map((topic) => (
                          <Link key={topic.id} href={`/forum/${topic.id}`}>
                            <div className="flex items-start justify-between gap-4 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer border">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{topic.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(topic.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
