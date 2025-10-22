# API Testing Guide

## Quick Test

Run the automated test suite:

```bash
bash test-api.sh
```

## Manual Testing with curl

### Blog Storage Tests

```bash
# Get all blog posts
curl http://localhost:5000/api/blog/posts

# Get blog posts with limit
curl http://localhost:5000/api/blog/posts?limit=5

# Get featured blog post
curl http://localhost:5000/api/blog/featured

# Get specific blog post by slug
curl http://localhost:5000/api/blog/posts/why-we-built-this-for-rochester
```

### Directory Storage Tests

```bash
# Get complete directory (salons, stylists, certifications)
curl http://localhost:5000/api/directory
```

### Analytics Storage Tests

```bash
# Get stylist mention analytics
curl http://localhost:5000/api/analytics/mentions
```

### Forum Storage Tests

```bash
# Get forum topics
curl http://localhost:5000/api/forum/topics

# Get topics sorted by recent activity
curl 'http://localhost:5000/api/forum/topics?sortBy=recent'

# Get topics sorted by reply count
curl 'http://localhost:5000/api/forum/topics?sortBy=replies'

# Get topics sorted by newest first
curl 'http://localhost:5000/api/forum/topics?sortBy=newest'

# Get specific topic with threaded replies
curl http://localhost:5000/api/forum/topics/1

# Create a new topic
curl -X POST http://localhost:5000/api/forum/topics \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "Test User",
    "title": "Test Topic",
    "content": "This is a test topic.",
    "tags": ["test"]
  }'

# Create a reply (replace :id with actual topic ID)
curl -X POST http://localhost:5000/api/forum/topics/:id/reply \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "Test Replier",
    "content": "This is a test reply."
  }'

# Upvote a topic (replace :id with actual topic ID)
curl -X POST http://localhost:5000/api/forum/topics/:id/upvote

# Flag content (topic)
curl -X POST http://localhost:5000/api/forum/topics/:id/flag

# Flag content (reply)
curl -X POST http://localhost:5000/api/forum/replies/:id/flag
```

### Cache Tests

```bash
# Get cache statistics
curl http://localhost:5000/api/cache/stats

# Clear cache (admin)
curl -X POST http://localhost:5000/api/cache/clear
```

### AI Storage Tests (Admin)

```bash
# Check if stylist needs AI summary refresh
curl http://localhost:5000/api/admin/stylists/:id/should-generate

# Generate AI summary for specific stylist (replace :id)
curl -X POST http://localhost:5000/api/stylists/:id/refresh-summary

# Generate AI summaries for all stylists (batch)
curl -X POST http://localhost:5000/api/admin/generate-ai-summaries \
  -H "Content-Type: application/json" \
  -d '{
    "stylistIds": [],
    "force": false
  }'
```

## Error Handling Tests

```bash
# Test 404 - Non-existent blog post
curl http://localhost:5000/api/blog/posts/nonexistent-slug

# Test 404 - Non-existent topic
curl http://localhost:5000/api/forum/topics/999999

# Test 400 - Invalid data
curl -X POST http://localhost:5000/api/forum/topics \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Test 429 - Rate limit (create 6 topics quickly)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/forum/topics \
    -H "Content-Type: application/json" \
    -d "{\"authorName\":\"Test\",\"title\":\"Topic $i\",\"content\":\"Content $i\",\"tags\":[]}"
  echo ""
done
```

## Expected Responses

### Successful Responses

- **200 OK** - GET requests return data
- **201 Created** - POST requests create new resources
- **404 Not Found** - Resource doesn't exist (expected for non-existent items)

### Error Responses

- **400 Bad Request** - Invalid data (validation failed)
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error (should not happen)

## Rate Limiting

The API has spam protection:
- **5 posts per hour** per IP address
- **24-hour duplicate content detection**

If you hit rate limits during testing, you'll need to wait or modify `server/config.ts` to increase limits temporarily.

## Middleware Verification

The refactored code includes these middleware features:

1. **asyncHandler** - Automatic error handling for async routes
2. **errorHandler** - Centralized error responses with proper status codes
3. **validateRequest** - Zod schema validation
4. **spamProtection** - Rate limiting and duplicate detection

All error responses follow this format:
```json
{
  "message": "Error description",
  "details": { /* optional additional info */ }
}
```

## Test Results

Run automated tests to verify all storage modules:

```bash
npm run build  # Build the application
npm run dev    # Start dev server (in separate terminal)
bash test-api.sh  # Run test suite
```

Expected output: All tests should pass with green checkmarks ✓
