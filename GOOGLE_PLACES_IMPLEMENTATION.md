# Google Places API Integration - Database Migration Required

## What We Implemented

Backend service to automatically fetch and cache Google Business Profile data (Place ID, ratings, review counts) for salons using the Google Places API. The service:

- Searches for Place IDs using business name + address with retry fallback logic
- Fetches rating, review count, and reviews URL from Google Places
- Implements lazy loading (syncs during directory API calls)
- Caches results in database to minimize API usage
- Refreshes data weekly (7-day interval)
- Marks unfindable businesses as 'NOT_FOUND' to prevent repeated failed lookups

## Code Implementation Locations

### New File
- **`server/google-places.ts`** - Google Places API service with `findPlaceId()` and `getPlaceDetails()` functions

### Modified Files
- **`shared/schema.ts`** - Added Google Place fields to `salons` table schema and `Salon` TypeScript interface
- **`server/storage.ts`** - Added `syncGooglePlaceData()` and `shouldSyncGoogleData()` methods, integrated sync into `getDirectory()`

## Database Migration Required

**Table:** `salons`

**Add the following columns:**

```sql
ALTER TABLE salons ADD COLUMN google_place_id TEXT;
ALTER TABLE salons ADD COLUMN google_rating TEXT;
ALTER TABLE salons ADD COLUMN google_review_count INTEGER;
ALTER TABLE salons ADD COLUMN google_reviews_url TEXT;
ALTER TABLE salons ADD COLUMN last_google_sync TIMESTAMP;
```

### Field Descriptions
- `google_place_id` - Unique Google Place ID (or 'NOT_FOUND' if not findable)
- `google_rating` - Average rating (stored as TEXT for precision, like lat/lng)
- `google_review_count` - Total number of reviews
- `google_reviews_url` - Google Maps URL to view all reviews
- `last_google_sync` - Timestamp of last successful sync (for weekly refresh logic)

## Setup Requirements

1. **Environment Variable:** Add `GOOGLE_PLACES_API_KEY` to Replit Secrets with Google Places API enabled
2. **Run Migration:** Execute the SQL ALTER TABLE statements above
3. **Test:** Load the directory endpoint multiple times to trigger gradual sync of salon data
4. **Monitor:** Check server logs for sync messages: `[storage] Syncing Google Place data for: [Salon Name]`

## How It Works

- First directory load syncs missing Place IDs (free)
- Subsequent loads fetch details if missing or >7 days old
- Failed lookups marked as 'NOT_FOUND' to prevent wasted API calls
- Data is returned in existing `/api/directory` response under each salon object

## Future Frontend Work

Frontend can later be updated to display `googleRating`, `googleReviewCount`, and link to `googleReviewsUrl` on salon/stylist cards.
