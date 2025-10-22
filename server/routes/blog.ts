import { Router } from 'express';
import { asyncHandler, notFound } from '../middleware';
import { storage } from '../storage';

export const blogRouter = Router();

/**
 * Get all blog posts with optional filtering
 * GET /api/blog/posts?tag=Rochester&limit=50
 */
blogRouter.get('/posts', asyncHandler(async (req, res) => {
  const { tag, limit } = req.query;

  const posts = await storage.getBlogPosts({
    tag: tag as string | undefined,
    limit: limit ? parseInt(limit as string) : 50,
  });

  res.json(posts);
}));

/**
 * Get single blog post by slug
 * GET /api/blog/posts/:slug
 */
blogRouter.get('/posts/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await storage.getBlogPostBySlug(slug);

  if (!post) {
    throw notFound('Blog post');
  }

  res.json(post);
}));

/**
 * Get featured blog post
 * GET /api/blog/featured
 */
blogRouter.get('/featured', asyncHandler(async (_req, res) => {
  const post = await storage.getFeaturedBlogPost();
  res.json(post);
}));
