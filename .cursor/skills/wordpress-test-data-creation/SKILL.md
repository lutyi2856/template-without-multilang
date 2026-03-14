---
name: wordpress-test-data-creation
description: Create test data in WordPress (posts, terms, taxonomies) via WP-CLI and verify in frontend. Use when need to populate database with test content, create categories/services for testing, or verify data flow from WordPress to Next.js.
---

# WordPress Test Data Creation & Verification

## When to Use

**Use this skill when:**
- Need to **populate database** with test content
- Creating **categories and services** for dropdown testing
- Testing **data flow** from WordPress to Next.js
- Verifying **GraphQL queries** return correct data
- Setting up **demo content** for development
- Testing **relationships** between CPT and taxonomies

**Example scenario:** Create 7 service categories with 22 services total to test service dropdown.

---

## Quick Reference

### Create Categories via WP-CLI

```bash
docker exec -it template-wordpress-1 wp term create service_categories "Implantation" \
  --slug=implantation \
  --description="Dental implants installation"
```

### Create Posts via WP-CLI

```bash
docker exec -it template-wordpress-1 wp post create \
  --post_type=services \
  --post_title="Implant OSSTEM" \
  --post_status=publish
```

### Assign Terms to Posts

```bash
docker exec -it template-wordpress-1 wp post term add <post_id> service_categories <term_id>
```

---

## Step-by-Step Process

### Step 1: Plan Data Structure

**Define what you need:**

```yaml
Categories (service_categories taxonomy):
  - Implantation (10 services)
  - Treatment (8 services)
  - Prosthetics (12 services)
  - Whitening (6 services)
  - Braces (9 services)
  - Children (7 services)
  - Surgery (11 services)

Total: 7 categories, 63 services
```

### Step 2: Create PHP Script for Bulk Creation

**Why PHP script instead of WP-CLI loop?**
- ✅ Faster execution
- ✅ Better encoding handling (Cyrillic)
- ✅ Easier to maintain
- ✅ Can check existing data

**Example: `scripts/create-services-data.php`**

```php
<?php
/**
 * Create test service categories and posts
 * 
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-services-data.php
 */

// Categories configuration
$categories = [
    [
        'name' => 'Implantation',
        'slug' => 'implantation',
        'description' => 'Dental implants installation',
        'services_count' => 10
    ],
    [
        'name' => 'Treatment',
        'slug' => 'treatment',
        'description' => 'Therapeutic treatment',
        'services_count' => 8
    ],
    // ... more categories
];

// Service templates for each category
$service_templates = [
    'implantation' => [
        'Implant OSSTEM',
        'Implant Nobel Biocare',
        'Implant Straumann',
        'Sinus lift',
        'Bone grafting',
        'All-on-4',
        'All-on-6',
        'One day implantation',
        'Turnkey implantation',
        'Painless implantation'
    ],
    'treatment' => [
        'Caries treatment',
        'Pulpitis treatment',
        // ... more services
    ],
];

echo "=== Creating Categories ===\n\n";

$created_terms = [];

foreach ($categories as $category) {
    // Check if term exists
    $existing_term = get_term_by('slug', $category['slug'], 'service_categories');
    
    if ($existing_term) {
        echo "✓ Category '{$category['name']}' exists (ID: {$existing_term->term_id})\n";
        $term_id = $existing_term->term_id;
    } else {
        // Create new term
        $result = wp_insert_term(
            $category['name'],
            'service_categories',
            [
                'slug' => $category['slug'],
                'description' => $category['description'],
            ]
        );
        
        if (is_wp_error($result)) {
            echo "✗ Error: {$category['name']} - " . $result->get_error_message() . "\n";
            continue;
        }
        
        $term_id = $result['term_id'];
        echo "✓ Created category '{$category['name']}' (ID: {$term_id})\n";
    }
    
    $created_terms[$category['slug']] = [
        'id' => $term_id,
        'name' => $category['name'],
        'services_count' => $category['services_count'],
    ];
}

echo "\n=== Creating Services ===\n\n";

$total_services = 0;

foreach ($created_terms as $slug => $term_data) {
    $templates = $service_templates[$slug] ?? [];
    $count = min($term_data['services_count'], count($templates));
    
    echo "Category: {$term_data['name']} (creating {$count} services)\n";
    
    for ($i = 0; $i < $count; $i++) {
        $service_name = $templates[$i];
        
        // Check if service exists
        $existing_posts = get_posts([
            'post_type' => 'services',
            'title' => $service_name,
            'post_status' => 'publish',
            'numberposts' => 1,
        ]);
        
        if (!empty($existing_posts)) {
            $post_id = $existing_posts[0]->ID;
            echo "  ✓ Service '{$service_name}' exists (ID: {$post_id})\n";
        } else {
            // Create new post
            $post_id = wp_insert_post([
                'post_title' => $service_name,
                'post_type' => 'services',
                'post_status' => 'publish',
                'post_content' => "<!-- wp:paragraph -->\n<p>Service description: {$service_name}</p>\n<!-- /wp:paragraph -->",
                'post_excerpt' => "Professional service: {$service_name}",
            ]);
            
            if (is_wp_error($post_id)) {
                echo "  ✗ Error: {$service_name} - " . $post_id->get_error_message() . "\n";
                continue;
            }
            
            echo "  ✓ Created service '{$service_name}' (ID: {$post_id})\n";
        }
        
        // Assign to category
        wp_set_object_terms($post_id, [$term_data['id']], 'service_categories');
        
        $total_services++;
    }
    
    echo "\n";
}

echo "=== Summary ===\n";
echo "Categories: " . count($created_terms) . "\n";
echo "Services: {$total_services}\n";
echo "\n✓ Done!\n";
```

