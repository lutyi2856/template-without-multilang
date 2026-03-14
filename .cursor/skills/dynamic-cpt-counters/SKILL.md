---
name: dynamic-cpt-counters
description: Create dynamic counters from WordPress Custom Post Types for GraphQL. Use when implementing dynamic metrics (clinic count, doctor count, service count) that update automatically when posts are added/removed in WordPress admin.
---

# Dynamic CPT Counters for WordPress + GraphQL

## When to Use

Use this skill when you need to:
- Display dynamic counts of WordPress posts in frontend (Next.js, React)
- Replace static ACF option fields with auto-updating counters
- Create metrics that sync with WordPress database (e.g., "4 клиники", "10 врачей")
- Expose post counts through WPGraphQL to headless frontend

**Common scenarios:**
- Header/footer stats (locations, doctors, services)
- Landing page metrics (reviews count, success stories)
- Dashboard counters (active promotions, available services)

## Implementation Pattern

### 3-Step Process

1. **Create CPT** with WPGraphQL support
2. **Replace static field** with `wp_count_posts()`
3. **Expose via GraphQL** in custom resolver

---

## Step 1: Create Custom Post Type

Register CPT in `wp-content/mu-plugins/[plugin].php`:

```php
function register_my_cpt() {
    $args = array(
        'label'                 => 'My Type',
        'supports'              => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'public'                => true,
        'show_in_rest'          => true,
        // GraphQL - CRITICAL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'myItem',
        'graphql_plural_name'   => 'myItems',
    );
    
    register_post_type('my_type', $args);
}
add_action('init', 'register_my_cpt', 0);
```

**Key points:**
- ✅ Set `show_in_graphql => true`
- ✅ Define `graphql_single_name` and `graphql_plural_name`
- ✅ Add 'custom-fields' to `supports` if using ACF

---

## Step 2: Dynamic Count in GraphQL Resolver

Replace static ACF field with dynamic count:

### Before (static):
```php
// ❌ Static value from ACF options
$count = get_field('my_count', 'options');
```

### After (dynamic):
```php
// ✅ Dynamic count from published posts
$posts_count = wp_count_posts('my_type');
$count = isset($posts_count->publish) ? (int) $posts_count->publish : 0;
```

### Full Resolver Example

```php
/**
 * Manual GraphQL Registration for Dynamic Counters
 */
function register_dynamic_counter_in_graphql() {
    // Register root query field
    register_graphql_field('RootQuery', 'mySettings', [
        'type' => 'MySettings',
        'description' => 'Settings with dynamic counters',
        'resolve' => function() {
            // Get static fields from ACF options
            $phone = get_field('phone', 'options');
            $email = get_field('email', 'options');
            
            // DYNAMIC COUNT - replaces static field
            $posts_count = wp_count_posts('my_type');
            $items_count = isset($posts_count->publish) ? (int) $posts_count->publish : 0;
            
            return [
                'phone'       => $phone,
                'email'       => $email,
                'itemsCount'  => $items_count, // Dynamic!
            ];
        }
    ]);
    
    // Register object type
    register_graphql_object_type('MySettings', [
        'description' => 'Site settings',
        'fields' => [
            'phone' => ['type' => 'String'],
            'email' => ['type' => 'String'],
            'itemsCount' => ['type' => 'Int'], // Dynamic field
        ]
    ]);
}
add_action('graphql_register_types', 'register_dynamic_counter_in_graphql');
```

---

## Step 3: Query from Frontend

### GraphQL Query (Next.js)

```graphql
query GetSettings {
  mySettings {
    phone
    email
    itemsCount  # Dynamic count
  }
}
```

### Next.js Server Component

```typescript
// app/components/header.tsx
async function Header() {
  const { data } = await fetchGraphQL(`
    query {
      mySettings {
        itemsCount
      }
    }
  `);
  
  const count = data.mySettings.itemsCount;
  
  return (
    <div>
      {count} клиники рядом с метро
    </div>
  );
}
```

**Performance tip:** Use ISR for caching:

