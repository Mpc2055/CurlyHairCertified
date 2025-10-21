# Curly Hair Certified - Rochester Directory

## Overview
A map-based directory application to help people find certified curly hair stylists in Rochester, NY. Users can browse stylists on an interactive map, filter by certifications and price, search by location, and view stylist portfolios on Instagram.

## Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon-backed via Replit)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Data Source**: PostgreSQL database (4 tables: salons, stylists, certifications, stylist_certifications)
- **Map Integration**: Google Maps JavaScript API with Advanced Markers (AdvancedMarkerElement)
- **Map Loader**: @googlemaps/js-api-loader v2.0+ with modern importLibrary() API
- **Geocoding**: Google Maps Geocoding API (with in-memory caching and database persistence)

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── filter/    # Filter panel for certifications, price, booking
│   │   │   ├── map/       # Google Maps integration
│   │   │   ├── salon/     # Salon group display
│   │   │   ├── search/    # Search bar component
│   │   │   ├── stylist/   # Stylist card component
│   │   │   └── ui/        # Shadcn base components
│   │   ├── pages/         # Page components
│   │   │   ├── landing.tsx    # Hero landing page
│   │   │   └── rochester.tsx  # Main directory page
│   │   └── lib/           # Utilities and query client
├── server/                # Backend Express server
│   ├── storage.ts        # PostgreSQL data access layer (Drizzle ORM)
│   ├── cache.ts          # In-memory caching service (node-cache)
│   ├── geocoding.ts      # Google Maps geocoding with cache
│   ├── routes.ts         # API endpoints
│   └── seed.ts           # CSV import script for initial data load
└── shared/               # Shared TypeScript types
    └── schema.ts         # Drizzle table schemas + Zod validation types
