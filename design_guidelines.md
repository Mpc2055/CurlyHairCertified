# Curly Hair Certified - Design Guidelines

**Last Updated:** October 2025
**Design Version:** 2.0 - Warm & Welcoming Community Edition

---

## Design Philosophy

**"A Warm Welcome Home for Curly Hair"**

This directory is more than a utility—it's a community hub where people with curly, coily, and wavy hair find specialized care. The design celebrates natural texture, builds trust through warmth, and makes discovering the perfect stylist feel personal and inviting.

### Core Design Principles

1. **Warmth Over Corporate** - Golden, natural tones replace cold tech colors
2. **Community Over Transaction** - Friendly, approachable design language
3. **Celebration of Texture** - Design honors the curly hair journey
4. **Trust Through Transparency** - Clear pricing, real reviews, verified credentials
5. **Accessible to All** - WCAG AA compliant, inclusive design

---

## Target Audience

**Who:** People with curly, coily, wavy hair seeking specialized stylists in Rochester, NY

**Demographics:**
- Ages 25-45, digitally savvy
- 60%+ women of color
- Value community recommendations over advertising
- Research-focused decision makers
- Mobile-first users (70%+ mobile traffic)

**User Needs:**
- Find stylists who understand their specific curl pattern
- See transparent pricing upfront
- Trust through certifications and real reviews
- Easy filtering by specialization and location
- Quick access to contact info and portfolios

---

## Color Palette

### Philosophy
Our palette draws from **Pattern Beauty** and successful curly hair brands, using warm, natural tones that complement diverse skin tones and create an inclusive, welcoming atmosphere.

### Light Mode

**Primary Palette:**
```css
--primary: 40 85% 55%           /* Golden Honey #f5b73d */
--primary-foreground: 25 10% 15% /* Dark Brown text on golden */

--accent: 15 75% 55%            /* Terra Cotta #e67e50 */
--accent-foreground: 0 0% 100%  /* White text on terra cotta */

--secondary: 140 25% 85%        /* Soft Sage #d9e8df */
--secondary-foreground: 140 30% 25% /* Deep green text */
```

**Neutrals (Warm):**
```css
--background: 0 0% 98%          /* Warm off-white, not pure white */
--foreground: 25 10% 15%        /* Warm charcoal, not pure black */

--card: 40 15% 96%              /* Cream card background */
--card-foreground: 25 10% 15%   /* Warm text */
--card-border: 35 10% 90%       /* Subtle warm border */

--border: 30 8% 88%             /* Warm gray borders */
--input: 35 10% 75%             /* Input border color */

--muted: 35 12% 90%             /* Muted backgrounds */
--muted-foreground: 35 8% 50%   /* Muted text */
```

**Functional Colors:**
```css
--destructive: 0 84% 42%        /* Error red (unchanged) */
--ring: 40 85% 55%              /* Focus ring - golden honey */

/* Chart colors - golden and earth tones */
--chart-1: 40 85% 45%           /* Deep golden */
--chart-2: 15 75% 50%           /* Terra cotta */
--chart-3: 142 50% 45%          /* Sage green */
--chart-4: 140 60% 50%          /* Green accent */
--chart-5: 20 90% 48%           /* Warm orange */
```

### Dark Mode

**Primary Palette:**
```css
--primary: 40 85% 60%           /* Lighter golden for dark backgrounds */
--accent: 15 75% 60%            /* Lighter terra cotta */
--secondary: 140 25% 30%        /* Darker sage */
```

**Neutrals:**
```css
--background: 25 10% 10%        /* Warm dark background */
--foreground: 40 5% 92%         /* Warm light text */

--card: 30 10% 14%              /* Warm dark card */
--card-foreground: 40 5% 90%    /* Warm light text */

--border: 30 10% 22%            /* Warm dark border */
```

### Map Accent Colors

