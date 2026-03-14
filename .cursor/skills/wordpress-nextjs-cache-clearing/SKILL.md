---
name: wordpress-nextjs-cache-clearing
description: Multi-level cache clearing for WordPress + Next.js headless setup. Use when data doesn't update, GraphQL returns stale data, or debugging cache issues.
---

# Multi-Level Cache Clearing: WordPress + Next.js

## The Problem

Headless WordPress + Next.js has **multiple cache layers**:
1. WordPress Object Cache (Redis)
2. WordPress Transients
3. WPGraphQL Schema Cache
4. ACF Local Cache
5. Next.js .next Directory
6. Next.js Server Components Cache
7. Apollo Client Cache
8. Browser Cache

**All must be cleared** when debugging data sync issues.

## Quick Fix (Do This First)

```bash
# 1. Clear WordPress caches
docker exec wp-container wp cache flush --allow-root
docker exec wp-container wp transient delete --all --allow-root
docker exec wp-container wp graphql clear-schema-cache --allow-root

# 2. Restart WordPress
docker restart wp-container

# 3. Clear Next.js cache
rm -rf nextjs/.next/

# 4. Restart Next.js
# Kill all node processes, then restart
npm run dev
```

## Detailed: Layer by Layer

### Layer 1: WordPress Object Cache (Redis)

**What:** In-memory cache for database queries

```bash
# Flush object cache
docker exec wp-container wp cache flush --allow-root
```

**Or via PHP:**

```php
wp_cache_flush();
```

### Layer 2: WordPress Transients

**What:** Time-based cache stored in database

```bash
# Delete all transients
docker exec wp-container wp transient delete --all --allow-root

# Delete specific transient
docker exec wp-container wp transient delete my_transient --allow-root
```

**Or via PHP:**

```php
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");
```

### Layer 3: WPGraphQL Schema Cache

**What:** Cached GraphQL type definitions

```bash
# Clear schema cache
docker exec wp-container wp graphql clear-schema-cache --allow-root
```

**Or via PHP:**

```php
// In wp-admin or script
if (function_exists('graphql_clear_schema')) {
    graphql_clear_schema();
}
```

### Layer 4: ACF Local Cache

**What:** ACF field definitions cached in memory

**Fix:** Restart WordPress container

```bash
docker restart wp-container
```

### Layer 5: Next.js .next Directory

**What:** Compiled pages and cached data

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force "nextjs\.next"