```typescript
// app/layout.tsx or page.tsx
export const revalidate = 3600; // Cache for 1 hour
```

---

## Testing the Implementation

### 1. Backend Test (PHP Script)

Create `scripts/test-count.php`:

```php
<?php
require_once __DIR__ . '/../wp-config.php';

// Direct count
$count = wp_count_posts('my_type');
$published = $count->publish ?? 0;

echo "Published posts: {$published}\n";

// Simulate GraphQL resolver
$posts_count = wp_count_posts('my_type');
$items_count = isset($posts_count->publish) ? (int) $posts_count->publish : 0;
echo "GraphQL will return: {$items_count}\n";
```

Run:
```bash
docker exec wordpress php /var/www/html/scripts/test-count.php
```

### 2. GraphQL Test (curl)

```bash
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ mySettings { itemsCount } }"}'
```

Expected:
```json
{
  "data": {
    "mySettings": {
      "itemsCount": 4
    }
  }
}
```

### 3. Frontend Test (Browser)

```bash
# Clear Next.js cache
rm -rf nextjs/.next

# Restart dev server
cd nextjs && npm run dev
```

Navigate to page and verify count displays correctly.

---

## Troubleshooting

### Issue: Frontend shows old count after adding posts

**Causes:**
1. Next.js Server Component cache
2. WordPress object cache
3. Browser cache

**Fix:**
```bash
# 1. Clear WordPress cache
docker exec wordpress wp cache flush --allow-root

# 2. Clear Next.js cache
rm -rf nextjs/.next
Stop-Process -Name node -Force  # PowerShell
cd nextjs && npm run dev

# 3. Hard refresh browser
Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

### Issue: GraphQL returns null for itemsCount

**Causes:**
1. CPT not registered with GraphQL
2. Resolver not registered
3. Field name mismatch

**Debug:**
```php
// Check if CPT is registered
$cpt = get_post_type_object('my_type');
var_dump($cpt->show_in_graphql); // Should be true

// Test wp_count_posts directly
$count = wp_count_posts('my_type');
var_dump($count); // Check ->publish property
```

### Issue: Count is 0 but posts exist

**Causes:**
1. Posts are in 'draft' status
2. Posts are in trash
3. Different post_type name

**Fix:**
```php
// Check post statuses
$all_posts = wp_count_posts('my_type');
var_dump([
    'publish' => $all_posts->publish,
    'draft' => $all_posts->draft,
    'trash' => $all_posts->trash,
]);

// Verify post_type name
$posts = get_posts(['post_type' => 'my_type', 'numberposts' => 5]);
foreach ($posts as $post) {
    echo "{$post->post_title} ({$post->post_status})\n";
}
```

---

## Cache Management

### WordPress Cache Layers

When post count changes, clear these caches:

```bash
# 1. WordPress object cache
docker exec wordpress wp cache flush --allow-root

# 2. WPGraphQL query cache (if plugin installed)
docker exec wordpress wp graphql clear-schema --allow-root
```

### Next.js Cache Strategy

```typescript
// Option 1: ISR with revalidation
export const revalidate = 3600; // Revalidate every hour

// Option 2: Dynamic (no cache)
export const dynamic = 'force-dynamic';

// Option 3: Manual revalidation
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path } = await request.json();
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

### WordPress Webhook → Next.js Revalidation

```php
// wp-content/mu-plugins/revalidate-on-publish.php
add_action('save_post_my_type', function($post_id, $post) {
    if ($post->post_status !== 'publish') return;
    
    wp_remote_post('https://yoursite.com/api/revalidate', [
        'body' => [
            'secret' => REVALIDATE_SECRET,
            'path' => '/',
        ],
    ]);
}, 10, 2);
```

---

## Best Practices

### ✅ DO:

1. **Always check post_status:**
   ```php
   $count = wp_count_posts('my_type');
   $published = isset($count->publish) ? (int) $count->publish : 0;
   ```

2. **Use type casting:**
   ```php
   (int) $count->publish  // Ensure integer type
   ```