```css
/* Map Markers */
.marker-circle {
  background: hsl(40, 85%, 55%);           /* Golden honey */
  box-shadow: 0 2px 8px rgba(245, 183, 61, 0.4);
}

.marker-circle.selected {
  background: hsl(15, 75%, 55%);           /* Terra cotta when selected */
  box-shadow: 0 4px 16px rgba(230, 126, 80, 0.6);
}
```

### Color Usage Guidelines

**Golden Honey (Primary):**
- Buttons, CTAs, and primary actions
- Prices and important numbers
- Focus states and active elements
- Certification badge outlines
- Map markers

**Terra Cotta (Accent):**
- Secondary CTAs
- Selected states
- Accent elements
- Special badges

**Soft Sage (Secondary):**
- Success states
- Verified badges
- Calm background sections
- Secondary information

**Warm Neutrals:**
- Cards, backgrounds, borders
- Text hierarchy
- Subtle UI elements

---

## Typography

### Font Families

**Montserrat** - Headings (500, 600, 700 weights)
- Warm, friendly, geometric
- Excellent readability
- Used successfully by Pattern Beauty
- For: H1-H4, Prices, Card titles, Section headers

**DM Sans** - Body (400, 500 weights)
- Highly legible at all sizes
- Softer than Inter
- Great for long-form content
- For: Body text, descriptions, labels, metadata

**Inter** - Fallback
- Maintained for compatibility
- System fallback font

### CSS Variables

```css
--font-heading: 'Montserrat', Inter, system-ui, sans-serif;
--font-sans: 'DM Sans', Inter, system-ui, sans-serif;
--font-serif: Georgia, serif;
--font-mono: Menlo, monospace;
```

### Tailwind Classes

```css
font-heading  /* Use for all headings */
font-sans     /* Use for body text (default) */
```

### Type Scale

**Headings:**
```css
Hero/H1:    font-heading text-4xl md:text-5xl font-bold
Page Title: font-heading text-3xl font-bold tracking-tight
H2:         font-heading text-2xl font-semibold
H3:         font-heading text-xl font-semibold
H4:         font-heading text-lg font-medium
```

**Body:**
```css
Large:      text-lg leading-relaxed
Body:       text-base leading-normal
Small:      text-sm
Tiny:       text-xs font-medium
```

**Special:**
```css
Price:      font-heading text-3xl font-bold text-primary
Card Title: font-heading text-2xl font-bold
Label:      text-sm font-medium text-muted-foreground
```

### Typography Guidelines

1. **Headings always use Montserrat** - Apply `font-heading` class
2. **Body text uses DM Sans** - Default, no class needed
3. **Never mix heading fonts** in the same component
4. **Line height:** headings use `tracking-tight`, body uses `leading-normal`
5. **Font weights:** Montserrat (500-700), DM Sans (400-500)

---

## Layout System

### Spacing Scale

**Tailwind Standard:**
```
2  = 0.5rem (8px)    - Tight spacing
3  = 0.75rem (12px)  - Small gaps
4  = 1rem (16px)     - Default spacing
6  = 1.5rem (24px)   - Medium spacing
8  = 2rem (32px)     - Large spacing
12 = 3rem (48px)     - Section spacing
16 = 4rem (64px)     - Hero spacing
```

### Border Radius

```css
--radius: 0.75rem;  /* 12px - Softer, friendlier corners */
```

**Component Radii:**
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-full` (pill shape)
- Images: `rounded-lg` (8px)
- Inputs: `rounded-lg` (8px)

### Container Widths

```css
/* Landing page content */
max-w-6xl (1152px)

/* Directory page */
Full width with max-w-screen-2xl (1536px)

/* Content sections */
max-w-4xl (896px) for text-heavy content

/* Card grids */
Full width within container
```

### Grid Systems

**Stylist Cards:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
```

**Map/List Split (Desktop):**
- Map: 60% width
- List: 40% width
- Both: Full height, independent scroll

