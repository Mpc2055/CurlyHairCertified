import { z } from "zod";

// Certification schema
export const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string().optional(),
  organization: z.string().optional(),
  description: z.string().optional(),
});

export type Certification = z.infer<typeof certificationSchema>;

// Stylist schema
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

// Salon schema
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
