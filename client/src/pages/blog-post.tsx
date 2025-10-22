import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { PageLayout } from "@/layouts/PageLayout";
import { LoadingState, ErrorState } from "@/components/shared";
import { usePost } from "@/hooks/api";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || null;

  const { data: post, isLoading, error } = usePost(slug);

  const formattedDate = post ? new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState message="Loading blog post..." />
      </PageLayout>
    );
  }

  if (error || !post) {
    return (
      <PageLayout>
        <ErrorState
          title="Blog post not found"
          message="This blog post doesn't exist or has been removed."
          onRetry={() => window.location.href = "/blog"}
          retryText="Back to Blog"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Back Button */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-6">
                {post.subtitle}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b">
              <span className="font-medium text-foreground">{post.authorName}</span>
              {post.authorBio && (
                <>
                  <span>•</span>
                  <span>{post.authorBio}</span>
                </>
              )}
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-heading prose-headings:text-foreground
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-8
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-6
                  prose-p:text-base prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                  prose-li:mb-2
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                  prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
              />
            </CardContent>
          </Card>

          {/* Author Bio Card */}
          {post.authorBio && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-heading text-xl font-semibold mb-2">About the Author</h3>
                <p className="text-muted-foreground mb-1 font-medium">{post.authorName}</p>
                <p className="text-sm text-muted-foreground">{post.authorBio}</p>
              </CardContent>
            </Card>
          )}

          {/* Back to Blog */}
          <div className="mt-8 text-center">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </PageLayout>
  );
}

/**
 * Simple markdown formatter
 * Converts basic markdown to HTML for display
 */
function formatMarkdown(markdown: string): string {
  let html = markdown;

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Convert line breaks to paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim().startsWith('<h') || para.trim().startsWith('<ul') || para.trim().startsWith('<ol')) {
      return para;
    }
    return `<p>${para.trim()}</p>`;
  }).join('\n');

  // Convert lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  return html;
}