3. **Cache GraphQL queries in frontend:**
   ```typescript
   export const revalidate = 3600; // 1 hour
   ```

4. **Test backend independently:**
   - Create PHP test script
   - Verify `wp_count_posts()` returns correct data
   - Test GraphQL endpoint directly with curl

5. **Document expected behavior:**
   ```php
   // Dynamic count - updates when posts published/trashed
   $count = wp_count_posts('my_type');
   ```

### ❌ DON'T:

1. **Don't use static ACF fields for counts:**
   ```php
   // ❌ Manual update required
   $count = get_field('items_count', 'options');
   ```

2. **Don't forget cache clearing:**
   - Always clear WordPress cache after adding posts
   - Always restart Next.js dev server

3. **Don't query in loops:**
   ```php
   // ❌ N+1 queries
   foreach ($items as $item) {
       $count = wp_count_posts('my_type'); // BAD!
   }
   
   // ✅ Query once
   $count = wp_count_posts('my_type');
   foreach ($items as $item) {
       echo $count->publish;
   }
   ```

4. **Don't hardcode counts in frontend:**
   ```typescript
   // ❌ Static
   const count = 4;
   
   // ✅ Dynamic
   const count = data.mySettings.itemsCount;
   ```

---

## Real-World Example: Clinics Counter

From УниДент project:

### CPT Registration
```php
// wp-content/mu-plugins/unident-structure.php
function unident_register_clinics_cpt() {
    register_post_type('clinics', [
        'label' => 'Клиники',
        'show_in_graphql' => true,
        'graphql_single_name' => 'clinic',
        'graphql_plural_name' => 'clinics',
        // ... other args
    ]);
}
add_action('init', 'unident_register_clinics_cpt', 0);
```

### GraphQL Resolver
```php
// wp-content/mu-plugins/unident-acf-fields.php
function unident_register_header_settings_in_graphql() {
    register_graphql_field('RootQuery', 'headerSettings', [
        'type' => 'HeaderSettings',
        'resolve' => function() {
            // Static fields
            $phone = get_field('phone', 'options');
            $email = get_field('email', 'options');
            
            // DYNAMIC COUNTER
            $clinics_count = wp_count_posts('clinics');
            $locations_count = isset($clinics_count->publish) 
                ? (int) $clinics_count->publish 
                : 0;
            
            return [
                'phone' => $phone,
                'email' => $email,
                'locationsCount' => $locations_count, // Dynamic!
            ];
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_header_settings_in_graphql');
```

### Frontend Usage
```typescript
// nextjs/src/components/header.tsx
const { data } = await fetchGraphQL(`
  query {
    headerSettings {
      locationsCount
    }
  }
`);

return (
  <div>
    {data.headerSettings.locationsCount} клиники рядом с метро
  </div>
);
```

**Result:** "4 клиники рядом с метро" updates automatically!

---

## Quick Reference

| Task | Command/Code |
|------|--------------|
| Count published posts | `wp_count_posts('post_type')->publish` |
| Count all statuses | `wp_count_posts('post_type')` |
| Clear WP cache | `docker exec wordpress wp cache flush --allow-root` |
| Clear Next.js cache | `rm -rf nextjs/.next` |
| Test GraphQL | `curl -X POST http://localhost:8080/graphql -H "Content-Type: application/json" -d '{"query":"..."}'` |
| ISR revalidation | `export const revalidate = 3600` |

---

## Summary

**Dynamic CPT Counters Pattern:**
1. Create CPT with `show_in_graphql => true`
2. Use `wp_count_posts('type')->publish` in resolver
3. Expose via GraphQL custom field
4. Query from frontend with ISR caching

**Key benefits:**
- ✅ Auto-updates when posts added/removed
- ✅ No manual ACF field updates
- ✅ Single source of truth (database)
- ✅ Works with any CPT

**Common use cases:**
- Location/clinic counters
- Team member counts
- Service/product counts
- Review/testimonial counts
- Portfolio item counts
