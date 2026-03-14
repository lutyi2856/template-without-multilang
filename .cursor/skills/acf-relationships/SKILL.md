---
name: acf-relationships
description: ACF bidirectional relationships, CPT setup with GraphQL, JSON sync, option page fields, manual GraphQL registration for relationships, direct database creation for complex fields. Use when creating relationships between post types, setting up ACF field groups, connecting services/prices/promotions, fixing repeater showing as text, or resolving JSON/DB conflicts. Includes programmatic registration, list_of format, and database structure.
---

# ACF Relationships & CPT Setup

## ⚠️ Critical: WPGraphQL ACF Relationship Limitations

**WPGraphQL ACF v2 does NOT automatically expose relationship fields correctly!**

Even with `show_in_graphql => 1`, relationship fields often fail to work or cause Internal Server Errors.

**Solution: Manual GraphQL Registration (REQUIRED for relationships)**

## Creating Custom Post Type with GraphQL

### In MU Plugin (unident-structure.php)

```php
function register_custom_post_types() {
    // Prices CPT
    register_post_type('price', array(
        'labels' => array(
            'name' => 'Цены',
            'singular_name' => 'Цена',
        ),
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-money-alt',
        'supports' => array('title', 'editor', 'thumbnail'),
        'show_in_rest' => true,
        'show_in_graphql' => true,           // ✅ REQUIRED for WPGraphQL
        'graphql_single_name' => 'price',    // ✅ GraphQL singular name
        'graphql_plural_name' => 'prices',   // ✅ GraphQL plural name
    ));
}
add_action('init', 'register_custom_post_types');
```

## ACF JSON Sync (Recommended)

### Enable JSON Sync

```php
// In mu-plugins/your-plugin.php
add_filter('acf/settings/save_json', function($path) {
    return WP_CONTENT_DIR . '/acf-json';
});

add_filter('acf/settings/load_json', function($paths) {
    unset($paths[0]);  // Remove default path
    $paths[] = WP_CONTENT_DIR . '/acf-json';
    return $paths;
});
```

### Create Directory

```bash
mkdir -p wp-content/acf-json
```

### Benefits

- ✅ Version control for field groups
- ✅ Editable in WordPress Admin UI
- ✅ Sync across environments
- ✅ No need for programmatic registration

## Bidirectional Relationships

### Structure

```
Service ↔ Price (Service has prices, Price belongs to service)
Service ↔ Promotion (Service has promotions, Promotion has services)
```

### ACF Field Groups (JSON Format)

**1. Price Settings (group_price_fields.json)**

```json
{
  "key": "group_price_fields",
  "title": "Price Settings",
  "fields": [
    {
      "key": "field_regular_price",
      "label": "Regular Price",
      "name": "regular_price",
      "type": "number",
      "show_in_graphql": 1
    },
    {
      "key": "field_promo_price",
      "label": "Promo Price",
      "name": "promo_price",
      "type": "number",
      "show_in_graphql": 1
    },
    {
      "key": "field_currency",
      "label": "Currency",
      "name": "currency",
      "type": "text",
      "default_value": "₽",
      "show_in_graphql": 1
    },
    {
      "key": "field_period",
      "label": "Period",
      "name": "period",
      "type": "text",
      "placeholder": "мес.",
      "show_in_graphql": 1
    },
    {
      "key": "field_related_service",
      "label": "Related Service",
      "name": "related_service",
      "type": "relationship",
      "post_type": ["service"],
      "return_format": "object",
      "show_in_graphql": 1
    }
  ],
  "location": [[{ "param": "post_type", "operator": "==", "value": "price" }]],
  "show_in_graphql": 1,
  "graphql_field_name": "priceFields"
}
```

**2. Service Relationships (group_service_relationships.json)**

```json
{
  "key": "group_service_relationships",
  "title": "Service Relationships",
  "fields": [
    {
      "key": "field_related_prices",
      "label": "Related Prices",
      "name": "related_prices",
      "type": "relationship",
      "post_type": ["price"],
      "return_format": "object",
      "show_in_graphql": 1
    },
    {
      "key": "field_related_promotions",
      "label": "Related Promotions",
      "name": "related_promotions",
      "type": "relationship",
      "post_type": ["promotion"],
      "return_format": "object",
      "show_in_graphql": 1
    }
  ],
  "location": [
    [{ "param": "post_type", "operator": "==", "value": "service" }]
  ],
  "show_in_graphql": 1,
  "graphql_field_name": "serviceRelationships"
}
```

