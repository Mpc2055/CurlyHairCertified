import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp } from "lucide-react";
import type { MentionStats } from "server/storage";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/forum">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Stylist Mentions Analytics</h1>
              <p className="text-sm text-muted-foreground">See which stylists are trending in discussions</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : !mentions || mentions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No mentions yet</h3>
              <p className="text-muted-foreground">
                Stylists mentioned in forum topics will appear here.
              </p>
            </CardContent>
          </Card>
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
    </div>
  );
}