### Step 3: Run the Script

```bash
# Execute PHP script via WP-CLI
docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-services-data.php
```

**Output:**

```
=== Creating Categories ===

✓ Created category 'Implantation' (ID: 21)
✓ Created category 'Treatment' (ID: 22)
✓ Created category 'Prosthetics' (ID: 23)
...

=== Creating Services ===

Category: Implantation (creating 10 services)
  ✓ Created service 'Implant OSSTEM' (ID: 13)
  ✓ Created service 'Implant Nobel Biocare' (ID: 14)
  ...

=== Summary ===
Categories: 7
Services: 63

✓ Done!
```

### Step 4: Verify in WordPress Admin

**Check categories:**
```bash
docker exec -it template-wordpress-1 wp term list service_categories
```

**Output:**
```
+----------+------------------+-------------+-------+
| term_id  | name             | slug        | count |
+----------+------------------+-------------+-------+
| 21       | Implantation     | implantation| 10    |
| 22       | Treatment        | treatment   | 8     |
| 23       | Prosthetics      | prosthetics | 12    |
...
```

**Check services:**
```bash
docker exec -it template-wordpress-1 wp post list --post_type=services --format=count
```

**Output:**
```
63
```

### Step 5: Test GraphQL Query

```bash
docker exec -it template-wordpress-1 wp graphql query '
query GetServicesWithCategories {
  serviceCategories(first: 10) {
    nodes {
      id
      databaseId
      name
      slug
      count
    }
  }
  services(first: 100) {
    nodes {
      id
      title
      serviceCategories {
        nodes {
          slug
        }
      }
    }
  }
}
'
```

**Expected output:**
```json
{
  "data": {
    "serviceCategories": {
      "nodes": [
        {
          "id": "dGVybToyMQ==",
          "databaseId": 21,
          "name": "Implantation",
          "slug": "implantation",
          "count": 10
        },
        ...
      ]
    },
    "services": {
      "nodes": [
        {
          "id": "cG9zdDoxMw==",
          "title": "Implant OSSTEM",
          "serviceCategories": {
            "nodes": [
              { "slug": "implantation" }
            ]
          }
        },
        ...
      ]
    }
  }
}
```

### Step 6: Clear All Caches

```bash
# WordPress Object Cache
docker exec -it template-wordpress-1 wp cache flush

# GraphQL Schema Cache
docker exec -it template-wordpress-1 wp graphql clear-schema-cache

# Restart Next.js (Ctrl+C in terminal, then npm run dev)
```

### Step 7: Verify in Next.js Frontend

**Use Playwright MCP to test:**

```typescript
// Navigate to page
browser_navigate({ url: "http://localhost:3000" })

// Hover on Services
browser_hover({ element: "Services link", ref: "e81" })

// Get snapshot
browser_snapshot()
// → Should see all 7 categories in dropdown

// Take screenshot
browser_take_screenshot({ 
  filename: "services-dropdown-7-categories.png" 
})

// Check console logs
browser_console_messages()
// → Look for: "[Navigation] DEBUG: {categoriesCount: 7, ...}"
```

---

## Advanced: Adding ACF Fields to Created Posts

### Update Script to Add ACF Data

```php
// After creating post
$post_id = wp_insert_post([...]);

// Add ACF fields
if (function_exists('update_field')) {
    // Add price
    update_field('price', '3 500', $post_id);
    
    // Add features
    $features = [
        'High-quality materials',
        'Modern equipment',
        '5 year warranty'
    ];
    update_field('features', implode("\n", $features), $post_id);
}
```

### Verify ACF Fields in GraphQL

```bash
docker exec -it template-wordpress-1 wp graphql query '
query GetServiceWithFields($id: ID!) {
  service(id: $id, idType: DATABASE_ID) {
    id
    title
    serviceFields {
      price
      features
    }
  }
}
' --variables='{"id": 13}'
```

---

## Common Patterns

### Pattern 1: Create Categories First, Then Services

```php
// Step 1: Create all categories
foreach ($categories as $cat) {
    $term_id = wp_insert_term($cat['name'], 'taxonomy');
    $created_terms[$cat['slug']] = $term_id;
}

// Step 2: Create services and assign categories
foreach ($services as $service) {
    $post_id = wp_insert_post([...]);
    $category_id = $created_terms[$service['category']];
    wp_set_object_terms($post_id, [$category_id], 'taxonomy');
}
```

### Pattern 2: Check Before Create (Idempotent)

