---
name: nextjs-caching
description: Next.js and Apollo Client caching strategies, fetchPolicy options, cache invalidation. Use when data doesn't update, dealing with stale data, or configuring dynamic content fetching.
---

# Next.js Caching Strategies

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.

## The Problem

Changes in WordPress don't appear on frontend because:
1. Apollo Client caches queries by default (`cache-first`)
2. Next.js Server Components cache responses
3. Next.js has built-in ISR (Incremental Static Regeneration)

## Apollo Client fetchPolicy

### Options

| Policy | Description | Use Case |
|--------|-------------|----------|
| `cache-first` | Check cache first, fetch if missing | Static content (default) |
| `network-only` | Always fetch from server | Dynamic content, admin data |
| `cache-and-network` | Return cache, then update | Balance of speed and freshness |
| `no-cache` | Never read/write cache | Real-time data |
| `cache-only` | Only return cached data | Offline support |

### For Dynamic Content (REQUIRED!)

```typescript
// lib/wordpress/api-header.ts
const [menuResult, settingsResult] = await Promise.all([
  client.query<{ menu: Menu }>({
    query: GET_PRIMARY_MENU,
    fetchPolicy: 'network-only',  // ✅ Always fetch fresh data
  }),
  client.query<{ headerSettings: HeaderSettings }>({
    query: GET_HEADER_SETTINGS,
    fetchPolicy: 'network-only',  // ✅ Always fetch fresh data
  }),
]);
```

### For Static Content

```typescript
const { data } = await client.query({
  query: GET_STATIC_PAGES,
  fetchPolicy: 'cache-first',  // Use cache if available
});
```

## Server Components vs Client Components

### Server Components (Recommended)

```typescript
// app/page.tsx - Server Component (no 'use client')
async function HomePage() {
  const data = await fetchData();  // Fetched on server
  return <Content data={data} />;
}
```

**Benefits:**
- No JavaScript sent to client
- Better SEO
- Faster initial load

### Client Components (When Needed)

```typescript
'use client'

function InteractiveComponent() {
  const [state, setState] = useState();
  // Interactive logic here
}
```

**Use only for:**
- User interactions (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)

## Cache Invalidation

### Method 1: Restart Next.js Dev Server

```powershell
# Windows
taskkill /F /IM node.exe
cd nextjs
npm run dev
```

### Method 2: Clear .next Directory

```bash
rm -rf .next
npm run dev
```

### Method 3: On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path, secret } = await request.json();
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

**WordPress webhook:**

```php
add_action('save_post', function($post_id) {
  wp_remote_post('https://your-nextjs-app.com/api/revalidate', [
    'body' => [
      'secret' => REVALIDATE_SECRET,
      'path' => '/' . get_post_type($post_id),
    ],
  ]);
});
```

## Conditional Field Display

### Problem

Empty fields show default/fallback values when they should be hidden.

### Solution

```typescript
// ❌ Wrong - Shows "₽" even if currency is empty
const pricePart = `${price} ${currency || '₽'}`;

// ✅ Correct - Only show if value exists
let pricePart = '';
if (promoPrice) {
  pricePart = `${promoPrice}`;
  if (currency) pricePart += ` ${currency}`;
  if (period) pricePart += `/${period}`;
}
```

### Pattern: Build String Conditionally

```typescript
const parts: string[] = [];

if (promoPrice) parts.push(promoPrice.toString());
if (currency) parts.push(currency);
if (period) parts.push(`/${period}`);

const priceDisplay = parts.join(' ');  // Only non-empty parts
```

## Apollo Client Configuration

### Basic Setup

```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',  // Global default
    },
  },
});
```

### With Custom Cache Policy

```typescript
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          headerSettings: {
            merge: true,  // Merge updates instead of replace
          },
          posts: {
            keyArgs: ['where'],  // Cache by query args
          },
        },
      },
    },
  }),
});
```

## Debugging Cache Issues

### Step 1: Check Apollo DevTools

```typescript
// Enable in development
if (process.env.NODE_ENV === 'development') {
  console.log('Apollo Cache:', client.cache.extract());
}
```

### Step 2: Force Network Request

```typescript
const { data } = await client.query({
  query: GET_DATA,
  fetchPolicy: 'network-only',
});
console.log('Fresh data:', data);
```

### Step 3: Clear All Caches

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Step 4: Check WordPress

```php
// Add to GraphQL resolver
error_log('[GraphQL] Returning: ' . json_encode($data));
```

## Best Practices

### ✅ DO:

1. Use `fetchPolicy: 'network-only'` for dynamic content
2. Server Components for data fetching
3. Minimal Client Components
4. Conditional rendering for optional fields
5. Clear cache when debugging

### ❌ DON'T:

1. ❌ Assume data updates automatically
2. ❌ Use useEffect for data fetching (Server Components!)
3. ❌ Hardcode fallback values for optional fields
4. ❌ Ignore cache during debugging

## Common Scenarios

### Scenario 1: WordPress Changes Not Showing

**Symptoms:** Changed data in WordPress, but frontend shows old data.

**Fix:**
1. Add `fetchPolicy: 'network-only'` to query
2. Restart Next.js dev server
3. Clear `.next` directory

### Scenario 2: Optional Field Shows Default Value

**Symptoms:** Empty field shows "₽" or "мес." when should be empty.

**Fix:**
```typescript
// Check if value exists before adding
if (currency) pricePart += ` ${currency}`;
```

### Scenario 3: Stale Data in Production

**Symptoms:** Data was correct in dev but stale in production.

**Fix:**
1. Implement on-demand revalidation webhook
2. Or use shorter revalidation time:
```typescript
export const revalidate = 60;  // Revalidate every 60 seconds
```

### Scenario 4: Production Container Shows Stale Data After DB Fix

**Symptoms:** Database was reimported or encoding was fixed, but the production site still shows garbled or old text. Header/navigation may be correct while body sections (services, doctors, promotions) still show corrupted text.

**Why:** SSG pages and the `fetch-cache` directory (`/app/.next/cache/fetch-cache/` inside the container) were generated during the Docker image build. If the database was fixed *after* the build, the cached pages still contain old data. Sections using `fetchPolicy: 'network-only'` (like header) appear correct because they bypass cache.

**Fix:** Rebuild the Next.js Docker container with `--no-cache` to regenerate all static pages from the now-correct database:

```bash
cd /opt/wp-nextjs
docker compose -f docker-compose.production.yml build --no-cache nextjs
docker compose -f docker-compose.production.yml up -d nextjs
```

This forces a full rebuild: fresh `npm ci`, fresh `next build` (which queries the database for SSG pages), and a new image with correct data baked in.

## Performance Tips

### Balance Freshness vs Speed

```typescript
// Critical dynamic data - always fresh
fetchPolicy: 'network-only'

// Semi-static data - cache with revalidation
fetchPolicy: 'cache-and-network'

// Static data - full cache
fetchPolicy: 'cache-first'
```

### Use ISR for Static Pages

```typescript
// app/posts/[slug]/page.tsx
export const revalidate = 3600;  // Revalidate every hour

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```