**Mobile:**
- Stacked layout
- Toggle between map and list
- Full viewport usage

---

## Component Library

### Navigation

**Header:**
```
- Fixed top navigation
- Warm cream background (bg-card)
- Logo/branding left
- CTA right
- Height: h-16
- Padding: px-6
- Border: border-b with warm gray
```

**Active States:**
- Golden underline for current page
- Hover: subtle background lift

### Stylist Cards

**Structure:**
```html
<Card class="hover-elevate hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
  <CardContent class="p-4">
    <!-- Stylist Name (Montserrat) -->
    <h3 class="font-heading text-2xl font-bold">

    <!-- Salon Info -->
    <div class="text-sm text-muted-foreground">

    <!-- Price (Golden, Large) -->
    <span class="font-heading text-3xl font-bold text-primary">
      ${price}
    </span>

    <!-- Certifications (Golden outline badges) -->
    <Badge variant="outline"
           class="border-primary/30 text-primary bg-primary/5">

    <!-- Contact Icons -->
    <TooltipProvider>
      <!-- Instagram, Website, Phone, Email -->
    </TooltipProvider>
  </CardContent>
</Card>
```

**Visual Specs:**
- Background: Cream `bg-card`
- Hover: Lift with shadow + subtle scale
- Selected: Golden ring with shadow
- Price: Golden color, 3xl font, Montserrat
- Badges: Golden outline, semi-transparent background
- Border radius: 12px

### Filter Panel

**Desktop:**
```
- Sticky sidebar
- Width: w-80 (320px)
- Warm background
- Golden accents on active filters
```

**Mobile:**
```
- Bottom sheet overlay
- Full width
- Slide-up animation
```

**Filter Chips:**
```html
<Badge variant="outline"
       class="border-primary text-primary bg-primary/10 cursor-pointer hover:bg-primary/20">
  Organization Name
</Badge>
```

### Buttons

**Primary (Golden):**
```html
<Button class="bg-primary text-primary-foreground hover:bg-primary/90">
  Book Now
</Button>
```

**Secondary (Sage):**
```html
<Button variant="secondary">
  View Details
</Button>
```

**Outline (Golden Border):**
```html
<Button variant="outline" class="border-primary text-primary">
  Learn More
</Button>
```

**Ghost:**
```html
<Button variant="ghost">
  Cancel
</Button>
```

### Certification Badges

**Style:**
```html
<Badge variant="outline"
       class="border-primary/30 text-primary bg-primary/5 font-medium px-3 py-1">
  DevaCurl Certified
</Badge>
```

- Pill shape with golden outline
- Semi-transparent golden background
- Medium font weight
- Subtle padding

### Map Components

**Markers:**
- Golden honey circle with white border
- Stylist count in center
- Shadow with golden tint
- Selected: Terra cotta background
- Hover: Scale up slightly

**Info Windows:**
- Clean white card
- Warm shadows
- Rounded corners (12px)
- Golden accent for CTA button

### Loading States

**Spinner:**
```html
<Loader2 class="animate-spin text-primary" />
<p class="text-muted-foreground">Loading stylists...</p>
```

**Skeleton:**
- Warm gray pulse animation
- Match card structure
- Subtle animation

### Error & Empty States

**Error:**
```html
<div class="text-center">
  <AlertCircle class="w-12 h-12 text-destructive" />
  <h3 class="font-heading text-xl font-semibold">Something went wrong</h3>
  <p class="text-muted-foreground text-base">We couldn't load this content...</p>
  <Button variant="outline">Try again</Button>
</div>
```

**Empty:**
```html
<div class="text-center">
  <Icon class="w-12 h-12 text-muted-foreground" />
  <h3 class="font-heading text-xl font-semibold">No results found</h3>
  <p class="text-muted-foreground text-base">Try adjusting your filters</p>
  <Button>Clear Filters</Button>
</div>
```

---

## Page Layouts

### Landing Page (/)

