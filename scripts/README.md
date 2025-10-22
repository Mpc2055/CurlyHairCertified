# Graphics Generation Utility

Automated image generation for Curly Hair Certified using Gemini 2.5 Flash Image API.

## Setup

### 1. API Key Configuration

You need a Gemini API key to generate images. Configure it in one of these ways:

**Option A: Replit Secrets (Recommended for Replit)**
1. Go to your Replit project
2. Open the "Secrets" tab (lock icon in left sidebar)
3. Add a secret named `GEMINI_API_KEY` with your API key value
4. The script will automatically use this key

**Option B: Environment Variable (Local Development)**
```bash
export GEMINI_API_KEY="your-api-key-here"
```

**Option C: .env File (Local Development)**
```bash
# Create a .env file in the project root
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

### 2. Install Dependencies

Dependencies should already be installed. If needed:
```bash
npm install
```

## Usage

### Generate All Graphics

Generate all 29 custom graphics from the default prompt file:
```bash
npm run generate-graphics -- --all
```

### Generate Logos

Generate logos using the logo-specific prompt file:
```bash
# Generate all logos
npm run generate-graphics -- --prompt-file logo-prompts.md --all

# Generate specific logo variants
npm run generate-graphics -- --prompt-file logo-prompts.md --graphics 1,2,4

# Preview logos first
npm run generate-graphics -- --prompt-file logo-prompts.md --all --dry-run
```

### Generate by Category

Generate only graphics from a specific category:
```bash
# Hero graphics (2 images)
npm run generate-graphics -- --category hero

# Feature icons (4 images)
npm run generate-graphics -- --category icons

# Educational graphics (10 images: 1 guide + 9 curl type swatches)
npm run generate-graphics -- --category educational

# Empty/error states (3 images)
npm run generate-graphics -- --category states

# Decorative elements (2 images)
npm run generate-graphics -- --category decorative

# Community illustrations (2 images)
npm run generate-graphics -- --category community

# Blog headers (3 images)
npm run generate-graphics -- --category blog

# UI elements (3 images)
npm run generate-graphics -- --category ui-elements
```

### Generate Specific Graphics

Generate only specific graphics by number:
```bash
# Generate graphics 1, 2, and 3
npm run generate-graphics -- --graphics 1,2,3

# Generate just the hero illustration
npm run generate-graphics -- --graphics 1
```

### Use Custom Prompt Files

Specify a different prompt file (useful for logos, icons, etc.):
```bash
# Use logo prompts
npm run generate-graphics -- --prompt-file logo-prompts.md --all

# Use custom prompt file
npm run generate-graphics -- --prompt-file my-custom-prompts.md --all
```

### Preview Without Generating (Dry Run)

Test what would be generated without making API calls:
```bash
# Preview all graphics
npm run generate-graphics -- --all --dry-run

# Preview hero graphics
npm run generate-graphics -- --category hero --dry-run

