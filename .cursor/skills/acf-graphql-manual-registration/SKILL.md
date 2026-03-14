---
name: acf-graphql-manual-registration
description: Manual ACF field registration with GraphQL exposure for Custom Post Types. Use when creating custom fields for CPT, fields don't appear in GraphQL schema, repeater shows as text in admin, or need to create fields directly in database bypassing ACF import bugs.
---

# ACF GraphQL Manual Registration

## When to Use

**Use this skill when:**

- Creating custom fields for Custom Post Types (CPT)
- ACF fields don't appear in GraphQL schema despite being configured
- Need to expose ACF fields to WPGraphQL API
- Working with `serviceFields`, `doctorFields`, or similar custom field groups
- Getting "Cannot query field" errors in GraphQL

**Example scenario:** Need to add `price` and `features` fields to `services` CPT and expose them via GraphQL.

---

## Quick Reference

### 1. Create ACF Field Group Programmatically

```php
// wp-content/mu-plugins/unident-acf-fields.php

/**
 * Register ACF Fields для Services
 *
 * WPGraphQL ACF v2 automatically exposes fields if:
 * - Field group has 'show_in_graphql' => 1
 * - Each field has 'show_in_graphql' => 1
 */
function unident_register_service_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_service_fields',
            'title' => 'Настройки услуги',
            'fields' => array(
                // Price field
                array(
                    'key' => 'field_service_price',
                    'label' => 'Цена',
                    'name' => 'price',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1, // ✅ CRITICAL
                    'graphql_field_name' => 'price',
                ),
                // Features field
                array(
                    'key' => 'field_service_features',
                    'label' => 'Особенности',
                    'name' => 'features',
                    'type' => 'textarea',
                    'required' => 0,
                    'show_in_graphql' => 1, // ✅ CRITICAL
                    'graphql_field_name' => 'features',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'services', // CPT slug
                    ),
                ),
            ),
            'active' => true,
            'show_in_graphql' => 1, // ✅ CRITICAL for field group
            'graphql_field_name' => 'serviceFields', // Name in GraphQL
        ));
    }
}
add_action('acf/init', 'unident_register_service_fields');
```

### 2. GraphQL Query Structure

```graphql
query GetService($id: ID!) {
  service(id: $id) {
    id
    title
    serviceFields {
      # ← field group name from graphql_field_name
      price # ← field name from graphql_field_name
      features
    }
  }
}
```

---

## Step-by-Step Process

### Step 1: Create MU-Plugin File

```bash
# Create or edit MU-plugin
touch wp-content/mu-plugins/unident-acf-fields.php
```

**Why MU-plugin?**

- Always loaded, no activation needed
- Won't be disabled accidentally
- Perfect for critical functionality

### Step 2: Define Field Group Structure

**Critical parameters:**

```php
array(
    'key' => 'group_unique_key',        // Unique ID for field group
    'title' => 'Display Name',          // Admin UI title
    'show_in_graphql' => 1,             // ✅ Expose to GraphQL
    'graphql_field_name' => 'fieldName', // Name in GraphQL schema
    'fields' => [/* fields array */],
    'location' => [/* where to show */],
)
```

### Step 3: Define Individual Fields

```php
array(
    'key' => 'field_unique_key',        // Unique field ID
    'label' => 'Price',                 // Admin label
    'name' => 'price',                  // Database name
    'type' => 'text',                   // Field type
    'show_in_graphql' => 1,             // ✅ Expose to GraphQL
    'graphql_field_name' => 'price',    // GraphQL field name
)
```

### Step 4: Set Location Rules

```php
'location' => array(
    array(
        array(
            'param' => 'post_type',     // Rule type
            'operator' => '==',         // Comparison
            'value' => 'services',      // CPT slug
        ),
    ),
),
```

### Step 5: Hook into ACF Init

```php
add_action('acf/init', 'your_registration_function');
```

**Why `acf/init`?**

- Fires after ACF is loaded
- Safe to use `acf_add_local_field_group()`
- Before GraphQL schema is built

### Step 6: Clear All Caches

```bash
# WordPress Object Cache
docker exec -it template-wordpress-1 wp cache flush

# GraphQL Schema Cache
docker exec -it template-wordpress-1 wp graphql clear-schema-cache

# Verify registration in WP Admin
# Go to: Custom Fields → Field Groups → check if your group exists
```

### Step 7: Test GraphQL Query

```bash
# Test direct GraphQL query
docker exec -it template-wordpress-1 wp graphql query '
query {
  services(first: 1) {
    nodes {
      id
      title
      serviceFields {
        price
        features
      }
    }
  }
}
'
```

---

