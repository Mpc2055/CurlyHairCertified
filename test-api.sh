#!/bin/bash

# API Testing Script
# Tests all refactored endpoints to ensure functionality

set -e  # Exit on error

PORT=${PORT:-5000}
BASE_URL="http://localhost:$PORT"
FAILED=0
PASSED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  API Integration Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5

    echo -n "Testing: $description... "

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" 2>&1)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))

        # Show response preview
        if command -v jq &> /dev/null && echo "$body" | jq empty 2>/dev/null; then
            echo "$body" | jq -C '.' 2>/dev/null | head -10 | sed 's/^/    /'
            line_count=$(echo "$body" | jq '.' | wc -l)
            if [ "$line_count" -gt 10 ]; then
                echo "    ... (truncated, $line_count total lines)"
            fi
        else
            # Fallback without jq - just show truncated JSON
            body_length=${#body}
            if [ $body_length -gt 500 ]; then
                echo "${body:0:500}..." | sed 's/^/    /'
            else
                echo "$body" | sed 's/^/    /'
            fi
        fi
        echo ""
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        echo "$body" | head -20 | sed 's/^/    /'
        echo ""
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Wait for server to be ready
echo -e "${YELLOW}Waiting for server to be ready...${NC}"
for i in {1..30}; do
    if curl -s "$BASE_URL/api/blog/featured" > /dev/null 2>&1; then
        echo -e "${GREEN}Server is ready!${NC}"
        echo ""
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Server failed to start within 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

# ========== Blog Storage Tests ==========
echo -e "${BLUE}========== Blog Storage Tests ==========${NC}"
echo ""

test_endpoint GET "/api/blog/posts" 200 "Get all blog posts"
test_endpoint GET "/api/blog/posts?limit=5" 200 "Get blog posts with limit"
test_endpoint GET "/api/blog/featured" 200 "Get featured blog post"

# ========== Directory Storage Tests ==========
echo -e "${BLUE}========== Directory Storage Tests ==========${NC}"
echo ""

test_endpoint GET "/api/directory" 200 "Get directory data"

# ========== Analytics Storage Tests ==========
echo -e "${BLUE}========== Analytics Storage Tests ==========${NC}"
echo ""

test_endpoint GET "/api/analytics/mentions" 200 "Get mention analytics"

# ========== Forum Storage Tests ==========
echo -e "${BLUE}========== Forum Storage Tests ==========${NC}"
echo ""

test_endpoint GET "/api/forum/topics" 200 "Get forum topics"
test_endpoint GET "/api/forum/topics?sortBy=recent" 200 "Get topics sorted by recent"
test_endpoint GET "/api/forum/topics?sortBy=replies" 200 "Get topics sorted by replies"
test_endpoint GET "/api/forum/topics?sortBy=newest" 200 "Get topics sorted by newest"

# Test creating a topic (should work) - use timestamp to avoid duplicates
TIMESTAMP=$(date +%s)
TOPIC_DATA="{\"authorName\":\"Test User\",\"title\":\"Test Topic $TIMESTAMP\",\"content\":\"This is a test topic created by automated testing at $TIMESTAMP.\",\"tags\":[\"test\"]}"
echo ""
echo -e "${YELLOW}Testing topic creation...${NC}"
test_endpoint POST "/api/forum/topics" 201 "Create a test topic" "$TOPIC_DATA"

# Get the created topic ID from response (use different timestamp to avoid duplicate)
TIMESTAMP2=$(date +%s)
TOPIC_DATA2="{\"authorName\":\"Test User\",\"title\":\"Test Topic for Replies $TIMESTAMP2\",\"content\":\"This is another test topic at $TIMESTAMP2.\",\"tags\":[\"test\"]}"
TOPIC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/forum/topics" \
    -H "Content-Type: application/json" \
    -d "$TOPIC_DATA2")
if command -v jq &> /dev/null; then
    TOPIC_ID=$(echo "$TOPIC_RESPONSE" | jq -r '.id')
else
    # Fallback - extract id without jq
    TOPIC_ID=$(echo "$TOPIC_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
fi

if [ "$TOPIC_ID" != "null" ] && [ -n "$TOPIC_ID" ]; then
    echo -e "${GREEN}Created topic with ID: $TOPIC_ID${NC}"
    echo ""

    test_endpoint GET "/api/forum/topics/$TOPIC_ID" 200 "Get topic by ID ($TOPIC_ID)"

    # Test creating a reply
    REPLY_DATA='{"authorName":"Test Replier","content":"This is a test reply"}'
    test_endpoint POST "/api/forum/topics/$TOPIC_ID/reply" 201 "Create a reply" "$REPLY_DATA"

    # Test upvoting
    test_endpoint POST "/api/forum/topics/$TOPIC_ID/upvote" 200 "Upvote topic"
fi

# ========== Cache Tests ==========
echo -e "${BLUE}========== Cache Tests ==========${NC}"
echo ""

test_endpoint GET "/api/cache/stats" 200 "Get cache statistics"

# ========== Error Handling Tests ==========
echo -e "${BLUE}========== Error Handling Tests ==========${NC}"
echo ""

test_endpoint GET "/api/blog/posts/nonexistent-slug" 404 "Get non-existent blog post"
test_endpoint GET "/api/forum/topics/999999" 404 "Get non-existent topic"

# Invalid data tests
INVALID_TOPIC='{"invalid":"data"}'
test_endpoint POST "/api/forum/topics" 400 "Create topic with invalid data" "$INVALID_TOPIC"

# ========== Summary ==========
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed ✗${NC}"
    exit 1
fi
