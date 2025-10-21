import { z } from "zod";
import { pgTable, text, boolean, numeric, index, primaryKey } from "drizzle-orm/pg-core";
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

// ========== Drizzle Insert Schemas ==========

export const insertSalonSchema = createInsertSchema(salons);
export const insertCertificationSchema = createInsertSchema(certifications);
export const insertStylistSchema = createInsertSchema(stylists);
export const insertStylistCertificationSchema = createInsertSchema(stylistCertifications);

// ========== TypeScript Types ==========

export type InsertSalon = typeof salons.$inferInsert;
export type SelectSalon = typeof salons.$inferSelect;

export type InsertCertification = typeof certifications.$inferInsert;
export type SelectCertification = typeof certifications.$inferSelect;

export type InsertStylist = typeof stylists.$inferInsert;
export type SelectStylist = typeof stylists.$inferSelect;

export type InsertStylistCertification = typeof stylistCertifications.$inferInsert;
export type SelectStylistCertification = typeof stylistCertifications.$inferSelect;

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
  stylists: z.array(stylistSchema),
});

export type Salon = z.infer<typeof salonSchema>;

// Filter options schema
export const filterOptionsSchema = z.object({
  certifications: z.array(z.string()),
  onlineBooking: z.boolean().optional(),
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