## Field Types Reference

### Text Field

```php
array(
    'type' => 'text',
    'name' => 'field_name',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'fieldName',
)
```

### Textarea Field

```php
array(
    'type' => 'textarea',
    'name' => 'description',
    'rows' => 4,
    'new_lines' => '', // or 'br', 'wpautop'
    'show_in_graphql' => 1,
    'graphql_field_name' => 'description',
)
```

### Number Field (Requires Manual GraphQL Registration!)

**ACF Definition:**

```php
array(
    'type' => 'number',
    'name' => 'regular_price',
    'min' => 0,
    'step' => 0.01,
    'default_value' => 0,
    'show_in_graphql' => 1,               // Won't work automatically!
    'graphql_field_name' => 'regularPrice',
)
```

**Manual GraphQL Registration (REQUIRED):**

```php
function register_number_field_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_field('Price', 'regularPrice', [
        'type' => 'Float',                         // Or 'Int' for integers
        'description' => 'Regular price',
        'resolve' => function($post) {
            $value = get_field('regular_price', $post->ID);
            return $value ? (float) $value : null; // MUST cast to Float!
        }
    ]);
}
add_action('graphql_register_types', 'register_number_field_graphql', 10);
```

**Why Manual Registration?**

- Number fields often don't auto-expose to GraphQL
- Type casting is required (Float/Int)
- Prevents "Internal server error" in GraphQL

### Image Field

```php
array(
    'type' => 'image',
    'name' => 'featured_image',
    'return_format' => 'array', // or 'url', 'id'
    'show_in_graphql' => 1,
)
```

### Repeater Field

```php
array(
    'type' => 'repeater',
    'name' => 'items',
    'layout' => 'table',                          // or 'block', 'row'
    'button_label' => 'Add Item',
    'sub_fields' => [
        array(
            'key' => 'field_item_title',
            'name' => 'item_title',
            'type' => 'text',
            'show_in_graphql' => 1,
            'graphql_field_name' => 'itemTitle',
        ),
    ],
    'show_in_graphql' => 1,
    'graphql_field_name' => 'items',
)
```

### Relationship Field (Requires Manual GraphQL Registration!)

**ACF Definition:**

```php
array(
    'type' => 'relationship',
    'name' => 'related_prices',
    'post_type' => ['prices'],                    // Target CPT
    'return_format' => 'object',                  // Returns WP_Post objects
    'show_in_graphql' => 1,                       // Won't work automatically!
    'graphql_field_name' => 'relatedPrices',
)
```

**Manual GraphQL Registration (REQUIRED):**

```php
function register_relationship_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_field('Service', 'relatedPrices', [
        'type' => ['list_of' => 'Price'],         // List format (recommended)
        'description' => 'Related prices',
        'resolve' => function($service, $args, $context, $info) {
            $prices = get_field('related_prices', $service->ID);

            if (!$prices || !is_array($prices)) {
                return null;
            }

            // Convert WP_Post to GraphQL types
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
}
add_action('graphql_register_types', 'register_relationship_graphql', 10);
```

**GraphQL Query:**

```graphql
query {
  service(id: "41", idType: DATABASE_ID) {
    relatedPrices {
      id
      title
      regularPrice
    }
  }
}
```

---

## Common Errors and Fixes

### Error 1: "Cannot query field 'serviceFields' on type 'Service'"

**Cause:** Field group not exposed to GraphQL

**Fix:**

```php
'show_in_graphql' => 1, // Add to field group
```

### Error 2: Fields show in admin but not in GraphQL

**Cause:** Individual fields missing GraphQL exposure

**Fix:**

```php
// Add to EACH field:
'show_in_graphql' => 1,
'graphql_field_name' => 'fieldName',
```

### Error 3: Old field names still in GraphQL

**Cause:** GraphQL schema cache

**Fix:**

```bash
docker exec -it template-wordpress-1 wp graphql clear-schema-cache
```

### Error 4: Field group shows but fields are null

**Cause:** Field keys conflict or wrong location rules

**Fix:**

1. Check `'key'` is unique across all fields
2. Verify location rules match your CPT
3. Check if fields are filled in admin

---

## Best Practices

### ✅ DO:

1. **Use unique keys:**

   ```php
   'key' => 'group_project_cpt_field', // project_services_price
   ```

2. **Always set GraphQL field names:**

   ```php
   'graphql_field_name' => 'camelCaseName',
   ```

3. **Use MU-plugins for critical fields:**

   ```
   wp-content/mu-plugins/unident-acf-fields.php
   ```

4. **Clear caches after changes:**

   ```bash
   wp cache flush && wp graphql clear-schema-cache
   ```

