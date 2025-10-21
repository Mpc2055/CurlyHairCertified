# Curly Hair Certified - Rochester Directory

## Overview
A map-based directory application to help people find certified curly hair stylists in Rochester, NY. Users can browse stylists on an interactive map, filter by certifications and price, search by location, and view stylist portfolios on Instagram.

## Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js, Node.js
- **Data Source**: Airtable API (3 tables: Salons, Stylists, Certifications)
- **Map Integration**: Google Maps JavaScript API with Advanced Markers (AdvancedMarkerElement)
- **Map Loader**: @googlemaps/js-api-loader v2.0+ with modern importLibrary() API
- **Geocoding**: Google Maps Geocoding API (with in-memory caching)

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
│   ├── airtable.ts       # Airtable API integration
│   ├── geocoding.ts      # Google Maps geocoding with cache
│   └── routes.ts         # API endpoints
└── shared/               # Shared TypeScript types
    └── schema.ts         # Data models for Salon, Stylist, Certification
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

### Airtable Integration
1. **Certifications Table**: Fetched and cached, mapped by ID
2. **Stylists Table**: Linked to certifications and salons
3. **Salons Table**: Geocoded addresses cached in memory

### Transformation Pipeline
```
Airtable → Fetch 3 tables → Transform & merge data → 
Geocode salon addresses → Group stylists by salon → 
Filter based on user preferences → Display on map + list
```

### API Endpoints
- `GET /api/directory`: Returns all salons with stylists and certifications
  - Geocodes salon addresses (cached)
  - Normalizes Instagram handles (adds @ prefix)
  - Filters out salons with no stylists

## Environment Variables

### Required Secrets (via Replit Secrets)
- `AIRTABLE_API_KEY`: Airtable Personal Access Token
- `AIRTABLE_BASE_ID`: Airtable base ID (starts with "app...")
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (Maps JavaScript API + Geocoding API enabled)

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
- October 21, 2025: Google Maps Modernization
  - **Migrated to Advanced Markers**: Replaced deprecated `google.maps.Marker` with `google.maps.marker.AdvancedMarkerElement` (66% faster performance)
  - **Modern API Loader**: Upgraded to @googlemaps/js-api-loader v2.0+ using `setOptions()` and `importLibrary()` pattern
  - **Custom HTML Markers**: Built custom circular markers with HTML/CSS instead of icon-based markers
  - **CSS Animations**: Added smooth hover effects (scale 1.1x) and bounce animation on selection
  - **Map ID Integration**: Configured with Map ID for Advanced Markers compatibility
  - **TypeScript Definitions**: Added complete type definitions for AdvancedMarkerElement API
  
- October 21, 2025: Initial implementation
  - Full-stack application with Airtable + Google Maps integration
  - Mobile-responsive design with map/list toggle
  - Real-time filtering and search capabilities
  - Beautiful UI with purple/pink color scheme

## Future Enhancements
- Geocoding cache persistence (database)
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
