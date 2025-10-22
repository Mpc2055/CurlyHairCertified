import { eq, desc, arrayContains } from 'drizzle-orm';
import { blogPosts, type SelectBlogPost } from '@shared/schema';
import { BaseStorage } from './base/BaseStorage';
import type { IBlogStorage } from './base/types';

/**
 * Blog storage operations
 * Handles blog posts retrieval and filtering
 */
export class BlogStorage extends BaseStorage implements IBlogStorage {
  /**
   * Get blog posts with optional filtering
   */
  async getBlogPosts(options: { tag?: string; limit?: number }): Promise<SelectBlogPost[]> {
    try {
      const { tag, limit = 50 } = options;

      let query = this.db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit);

      // Filter by tag if provided
      if (tag) {
        query = query.where(arrayContains(blogPosts.tags, [tag])) as any;
      }

      const posts = await query;
      return posts;
    } catch (error) {
      console.error('[storage] Error fetching blog posts:', error);
      throw error;
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<SelectBlogPost | null> {
    try {
      const [post] = await this.db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      return post || null;
    } catch (error) {
      console.error('[storage] Error fetching blog post by slug:', error);
      throw error;
    }
  }

  /**
   * Get the featured blog post
   */
  async getFeaturedBlogPost(): Promise<SelectBlogPost | null> {
    try {
      const [post] = await this.db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.featured, true))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(1);

      return post || null;
    } catch (error) {
      console.error('[storage] Error fetching featured blog post:', error);
      throw error;
    }
  }
}