5. **Test queries immediately:**
   ```bash
   wp graphql query '{ services { nodes { serviceFields { price } } } }'
   ```

### ❌ DON'T:

1. ❌ Register fields in theme (can be deactivated)
2. ❌ Forget `show_in_graphql` on field group
3. ❌ Use spaces in `graphql_field_name`
4. ❌ Reuse `key` values across fields
5. ❌ Skip cache clearing after registration

---

## Complete Example: Doctor Fields

```php
<?php
/**
 * Register Doctor ACF Fields with GraphQL
 *
 * File: wp-content/mu-plugins/unident-doctor-fields.php
 */

function unident_register_doctor_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array(
        'key' => 'group_doctor_fields',
        'title' => 'Информация о враче',
        'fields' => array(
            // Experience (years)
            array(
                'key' => 'field_doctor_experience',
                'label' => 'Стаж (лет)',
                'name' => 'experience',
                'type' => 'number',
                'min' => 0,
                'max' => 50,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'experience',
            ),
            // Rating
            array(
                'key' => 'field_doctor_rating',
                'label' => 'Рейтинг',
                'name' => 'rating',
                'type' => 'number',
                'min' => 0,
                'max' => 5,
                'step' => 0.1,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'rating',
            ),
            // Specialization
            array(
                'key' => 'field_doctor_specialization',
                'label' => 'Специализация',
                'name' => 'specialization',
                'type' => 'textarea',
                'rows' => 3,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'specialization',
            ),
            // Clinic
            array(
                'key' => 'field_doctor_clinic',
                'label' => 'Клиника',
                'name' => 'clinic',
                'type' => 'text',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'clinic',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'doctors',
                ),
            ),
        ),
        'active' => true,
        'show_in_graphql' => 1,
        'graphql_field_name' => 'doctorFields',
    ));
}
add_action('acf/init', 'unident_register_doctor_fields');
```

**GraphQL Query:**

```graphql
query GetDoctors {
  doctors(first: 10) {
    nodes {
      id
      title
      doctorFields {
        experience
        rating
        specialization
        clinic
      }
    }
  }
}
```

---

## Verification Checklist

After registration, verify:

- [ ] Field group shows in WP Admin → Custom Fields
- [ ] Fields appear when editing CPT post
- [ ] Can save values in admin
- [ ] GraphQL schema includes field group (test query)
- [ ] GraphQL query returns field values
- [ ] Values update in GraphQL after editing in admin
- [ ] Next.js fetches data correctly

---

## ACF Database Structure (For Complex Fields)

### When to Use Direct Database Creation

Use direct `wp_insert_post()` instead of `acf_add_local_field_group()` when:

1. **Repeater fields show as Text in admin** - common bug with ACF import
2. **Admin editing breaks field structure** - conflicts between JSON/PHP/DB
3. **`acf_import_field_group()` fails** - doesn't preserve complex structures
4. **Need field group visible in ACF list** - JSON-only groups hidden in admin

### ACF Post Type Structure

| Post Type         | Purpose               | Key Field      |
| ----------------- | --------------------- | -------------- |
| `acf-field-group` | Field group container | `post_excerpt` |
| `acf-field`       | Individual field      | `post_excerpt` |

**Configuration Storage:**

- `post_content` = serialized PHP array with field config
- `post_parent` = parent ID (group for fields, repeater for sub-fields)
- `post_excerpt` = field/group KEY (used by ACF internally)

### Creating Repeater Field Directly in Database

```php
/**
 * Create repeater field group directly in database
 * Bypasses acf_import_field_group() bugs
 */
function create_repeater_in_database() {
    // 1. Create field group
    $group_id = wp_insert_post([
        'post_title' => 'Service Fields',
        'post_name' => 'group_service_fields',
        'post_excerpt' => 'group_service_fields',    // KEY!
        'post_type' => 'acf-field-group',
        'post_status' => 'publish',
    ]);

    // Group meta
    update_post_meta($group_id, 'location', [
        [['param' => 'post_type', 'operator' => '==', 'value' => 'services']]
    ]);
    update_post_meta($group_id, 'show_in_graphql', 1);
    update_post_meta($group_id, 'graphql_field_name', 'serviceFields');
    update_post_meta($group_id, 'active', 1);

    // 2. Create REPEATER field
    $repeater_config = [
        'type' => 'repeater',
        'instructions' => 'Add features',
        'layout' => 'table',
        'button_label' => 'Add Feature',
        'show_in_graphql' => 1,
        'graphql_field_name' => 'features',
    ];

    $repeater_id = wp_insert_post([
        'post_title' => 'Features',
        'post_name' => 'field_service_features',
        'post_excerpt' => 'field_service_features',  // KEY!
        'post_type' => 'acf-field',
        'post_status' => 'publish',
        'post_parent' => $group_id,                  // Parent = GROUP
        'menu_order' => 0,
        'post_content' => serialize($repeater_config),
    ]);

    // 3. Create SUB-FIELD (CRITICAL: parent = repeater, NOT group!)
    $text_config = [
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
        'post_parent' => $repeater_id,               // Parent = REPEATER!
        'menu_order' => 0,
        'post_content' => serialize($text_config),
    ]);

    return $group_id;
}
```