# Linux/Mac
rm -rf nextjs/.next/
```

### Layer 6: Next.js Server Components Cache

**What:** Cached fetch() responses in Server Components

**Fix 1:** Add `fetchPolicy: 'network-only'`

```typescript
const { data } = await client.query({
  query: GET_HEADER_SETTINGS,
  fetchPolicy: 'network-only', // ✅ Always fetch fresh
});
```

**Fix 2:** Add `cache: 'no-store'`

```typescript
const response = await fetch(GRAPHQL_URL, {
  method: 'POST',
  body: JSON.stringify({ query }),
  cache: 'no-store', // ✅ Bypass Next.js cache
});
```

**Fix 3:** Use `revalidate: 0`

```typescript
export const revalidate = 0; // ✅ No caching
```

### Layer 7: Apollo Client Cache

**What:** In-memory cache for GraphQL queries

**Fix 1:** Global setting

```typescript
// lib/apollo-client.ts
const client = new ApolloClient({
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only', // ✅ Disable cache
    },
  },
});
```

**Fix 2:** Per-query

```typescript
const { data } = await client.query({
  query: GET_DATA,
  fetchPolicy: 'network-only',
});
```

**Fix 3:** Clear cache manually

```typescript
client.clearStore(); // Clear all cached data
```

### Layer 8: Browser Cache

**What:** Cached responses in browser

**Fix:**
1. Hard refresh: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)
2. Open DevTools → Network → "Disable cache" checkbox
3. Clear site data: DevTools → Application → Clear storage

## Complete Cache Clearing Script

### PHP Script (WordPress Side)

```php
<?php
/**
 * scripts/flush-all-cache.php
 * 
 * Comprehensive cache clearing for WordPress
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo "Clearing all WordPress caches...\n\n";

// 1. Object cache
wp_cache_flush();
echo "✓ Object cache cleared\n";

// 2. Transients
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");
echo "✓ Transients cleared\n";

// 3. WPGraphQL schema cache
if (function_exists('graphql_clear_schema')) {
    graphql_clear_schema();
    echo "✓ GraphQL schema cache cleared\n";
}

// 4. ACF cache (if available)
if (function_exists('acf_get_store')) {
    acf_get_store('field-groups')->reset();
    echo "✓ ACF cache cleared\n";
}

echo "\n✓ All WordPress caches cleared!\n";
echo "⚠️ Restart WordPress container for full effect\n";
```

**Run:**

```bash
docker cp scripts/flush-all-cache.php wp-container:/tmp/
docker exec wp-container php /tmp/flush-all-cache.php
docker restart wp-container
```

### Bash Script (Complete Workflow)

```bash
#!/bin/bash
# scripts/clear-all-caches.sh

echo "=== Clearing All Caches ==="

# 1. WordPress caches
echo "1. Clearing WordPress caches..."
docker exec wp-container wp cache flush --allow-root
docker exec wp-container wp transient delete --all --allow-root
docker exec wp-container wp graphql clear-schema-cache --allow-root

# 2. Restart WordPress
echo "2. Restarting WordPress..."
docker restart wp-container
sleep 5

# 3. Clear Next.js
echo "3. Clearing Next.js cache..."
rm -rf nextjs/.next/

# 4. Kill Node processes
echo "4. Stopping Node processes..."
pkill -f "node.*next"

echo "✓ All caches cleared!"
echo "Run: cd nextjs && npm run dev"
```

**Make executable and run:**

```bash
chmod +x scripts/clear-all-caches.sh
./scripts/clear-all-caches.sh
```

## Common Scenarios

### Scenario 1: ACF Field Not in GraphQL

**Symptoms:**
- Added field to ACF
- Field shows in WordPress admin
- Field NOT in GraphQL query

**Fix:**

```bash
# 1. Verify manual registration exists
# (Check wp-content/mu-plugins/your-plugin.php)

# 2. Clear GraphQL cache
docker exec wp-container wp graphql clear-schema-cache --allow-root

# 3. Restart WordPress
docker restart wp-container

# 4. Test query in GraphiQL
# http://localhost:8000/graphql
```

### Scenario 2: Data Updated But Not on Frontend

**Symptoms:**
- Changed data in WordPress
- Frontend shows old data
- GraphiQL shows correct data

**Fix:**

```bash
# 1. Clear Next.js cache
rm -rf nextjs/.next/

# 2. Restart Next.js dev server
pkill -f "node.*next"
cd nextjs && npm run dev

# 3. Hard refresh browser (Ctrl+Shift+R)
```

### Scenario 3: New Field Added, Returns Null

**Symptoms:**
- Added field to ACF Field Group
- Manual GraphQL registration done
- GraphQL returns `null` for field

**Fix:**

```bash
# 1. Verify data exists in WordPress
docker exec wp-container wp shell --allow-root
# In wp-cli:
>>> get_field('your_field', 'options');

# 2. Clear ALL caches
docker exec wp-container wp cache flush --allow-root
docker exec wp-container wp transient delete --all --allow-root
docker restart wp-container

# 3. Clear Next.js
rm -rf nextjs/.next/

# 4. Restart Next.js
```

### Scenario 4: Repeater Field Shows Old Data

**Symptoms:**
- Updated repeater field (added/removed items)
- Old data still appears
- WordPress shows correct data

**Fix:**

```bash
# 1. Check if manual registration formats data correctly
# (Look at resolve() function)

# 2. Clear WordPress + Next.js caches
docker exec wp-container wp cache flush --allow-root
docker restart wp-container
rm -rf nextjs/.next/

# 3. Verify fetchPolicy in Next.js
# Should be: fetchPolicy: 'network-only'
```

## Debugging Workflow

### Step 1: Verify Data in WordPress

```bash
docker exec -it wp-container wp shell --allow-root
```

```php
# In wp-cli shell
>>> get_field('social_links', 'options');
```

**Expected:** Array with data

### Step 2: Verify GraphQL Returns Data

Visit: `http://localhost:8000/graphql`

```graphql
query {
  headerSettings {
    socialLinks {
      name
      icon
      url
    }
  }
}
```

**Expected:** Data appears in GraphiQL

### Step 3: Verify Next.js Fetches Data

```typescript
// Add logging in fetchHeaderSettings()
const { data } = await client.query({
  query: GET_HEADER_SETTINGS,
  fetchPolicy: 'network-only',
});

console.log('[Header] Fetched data:', data);
```

**Expected:** Console shows correct data

### Step 4: Verify Component Renders Data

```typescript
// Add logging in component
console.log('[SocialLinks] Received links:', links);
```

**Expected:** Component receives correct data

## Prevention

### Use network-only for Dynamic Data

```typescript
// ✅ ALWAYS use network-only for option page data
const { data } = await client.query({
  query: GET_HEADER_SETTINGS,
  fetchPolicy: 'network-only', // Don't cache
});
```

### Disable Next.js Cache in Development

```typescript
// next.config.js
module.exports = {
  experimental: {
    isrMemoryCacheSize: 0, // Disable ISR cache
  },
};
```

### Add Cache Headers

```typescript
// app/api/graphql/route.ts
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
```

## Tools

### Check WordPress Cache Status

```bash
docker exec wp-container wp cache info --allow-root
```

### Check Next.js Build Cache

```bash
# Analyze .next directory size
du -sh nextjs/.next/
```

### Monitor GraphQL Queries

```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: ${message}`)
    );
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});
```

## Key Points

### ✅ DO:

1. Clear ALL cache layers when debugging
2. Use `fetchPolicy: 'network-only'` for dynamic data
3. Restart containers after clearing WordPress cache
4. Delete `.next/` directory regularly during development
5. Test in GraphiQL before blaming Next.js

### ❌ DON'T:

1. ❌ Assume cache cleared if only one layer cleared
2. ❌ Use `cache-first` for data from option pages
3. ❌ Forget to restart WordPress after schema changes
4. ❌ Skip browser hard refresh when testing
5. ❌ Clear cache without verifying data source first

## Quick Reference

```bash
# WordPress caches
docker exec wp-container wp cache flush --allow-root
docker exec wp-container wp transient delete --all --allow-root
docker exec wp-container wp graphql clear-schema-cache --allow-root
docker restart wp-container

# Next.js cache
rm -rf nextjs/.next/
pkill -f "node.*next"
cd nextjs && npm run dev

# Browser cache
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

**Remember:** When in doubt, clear EVERYTHING.