**3. Promotion Relationships (group_promotion_relationships.json)**

```json
{
  "key": "group_promotion_relationships",
  "title": "Promotion Relationships",
  "fields": [
    {
      "key": "field_related_services",
      "label": "Related Services",
      "name": "related_services",
      "type": "relationship",
      "post_type": ["service"],
      "return_format": "object",
      "show_in_graphql": 1
    }
  ],
  "location": [
    [{ "param": "post_type", "operator": "==", "value": "promotion" }]
  ],
  "show_in_graphql": 1,
  "graphql_field_name": "promotionRelationships"
}
```

## Option Page with Featured Post

### Add Field to Option Page

```json
{
  "key": "field_featured_promotion",
  "label": "Featured Promotion",
  "name": "featured_promotion",
  "type": "post_object",
  "post_type": ["promotion"],
  "return_format": "object",
  "allow_null": 1,
  "show_in_graphql": 1
}
```

### Manual GraphQL Registration (Required for Option Pages!)

```php
function register_header_settings_graphql() {
    if (!function_exists('register_graphql_field')) return;

    register_graphql_field('RootQuery', 'headerSettings', [
        'type' => 'HeaderSettings',
        'resolve' => function() {
            $featured_promotion = get_field('featured_promotion', 'options');

            return [
                'phone' => get_field('phone', 'options'),
                'featuredPromotion' => $featured_promotion
                    ? \WPGraphQL\Data\DataSource::resolve_post_object(
                        $featured_promotion->ID,
                        \WPGraphQL::get_app_context()
                      )
                    : null,
            ];
        }
    ]);
}
add_action('graphql_register_types', 'register_header_settings_graphql');
```

## GraphQL Query for Nested Relationships

```graphql
query GetHeaderSettings {
  headerSettings {
    phone
    featuredPromotion {
      id
      title
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
                          id
                          title
                          priceFields {
                            regularPrice
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

## TypeScript Types

```typescript
// types/price.ts
export interface PriceFields {
  regularPrice?: number | null;
  promoPrice?: number | null;
  currency?: string | null;
  period?: string | null;
  installmentTerms?: string | null;
}

export interface Price {
  id: string;
  databaseId: number;
  title: string;
  priceFields?: PriceFields | null;
}

// types/promotion.ts
export interface Promotion {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  promotionRelationships?: {
    relatedServices?: {
      edges?: Array<{
        node?: Service;
      }>;
    };
  };
}
```

## Frontend: Dynamic Display

```typescript
// Extract data from nested relationships
const featuredPromotion = settings.featuredPromotion;

if (featuredPromotion) {
  const relatedService =
    featuredPromotion.promotionRelationships?.relatedServices?.edges?.[0]?.node;

  if (relatedService) {
    const serviceTitle = relatedService.title || "Услуга";
    const relatedPrice =
      relatedService.serviceRelationships?.relatedPrices?.edges?.[0]?.node;

    if (relatedPrice?.priceFields) {
      const { promoPrice, currency, period } = relatedPrice.priceFields;

      let pricePart = "";
      if (promoPrice) {
        pricePart = `${promoPrice}`;
        if (currency) pricePart += ` ${currency}`;
        if (period) pricePart += `/${period}`;
      }

      promoText = pricePart ? `${serviceTitle} за ${pricePart}` : serviceTitle;
    }
  }
}
```

## Programmatic ACF Registration (Alternative to JSON Sync)

### When to Use

- Need full control over field configuration
- Deploying across multiple environments
- Prefer code over admin UI for critical fields

### Price Fields Example

```php
// wp-content/mu-plugins/unident-acf-fields.php