### Cleaning Up Before Recreation

```php
/**
 * Delete all ACF entries for a field group
 */
function cleanup_acf_group($group_key) {
    global $wpdb;

    $groups = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts}
         WHERE post_type = 'acf-field-group'
         AND (post_excerpt = %s OR post_name = %s)",
        $group_key, $group_key
    ));

    foreach ($groups as $gid) {
        // Delete child fields
        $fields = $wpdb->get_col($wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts}
             WHERE post_parent = %d AND post_type = 'acf-field'",
            $gid
        ));

        foreach ($fields as $fid) {
            // Delete sub-fields
            $wpdb->query($wpdb->prepare(
                "DELETE FROM {$wpdb->posts}
                 WHERE post_parent = %d AND post_type = 'acf-field'",
                $fid
            ));
            wp_delete_post($fid, true);
        }
        wp_delete_post($gid, true);
    }
}
```

### Debug ACF Database Entries

```php
/**
 * Debug what ACF has in database
 */
function debug_acf_database() {
    global $wpdb;

    $groups = $wpdb->get_results(
        "SELECT ID, post_title, post_excerpt, post_name
         FROM {$wpdb->posts}
         WHERE post_type = 'acf-field-group'"
    );

    foreach ($groups as $g) {
        echo "Group: {$g->post_title} (key: {$g->post_excerpt})\n";

        $fields = $wpdb->get_results($wpdb->prepare(
            "SELECT ID, post_title, post_excerpt, post_content, post_parent
             FROM {$wpdb->posts}
             WHERE post_parent = %d AND post_type = 'acf-field'",
            $g->ID
        ));

        foreach ($fields as $f) {
            $config = @unserialize($f->post_content);
            $type = $config['type'] ?? 'unknown';
            echo "  - {$f->post_title} (type: {$type}, key: {$f->post_excerpt})\n";

            // Check for sub-fields (repeater)
            if ($type === 'repeater') {
                $subs = $wpdb->get_results($wpdb->prepare(
                    "SELECT post_title, post_excerpt, post_content
                     FROM {$wpdb->posts}
                     WHERE post_parent = %d AND post_type = 'acf-field'",
                    $f->ID
                ));
                foreach ($subs as $s) {
                    $sc = @unserialize($s->post_content);
                    echo "      └ {$s->post_title} (type: " . ($sc['type'] ?? '?') . ")\n";
                }
            }
        }
    }
}
```

---

## Common Issues with ACF Admin

### Issue: Repeater Shows as Text in Field Group Editor

**Symptom:**

- In posts: Repeater works correctly
- In ACF Field Groups: Shows as Text field

**Cause:** ACF loads from different sources:

- Posts use JSON file (correct)
- Admin uses database (corrupted)

**Fix:**

1. Delete all database entries for the group
2. Recreate using direct `wp_insert_post()` method
3. Ensure `post_content` has `'type' => 'repeater'`
4. Ensure sub-fields have `post_parent` = repeater ID

### Issue: Field Group Not Visible in ACF List

**Symptom:** Fields work but group not in ACF → Field Groups

**Cause:** Group loaded from JSON only (not in database)

**Fix:** Create database entry to make visible in admin

### Issue: acf_import_field_group() Breaks Structure

**Known Bug:** ACF's import function sometimes converts repeaters to text.

**Fix:** Use direct database creation instead:

```php
// ❌ UNRELIABLE
acf_import_field_group($array);

// ✅ RELIABLE
wp_insert_post([...group...]);
wp_insert_post([...repeater...]);
wp_insert_post([...subfield...]);
```

---

## Related Skills

- **acf-relationships** - bidirectional relationships and database structure
- **wordpress-nextjs-cache-clearing** - clear caches after registration
- **graphql-queries** - writing optimized GraphQL queries
- **wpgraphql-debugging** - debugging GraphQL issues

---

**Status:** ✅ Активно применять
**Version:** 2.0.0
**Created:** 2026-01-21
**Updated:** 2026-01-28 (Added database structure, direct creation method)