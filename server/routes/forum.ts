import { Router } from 'express';
import { asyncHandler, validateRequest, spamProtection, notFound, validationError } from '../middleware';
import { insertTopicSchema, insertReplySchema } from '@shared/schema';
import { storage } from '../storage';
import { detectStylistMentions } from '../services/forum/mention-detection';

export const forumRouter = Router();

/**
 * Get topics with filtering and sorting
 * GET /api/forum/topics?sortBy=recent&tags=Help&search=curly&limit=50&offset=0
 */
forumRouter.get('/topics', asyncHandler(async (req, res) => {
  const { sortBy, tags, search, limit, offset } = req.query;

  const topics = await storage.getTopics({
    sortBy: sortBy as 'recent' | 'replies' | 'newest' | undefined,
    tags: tags ? (typeof tags === 'string' ? [tags] : tags as string[]) : undefined,
    search: search as string | undefined,
    limit: limit ? parseInt(limit as string) : 50,
    offset: offset ? parseInt(offset as string) : 0,
  });

  res.json(topics);
}));

/**
 * Create a new topic
 * POST /api/forum/topics
 * Body: { title: string, content: string, authorName?: string, authorEmail?: string, tags?: string[] }
 */
forumRouter.post(
  '/topics',
  validateRequest(insertTopicSchema),
  spamProtection({ includeTitle: true }),
  asyncHandler(async (req, res) => {
    // Detect stylist mentions
    const mentionedStylistIds = await detectStylistMentions(
      req.body.content,
      req.body.title
    );

    // Create topic with detected mentions
    const topic = await storage.createTopic({
      ...req.body,
      mentionedStylistIds,
    });

    res.status(201).json(topic);
  })
);

/**
 * Get a single topic with replies
 * GET /api/forum/topics/:id
 */
forumRouter.get('/topics/:id', asyncHandler(async (req, res) => {
  const topicId = parseInt(req.params.id);

  if (isNaN(topicId)) {
    throw validationError('Invalid topic ID');
  }

  const topic = await storage.getTopicById(topicId);

  if (!topic) {
    throw notFound('Topic');
  }

  res.json(topic);
}));

/**
 * Reply to a topic
 * POST /api/forum/topics/:id/reply
 * Body: { content: string, authorName?: string, authorEmail?: string, parentReplyId?: number }
 */
forumRouter.post(
  '/topics/:id/reply',
  spamProtection(),
  asyncHandler(async (req, res) => {
    const topicId = parseInt(req.params.id);

    if (isNaN(topicId)) {
      throw validationError('Invalid topic ID');
    }

    // Validate request body with topicId injected
    const validatedData = insertReplySchema.parse({
      content: req.body.content,
      authorName: req.body.authorName,
      authorEmail: req.body.authorEmail,
      parentReplyId: req.body.parentReplyId,
      topicId,
    });

    // Create reply
    const reply = await storage.createReply(validatedData);

    res.status(201).json(reply);
  })
);

/**
 * Flag content as inappropriate
 * POST /api/forum/flag
 * Body: { contentType: 'topic' | 'reply', contentId: number }
 */
forumRouter.post('/flag', asyncHandler(async (req, res) => {
  const { contentType, contentId } = req.body;

  if (!['topic', 'reply'].includes(contentType)) {
    throw validationError('Invalid content type');
  }

  if (typeof contentId !== 'number') {
    throw validationError('Invalid content ID');
  }

  await storage.flagContent(contentType as 'topic' | 'reply', contentId);

  res.json({ message: 'Content flagged successfully' });
}));

/**
 * Upvote a topic
 * POST /api/forum/upvote
 * Body: { topicId: number }
 */
forumRouter.post('/upvote', asyncHandler(async (req, res) => {
  const { topicId } = req.body;

  if (typeof topicId !== 'number') {
    throw validationError('Invalid topic ID');
  }

  await storage.upvoteTopic(topicId);

  res.json({ message: 'Topic upvoted successfully' });
}));
