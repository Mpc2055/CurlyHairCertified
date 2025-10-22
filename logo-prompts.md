# Curly Hair Certified - Logo Design Prompts

**Project:** Curly Hair Certified (curlyhaircertified.com)
**Date:** October 2025
**Purpose:** Comprehensive logo system for website, social media, and branding

---

## Table of Contents

1. [Brand Identity & Strategy](#brand-identity--strategy)
2. [Logo Design Philosophy](#logo-design-philosophy)
3. [Primary Horizontal Logo](#primary-horizontal-logo)
4. [Icon/Mark Only](#iconmark-only)
5. [Social Media Variants](#social-media-variants)
6. [Favicon System](#favicon-system)
7. [Implementation Guide](#implementation-guide)

---

## Brand Identity & Strategy

### Core Brand Identity

**Brand Name:** Curly Hair Certified
**Domain:** curlyhaircertified.com
**Tagline (implied):** "Your trusted resource for certified curly hair specialists"

**Design Philosophy:** "A Warm Welcome Home for Curly Hair"

The logo must embody:
- **Celebration of Natural Texture** - Honor curls, coils, waves (2A-4C)
- **Community & Trust** - Approachable, professional, certified expertise
- **Warmth & Inclusivity** - Golden honey tones, welcoming aesthetic
- **Modern Professionalism** - Contemporary, clean, scalable design

### Target Audience

- Ages 25-45, digitally savvy
- 60%+ women of color
- Value authenticity and community
- Seeking specialized curl care expertise
- Mobile-first users (70%+ mobile traffic)

### Color Palette

**Primary:**
- **Golden Honey:** `#f5b73d` (HSL: 40, 85%, 55%) - Primary brand color
- **Warm Charcoal:** `#2d2620` (HSL: 25, 10%, 15%) - Text/dark elements

**Secondary (for accents):**
- **Terra Cotta:** `#e67e50` (HSL: 15, 75%, 55%)
- **Soft Sage:** `#d9e8df` (HSL: 140, 25%, 85%)

**Neutrals:**
- **Warm Off-White:** `#fafaf8` - Light backgrounds
- **Cream:** `#f7f4f0` - Card backgrounds

### Typography Reference

**Primary Font:** Montserrat (500-700 weights)
- Modern, geometric, warm
- Used by Pattern Beauty
- Excellent legibility at all sizes

**Secondary Font:** DM Sans (for body text if needed)

### Visual Language

**Inspiration:**
- Pattern Beauty (Tracee Ellis Ross) - Warm, inclusive aesthetic
- NaturallyCurly.com - Community-focused design
- Modern wellness brands - Clean, approachable, trustworthy

**Avoid:**
- Corporate/cold aesthetics
- Overly literal curl imagery (if used, keep subtle)
- Thin, delicate lines (must work at small sizes)
- Complex gradients or effects

---

## Logo Design Philosophy

### Design Principles

1. **Versatile & Scalable**
   - Must work from 16px favicon to billboard size
   - Clear at tiny sizes (browser tabs)
   - Impactful at large sizes (hero sections)

2. **Memorable & Distinctive**
   - Instantly recognizable
   - Stands out in crowded browser tabs
   - Unique in the beauty/hair care space

3. **Professional Yet Warm**
   - Conveys certification/expertise
   - Maintains approachable, friendly feel
   - Not corporate or sterile

4. **Inclusive & Celebratory**
   - Celebrates natural hair texture
   - Represents diverse curl patterns
   - Welcoming to all

5. **Modern & Timeless**
   - Contemporary 2025 aesthetic
   - Won't feel dated in 3-5 years
   - Clean, refined execution

### Logo Components

The logo system should include:

**Option A - Wordmark + Symbol:**
- Stylized "Curly Hair Certified" text
- Integrated curl/certification symbol
- Horizontal layout for navigation

**Option B - Badge/Seal Style:**
- Circular or shield badge concept
- "Curly Hair Certified" arranged around perimeter
- Central curl icon/symbol
- Conveys certification authority

**Option C - Modern Minimalist:**
- Clean typography-focused
- Subtle curl element integrated into letterforms
- Contemporary, sophisticated

**Recommended Approach:** Create a system that combines wordmark + icon, allowing for flexible use

---

## Primary Horizontal Logo

### 1. Horizontal Logo - Full Lockup

**Purpose:** Primary logo for website navigation header, marketing materials, partnerships
**Location:** `/client/public/logo/horizontal/logo-horizontal.svg`

**Prompt:**
```
Design a modern, warm, and professional horizontal logo for "Curly Hair Certified":

BRAND NAME: Curly Hair Certified
DOMAIN: curlyhaircertified.com
CONCEPT: Premium directory connecting people with certified curly hair specialists

DESIGN REQUIREMENTS:

Typography:
- Font: Montserrat (or similar geometric sans-serif)
- Weight: Bold or Semi-Bold (600-700)
- Style: Modern, clean, highly legible
- Text: "Curly Hair Certified" OR "CURLY HAIR CERTIFIED"
- Consider: Two-line layout option for better proportion

Iconography/Symbol:
- Include a distinctive icon/mark that can stand alone
- Options to explore:
  * Abstract curl/spiral shape (elegant, flowing)
  * Certification badge/seal with curl element
  * Stylized "C" or "CHC" monogram incorporating curl
  * Minimalist curl pattern or wave
- Icon should work independently as square logo variant
- Icon placement: Left of text (standard) or integrated into text

Color:
- Primary color: Golden honey (#f5b73d)
- Secondary color: Warm charcoal (#2d2620)
- Suggest 2 versions:
  * Full color (golden honey + charcoal)
  * Single color (all charcoal or all golden)
- Must work on white and cream backgrounds

Style:
- Modern, clean, professional
- Warm and approachable (not corporate/cold)
- Scalable and versatile
- Conveys trust, certification, and expertise
- Celebrates natural hair texture subtly

Layout:
- Horizontal orientation
- Aspect ratio approximately 3:1 or 4:1 (width:height)
- Icon and text well-balanced
- Adequate spacing and breathing room
- Clean alignment and visual hierarchy

Technical Requirements:
- Format: SVG (vector)
- Dimensions: 600px wide × 150-200px tall (approx)
- Clean, simple shapes (no complex gradients)
- Minimum 2px stroke weight for any lines
- All text converted to outlines/paths
- Works at both large and small sizes

AESTHETIC REFERENCES:
- Pattern Beauty logo - Warm, modern, celebratory
- Wellness brands - Clean, trustworthy, approachable
- Modern certification badges - Professional authority

AVOID:
- Overly complex or detailed designs
- Thin, delicate lines or ornate details
- Literal/realistic hair illustrations
- Corporate blue or sterile aesthetics
- Trendy effects that will date quickly

DELIVERABLE: A horizontal logo lockup that works beautifully in website navigation at 200px wide, scales to large format, and maintains legibility at small sizes.
```

**Visual References:**
- Pattern Beauty brand aesthetic
- Airbnb logo (clean, modern, memorable icon)
- Stripe logo (professional, scalable typography)
- Modern wellness/beauty brand logos

---

### 2. Horizontal Logo - Light Background Variant

**Purpose:** Optimized for light/cream backgrounds (primary use case)
**Location:** `/client/public/logo/horizontal/logo-horizontal-light-bg.svg`

**Prompt:**
```
Create the "Curly Hair Certified" horizontal logo optimized for light backgrounds:

SAME DESIGN as primary horizontal logo, but:

Color Treatment:
- Icon/symbol: Golden honey (#f5b73d)
- Text: Warm charcoal (#2d2620)
- OR: All golden honey (#f5b73d) if it provides better contrast
- Ensure 4.5:1 contrast ratio minimum with cream background (#f7f4f0)

Background Context:
- Will appear on warm off-white (#fafaf8) and cream (#f7f4f0)
- Must have excellent visibility and contrast
- Professional, polished appearance

Technical Requirements:
- Format: SVG
- Dimensions: 600px × 150-200px
- Clean edges, crisp rendering
- Optimized for web (small file size)
```

---

### 3. Horizontal Logo - Dark Background Variant

**Purpose:** For dark mode, hero sections with dark backgrounds, special uses
**Location:** `/client/public/logo/horizontal/logo-horizontal-dark-bg.svg`

**Prompt:**
```
Create the "Curly Hair Certified" horizontal logo optimized for dark backgrounds:

SAME DESIGN as primary horizontal logo, but:

Color Treatment:
- Icon/symbol: Golden honey (#f5b73d) - warm, glowing on dark
- Text: Warm off-white (#fafaf8) or lighter variant
- Maintains warmth even on dark backgrounds

Background Context:
- Will appear on dark charcoal (#2d2620) or rich dark tones
- Should feel premium and elevated
- Warm, inviting glow on dark backgrounds

Technical Requirements:
- Format: SVG
- Dimensions: 600px × 150-200px
- Excellent contrast and visibility on dark
```

---

## Icon/Mark Only

### 4. Square Logo Icon - Primary

**Purpose:** Favicon, mobile app icons, social media profile pictures, square placements
**Location:** `/client/public/logo/icon/logo-icon.svg`

**Prompt:**
```
Design a square logo icon/mark for "Curly Hair Certified":

CONCEPT: This is the standalone icon from the horizontal logo, optimized for square format

DESIGN REQUIREMENTS:

Icon Design:
- Must work independently without text
- Instantly recognizable at tiny sizes (16px)
- Clear and bold at all sizes
- Can be:
  * Abstract curl/spiral symbol
  * Stylized "C" or "CHC" monogram
  * Certification badge with curl element
  * Minimalist geometric curl pattern

Characteristics:
- Simple, bold shapes
- High contrast elements
- No fine details (lost at small sizes)
- Centered composition
- Works in circle crop (for social media profiles)

Color:
- Primary version: Golden honey (#f5b73d) icon on transparent
- Alt version: Warm charcoal (#2d2620) icon on transparent
- Must work on both light and dark backgrounds

Style:
- Modern, clean, minimal
- Professional yet friendly
- Memorable and distinctive
- Scalable from 16px to 512px

Technical Requirements:
- Format: SVG (vector)
- Dimensions: 512px × 512px (square)
- Artboard with no bleed
- Icon should fill ~70-80% of artboard (breathing room)
- Clean, simple paths
- Works when cropped to circle (safe area consideration)

USE CASES TO CONSIDER:
- Browser favicon (16×16, 32×32, 48×48)
- Social media profile picture (circle crop)
- Mobile app icon (iOS: 180px, Android: 192px)
- Loading spinners and UI elements

TESTING:
- Must be recognizable at 16px
- Must work in circle crop
- Must maintain impact at 512px

DELIVERABLE: A bold, simple square icon that works perfectly from favicon size to large displays.
```

**Visual References:**
- Slack icon - Simple, bold, memorable
- Notion icon - Clean, modern, versatile
- Spotify icon - Recognizable at any size

---

### 5. Square Icon - Multiple Size Exports

**Purpose:** Pre-optimized icons for various use cases
**Locations:**
- `/client/public/logo/icon/logo-icon-512.png` (512×512 - High res)
- `/client/public/logo/icon/logo-icon-192.png` (192×192 - Android)
- `/client/public/logo/icon/logo-icon-180.png` (180×180 - iOS)
- `/client/public/logo/icon/logo-icon-96.png` (96×96 - Standard)
- `/client/public/logo/icon/logo-icon-48.png` (48×48 - Small)

**Prompt:**
```
Create optimized PNG exports of the square logo icon at multiple sizes:

BASED ON: The primary square logo icon (logo-icon.svg)

SIZES NEEDED:
1. 512×512px - High resolution for large displays
2. 192×192px - Android home screen icon
3. 180×180px - iOS home screen icon (Apple Touch Icon)
4. 96×96px - Standard web icon
5. 48×48px - Small UI elements

REQUIREMENTS:
- Format: PNG with transparency
- Color space: sRGB
- Same design, perfectly centered in each size
- Crisp edges (no anti-aliasing artifacts)
- Optimized file size without quality loss

OPTIMIZATION:
- Use nearest-neighbor or careful anti-aliasing for small sizes
- Ensure icon remains sharp and clear at each size
- Test visibility at actual size on screen
```

---

## Social Media Variants

### 6. Social Media Open Graph Image

**Purpose:** Facebook, LinkedIn, Twitter/X link previews, social sharing
**Location:** `/client/public/logo/social/logo-social-og.png`

**Prompt:**
```
Design a social media Open Graph image for "Curly Hair Certified":

CONCEPT: Eye-catching branded image for social media link previews

DESIGN REQUIREMENTS:

Layout:
- Horizontal landscape format
- Logo (horizontal or large icon) on left or center
- Tagline or descriptive text on right
- Warm, inviting background

Content:
- Primary element: "Curly Hair Certified" logo (prominent)
- Secondary text: "Find Certified Curly Hair Specialists in Rochester"
  OR: "Your Trusted Directory for Curl Experts"
- Website: "curlyhaircertified.com" (small, bottom corner)

Background:
- Warm gradient (golden honey to cream tones)
- OR: Subtle curl pattern background (decorative, not distracting)
- OR: Clean cream background with golden accents
- Professional, clean, on-brand

Style:
- Modern, polished, professional
- Warm and inviting
- Clear hierarchy (logo most prominent)
- Legible text even at thumbnail size
- Matches website aesthetic

Color Palette:
- Background: Cream to golden honey gradient
- Logo: Full color (golden honey + charcoal)
- Text: Warm charcoal (#2d2620)
- Accent: Soft sage or terra cotta touches

Typography:
- Logo: As designed
- Headline: Montserrat Bold
- Body/URL: DM Sans or Montserrat Regular

Technical Requirements:
- Dimensions: 1200×630 pixels (exact - Facebook/LinkedIn standard)
- Aspect ratio: 1.91:1
- Format: PNG or JPG (high quality)
- File size: Under 1MB
- Safe zone: Keep important content 40px from edges
- Works when cropped to 1:1 square (for some platforms)

OPTIMIZATION:
- High contrast for thumbnail visibility
- Clear, bold logo placement
- Minimal, uncluttered design
- Professional, shareable appearance

DELIVERABLE: A 1200×630px image perfect for Facebook, LinkedIn, and Twitter link previews.
```

**Visual References:**
- Airbnb Open Graph images
- Stripe social cards
- Modern SaaS product social images

---

### 7. Social Media Profile Picture

**Purpose:** Twitter, Facebook, Instagram profile pictures (circle crop)
**Location:** `/client/public/logo/social/logo-social-profile.png`

**Prompt:**
```
Create a social media profile picture for "Curly Hair Certified":

CONCEPT: Optimized version of square icon for circular profile pictures

DESIGN:
- Based on the square logo icon
- Optimized specifically for circle crop
- All important elements within safe circular area
- No text (icon/symbol only)

Requirements:
- Dimensions: 500×500 pixels (square, will be cropped to circle)
- Format: PNG with transparency
- Icon fills circular "safe zone" (~400px diameter)
- Clear visibility when cropped to circle
- Bold, simple, instantly recognizable

Color:
- Full color: Golden honey (#f5b73d)
- Background: Transparent OR warm cream (#f7f4f0)
- Version with cream background for platforms that don't support transparency

Technical:
- High resolution (500×500)
- Crisp edges and shapes
- Optimized for small display (as small as 32×32 in some UIs)

DELIVERABLE: Square image that looks perfect when cropped to circle for social profiles.
```

---

## Favicon System

### 8. Favicon - ICO Format

**Purpose:** Browser tab icon (multi-size ICO file)
**Location:** `/client/public/logo/favicon/favicon.ico`

**Prompt:**
```
Create a multi-size favicon.ico file for "Curly Hair Certified":

CONCEPT: Browser tab icon, must be instantly recognizable at tiny sizes

DESIGN:
- Based on the square logo icon
- Simplified if necessary for clarity at 16×16
- Bold, high-contrast shapes
- No fine details

Size Requirements (multi-size ICO):
- 16×16 pixels - Tiny browser tabs
- 32×32 pixels - Standard browser tabs
- 48×48 pixels - Windows taskbar/shortcuts

Design Considerations for Small Sizes:
- At 16×16: May need to simplify icon further
- Use pixel-perfect alignment
- Ensure maximum contrast
- Test actual visibility in browser tab

Colors:
- Primary: Golden honey (#f5b73d)
- Background: Transparent or white
- High contrast for visibility

Technical:
- Format: ICO (contains 16, 32, 48px)
- Color space: sRGB
- Optimized file size
- Cross-browser compatible

DELIVERABLE: favicon.ico file that looks crisp and recognizable in browser tabs.
```

---

### 9. Favicon - SVG Format

**Purpose:** Modern browsers (scalable favicon)
**Location:** `/client/public/logo/favicon/favicon.svg`

**Prompt:**
```
Create an SVG favicon for "Curly Hair Certified":

CONCEPT: Scalable vector favicon for modern browsers

DESIGN:
- Exact same design as square logo icon
- Optimized for small display
- Clean, simple vector paths

Requirements:
- Format: SVG
- Viewbox: "0 0 512 512"
- Simple, clean code
- No complex effects or gradients
- Supports dark mode (if possible via CSS)

Dark Mode Support (Advanced):
- Icon adapts to browser dark mode
- Light version on dark backgrounds
- Dark version on light backgrounds
- Uses CSS media queries in SVG

DELIVERABLE: Clean SVG favicon that works in all modern browsers.
```

---

### 10. Apple Touch Icon

**Purpose:** iOS home screen icon when site is saved
**Location:** `/client/public/logo/favicon/apple-touch-icon.png`

**Prompt:**
```
Create an Apple Touch Icon for "Curly Hair Certified":

CONCEPT: iOS home screen icon (appears when users save site to home screen)

DESIGN:
- Based on square logo icon
- Optimized for iOS visual language
- Can include subtle background color

Requirements:
- Dimensions: 180×180 pixels (exact)
- Format: PNG
- Background: Warm cream (#f7f4f0) OR golden honey (#f5b73d)
- Icon: Centered, appropriate padding
- Follows iOS icon guidelines (rounded corners applied by iOS)

Style:
- Clean, modern
- High quality, crisp rendering
- Professional appearance on iOS home screen
- Icon fills ~75% of canvas (iOS adds rounded corners)

Technical:
- PNG format
- sRGB color space
- Optimized file size
- No transparency (solid background)

DELIVERABLE: 180×180px PNG perfect for iOS home screen.
```

---

## Implementation Guide

### File Structure

```
/client/public/logo/
├── horizontal/
│   ├── logo-horizontal.svg              # Primary full logo
│   ├── logo-horizontal-light-bg.svg     # Optimized for light backgrounds
│   └── logo-horizontal-dark-bg.svg      # Optimized for dark backgrounds
├── icon/
│   ├── logo-icon.svg                    # Square icon (vector)
│   ├── logo-icon-512.png                # 512×512 high-res
│   ├── logo-icon-192.png                # 192×192 Android
│   ├── logo-icon-180.png                # 180×180 iOS
│   ├── logo-icon-96.png                 # 96×96 standard
│   └── logo-icon-48.png                 # 48×48 small
├── social/
│   ├── logo-social-og.png               # 1200×630 Open Graph
│   └── logo-social-profile.png          # 500×500 profile picture
└── favicon/
    ├── favicon.ico                      # Multi-size ICO (16, 32, 48)
    ├── favicon.svg                      # SVG favicon
    └── apple-touch-icon.png             # 180×180 iOS icon
```

### Integration Checklist

After receiving logo files:

**1. Navigation Header**
- [ ] Replace text logo with SVG in `client/src/components/navigation.tsx`
- [ ] Use `logo-horizontal-light-bg.svg`
- [ ] Set appropriate height (40-48px)
- [ ] Add alt text: "Curly Hair Certified"
- [ ] Ensure clickable link to home page

**2. HTML Head (Favicon)**
- [ ] Add to `index.html` or equivalent:
```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/logo/favicon/favicon.svg">
<link rel="icon" type="image/x-icon" href="/logo/favicon/favicon.ico">
<link rel="apple-touch-icon" href="/logo/favicon/apple-touch-icon.png">
```

**3. Open Graph Meta Tags**
- [ ] Add social media meta tags:
```html
<!-- Open Graph -->
<meta property="og:image" content="https://curlyhaircertified.com/logo/social/logo-social-og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:title" content="Curly Hair Certified - Find Your Perfect Curl Specialist">
<meta property="og:description" content="Your trusted directory for certified curly hair specialists in Rochester, NY">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://curlyhaircertified.com/logo/social/logo-social-og.png">
```

**4. PWA Manifest** (if applicable)
- [ ] Add to manifest.json:
```json
{
  "icons": [
    {
      "src": "/logo/icon/logo-icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo/icon/logo-icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**5. Loading States** (Optional)
- [ ] Consider using `logo-icon.svg` in loading spinners
- [ ] Replace generic loading graphics

**6. Footer** (Future)
- [ ] Add logo to footer when implemented
- [ ] Use smaller horizontal logo or icon

### Design Validation

Before finalizing:

- [ ] Test logo at actual navigation size (200px wide)
- [ ] Verify favicon visibility in browser tabs (multiple browsers)
- [ ] Check social media preview with Open Graph debugger
- [ ] Test iOS home screen icon appearance
- [ ] Verify all sizes render crisply (no blurriness)
- [ ] Ensure brand consistency across all variants
- [ ] Check accessibility (sufficient contrast)
- [ ] Validate file sizes (optimize if needed)

### Brand Guidelines

**Primary Logo Usage:**
- Always use horizontal logo in navigation header
- Maintain clear space around logo (minimum = height of logo)
- Don't stretch, distort, or rotate logo
- Use provided color versions (don't recolor)

**Icon Usage:**
- Use square icon when horizontal logo won't fit
- Never use low-resolution versions at large sizes
- Always use SVG when possible for crisp rendering

**Color Variations:**
- Light backgrounds: Use light background variant
- Dark backgrounds: Use dark background variant
- Monochrome: Acceptable in single golden honey color

**Minimum Sizes:**
- Horizontal logo: 120px wide minimum
- Square icon: 24px minimum
- Favicon: Provided sizes only

---

## Priority Generation Order

**Phase 1 - Essential:**
1. Primary horizontal logo (#1)
2. Square icon SVG (#4)
3. Favicon ICO (#8)

**Phase 2 - Web Optimization:**
4. Light/dark background variants (#2, #3)
5. Icon size exports (#5)
6. SVG favicon (#9)
7. Apple Touch Icon (#10)

**Phase 3 - Social Media:**
8. Open Graph image (#6)
9. Social profile picture (#7)

---

## Questions or Clarifications?

For any questions about logo design, implementation, or brand alignment:
- Reference: `/home/runner/workspace/design_guidelines.md`
- Brand colors: Golden honey (#f5b73d), Warm charcoal (#2d2620)
- Typography: Montserrat (headings), DM Sans (body)
- Aesthetic: Pattern Beauty, warm wellness brands

---

**Ready for AI generation!** Use these prompts with your preferred AI image generation tool and place generated files in the corresponding `/client/public/logo/` subdirectories.

Generate logos in order of priority, starting with the essential horizontal logo and square icon.