```

## Features

### Landing Page (/)
- Hero section with gradient background
- Feature highlights (Certified Specialists, Location Search, View Work)
- Call-to-action button to Rochester directory

### Rochester Directory (/roc)
- **Interactive Map**: Google Maps with AdvancedMarkerElement custom HTML markers
  - Custom circular pink markers (44px) with white borders
  - Stylist count badge displayed in marker center
  - Hover effect: Scale transform to 1.1x
  - Selected state: Grows to 52px with darker pink color and bounce animation
  - Click marker to highlight corresponding salon in list
  - Smooth pan and zoom when marker selected
- **List View**: Scrollable list of stylists grouped by salon
  - Stylist cards with photos, certifications, price, contact info
  - Instagram, website, phone, email links
  - "View on Map" button to highlight salon location
- **Filters**: 
  - Certification type (checkbox multi-select)
  - Online booking availability
  - Price range (min/max)
  - Active filter count with clear all option
- **Search**: Address or ZIP code search (geocoding integration)
- **Mobile Responsive**: Toggle between map and list views on mobile

## Data Flow

### Database Schema
1. **certifications**: Certification types (Rëzo, Ouidad, DevaCurl, etc.)
2. **salons**: Salon locations with geocoded coordinates
3. **stylists**: Individual stylists linked to salons
4. **stylist_certifications**: Many-to-many join table

### Data Pipeline
```
PostgreSQL → Storage layer queries (Drizzle ORM) → 
In-memory cache (1-hour TTL) → Transform to API format → 
Frontend filters/displays on map + list
```

### Geocoding Strategy
- Coordinates stored in database (lat/lng columns on salons table)
- On first fetch, missing coordinates are geocoded and persisted
- In-memory geocoding cache prevents redundant API calls
- Future fetches read from database (no re-geocoding needed)

### API Endpoints
- `GET /api/directory`: Returns all salons with stylists and certifications
  - **In-memory caching** with 1-hour TTL for fast response times
  - Cache warming on server startup (pre-populates data)
  - Performance: ~0-2ms (cache hit) vs ~300-500ms (cache miss from PostgreSQL)
  - Geocodes missing salon addresses on-demand and persists to database
  - Normalizes Instagram handles (adds @ prefix)
  - Filters out salons with no stylists
- `POST /api/cache/clear`: Manually clear the directory cache
- `GET /api/cache/stats`: Get cache hit/miss statistics and metrics

## Environment Variables

### Required Secrets (via Replit Secrets)
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (Maps JavaScript API + Geocoding API enabled)
- `SESSION_SECRET`: Express session secret key

### Optional Configuration
- `CACHE_TTL_SECONDS`: Directory cache time-to-live in seconds (default: 3600 = 1 hour)

### Frontend Environment
- `VITE_GOOGLE_MAPS_API_KEY`: Exposed to frontend for map rendering

## Design System

### Color Palette
- **Primary**: Purple (#8B5CF6 variants) - represents creativity/beauty industry
- **Map Accent**: Warm pink (#E91E63) - stands out on maps
- **Success**: Green - for verified badges
- **Background**: Clean white/dark based on theme

### Typography
- Font: Inter (400, 500, 600, 700 weights)
- Headings: Bold, clear hierarchy
- Body: Readable 16px base

### Components
- All components use Shadcn UI primitives
- Hover states with elevation effects
- Smooth transitions (200ms duration)
- Mobile-first responsive design

## User Workflows

### Primary Journey
1. Land on homepage → See value proposition
2. Click "Browse Rochester Stylists"
3. View map with salon locations
4. Apply filters (certifications, price, online booking)
5. Click map marker or "View on Map" to explore
6. Click Instagram/website to view stylist work
7. Contact stylist via phone/email or book online

### Filter Workflow
- Select certification → Instantly filter list + map
- Toggle online booking → Show only bookable stylists
- Set price range → Filter by budget
- Clear filters → Reset to all stylists

## Recent Changes
- October 21, 2025: Database Migration - Airtable to PostgreSQL
  - **Database Migration**: Migrated from Airtable API to PostgreSQL for faster performance and data ownership
  - **Drizzle Schema**: Created normalized 4-table schema (salons, stylists, certifications, stylist_certifications)
  - **CSV Import**: Built seed script to import all Airtable data from CSV exports
  - **Storage Layer**: Implemented PostgreSQL data access layer with Drizzle ORM
  - **Performance**: PostgreSQL queries (~300ms) faster than Airtable API (~1000ms), plus caching (~0-2ms)
  - **Geocoding Persistence**: Salon coordinates now stored in database instead of re-geocoding on every fetch
  - **Data Ownership**: Full control over data structure, migrations, and backups

- October 21, 2025: Performance Optimization - In-Memory Caching
  - **Cache Service**: Created `server/cache.ts` with node-cache for directory data caching
  - **Cache Warming**: Automatic cache population on server startup (~2-10s one-time)
  - **Performance Gains**: API response time improved from ~1000ms to ~0-2ms (500-1000x faster)
  - **Cache Management**: Added POST `/api/cache/clear` and GET `/api/cache/stats` endpoints
  - **Configurable TTL**: Cache expires after 1 hour (customizable via `CACHE_TTL_SECONDS`)
  - **Hit/Miss Logging**: Detailed logging for cache operations with duration tracking
  
- October 21, 2025: Google Maps Modernization
  - **Migrated to Advanced Markers**: Replaced deprecated `google.maps.Marker` with `google.maps.marker.AdvancedMarkerElement` (66% faster performance)
  - **Modern API Loader**: Upgraded to @googlemaps/js-api-loader v2.0+ using `setOptions()` and `importLibrary()` pattern
  - **Custom HTML Markers**: Built custom circular markers with HTML/CSS instead of icon-based markers
  - **CSS Animations**: Added smooth hover effects (scale 1.1x) and bounce animation on selection
  - **Map ID Integration**: Configured with Map ID for Advanced Markers compatibility
  - **TypeScript Definitions**: Added complete type definitions for AdvancedMarkerElement API
  
- October 21, 2025: Initial implementation
  - Full-stack application with Google Maps integration
  - Mobile-responsive design with map/list toggle
  - Real-time filtering and search capabilities
  - Beautiful UI with purple/pink color scheme

## Future Enhancements
- Proximity search with distance calculation
- Instagram post embedding
- User reviews and ratings
- Multi-city expansion
- Admin panel for data management

## Technical Notes

### Google Maps Configuration Requirements
To use the Advanced Markers implementation, ensure your Google Cloud Project has:

1. **APIs Enabled**:
   - Maps JavaScript API
   - Geocoding API

2. **Map ID Created**:
   - Create a Map ID in Google Cloud Console (Cloud Maps Platform)
   - The current implementation uses `CURLY_HAIR_CERTIFIED_MAP` as the Map ID
   - Map styling must be configured in Cloud Console (cannot be set in code when using Map ID)

3. **API Key Configuration**:
   - API key must have proper restrictions (HTTP referrer for frontend)
   - Required environment variable: `GOOGLE_MAPS_API_KEY` (server) and `VITE_GOOGLE_MAPS_API_KEY` (client)

### Advanced Markers Benefits
- **66% faster** rendering than legacy markers
- **Native HTML/CSS**: Full control over marker design and animations
- **Better performance**: Optimized for large datasets
- **Modern API**: Uses async importLibrary() for better loading
- **Future-proof**: Recommended by Google over legacy Marker class

### Marker Implementation Details
- **Default marker**: 44px × 44px circle, pink (#E91E63), white 3px border
- **Selected marker**: 52px × 52px circle, dark pink (#C2185B), white 4px border
- **Hover animation**: CSS transform scale(1.1) with 0.2s transition
- **Bounce animation**: 600ms keyframe animation on selection
- **Click handlers**: Integrated with list view for bidirectional synchronization

### Caching Architecture

The application uses a **two-layer caching strategy** for optimal performance:

#### 1. Directory Cache (server/cache.ts)
- **Library**: node-cache with TTL support
- **Scope**: Complete `/api/directory` response (all salons, stylists, certifications)
- **TTL**: 3600 seconds (1 hour) by default, configurable via `CACHE_TTL_SECONDS`
- **Cache Warming**: Automatically pre-populated on server startup
- **Performance Impact**:
  - Cache HIT: ~0-2ms (500-1000x faster)
  - Cache MISS: ~1000-10000ms (fetches from Airtable)
  - Cache warming: ~2-10s one-time on startup
  
**Management Endpoints**:
- `POST /api/cache/clear`: Manual cache invalidation
- `GET /api/cache/stats`: View hit/miss statistics

**Events Logged**:
- Cache SET/DEL/EXPIRED events
- CACHE HIT/MISS with duration for each request

**Security Note**: The cache-clear endpoint is currently unauthenticated. In production, consider adding authentication or rate-limiting to prevent abuse.

#### 2. Geocoding Cache (server/geocoding.ts)
- **Scope**: Address → lat/lng conversions
- **Strategy**: In-memory Map with full address as key
- **TTL**: Session-based (clears on server restart)
- **Purpose**: Prevents redundant Google Maps Geocoding API calls

**Combined Benefits**:
- First user sees instant response (cache warmed on startup)
- Subsequent users get ~0-2ms responses for entire directory
- Geocoding cache prevents duplicate API calls during data fetch
- Weekly data updates → 1-hour TTL is optimal balance

## Data Management

### Updating Directory Data

To add or update stylist/salon data:

1. **Update CSV Files**: Modify the CSV files in `attached_assets/`:
   - `Salons-Grid view.csv`
   - `Stylists-Grid view.csv`
   - `Certifications-Grid view.csv`

2. **Run Seed Script**: Import the updated data into PostgreSQL:
   ```bash
   npx tsx server/seed.ts
   ```

3. **Clear Cache**: Force a fresh data fetch:
   ```bash
   curl -X POST http://localhost:5000/api/cache/clear
   ```

Or use the cache clear endpoint from the browser console:
```javascript
fetch('/api/cache/clear', { method: 'POST' })
```