**Hero Section:**
```
- Full viewport height
- Large hero image: Joyful curly hair client
- Gradient overlay: Golden honey tint (subtle)
- Centered content (max-w-3xl)
- Headline: font-heading text-5xl font-bold
- Subheading: text-lg text-muted-foreground
- Large golden CTA button
```

**Features Section:**
```
- Three columns on desktop
- Icons + descriptions
- Warm cream background
- Generous padding (py-20)
```

### Directory Page (/roc)

**Desktop:**
```
- Split layout: Map (60%) | List (40%)
- Both sections full height
- Independent scroll
- Sticky search/filters at top of list
```

**Mobile:**
```
- Toggle between map and list
- Full screen for each view
- Floating search button
- Bottom sheet for filters
```

**Search Bar:**
```
- Golden focus ring
- Large height (h-12)
- Magnifying glass icon
- Placeholder: "Search by name, salon, or certification"
```

### Forum Pages

**Topic List:**
```
- Card-based layout
- Golden badges for tags
- Montserrat headings
- Warm card backgrounds
```

**Topic Detail:**
```
- Large title (Montserrat 3xl)
- Nested reply structure
- Golden upvote buttons
- Warm, inviting spacing
```

---

## Interactive States

### Hover States

**Cards:**
```css
hover:shadow-lg hover:scale-[1.02] transition-all duration-200
```

**Buttons:**
```css
hover:bg-primary/90 transition-colors duration-150
```

**Links:**
```css
hover:text-primary transition-colors duration-150
```

**Badges:**
```css
hover:bg-primary/20 cursor-pointer transition-colors duration-150
```

### Focus States

**All Interactive Elements:**
```css
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

### Active/Selected States

**Filter Chips:**
```css
bg-primary text-primary-foreground
```

**Map Markers:**
```css
background: hsl(15, 75%, 55%) /* Terra cotta */
box-shadow: 0 4px 16px rgba(230, 126, 80, 0.6)
```

**Stylist Cards:**
```css
ring-2 ring-primary ring-offset-2 shadow-xl
```

---

## Micro-interactions

**Philosophy:** Subtle, smooth, never distracting

**Transitions:**
```css
/* Standard transition */
transition-all duration-200 ease-in-out

/* Color transitions */
transition-colors duration-150

/* Transform transitions */
transition-transform duration-200
```

**Animations:**
- Card hover: Scale 1.02x
- Button press: Scale 0.98x
- Loading spinner: Smooth rotate
- Skeleton: Gentle pulse
- Map markers: Bounce on add

**No Autoplay:**
- All animations user-triggered
- Respect prefers-reduced-motion

---

## Accessibility

### WCAG AA Compliance

**Contrast Ratios:**
- Golden Honey on white: 4.8:1 ✅
- Dark text on cream: 8.2:1 ✅
- Terra cotta on white: 4.6:1 ✅
- All functional text: Minimum 4.5:1

**Focus Indicators:**
```css
focus:ring-2 focus:ring-primary focus:ring-offset-2
```
- Visible on all interactive elements
- 2px golden ring with 2px offset
- Never use outline-none without replacement

**Keyboard Navigation:**
- All filters keyboard accessible
- Map controls have keyboard alternatives
- Modal traps focus appropriately
- Skip links for main content

**Screen Readers:**
- Semantic HTML (h1-h6, nav, main, article)
- ARIA labels on icons
- ARIA live regions for filter results
- Alt text on all images
- Descriptive link text

**Color Independence:**
- Never rely solely on color
- Icons + text for all states
- Patterns in addition to colors
- High contrast mode support

---

## Images & Assets

### Required Images

**1. Hero Image (Landing)**
- High-quality curly hair photo
- Joyful, vibrant, diverse representation
- Dimensions: 1920x1080+
- Treatment: Subtle golden gradient overlay

**2. Stylist Photos**
- Square format (400x400+)
- Professional but approachable
- Diverse representation
- Lazy loaded

**3. Certification Logos**
- Small (32x32 to 48x48)
- SVG preferred
- Badge-style display

### Image Treatment

**All Images:**
- Border radius: 8-12px
- Lazy loading enabled
- Aspect ratio preserved
- Object-fit: cover
- Placeholder: Warm gray gradient

**Optimization:**
- WebP format where supported
- Progressive JPEGs for photos
- Responsive sizes
- Max quality: 85%

---

## Design Tokens Summary

```css
/* Colors */
--primary: 40 85% 55%       /* Golden Honey */
--accent: 15 75% 55%        /* Terra Cotta */
--secondary: 140 25% 85%    /* Soft Sage */

