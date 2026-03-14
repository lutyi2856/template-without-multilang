---
name: wpgraphql-debugging
description: Debug WPGraphQL issues with ACF fields, nested types, option pages, and manual registration. Use when working with WPGraphQL queries, ACF integration, GraphQL schema issues, or "Cannot query field" errors.
---

# WPGraphQL ACF Debugging

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.

## Critical: Option Pages Require Manual Registration

**WPGraphQL ACF v2 does NOT support automatic registration of ACF Option Pages!**

Even with `show_in_graphql => 1`, fields won't appear in GraphQL schema.

## Manual Registration Workflow

### Step 1: Register ACF Option Page

```php
function register_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title' => 'Settings',
            'menu_slug'  => 'settings',
            'post_id'    => 'options',
            'autoload'   => true,
        ));
    }
}
add_action('acf/init', 'register_settings_page');
```

### Step 2: Register ACF Fields

```php
function register_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_settings',
            'fields' => array(
                array('key' => 'field_phone', 'name' => 'phone', 'type' => 'text'),
                // Group field for nested structure
                array(
                    'key' => 'field_working_hours',
                    'name' => 'working_hours',
                    'type' => 'group',
                    'sub_fields' => array(
                        array('key' => 'field_weekdays', 'name' => 'weekdays', 'type' => 'text'),
                        array('key' => 'field_weekend', 'name' => 'weekend', 'type' => 'text'),
                    ),
                ),
            ),
            'location' => array(
                array(array('param' => 'options_page', 'operator' => '==', 'value' => 'settings'))
            ),
            // ✅ DON'T add show_in_graphql - doesn't work for Option Pages!
        ));
    }
}
add_action('acf/init', 'register_settings_fields');
```

### Step 3: Manual GraphQL Registration (REQUIRED!)

```php
function register_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // 1. Register nested type
    register_graphql_object_type('SettingsWorkingHours', [
        'description' => 'Working hours',
        'fields' => [
            'weekdays' => ['type' => 'String'],
            'weekend' => ['type' => 'String'],
        ],
    ]);

    // 2. Register main type
    register_graphql_object_type('Settings', [
        'description' => 'Settings from ACF',
        'fields' => [
            'phone' => ['type' => 'String'],
            'workingHours' => ['type' => 'SettingsWorkingHours'],
            'count' => [
                'type' => 'Int',
                'resolve' => function($source) {
                    return isset($source['count']) ? (int) $source['count'] : null;
                },
            ],
        ],
    ]);

    // 3. Register field on RootQuery
    register_graphql_field('RootQuery', 'settings', [
        'type' => 'Settings',
        'description' => 'Settings from ACF Option Page',
        'resolve' => function() {
            $phone = get_field('phone', 'options');
            $working_hours = get_field('working_hours', 'options');
            
            return [
                'phone' => $phone ?: null,
                'workingHours' => $working_hours ? [
                    'weekdays' => $working_hours['weekdays'] ?? null,
                    'weekend' => $working_hours['weekend'] ?? null,
                ] : null,
                'count' => get_field('count', 'options'),
            ];
        }
    ]);
}
add_action('graphql_register_types', 'register_settings_in_graphql', 10);
```

## Key Rules

### ✅ DO:

1. **Manual registration** for Option Pages - ALWAYS required
2. **Nested structure** works perfectly with manual registration
3. **get_field('field_name', 'options')** - correct way to get data
4. **Explicit type cast** for Int/Float: `(int) $value`
5. **Check for null** before returning nested structures
6. **Restart WordPress** after changes in MU plugins
7. **Clear Next.js cache** (`rm -rf .next`) after GraphQL query changes

### ❌ DON'T:

