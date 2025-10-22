import { z } from "zod";
import { pgTable, text, boolean, numeric, index, primaryKey, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ========== Drizzle Table Definitions ==========

export const salons = pgTable("salons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  streetAddress: text("street_address").notNull(),
  suiteUnit: text("suite_unit"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  website: text("website"),
  photo: text("photo"),
  lat: numeric("lat"),
  lng: numeric("lng"),
  fullAddress: text("full_address").notNull(),
  // Google Places integration
  googlePlaceId: text("google_place_id"),
  googleRating: text("google_rating"),
  googleReviewCount: integer("google_review_count"),
  googleReviewsUrl: text("google_reviews_url"),
  lastGoogleSync: timestamp("last_google_sync"),
}, (table) => ({
  cityIdx: index("city_idx").on(table.city),
}));

export const certifications = pgTable("certifications", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  level: text("level"),
  organization: text("organization"),
  description: text("description"),
});

export const stylists = pgTable("stylists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  salonId: text("salon_id").notNull().references(() => salons.id),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  instagram: text("instagram"),
  verified: boolean("verified").default(false).notNull(),
  profilePhoto: text("profile_photo"),
  canBookOnline: boolean("can_book_online").default(false).notNull(),
  curlyCutPrice: numeric("curly_cut_price"),
  // AI-generated summary fields
  aiSummary: text("ai_summary"),
  aiSummaryGeneratedAt: timestamp("ai_summary_generated_at"),
  aiSummarySources: text("ai_summary_sources"), // JSON string of grounding sources
}, (table) => ({
  salonIdx: index("salon_idx").on(table.salonId),
}));

export const stylistCertifications = pgTable("stylist_certifications", {
  stylistId: text("stylist_id").notNull().references(() => stylists.id, { onDelete: 'cascade' }),
  certificationId: text("certification_id").notNull().references(() => certifications.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.stylistId, table.certificationId] }),
  stylistIdx: index("stylist_cert_stylist_idx").on(table.stylistId),
  certificationIdx: index("stylist_cert_certification_idx").on(table.certificationId),
}));

// ========== Blog Tables ==========

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  authorName: text("author_name").notNull(),
  authorBio: text("author_bio"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  featured: boolean("featured").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
  readTime: integer("read_time").notNull().default(5),
}, (table) => ({
  slugIdx: index("blog_posts_slug_idx").on(table.slug),
  publishedAtIdx: index("blog_posts_published_at_idx").on(table.publishedAt),
  featuredIdx: index("blog_posts_featured_idx").on(table.featured),
}));

// ========== Forum Tables ==========

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  upvotesCount: integer("upvotes_count").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  flagCount: integer("flag_count").notNull().default(0),
  tags: text("tags").array().notNull().default([]),
  mentionedStylistIds: text("mentioned_stylist_ids").array().notNull().default([]),
}, (table) => ({
  updatedAtIdx: index("topics_updated_at_idx").on(table.updatedAt),
  createdAtIdx: index("topics_created_at_idx").on(table.createdAt),
  flagCountIdx: index("topics_flag_count_idx").on(table.flagCount),
}));

export const replies = pgTable("replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: 'cascade' }),
  parentReplyId: integer("parent_reply_id"),
  content: text("content").notNull(),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  flagCount: integer("flag_count").notNull().default(0),
}, (table) => ({
  topicIdx: index("replies_topic_idx").on(table.topicId),
  parentIdx: index("replies_parent_idx").on(table.parentReplyId),
  createdAtIdx: index("replies_created_at_idx").on(table.createdAt),
}));

// ========== Drizzle Relations ==========

export const salonsRelations = relations(salons, ({ many }) => ({
  stylists: many(stylists),
}));

export const stylistsRelations = relations(stylists, ({ one, many }) => ({
  salon: one(salons, {
    fields: [stylists.salonId],
    references: [salons.id],
  }),
  stylistCertifications: many(stylistCertifications),
}));

export const certificationsRelations = relations(certifications, ({ many }) => ({
  stylistCertifications: many(stylistCertifications),
}));

export const stylistCertificationsRelations = relations(stylistCertifications, ({ one }) => ({
  stylist: one(stylists, {
    fields: [stylistCertifications.stylistId],
    references: [stylists.id],
  }),
  certification: one(certifications, {
    fields: [stylistCertifications.certificationId],
    references: [certifications.id],
  }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  replies: many(replies),
}));

export const repliesRelations = relations(replies, ({ one, many }) => ({
  topic: one(topics, {
    fields: [replies.topicId],
    references: [topics.id],
  }),
  parentReply: one(replies, {
    fields: [replies.parentReplyId],
    references: [replies.id],
  }),
  childReplies: many(replies),
}));

// ========== Drizzle Insert Schemas ==========

export const insertSalonSchema = createInsertSchema(salons);
export const insertCertificationSchema = createInsertSchema(certifications);
export const insertStylistSchema = createInsertSchema(stylists);
export const insertStylistCertificationSchema = createInsertSchema(stylistCertifications);

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotesCount: true,
  repliesCount: true,
  flagCount: true
});
export const insertReplySchema = createInsertSchema(replies).omit({
  id: true,
  createdAt: true,
  flagCount: true
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
  updatedAt: true
});

// ========== TypeScript Types ==========

export type InsertSalon = typeof salons.$inferInsert;
export type SelectSalon = typeof salons.$inferSelect;

export type InsertCertification = typeof certifications.$inferInsert;
export type SelectCertification = typeof certifications.$inferSelect;

export type InsertStylist = typeof stylists.$inferInsert;
export type SelectStylist = typeof stylists.$inferSelect;

export type InsertStylistCertification = typeof stylistCertifications.$inferInsert;
export type SelectStylistCertification = typeof stylistCertifications.$inferSelect;

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type SelectTopic = typeof topics.$inferSelect;

export type InsertReply = z.infer<typeof insertReplySchema>;
export type SelectReply = typeof replies.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type SelectBlogPost = typeof blogPosts.$inferSelect;

// ========== API Response Schemas (Zod) ==========

// Certification schema for API responses
export const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string().optional(),
  organization: z.string().optional(),
  description: z.string().optional(),
});

export type Certification = z.infer<typeof certificationSchema>;

// Stylist schema for API responses
export const stylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  photo: z.string().optional(),
  verified: z.boolean().default(false),
  canBookOnline: z.boolean().default(false),
  price: z.number().optional(),
  certifications: z.array(certificationSchema),
  // AI-generated summary
  aiSummary: z.string().optional(),
  aiSummaryGeneratedAt: z.date().optional(),
  aiSummarySources: z.string().optional(), // JSON string
});

export type Stylist = z.infer<typeof stylistSchema>;

// Salon schema for API responses
export const salonSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  phone: z.string().optional(),
  website: z.string().optional(),
  photo: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  // Google Places data
  googlePlaceId: z.string().optional(),
  googleRating: z.number().optional(),
  googleReviewCount: z.number().optional(),
  googleReviewsUrl: z.string().optional(),
  stylists: z.array(stylistSchema),
});

export type Salon = z.infer<typeof salonSchema>;

// Filter options schema
export const filterOptionsSchema = z.object({
  organizations: z.array(z.string()),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  searchLocation: z.string().optional(),
});

export type FilterOptions = z.infer<typeof filterOptionsSchema>;

// Directory data response
export const directoryDataSchema = z.object({
  salons: z.array(salonSchema),
  certifications: z.array(certificationSchema),
});

export type DirectoryData = z.infer<typeof directoryDataSchema>;