# Preview logos from logo-prompts.md
npm run generate-graphics -- --prompt-file logo-prompts.md --all --dry-run
```

### Overwrite Existing Files

By default, the script skips existing files. To regenerate and overwrite:
```bash
npm run generate-graphics -- --all --force
```

## Available Graphics

The script parses `/graphics-prompts.md` and generates 29 custom graphics:

| # | Title | Category | Output |
|---|-------|----------|--------|
| 1 | Hero Background Illustration | hero | `/client/public/graphics/hero/curl-joy-hero.svg` |
| 2 | Hero Accent | hero | `/client/public/graphics/hero/diverse-curls-accent.svg` |
| 3 | Certified Specialists Icon | icons | `/client/public/graphics/icons/certified-specialists.svg` |
| 4 | Interactive Map Icon | icons | `/client/public/graphics/icons/interactive-map.svg` |
| 5 | Community Resources Icon | icons | `/client/public/graphics/icons/community-resources.svg` |
| 6 | Connect Directly Icon | icons | `/client/public/graphics/icons/connect-directly.svg` |
| 7 | Curl Pattern Guide | educational | `/client/public/graphics/educational/curl-pattern-guide.svg` |
| 8 | Curl Type 2A Swatch | educational | `/client/public/graphics/educational/curl-2a.svg` |
| 9 | Curl Type 2B Swatch | educational | `/client/public/graphics/educational/curl-2b.svg` |
| 10 | Curl Type 2C Swatch | educational | `/client/public/graphics/educational/curl-2c.svg` |
| 11 | Curl Type 3A Swatch | educational | `/client/public/graphics/educational/curl-3a.svg` |
| 12 | Curl Type 3B Swatch | educational | `/client/public/graphics/educational/curl-3b.svg` |
| 13 | Curl Type 3C Swatch | educational | `/client/public/graphics/educational/curl-3c.svg` |
| 14 | Curl Type 4A Swatch | educational | `/client/public/graphics/educational/curl-4a.svg` |
| 15 | Curl Type 4B Swatch | educational | `/client/public/graphics/educational/curl-4b.svg` |
| 16 | Curl Type 4C Swatch | educational | `/client/public/graphics/educational/curl-4c.svg` |
| 17 | No Results Found | states | `/client/public/graphics/states/no-results.svg` |
| 18 | Error State | states | `/client/public/graphics/states/error.svg` |
| 19 | Loading State | states | `/client/public/graphics/states/loading.svg` |
| 20 | Abstract Curl Pattern | decorative | `/client/public/graphics/decorative/curl-pattern-bg-01.svg` |
| 21 | Organic Shapes | decorative | `/client/public/graphics/decorative/organic-shapes-set.svg` |
| 22 | Join Conversation | community | `/client/public/graphics/community/join-conversation.svg` |
| 23 | Success Illustration | community | `/client/public/graphics/community/success-found-stylist.svg` |
| 24 | Curl Care Basics Header | blog | `/client/public/graphics/blog/curl-care-basics-header.jpg` |
| 25 | Finding Stylist Header | blog | `/client/public/graphics/blog/finding-stylist-header.jpg` |
| 26 | Product Guide Header | blog | `/client/public/graphics/blog/product-guide-header.jpg` |
| 27 | Map Marker | ui-elements | `/client/public/graphics/ui-elements/map-marker.svg` |
| 28 | Loading Spinner | ui-elements | `/client/public/graphics/ui-elements/loading-spinner.svg` |
| 29 | Rating Star | ui-elements | `/client/public/graphics/ui-elements/rating-star.svg` |

## Features

✅ **Flexible Prompt Files** - Use any markdown prompt file (graphics-prompts.md, logo-prompts.md, or custom)
✅ **Automatic Prompt Parsing** - Reads markdown files to extract prompts and file locations
✅ **Category Filtering** - Generate by category (hero, icons, educational, etc.)
✅ **Selective Generation** - Generate specific graphics by number
✅ **Dry Run Mode** - Preview without making API calls
✅ **Smart Skip** - Skips existing files unless `--force` is used
✅ **Rate Limiting** - 2-second delay between API calls to avoid rate limits
✅ **Retry Logic** - Automatically retries failed generations (up to 3 attempts)
✅ **Progress Tracking** - Detailed logging and summary statistics
✅ **Error Handling** - Graceful error handling with informative messages

## Configuration

Edit `/scripts/generate-graphics.ts` to customize:

```typescript
const CONFIG = {
  model: 'gemini-2.5-flash-image',      // Gemini model to use
  rateLimitDelay: 2000,                  // Delay between API calls (ms)
  maxRetries: 3,                         // Max retry attempts per graphic
  retryDelay: 5000,                      // Delay before retry (ms)
};
```

## Cost Considerations

**Gemini 2.5 Flash Image Pricing** (as of Oct 2024):
- Image generation is currently in preview/beta
- Check [Google AI Studio pricing](https://ai.google.dev/pricing) for current rates

**Estimated Usage:**
- 29 graphics × 1 generation each = 29 API calls
- Add ~20% for potential retries = ~35 total calls
- With 2-second rate limiting: ~70 seconds total runtime

## Troubleshooting

### "GEMINI_API_KEY environment variable not set"

**Solution:** Make sure you've configured your API key in Replit Secrets or environment variables.

### "No graphics selected to generate"

**Solution:** You need to specify which graphics to generate using `--all`, `--category`, or `--graphics`.

### Graphics taking too long

**Solution:** Generate incrementally by category or specific numbers:
```bash
# Generate just icons first
npm run generate-graphics -- --category icons

# Then generate hero graphics
npm run generate-graphics -- --category hero
```

### API rate limit errors

**Solution:** Increase `rateLimitDelay` in the CONFIG section of `generate-graphics.ts`.

### File format mismatches

**Note:** Gemini may generate PNG/JPG instead of SVG. The script will save with the correct extension based on the actual format received. You may need to manually convert some images to SVG if required.

## Next Steps

After generating graphics:

1. **Review Generated Images** - Check `/client/public/graphics/` directories
2. **Optimize File Sizes** - Use tools like SVGO for SVGs, ImageOptim for PNGs/JPGs
3. **Update Components** - Replace Lucide icons with custom graphics in React components
4. **Test on Different Devices** - Verify graphics look good on mobile and desktop
5. **Commit to Git** - Add and commit the new graphics files

## Prompt Files

The utility supports multiple prompt files for different graphic types:

**Available Prompt Files:**
- `graphics-prompts.md` (default) - Website graphics (29 graphics)
  - Hero illustrations
  - Feature icons
  - Educational graphics (curl type swatches)
  - Empty/error states
  - Blog headers
  - UI elements

- `logo-prompts.md` - Logo system (10 variants)
  - Horizontal logos (light/dark variants)
  - Square icons (multiple sizes)
  - Social media graphics
  - Favicon system

**Creating Custom Prompt Files:**

You can create your own prompt files following the same markdown format:
```markdown
### 1. Your Graphic Title

**Purpose:** Description of the graphic
**Location:** `/path/to/output/file.svg`

**Prompt:**
\`\`\`
Your detailed AI generation prompt here...
\`\`\`
```

Then generate with:
```bash
npm run generate-graphics -- --prompt-file your-custom-prompts.md --all
```

## Example Workflows

### Graphics Workflow
```bash
# 1. Preview what would be generated
npm run generate-graphics -- --all --dry-run

# 2. Generate high-priority graphics first
npm run generate-graphics -- --category hero
npm run generate-graphics -- --category icons

# 3. Generate the rest
npm run generate-graphics -- --all

# 4. If something looks off, regenerate with --force
npm run generate-graphics -- --graphics 5 --force
```

### Logo Workflow
```bash
# 1. Preview logo prompts
npm run generate-graphics -- --prompt-file logo-prompts.md --all --dry-run

# 2. Generate essential logos first (horizontal + icon)
npm run generate-graphics -- --prompt-file logo-prompts.md --graphics 1,4

# 3. Generate all logo variants
npm run generate-graphics -- --prompt-file logo-prompts.md --all
```

## Support

For issues or questions:
- Check `/graphics-prompts.md` for detailed graphic specifications
- Review Gemini API documentation at https://ai.google.dev/
- File an issue in the project repository