1. ❌ Rely on `show_in_graphql` for Option Pages (doesn't work!)
2. ❌ Use `get_option()` directly - use `get_field()`
3. ❌ Forget to cast types for Int/Float fields
4. ❌ Return array from `get_fields()` directly - map manually
5. ❌ Forget to restart WordPress after PHP changes

## Next.js GraphQL Query

```typescript
// queries/settings.ts
import { gql } from '@apollo/client';

export const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      phone
      workingHours {
        weekdays
        weekend
      }
      count
    }
  }
`;
```

## TypeScript Types

```typescript
// types/settings.ts
export interface WorkingHours {
  weekdays?: string | null;
  weekend?: string | null;
}

export interface Settings {
  phone?: string | null;
  workingHours?: WorkingHours | null;
  count?: number | null;
}
```

## Debugging Workflow

### Step 1: Check WordPress Resolver

```php
// Add to resolver
error_log('[Settings] Returning: ' . json_encode($result));
```

### Step 2: Check WordPress Logs

```bash
docker compose exec wordpress tail -50 /var/www/html/wp-content/debug.log
```

### Step 3: Check Next.js Response

```typescript
console.log('[Settings] Result:', JSON.stringify(data, null, 2));
```

### Step 4: Restart All

```bash
# WordPress
docker compose restart wordpress

# Next.js
taskkill /F /IM node.exe
cd nextjs && rm -rf .next && npm run dev
```

## Troubleshooting Checklist

- [ ] WordPress MU plugin created in `wp-content/mu-plugins/`?
- [ ] Manual GraphQL registration added?
- [ ] Hook `graphql_register_types` used?
- [ ] WordPress restarted after changes?
- [ ] Next.js cache cleared?
- [ ] WordPress debug.log shows correct data?
- [ ] GraphQL query uses correct structure?
- [ ] TypeScript types match GraphQL schema?

## Why Nested Structure Works

**Myth:** "Nested types don't work with WPGraphQL"  
**Reality:** Nested types work perfectly with proper manual registration

**Key to success:**
1. Register nested type: `register_graphql_object_type('NestedType', ...)`
2. Return correct structure from resolver:
   ```php
   'nested' => [
       'field1' => $data['field1'],
       'field2' => $data['field2'],
   ]
   ```
3. WPGraphQL automatically maps data to nested type

## Common Errors

### "Cannot query field X on type RootQuery"

**Cause:** Missing manual registration  
**Fix:** Add `register_graphql_field('RootQuery', 'fieldName', ...)`

### Null Values in Response

**Cause:** Using `get_option()` instead of `get_field()`  
**Fix:** Use `get_field('field_name', 'options')`

### Wrong Type for Int Field

**Cause:** Not casting to int  
**Fix:** `(int) $source['count']`

## Relationship Fields in Option Pages

### Featured Post Object (e.g., Featured Promotion)

**ACF Field Configuration:**

```json
{
  "key": "field_featured_promotion",
  "label": "Featured Promotion",
  "name": "featured_promotion",
  "type": "post_object",
  "post_type": ["promotion"],
  "return_format": "object",
  "allow_null": 1
}
```

**Manual GraphQL Registration:**

```php
register_graphql_field('RootQuery', 'headerSettings', [
    'type' => 'HeaderSettings',
    'resolve' => function() {
        $featured_promotion = get_field('featured_promotion', 'options');
        
        return [
            'phone' => get_field('phone', 'options'),
            // ✅ Use resolve_post_object for relationship fields!
            'featuredPromotion' => $featured_promotion 
                ? \WPGraphQL\Data\DataSource::resolve_post_object(
                    $featured_promotion->ID, 
                    \WPGraphQL::get_app_context()
                  ) 
                : null,
        ];
    }
]);
```

**Key Point:** Use `\WPGraphQL\Data\DataSource::resolve_post_object()` to properly resolve post objects with all their fields and relationships.

### Querying Nested Relationships

```graphql
query GetHeaderSettings {
  headerSettings {
    featuredPromotion {
      id
      title
      # Access related posts via ACF relationship fields
      promotionRelationships {
        relatedServices {
          edges {
            node {
              ... on Service {
                id
                title
                serviceRelationships {
                  relatedPrices {
                    edges {
                      node {
                        ... on Price {
                          priceFields {
                            promoPrice
                            currency
                            period
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## ACF JSON Sync Issues

### Duplicate Field Groups

**Symptoms:** Same field group appears twice in ACF > Field Groups

**Cause:** One version in database, one in JSON file

**Fix:**

```php
// Check for duplicates
$groups = acf_get_field_groups();
foreach ($groups as $group) {
    error_log($group['title'] . ' - ' . $group['key'] . ' - ' . $group['local']);
}

// Delete database version (keep JSON)
$db_group_id = 55;  // Get from check above
wp_delete_post($db_group_id, true);
```

### JSON Sync Not Working

**Check paths are correct:**

```php
add_filter('acf/settings/save_json', function($path) {
    return WP_CONTENT_DIR . '/acf-json';
});

add_filter('acf/settings/load_json', function($paths) {
    unset($paths[0]);  // Remove default
    $paths[] = WP_CONTENT_DIR . '/acf-json';
    return $paths;
});
```

**Verify directory exists:**

```bash
ls -la wp-content/acf-json/
```

## Encoding Issues (Cyrillic)

### Symptoms

- "кракозябры" (garbled characters) in field names
- Russian text displays incorrectly

### Fix

1. **Use English for JSON field group titles** (avoid Cyrillic in JSON)
2. **Check database charset:**

```php
// In wp-config.php
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');
```

3. **Fix existing data:**

```php
// Direct database update
global $wpdb;
$wpdb->update(
    $wpdb->options,
    array('option_value' => 'Пн-Сб 10:00-22:00'),
    array('option_name' => 'options_working_hours_weekdays')
);
```

## Cache Clearing

### Clear All WordPress Caches

```php
// Clear object cache
wp_cache_flush();

// Clear all transients
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");

// Clear WPGraphQL cache
if (function_exists('graphql_clear_cache')) {
    graphql_clear_cache();
}

// Flush rewrite rules
flush_rewrite_rules();
```

### After PHP Changes

```bash
# Restart WordPress
docker compose restart wordpress

# Or just the PHP process
docker compose exec wordpress kill -USR2 1
```