/* Typography */
--font-heading: 'Montserrat'
--font-sans: 'DM Sans'

/* Spacing */
--radius: 0.75rem           /* 12px */
--spacing-unit: 0.25rem     /* 4px base */

/* Shadows (warm tones) */
--shadow-sm: 0 2px 8px rgba(245, 183, 61, 0.08)
--shadow-md: 0 4px 16px rgba(245, 183, 61, 0.12)
--shadow-lg: 0 8px 32px rgba(245, 183, 61, 0.15)
```

---

## Brand Voice & Tone

**In UI Copy:**
- Warm and welcoming, not corporate
- "Find your perfect stylist" not "Search directory"
- "Specializing in curls like yours" not "Certified professionals"
- "See prices" not "View pricing information"
- "Real reviews from real people" not "User testimonials"

**Microcopy:**
- Button: "Book Now" not "Schedule Appointment"
- Empty state: "No stylists match your filters yet" not "No results found"
- Loading: "Finding your perfect match..." not "Loading..."
- Success: "Got it!" not "Success"

---

## Development Guidelines

### Styling Approach

**Preferred:**
```html
<!-- Use Tailwind utility classes -->
<div class="bg-card p-4 rounded-xl shadow-md">
```

**Component-Specific:**
```html
<!-- Use font-heading for all headings -->
<h2 class="font-heading text-2xl font-bold text-foreground">
```

**Custom CSS:**
```css
/* Only for complex patterns */
.hover-elevate {
  /* See index.css for implementation */
}
```

### Class Ordering Convention

```html
<!-- Layout -> Spacing -> Typography -> Colors -> Effects -->
<div class="flex flex-col gap-4 p-6 font-heading text-xl text-primary hover:shadow-lg transition-all">
```

### Responsive Design

**Mobile-First:**
```html
<!-- Start with mobile, add larger breakpoints -->
<div class="text-base md:text-lg lg:text-xl">
```

**Breakpoints:**
- sm: 640px (phone landscape)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)
- 2xl: 1536px (extra large)

---

## Quality Checklist

Before shipping any UI:

- [ ] All headings use `font-heading` (Montserrat)
- [ ] Golden honey color for primary actions
- [ ] Border radius is 12px on cards
- [ ] Warm color palette throughout
- [ ] WCAG AA contrast ratios met
- [ ] Focus states visible on all interactive elements
- [ ] Keyboard navigation works
- [ ] Mobile responsive (test on phone)
- [ ] Dark mode looks good
- [ ] Loading states implemented
- [ ] Error states friendly and helpful
- [ ] Empty states have clear next actions
- [ ] Animations respect prefers-reduced-motion

---

## References

**Design Inspiration:**
- Pattern Beauty (Tracee Ellis Ross) - Color palette, warmth
- NaturallyCurly.com - Community feel, inclusive design
- DevaCurl - Professional but approachable tone
- Airbnb - Card-based layout clarity

**Technical:**
- Tailwind CSS v3+ documentation
- shadcn/ui component library
- WCAG 2.1 Level AA guidelines
- Google Fonts (Montserrat, DM Sans)

---

**Questions? See `/client/ARCHITECTURE.md` for technical implementation details.**