function unident_register_price_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_price_fields',
            'title' => 'Price Settings',
            'fields' => [
                [
                    'key' => 'field_regular_price',
                    'label' => 'Regular Price',
                    'name' => 'regular_price',
                    'type' => 'number',                    // Number field!
                    'default_value' => 0,
                    'min' => 0,
                    'step' => 0.01,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'regularPrice',
                ],
                [
                    'key' => 'field_promo_price',
                    'label' => 'Promo Price',
                    'name' => 'promo_price',
                    'type' => 'number',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'promoPrice',
                ],
                [
                    'key' => 'field_currency',
                    'label' => 'Currency',
                    'name' => 'currency',
                    'type' => 'text',
                    'default_value' => 'RUB',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'currency',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'prices',  // Your CPT slug
                    ],
                ],
            ],
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'priceFields',
        ]);
    }
}
add_action('acf/init', 'unident_register_price_fields');
```

### Service Relationships Example

```php
function unident_register_service_relationships() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_service_relationships',
            'title' => 'Service Relationships',
            'fields' => [
                [
                    'key' => 'field_related_prices',
                    'label' => 'Related Prices',
                    'name' => 'related_prices',
                    'type' => 'relationship',              // Relationship field!
                    'post_type' => ['prices'],             // Target CPT
                    'return_format' => 'object',           // Returns WP_Post objects
                    'show_in_graphql' => 1,                // Won't work automatically!
                    'graphql_field_name' => 'relatedPrices',
                ],
                [
                    'key' => 'field_related_promotions',
                    'label' => 'Related Promotions',
                    'name' => 'related_promotions',
                    'type' => 'relationship',
                    'post_type' => ['promotions'],
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedPromotions',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'services',
                    ],
                ],
            ],
            'style' => 'default',
            'active' => true,
        ]);
    }
}
add_action('acf/init', 'unident_register_service_relationships');
```

## Manual GraphQL Registration for Relationships (REQUIRED!)

### Step 1: Register Price Fields in GraphQL

```php
/**
 * Manual GraphQL Registration для Price Fields
 * ACF fields won't appear automatically - must register manually!
 */
