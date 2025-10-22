import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectBlogPost } from "@shared/schema";
import { Clock } from "lucide-react";

interface BlogCardProps {
  post: SelectBlogPost;
}

/**
 * BlogCard displays a preview of a blog post
 * Used in blog list view
 */
export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        className="hover-elevate active-elevate-2 cursor-pointer h-full flex flex-col"
        data-testid={`card-blog-post-${post.slug}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-heading text-2xl mb-2 line-clamp-2">
                {post.title}
              </CardTitle>
              {post.subtitle && (
                <p className="text-muted-foreground text-base mb-3 line-clamp-1">
                  {post.subtitle}
                </p>
              )}
              <CardDescription className="line-clamp-3">
                {post.excerpt}
              </CardDescription>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 mt-auto">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium">{post.authorName}</span>
            <span>•</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
