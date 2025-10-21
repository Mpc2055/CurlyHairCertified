# Curly Hair Certified - Rochester Directory
## Product Requirements Document (Lightweight)

---

## Overview

Build a simple, map-based directory to help people find certified curly hair stylists in Rochester, NY. Users should be able to see stylists on a map, search by location, filter by certifications, and easily view stylist details including their Instagram. The site will have a basic landing page and a Rochester-specific page (`/roc`) where all the functionality lives.

**Key Goal:** Make it dead simple to find a nearby curly hair specialist and see their work.

---

## Site Structure

- **Landing Page** (`/`) - Hero + link to "Rochester, NY" → routes to `/roc`
- **Rochester Page** (`/roc`) - Map + directory (this is the main page)

---

## Map Behavior

- One pin per salon location (not per stylist)
- Pin shows salon name + number of stylists
- Click pin → Shows all stylists at that location
- Each stylist displays: name, photo, certifications, Instagram handle, price, booking link

---

## List View

- Shows all stylists grouped by salon
- Each stylist card has: photo, name, certifications, Instagram handle, price, "View on Map" button
- Clicking "View on Map" highlights the corresponding pin

---

## Search & Filters

**Search:** "Find near [address/zip]" → calculates distance, sorts by proximity

**Filters:**
- Certification type (Rëzo, Ouidad, DevaCurl, etc.)
- Online booking available
- Price range

Filters update both map and list in real-time.

---

## Instagram Integration

- Make Instagram handles clickable links to their profiles
- (Future: Consider embedding latest post/reel if easy to implement)

---

## Location Handling

- One pin per unique salon address
- Multiple stylists at same salon = grouped together in pin popup
- Geocode addresses via Google Maps API

---

## Mobile

- **Desktop:** Map left, list right
- **Mobile:** Toggle between "Map View" and "List View"

---

## Data Source

Fetch from 3 Airtable tables:
- Stylists (names, contact, certifications, pricing)
- Salons (addresses for pins/geocoding)
- Certifications (for filter options)

---

**That's it.** Simple directory with map, search, and filters. Instagram links for social proof. Replit Agent builds it.