function unident_register_price_graphql_fields() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Register each field individually
    register_graphql_field('Price', 'regularPrice', [
        'type' => 'Float',                              // GraphQL type
        'description' => 'Regular price',
        'resolve' => function($post) {
            $value = get_field('regular_price', $post->ID);
            return $value ? (float) $value : null;     // Cast to Float!
        }
    ]);

    register_graphql_field('Price', 'promoPrice', [
        'type' => 'Float',
        'description' => 'Promo price',
        'resolve' => function($post) {
            $value = get_field('promo_price', $post->ID);
            return $value ? (float) $value : null;
        }
    ]);

    register_graphql_field('Price', 'currency', [
        'type' => 'String',
        'description' => 'Currency code',
        'resolve' => function($post) {
            return get_field('currency', $post->ID) ?: 'RUB';
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_price_graphql_fields', 10);
```

### Step 2: Register Relationship Fields in GraphQL

**Two formats available:**

#### Option A: List Format (Recommended - Simpler)

```php
/**
 * Register Relationship as List (not Connection)
 * Simpler query format, no edges/node needed
 */
function unident_register_service_relationships_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Register relatedPrices as list
    register_graphql_field('Service', 'relatedPrices', [
        'type' => ['list_of' => 'Price'],              // List format!
        'description' => 'Related prices for this service',
        'resolve' => function($service, $args, $context, $info) {
            // ACF returns array of WP_Post objects
            $prices = get_field('related_prices', $service->ID);

            if (!$prices || !is_array($prices)) {
                return null;
            }

            // Convert WP_Post to GraphQL types using DataSource
            $resolved = [];
            foreach ($prices as $price_post) {
                if ($price_post instanceof \WP_Post) {
                    $resolved_price = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $price_post->ID,
                        $context
                    );
                    if ($resolved_price) {
                        $resolved[] = $resolved_price;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);

    // Register relatedPromotions similarly
    register_graphql_field('Service', 'relatedPromotions', [
        'type' => ['list_of' => 'Promotion'],
        'description' => 'Related promotions for this service',
        'resolve' => function($service, $args, $context, $info) {
            $promotions = get_field('related_promotions', $service->ID);

            if (!$promotions || !is_array($promotions)) {
                return null;
            }

            $resolved = [];
            foreach ($promotions as $promo_post) {
                if ($promo_post instanceof \WP_Post) {
                    $resolved_promo = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $promo_post->ID,
                        $context
                    );
                    if ($resolved_promo) {
                        $resolved[] = $resolved_promo;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_service_relationships_graphql', 10);
```

#### Option B: Connection Format (More Complex)

```php
/**
 * Register Relationship as Connection (edges/node format)
 * More complex but standard GraphQL pattern
 */
function unident_register_service_relationships_connection() {
    if (!function_exists('register_graphql_connection')) {
        return;
    }

    register_graphql_connection([
        'fromType' => 'Service',
        'toType' => 'Price',
        'fromFieldName' => 'relatedPrices',
        'connectionTypeName' => 'ServiceToRelatedPricesConnection',
        'resolve' => function($service, $args, $context, $info) {
            $prices = get_field('related_prices', $service->ID);

            if (!$prices || !is_array($prices)) {
                return [];
            }

            return $prices;  // Return array of WP_Post objects
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_service_relationships_connection', 10);
```

### GraphQL Query Formats

**List Format Query (Simpler):**

```graphql
query GetService {
  service(id: "41", idType: DATABASE_ID) {
    id
    title
    # Direct array access - no edges/node!
    relatedPrices {
      id
      databaseId
      title
      regularPrice
      promoPrice
      currency
    }
  }
}
```

**Connection Format Query:**

```graphql
query GetService {
  service(id: "41", idType: DATABASE_ID) {
    id
    title
    # Edges/node structure
    relatedPrices {
      edges {
        node {
          id
          databaseId
          title
          regularPrice
          promoPrice
          currency
        }
      }
    }
  }
}
```

### TypeScript Types for List Format

```typescript
// lib/wordpress/api.ts

export interface PriceData {
  id: string;
  databaseId: number;
  title: string;
  regularPrice?: number;
  promoPrice?: number;
  currency?: string;
}

export interface Service {
  id: string;
  databaseId: number;
  title: string;
  // List format - direct array
  relatedPrices?: PriceData[] | null;
  relatedPromotions?: PromotionData[] | null;
}
```

### Frontend Usage (List Format)

```typescript
// components/service-card.tsx

function ServiceCard({ service }: { service: Service }) {
  // Direct array access - much simpler!
  const firstPrice = service.relatedPrices?.[0];
  const priceValue = firstPrice?.regularPrice || firstPrice?.promoPrice;

  const formattedPrice = priceValue
    ? `${priceValue.toLocaleString("ru-RU")} ₽`
    : "Цена не указана";

  return (
    <div>
      <h3>{service.title}</h3>
      <p>{formattedPrice}</p>

      {service.relatedPrices && service.relatedPrices.length > 0 && (
        <ul>
          {service.relatedPrices.map((price) => (
            <li key={price.id}>
              {price.title}: {price.regularPrice} {price.currency}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Creating Test Data in WordPress Admin

### Step 1: Create Price Posts

1. Go to WordPress Admin → **Prices** → **Add New**
2. Fill in:
   - **Title**: "Имплантация зубов - цена 2024"
   - **Regular Price**: 5000
   - **Promo Price**: 3550
   - **Currency**: RUB
3. **Publish**

### Step 2: Create Service and Link Price

1. Go to **Services** → **Add New**
2. Fill in:
   - **Title**: "Имплантация зубов"
   - **Related Prices**: Select "Имплантация зубов - цена 2024"
3. **Publish**

### Step 3: Verify in GraphQL IDE

1. Go to `http://localhost:8002/graphql-ide`
2. Run query:

```graphql
query {
  service(id: "41", idType: DATABASE_ID) {
    title
    relatedPrices {
      title
      regularPrice
    }
  }
}
```

## Troubleshooting

### Error: "Cannot query field 'relatedPrices' on type 'Service'"

**Cause:** Field not registered in GraphQL schema

**Fix:**

1. Check manual GraphQL registration is present
2. Restart WordPress container
3. Clear GraphQL cache (no WP-CLI command needed - just restart)

### Error: "Internal server error" on relationship field

**Cause:** Resolver returns wrong data format

**Fix:**

1. Use `DataSource::resolve_post_object()` for WP_Post conversion
2. Return array for `list_of`, not edges/node structure
3. Check WP_Post objects are valid (not null)

### Relationship returns null or empty array

**Cause:** No related posts selected in admin

**Fix:**

1. Edit Service post in admin
2. Scroll to "Service Relationships" metabox
3. Select related prices/promotions
4. Click "Update"
5. Verify data in GraphQL IDE

### Number fields return as strings

**Cause:** Missing type cast in resolver

**Fix:**

```php
// ❌ WRONG - returns string
'resolve' => function($post) {
    return get_field('regular_price', $post->ID);
}

// ✅ CORRECT - returns float
'resolve' => function($post) {
    $value = get_field('regular_price', $post->ID);
    return $value ? (float) $value : null;
}
```

## Key Points

### ✅ DO:

1. Use `show_in_graphql: 1` in all field definitions
2. Set `graphql_field_name` for field groups
3. **ALWAYS manually register relationship fields in GraphQL**
4. Use `DataSource::resolve_post_object()` for WP_Post conversion
5. Cast number fields to Float/Int in resolvers
6. Use list_of format for simpler queries
7. Test in GraphQL IDE before implementing frontend

### ❌ DON'T:

1. ❌ Rely on auto-registration for relationship fields
2. ❌ Forget to cast number types in resolvers
3. ❌ Return WP_Post objects directly - use DataSource
4. ❌ Mix Connection and List formats in same codebase
5. ❌ Forget to restart WordPress after PHP changes

## ACF Database Structure (CRITICAL!)

### Understanding ACF Storage

ACF stores field groups and fields as custom post types:

| Post Type         | Purpose          | Key Location               |
| ----------------- | ---------------- | -------------------------- |
| `acf-field-group` | Field group      | `post_excerpt` = group key |
| `acf-field`       | Individual field | `post_excerpt` = field key |

**Field Configuration Storage:**

- `post_content` = serialized array with field config (type, instructions, etc.)
- `post_parent` = parent ID (group ID for fields, repeater ID for sub-fields)
- `post_name` = field key
- `post_title` = field label

### JSON vs Database Conflict (CRITICAL!)

**Problem:** When you edit a field group in WordPress Admin and click "Save", ACF:

1. Saves to database (creates `acf-field-group` post)
2. If JSON Sync is enabled, also saves to JSON file

**Conflict occurs when:**

- JSON file has different structure than database
- `acf_add_local_field_group()` PHP registration conflicts with database entries
- Multiple sources (JSON + DB + PHP) define same field group

**Solution: Choose ONE source of truth:**

| Method           | Use When                                     | Admin Editable? |
| ---------------- | -------------------------------------------- | --------------- |
| JSON Sync        | Want to edit in Admin AND version control    | ✅ Yes          |
| PHP Registration | Deploy across environments, no admin editing | ❌ No           |
| Database Only    | Simple projects, admin-only management       | ✅ Yes          |

### Creating Field Groups in Database (Recommended for Complex Fields)

**When `acf_import_field_group()` fails (common with repeaters):**

```php
/**
 * Create ACF field group directly in database
 * Use when acf_import_field_group() doesn't preserve structure correctly
 */
function create_field_group_in_db() {
    global $wpdb;

    // 1. Create field group post
    $group_id = wp_insert_post([
        'post_title' => 'Service Fields',
        'post_name' => 'group_service_fields',       // Internal name
        'post_excerpt' => 'group_service_fields',    // KEY - used by ACF!
        'post_type' => 'acf-field-group',
        'post_status' => 'publish',
        'post_content' => '',
    ]);

    // 2. Add group settings as post meta
    update_post_meta($group_id, 'location', [
        [['param' => 'post_type', 'operator' => '==', 'value' => 'services']]
    ]);
    update_post_meta($group_id, 'position', 'normal');
    update_post_meta($group_id, 'style', 'default');
    update_post_meta($group_id, 'active', 1);
    update_post_meta($group_id, 'show_in_graphql', 1);
    update_post_meta($group_id, 'graphql_field_name', 'serviceFields');

    // 3. Create REPEATER field
    $repeater_content = [
        'type' => 'repeater',
        'instructions' => 'Add service features',
        'layout' => 'table',
        'button_label' => 'Add Feature',
        'show_in_graphql' => 1,
        'graphql_field_name' => 'features',
    ];

    $repeater_id = wp_insert_post([
        'post_title' => 'Features',
        'post_name' => 'field_service_features',
        'post_excerpt' => 'field_service_features',   // FIELD KEY
        'post_type' => 'acf-field',
        'post_status' => 'publish',
        'post_parent' => $group_id,                   // Parent = GROUP
        'menu_order' => 0,
        'post_content' => serialize($repeater_content),
    ]);

    // 4. Create SUB-FIELD (parent = REPEATER, not group!)
    $text_content = [
        'type' => 'text',
        'show_in_graphql' => 1,
        'graphql_field_name' => 'text',
    ];

    wp_insert_post([
        'post_title' => 'Text',
        'post_name' => 'field_feature_text',
        'post_excerpt' => 'field_feature_text',
        'post_type' => 'acf-field',
        'post_status' => 'publish',
        'post_parent' => $repeater_id,                // Parent = REPEATER!
        'menu_order' => 0,
        'post_content' => serialize($text_content),
    ]);

    return $group_id;
}
```

### Cleaning Conflicting Entries

```php
/**
 * Remove all ACF entries for a field group from database
 */
function cleanup_field_group($group_key) {
    global $wpdb;

    // Find groups
    $groups = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts}
         WHERE post_type = 'acf-field-group'
         AND post_excerpt = %s",
        $group_key
    ));

    foreach ($groups as $group_id) {
        // Delete child fields recursively
        $fields = $wpdb->get_col($wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts}
             WHERE post_parent = %d AND post_type = 'acf-field'",
            $group_id
        ));

        foreach ($fields as $field_id) {
            // Delete sub-fields
            $wpdb->query($wpdb->prepare(
                "DELETE FROM {$wpdb->posts}
                 WHERE post_parent = %d AND post_type = 'acf-field'",
                $field_id
            ));
            wp_delete_post($field_id, true);
        }

        wp_delete_post($group_id, true);
    }
}
```

### Making JSON Groups Visible in Admin List

**Problem:** Groups from JSON files don't appear in ACF Field Groups list.

**Solution:** Import to database for visibility:

```php
/**
 * Sync JSON field group to database for admin visibility
 */
function sync_json_to_database($json_file_path) {
    $json_content = file_get_contents($json_file_path);
    $field_group = json_decode($json_content, true);

    if (!$field_group) return false;

    // Use direct database creation instead of acf_import_field_group()
    // because acf_import_field_group() often breaks repeater structure
    return create_field_group_in_db_from_array($field_group);
}
```

## Troubleshooting

### Field Not Appearing in GraphQL

1. Check `show_in_graphql: 1` in field definition
2. Check `show_in_graphql: 1` in field group
3. Restart WordPress container
4. Clear WPGraphQL cache

### Relationship Returns Null

1. Check relationship field `return_format: 'object'`
2. Verify posts are published (not draft)
3. Check GraphQL query uses `edges > node` structure
4. Verify manual registration returns correct format

### Repeater Shows as Text in Admin, but Works in Posts

**Cause:** ACF loads from different sources:

- Posts: JSON file (correct repeater)
- Admin Field Groups: Database (corrupted/wrong type)

**Fix:**

1. Delete all database entries for the field group
2. Recreate using direct `wp_insert_post()` method (see above)
3. Ensure `post_content` contains serialized config with `'type' => 'repeater'`
4. Ensure sub-fields have `post_parent` = repeater ID (not group ID)

### Field Group Not in ACF List (But Works)

**Cause:** Group loaded from JSON only, not synced to database.

**Fix:** Create database entry to make it visible in admin list.

### Duplicate Field Groups

```php
// Check for duplicates
$groups = acf_get_field_groups();
foreach ($groups as $group) {
    error_log($group['title'] . ' - ' . $group['key']);
}
```

Fix: Delete database version if JSON version exists, or vice versa.

### acf_import_field_group() Breaks Repeater Structure

**Known Issue:** `acf_import_field_group()` sometimes converts repeaters to text fields.

**Fix:** Use direct `wp_insert_post()` method instead:

```php
// ❌ UNRELIABLE for complex fields
acf_import_field_group($json_array);

// ✅ RELIABLE - direct database creation
$group_id = wp_insert_post([...]);
$repeater_id = wp_insert_post([...]);
$subfield_id = wp_insert_post([...]);
```