```php
// Always check if exists first
$existing = get_term_by('slug', $slug, 'taxonomy');

if ($existing) {
    echo "Already exists\n";
    $term_id = $existing->term_id;
} else {
    $term_id = wp_insert_term(...);
    echo "Created\n";
}
```

### Pattern 3: Bulk Creation with Progress

```php
$total = count($items);
foreach ($items as $index => $item) {
    // Create item
    $progress = round(($index + 1) / $total * 100);
    echo "\rProgress: {$progress}% ({$index + 1}/{$total})";
}
echo "\n";
```

---

## Troubleshooting

### Issue 1: Cyrillic Characters Show as Gibberish

**Cause:** Encoding mismatch

**Fix:**
```php
// Use English names in script
'name' => 'Implantation',  // Not 'Имплантация'

// Or ensure UTF-8:
define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');
// Then use Cyrillic
```

### Issue 2: Script Runs But No Data Created

**Cause:** WordPress not loaded, or wrong file path

**Fix:**
```bash
# Verify file exists in container
docker exec -it template-wordpress-1 ls -la /var/www/html/scripts/

# Run with full path
docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-services-data.php
```

### Issue 3: Categories Created But Services Not Assigned

**Cause:** Wrong taxonomy name or term ID

**Fix:**
```php
// Verify taxonomy name
wp_set_object_terms($post_id, [$term_id], 'service_categories');
//                                          ^^^^^^^^^^^^^^^^ correct taxonomy!

// Double-check term exists
$term = get_term($term_id);
if (is_wp_error($term)) {
    echo "Term not found!\n";
}
```

### Issue 4: Data Created But Not in GraphQL

**Cause:** GraphQL schema cache, or CPT not exposed

**Fix:**
```bash
# Clear GraphQL cache
docker exec -it template-wordpress-1 wp graphql clear-schema-cache

# Verify CPT is exposed to GraphQL
docker exec -it template-wordpress-1 wp graphql get-post-types
# → Should see 'services' in list
```

---

## Best Practices

### ✅ DO:

1. **Use English names for slugs:**
   ```php
   'slug' => 'implantation',  // ✅
   'slug' => 'имплантация',   // ❌
   ```

2. **Check before create (idempotent):**
   ```php
   $existing = get_term_by('slug', $slug, 'taxonomy');
   if ($existing) { /* use existing */ }
   ```

3. **Use `wp eval-file` for complex operations:**
   ```bash
   wp eval-file /path/to/script.php
   ```

4. **Verify data in multiple ways:**
   - WP-CLI: `wp term list`, `wp post list`
   - GraphQL: `wp graphql query`
   - Frontend: Playwright MCP test

5. **Clear all caches after creation:**
   ```bash
   wp cache flush && wp graphql clear-schema-cache
   ```

### ❌ DON'T:

1. ❌ Create duplicate data (check first!)
2. ❌ Use Cyrillic in slugs
3. ❌ Skip cache clearing
4. ❌ Forget to verify in frontend
5. ❌ Create data without ACF fields if needed

---

## Complete Example: Doctor Test Data

```php
<?php
/**
 * Create test doctors with ACF fields
 */

$doctors = [
    [
        'name' => 'Dr. Ivanov Ivan',
        'specialization' => 'Implantologist',
        'experience' => 15,
        'rating' => 4.9,
        'clinic' => 'Main Clinic'
    ],
    [
        'name' => 'Dr. Petrova Anna',
        'specialization' => 'Therapist',
        'experience' => 10,
        'rating' => 4.7,
        'clinic' => 'Branch #2'
    ],
];

foreach ($doctors as $doctor) {
    // Check if exists
    $existing = get_posts([
        'post_type' => 'doctors',
        'title' => $doctor['name'],
        'numberposts' => 1,
    ]);
    
    if (!empty($existing)) {
        echo "✓ Doctor '{$doctor['name']}' exists\n";
        continue;
    }
    
    // Create post
    $post_id = wp_insert_post([
        'post_title' => $doctor['name'],
        'post_type' => 'doctors',
        'post_status' => 'publish',
    ]);
    
    if (is_wp_error($post_id)) {
        echo "✗ Error creating '{$doctor['name']}'\n";
        continue;
    }
    
    // Add ACF fields
    if (function_exists('update_field')) {
        update_field('experience', $doctor['experience'], $post_id);
        update_field('rating', $doctor['rating'], $post_id);
        update_field('specialization', $doctor['specialization'], $post_id);
        update_field('clinic', $doctor['clinic'], $post_id);
    }
    
    echo "✓ Created doctor '{$doctor['name']}' (ID: {$post_id})\n";
}

echo "\n✓ Done! Created " . count($doctors) . " doctors\n";
```

---

## Related Skills

- **acf-graphql-manual-registration** - add ACF fields to created posts
- **wordpress-nextjs-cache-clearing** - clear caches after data creation
- **playwright-browser-testing** - verify data in frontend
- **graphql-queries** - test GraphQL data fetching

---

**Status:** ✅ Активно применять
**Version:** 1.0.0
**Created:** 2026-01-21
