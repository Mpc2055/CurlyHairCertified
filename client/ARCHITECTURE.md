# Frontend Architecture Documentation

Last Updated: October 2025

## Table of Contents
- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [API Layer](#api-layer)
- [State Management](#state-management)
- [Component Organization](#component-organization)
- [Styling](#styling)
- [Routing](#routing)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Overview

The frontend is built with:
- **React 18** with TypeScript
- **TanStack Query** (React Query) for data fetching and caching
- **wouter** for lightweight routing
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Vite** for build tooling

### Architecture Philosophy
- **Type Safety**: Full TypeScript coverage with strict mode
- **Feature-Based Organization**: Code organized by business domain
- **Explicit over Implicit**: Prefer explicit API calls over magic conventions
- **Composition**: Small, composable components over large monoliths

## Directory Structure

```
client/src/
├── components/          # Shared UI components
│   ├── ui/             # shadcn/ui primitives (48+ components)
│   └── shared/         # App-specific shared components
├── features/           # Feature-specific code
│   ├── directory/      # Stylist directory feature
│   │   ├── filter/
│   │   ├── map/
│   │   ├── salon/
│   │   ├── stylist/
│   │   ├── DirectoryErrorBoundary.tsx
│   │   └── index.ts
│   └── forum/          # Forum/discussion feature
│       ├── Reply.tsx
│       ├── ForumErrorBoundary.tsx
│       └── index.ts
├── hooks/              # React hooks
│   └── api/           # Data fetching hooks
├── layouts/           # Layout components
│   ├── RootLayout.tsx
│   └── PageLayout.tsx
├── lib/               # Core utilities
│   ├── api-client.ts  # Typed API client
│   ├── query-keys.ts  # Query key factory
│   ├── query.ts       # Query client config
│   └── utils.ts       # Utility functions
├── pages/             # Route components
└── types/             # TypeScript type definitions
```

### Organization Rules
1. **Features** contain domain-specific logic and components
2. **Components/UI** contains only reusable, generic UI primitives
3. **Components/Shared** contains app-specific reusable components
4. **Hooks/API** contains data fetching hooks only
5. **Pages** are thin wrappers that compose features and layouts

## API Layer

### Architecture Pattern
The frontend uses a **typed API client pattern** for all backend communication:

```typescript
// ✅ Correct: Use the typed API client
import { api } from "@/lib/api-client";
const data = await api.directory.getDirectory();
const topic = await api.forum.getTopic(id);

// ❌ Incorrect: Don't use fetch directly
const response = await fetch('/api/directory');
```

### API Client (`/src/lib/api-client.ts`)

Provides type-safe methods for all endpoints:

```typescript
// Directory API
api.directory.getDirectory(): Promise<DirectoryData>

// Forum API
api.forum.getTopics(params?): Promise<SelectTopic[]>
api.forum.getTopic(id): Promise<TopicWithReplies>
api.forum.createTopic(payload): Promise<SelectTopic>
api.forum.createReply(topicId, payload): Promise<SelectReply>
api.forum.upvoteTopic(payload): Promise<void>
api.forum.flagContent(payload): Promise<void>
```

### Query Keys (`/src/lib/query-keys.ts`)

Factory functions for consistent cache keys:

```typescript
// Directory keys
queryKeys.directory.all()     // ['directory']
queryKeys.directory.list()    // ['directory', 'list']

// Forum keys
queryKeys.forum.all()               // ['forum']
queryKeys.forum.topics()            // ['forum', 'topics']
queryKeys.forum.topicsList(params)  // ['forum', 'topics', 'list', params]
queryKeys.forum.topic(id)           // ['forum', 'topic', id]
```

**Benefits:**
- Type-safe cache invalidation
- Prevents typos in query keys
- Clear key hierarchy
- Easy refactoring

### Custom Hooks

Located in `/src/hooks/api/`:

```typescript
// Query hooks
useDirectory()              // Fetches directory data
useTopics(params?)         // Fetches forum topics with filtering
useTopic(id)              // Fetches single topic with replies

// Usage
import { useDirectory } from "@/hooks/api";

function MyComponent() {
  const { data, isLoading, error } = useDirectory();
  // ...
}
```

### Mutations

Use `useMutation` with the API client:

```typescript
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryClient } from "@/lib/query";
import { queryKeys } from "@/lib/query-keys";

const createTopicMutation = useMutation({
  mutationFn: (data) => api.forum.createTopic(data),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.forum.topics()
    });
  },
});
```

## State Management

### Data State: TanStack Query

All server state is managed by TanStack Query:

```typescript
// Query configuration (/src/lib/query.ts)
{
  staleTime: Infinity,           // Data never goes stale
  refetchOnWindowFocus: false,   // No automatic refetching
  refetchInterval: false,        // No polling
  retry: false,                  // Fail fast
}
```

**When to use:**
- Fetching data from the server
- Caching server responses
- Invalidating cached data after mutations

### Local State: useState

For component-specific UI state:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<string | null>(null);
```

**When to use:**
- UI state (modals, dropdowns, toggles)
- Form input values (with react-hook-form)
- Component-specific temporary state

### Global State: Module-Level (Toast)

The toast system uses shadcn/ui's pattern with module-level state:

```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();
toast({ title: "Success", description: "Action completed" });
```

**Why not Context?**
- Avoids unnecessary re-renders
- Better performance
- Simpler API
- Standard shadcn/ui pattern

## Component Organization

### Component Types

1. **UI Primitives** (`/src/components/ui/`)
   - From shadcn/ui
   - Generic, reusable components
   - No business logic
   - Examples: Button, Card, Dialog

2. **Shared Components** (`/src/components/shared/`)
   - App-specific reusable components
   - Used across multiple features
   - Examples: LoadingState, ErrorState, PageHeader

3. **Feature Components** (`/src/features/`)
   - Domain-specific components
   - May include business logic
   - Organized by feature
   - Examples: StylistCard, Reply

4. **Page Components** (`/src/pages/`)
   - Route-level components
   - Compose features and layouts
   - Minimal logic

### File Naming Conventions

- **Components**: PascalCase filenames with `.tsx` extension
  - Example: `StylistCard.tsx`, `FilterPanel.tsx`
- **Hooks**: camelCase with `use` prefix
  - Example: `useDirectory.ts`, `use-toast.ts`
- **Utilities**: kebab-case
  - Example: `api-client.ts`, `query-keys.ts`
- **Types**: kebab-case or PascalCase
  - Example: `google-maps.d.ts`, `schema.ts`

### Index Files

Use index files to create clean public APIs:

```typescript
// features/forum/index.ts
export { Reply } from "./Reply";
export { ForumErrorBoundary } from "./ForumErrorBoundary";

// Usage
import { Reply, ForumErrorBoundary } from "@/features/forum";
```

## Styling

### Tailwind CSS

Primary styling approach using utility classes:

```tsx
<div className="flex items-center gap-2 p-4 bg-card rounded-lg">
  <Button className="hover-elevate">Click me</Button>
</div>
```

### Custom Utilities

Defined in `/src/index.css`:

```css
.hover-elevate    /* Elevation on hover */
.active-elevate   /* Elevation when active */
.toggle-elevate   /* Background change for toggles */
```

### Theme System

Uses CSS custom properties for theming:

```css
:root {
  --primary: 222 47% 11%;
  --secondary: 210 40% 96.1%;
  /* ... */
}

.dark {
  --primary: 210 40% 98%;
  --secondary: 217 32.6% 17.5%;
  /* ... */
}
```

### Styling Best Practices

1. **Prefer Tailwind utilities** over custom CSS
2. **Use design tokens** (colors, spacing) from theme
3. **Keep styles co-located** with components
4. **Use semantic class names** for custom utilities
5. **Follow mobile-first** responsive design

## Routing

Uses **wouter** for lightweight routing:

```typescript
// App.tsx
<Route path="/" component={Landing} />
<Route path="/roc" component={Rochester} />
<Route path="/forum" component={Forum} />
<Route path="/forum/:id" component={ForumTopic} />

// In components
import { Link, useRoute } from "wouter";

<Link href="/forum">Go to Forum</Link>

const [, params] = useRoute("/forum/:id");
const topicId = params?.id;
```

## Error Handling

### Error Boundaries

Feature-level error boundaries catch React errors:

```tsx
// Directory feature
import { DirectoryErrorBoundary } from "@/features/directory";

<DirectoryErrorBoundary>
  <StylistDirectory />
</DirectoryErrorBoundary>

// Forum feature
import { ForumErrorBoundary } from "@/features/forum";

<ForumErrorBoundary>
  <ForumContent />
</ForumErrorBoundary>
```

### Query Error Handling

```tsx
const { data, isLoading, error } = useDirectory();

if (error) {
  return <ErrorState
    title="Failed to load"
    message={error.message}
    onRetry={() => refetch()}
  />;
}
```

### Mutation Error Handling

```tsx
const mutation = useMutation({
  mutationFn: api.forum.createTopic,
  onError: (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  },
});
```

## Best Practices

### TypeScript

1. **Use explicit types** for function parameters and return values
2. **Avoid `any`** - use `unknown` if type is truly unknown
3. **Use type imports** when importing only types
4. **Enable strict mode** in tsconfig.json

```typescript
// ✅ Good
function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// ❌ Bad
function formatPrice(price: any) {
  return `$${price.toFixed(2)}`;
}
```

### API Calls

1. **Always use the typed API client**
2. **Use query keys factory**
3. **Invalidate queries after mutations**
4. **Handle loading and error states**

```typescript
// ✅ Good
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

const { data } = useQuery({
  queryKey: queryKeys.directory.list(),
  queryFn: () => api.directory.getDirectory(),
});

// ❌ Bad
const { data } = useQuery({
  queryKey: ['/api/directory'],
  queryFn: async () => {
    const res = await fetch('/api/directory');
    return res.json();
  },
});
```

### Components

1. **Keep components focused** - single responsibility
2. **Extract reusable logic** into hooks
3. **Use composition** over inheritance
4. **Add data-testid** attributes for testing

```tsx
// ✅ Good
export function StylistCard({ stylist }: StylistCardProps) {
  return (
    <Card data-testid={`card-stylist-${stylist.id}`}>
      {/* ... */}
    </Card>
  );
}

// ❌ Bad
export function StylistCard({ stylist }) {
  // 500 lines of code mixing concerns
}
```

### Forms

Use react-hook-form with Zod validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(10).max(200),
  content: z.string().min(20).max(5000),
});

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { title: "", content: "" },
});
```

### Performance

1. **Use React.memo** sparingly - only for expensive renders
2. **Memoize expensive computations** with useMemo
3. **Avoid inline functions** in render when possible
4. **Code split routes** with dynamic imports (if needed)

### Testing

1. **Use data-testid attributes** for reliable selectors
2. **Test user behavior** not implementation details
3. **Mock API calls** at the API client level
4. **Test error states** and loading states

## Common Patterns

### Loading States

```tsx
if (isLoading) {
  return <LoadingState message="Loading stylists..." />;
}
```

### Empty States

```tsx
if (data?.length === 0) {
  return <EmptyState
    title="No results"
    message="Try adjusting your filters"
  />;
}
```

### Conditional Rendering

```tsx
{hasRating && (
  <div className="flex items-center gap-1">
    <Star className="w-3 h-3" />
    <span>{rating.toFixed(1)}</span>
  </div>
)}
```

### Data Transformation

```tsx
const sortedStylists = useMemo(() => {
  return sortStylists(stylists, sortBy);
}, [stylists, sortBy]);
```

## Migration Guide

### From Old API Pattern to New

```typescript
// Old ❌
import { apiRequest } from "@/lib/api";
const response = await apiRequest('POST', '/api/forum/topics', data);
const topic = await response.json();

// New ✅
import { api } from "@/lib/api-client";
const topic = await api.forum.createTopic(data);
```

### From String Query Keys to Factory

```typescript
// Old ❌
queryKey: ['/api/forum/topics', topicId]

// New ✅
queryKey: queryKeys.forum.topic(topicId)
```

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [wouter Docs](https://github.com/molefrog/wouter)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)

## Troubleshooting

### TypeScript Errors

```bash
# Check for type errors
npm run typecheck
```

### Query Cache Issues

```typescript
// Clear all queries
queryClient.clear();

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: queryKeys.forum.all() });

// Reset specific query
queryClient.resetQueries({ queryKey: queryKeys.directory.list() });
```

### Build Issues

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

---

**Note**: This architecture is designed to scale with the application while maintaining simplicity. As the app grows, consider:
- Adding more granular error boundaries
- Implementing code splitting for routes
- Adding performance monitoring
- Setting up E2E testing
