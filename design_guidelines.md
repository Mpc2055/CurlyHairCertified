# Curly Hair Certified - Design Guidelines

## Design Approach

**Selected Approach**: Hybrid - Drawing from Airbnb's clean card aesthetics and Linear's typography with a focus on functional clarity for directory browsing.

**Rationale**: This is primarily a utility-focused application where users need to quickly find and evaluate stylists. The design should balance visual appeal (stylist photos, Instagram content) with efficient information discovery through maps, filters, and search.

**Key Design Principles**:
1. Location-first design - map prominence drives the experience
2. Visual trust signals - photos and certifications build confidence
3. Effortless filtering - users should scan and filter without friction
4. Mobile-optimized map interaction

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 280 70% 45% (vibrant purple - represents creativity/beauty industry)
- Primary Hover: 280 70% 40%
- Background: 0 0% 100%
- Surface: 240 10% 98%
- Text Primary: 240 10% 10%
- Text Secondary: 240 5% 45%
- Border: 240 10% 90%
- Success (verified badge): 142 76% 36%

**Dark Mode**:
- Primary: 280 70% 55%
- Primary Hover: 280 70% 60%
- Background: 240 10% 8%
- Surface: 240 10% 12%
- Text Primary: 240 5% 95%
- Text Secondary: 240 5% 65%
- Border: 240 10% 20%

**Map Accent**: 340 75% 55% (warm pink for map pins - stands out on map backgrounds)

---

### B. Typography

**Font Families**:
- Headings: Inter (600, 700 weights)
- Body: Inter (400, 500 weights)
- UI Elements: Inter (500, 600 weights)

**Scale**:
- Hero Headline: text-5xl md:text-6xl font-bold
- Page Title: text-3xl md:text-4xl font-bold
- Section Header: text-2xl font-semibold
- Card Title: text-lg font-semibold
- Body Text: text-base
- Small/Meta: text-sm
- Micro (badges): text-xs

---

### C. Layout System

**Spacing Primitives**: 2, 3, 4, 6, 8, 12, 16, 20, 24 (Tailwind units)

**Container Widths**:
- Landing page content: max-w-6xl
- Directory page: Full width with max-w-screen-2xl
- Stylist cards: Fixed width on desktop, full on mobile

**Grid Systems**:
- Stylist cards: grid-cols-1 md:grid-cols-2 gap-4
- Certification badges: Inline flex with gap-2
- Map/List split: 60/40 on desktop, stacked on mobile

---

### D. Component Library

#### Navigation
- Fixed header with logo left, "Find Stylists in Rochester" CTA right
- Transparent on landing hero, solid white/dark surface on scroll
- Height: h-16, horizontal padding: px-6

#### Map Container
- Desktop: 60% viewport width, full height minus header
- Pin clusters with count badges when zoomed out
- Custom purple map markers with salon count
- Info window: Clean white card with shadow, rounded-lg

#### Stylist Cards
- Photo: Rounded-lg, aspect-square object-cover
- Layout: Photo top, content below with p-4 spacing
- Hover state: Subtle shadow-lg and scale-105 transform
- Instagram badge: Clickable with Instagram icon + handle
- Price badge: Top-right absolute positioned on photo
- Certification badges: Horizontal scroll on mobile, wrapped on desktop

#### Filter Panel
- Desktop: Sticky sidebar, w-80
- Mobile: Bottom sheet overlay
- Filter chips: Rounded-full with border, toggle on/off state
- Search input: Large h-12 with magnifying glass icon
- Clear filters button when active

#### Info Cards (Salon Details)
- Grouped stylist layout under salon name
- Salon header: Name + address + phone in muted text
- Divider between salon groups: border-t with my-8 spacing
- "View on Map" button per card: Secondary style, small size

#### Certification Badges
- Pill shape: rounded-full px-3 py-1
- Background: surface color with colored left border (border-l-4)
- Text: text-xs font-medium
- Icon optional: Small verified checkmark for verified certs
- Different border colors per cert type

#### Buttons
- Primary: bg-primary with white text, px-6 py-3, rounded-lg
- Secondary: border with primary text, bg-transparent
- Ghost: No background, primary text, hover bg-surface
- On image overlays: backdrop-blur-sm with semi-transparent background

#### Mobile Toggle
- Fixed bottom bar with two equal width buttons
- Active state: Primary background, inactive: surface
- Icons: Map pin and list icons
- Safe area padding for modern phones

---

### E. Page-Specific Layouts

#### Landing Page (/)
**Hero Section**:
- Full viewport height (min-h-screen)
- Large hero image: Curly hair transformation before/after or happy client
- Centered content with max-w-3xl
- Headline: "Find Your Perfect Curly Hair Stylist in Rochester"
- Subheading: Brief value prop about certified specialists
- Large CTA button: "Browse Rochester Stylists"
- Background image with gradient overlay (purple tint)

**Features Section** (if needed):
- Three columns on desktop: Certifications, Instagram Previews, Easy Booking
- Icons + short description
- Subtle background: surface color, py-20

#### Directory Page (/roc)
**Desktop Layout**:
- Horizontal split: Map (60%) | List (40%)
- Fixed positions, both scroll independently
- Search bar fixed at top of list section
- Filters collapsible panel below search

**Mobile Layout**:
- Toggle between full-screen map and full-screen list
- Floating search bar over map (absolute positioned)
- Filter button opens bottom sheet
- Quick "Show List/Show Map" toggle button

**Empty States**:
- No results: Friendly message with "Clear Filters" CTA
- Loading: Skeleton cards with pulse animation

---

### F. Interactive States

**Map Interactions**:
- Pin hover: Scale up slightly, show salon name tooltip
- Pin click: Open info card, highlight corresponding list item
- Clustered pins: Show count, expand on click

**List Interactions**:
- Card hover: Lift with shadow
- "View on Map" click: Pan to location, pulse pin
- Instagram link: Subtle underline on hover

**Filter Application**:
- Instant update (no "Apply" button needed)
- Visual count of active filters
- Smooth transitions when cards appear/disappear

---

### G. Images

**Required Images**:
1. **Hero Image** (Landing page): High-quality photo of beautiful curly hair - vibrant, joyful, professional salon setting. Dimensions: 1920x1080+, placed as background with purple gradient overlay (from left: purple 70% opacity to transparent)

2. **Stylist Photos** (From Airtable): Square format preferred, 400x400+, displayed in card headers

3. **Salon Photos** (Optional, from Airtable): Used in map info windows if available, rounded corners

4. **Certification Logos** (From Airtable): Small badge images, 32x32, used alongside text labels

**Image Treatment**:
- All photos: rounded-lg corners
- Lazy loading for performance
- Aspect ratio preserved with object-cover
- Placeholder gradient during load

---

### H. Animations

Use sparingly:
- Card hover: transform duration-200
- Map pan: smooth ease-in-out
- Filter panel slide: transition-transform duration-300
- Skeleton pulse on load

**No autoplay animations** - all interactions user-triggered.

---

## Accessibility Notes

- Maintain 4.5:1 contrast ratios
- Focus rings on all interactive elements
- Keyboard navigation for filters and map
- ARIA labels for map pins and dynamic content
- Screen reader announcements for filter results count