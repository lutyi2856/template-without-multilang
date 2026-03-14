---
name: service-dropdown-full-workflow
description: Complete workflow for implementing service dropdown with categories - from ACF registration to frontend verification. Use when implementing dropdown menus with WordPress taxonomies and CPT data.
---

# Service Dropdown: Complete Implementation Workflow

## Overview

**Complete end-to-end workflow for implementing dropdown menu with:**
- WordPress taxonomies (categories)
- Custom Post Type (services)
- ACF custom fields (price, features)
- GraphQL API exposure
- Next.js frontend rendering
- Browser testing and verification

**Example:** Service dropdown showing 7 categories with 63 services, featured service card.

---

## Complete Workflow

### Phase 1: WordPress Backend Setup

#### Step 1.1: Register ACF Fields with GraphQL

**File:** `wp-content/mu-plugins/unident-acf-fields.php`

```php
function unident_register_service_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }
    
    acf_add_local_field_group(array(
        'key' => 'group_service_fields',
        'title' => 'Настройки услуги',
        'fields' => array(
            array(
                'key' => 'field_service_price',
                'label' => 'Цена',
                'name' => 'price',
                'type' => 'text',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'price',
            ),
            array(
                'key' => 'field_service_features',
                'label' => 'Особенности',
                'name' => 'features',
                'type' => 'textarea',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'features',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'services',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_field_name' => 'serviceFields',
    ));
}
add_action('acf/init', 'unident_register_service_fields');
```

#### Step 1.2: Create Test Data

**File:** `scripts/create-services-data.php`

```php
<?php
$categories = [
    ['name' => 'Implantation', 'slug' => 'implantation', 'services_count' => 10],
    ['name' => 'Treatment', 'slug' => 'treatment', 'services_count' => 8],
    ['name' => 'Prosthetics', 'slug' => 'prosthetics', 'services_count' => 12],
    // ... more categories
];

foreach ($categories as $cat) {
    $term = wp_insert_term($cat['name'], 'service_categories', [
        'slug' => $cat['slug'],
        'description' => $cat['description'] ?? '',
    ]);
    
    // Create services for this category
    for ($i = 0; $i < $cat['services_count']; $i++) {
        $post_id = wp_insert_post([
            'post_title' => "Service {$i} - {$cat['name']}",
            'post_type' => 'services',
            'post_status' => 'publish',
        ]);
        
        // Assign to category
        wp_set_object_terms($post_id, [$term['term_id']], 'service_categories');
        
        // Add ACF fields
        update_field('price', '3 500', $post_id);
        update_field('features', "Feature 1\nFeature 2", $post_id);
    }
}
```

**Run:**

```bash
docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-services-data.php
```

#### Step 1.3: Clear WordPress Caches

```bash
# Clear all caches
docker exec -it template-wordpress-1 wp cache flush
docker exec -it template-wordpress-1 wp graphql clear-schema-cache

# Restart WordPress
docker restart template-wordpress-1
```

#### Step 1.4: Verify GraphQL Schema

```bash
docker exec -it template-wordpress-1 wp graphql query '
query GetServicesDropdownData {
  serviceCategories(first: 20, where: { hideEmpty: true }) {
    nodes {
      id
      databaseId
      name
      slug
      count
    }
  }
  services(first: 100, where: { status: PUBLISH }) {
    nodes {
      id
      title
      slug
      uri
      serviceCategories {
        nodes {
          slug
        }
      }
      serviceFields {
        price
        features
      }
    }
  }
}
'
```

**Expected output:** 7 categories, 63 services with `serviceFields`.

---

### Phase 2: Next.js Frontend Implementation

#### Step 2.1: Define GraphQL Query

**File:** `nextjs/src/lib/wordpress/queries/services.ts`

```typescript
export const GET_SERVICES_DROPDOWN_DATA = gql`
  query GetServicesDropdownData {
    serviceCategories(
      first: 20
      where: { hideEmpty: true, orderby: NAME, order: ASC }
    ) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    
    services(
      first: 100
      where: { status: PUBLISH, orderby: { field: TITLE, order: ASC } }
    ) {
      nodes {
        id
        databaseId
        title
        slug
        uri
        serviceCategories {
          nodes {
            id
            slug
          }
        }
        serviceFields {
          price
          features
        }
      }
    }
    
    headerSettings {
      featuredService {
        ... on Service {
          id
          databaseId
          title
          slug
          uri
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          serviceFields {
            price
            features
          }
        }
      }
    }
  }
`;
```

#### Step 2.2: Create API Function

**File:** `nextjs/src/lib/wordpress/api.ts`

```typescript
export async function getServicesDropdownData(): Promise<ServicesDropdownData> {
  try {
    const { data } = await apolloClient.query({
      query: GET_SERVICES_DROPDOWN_DATA,
      fetchPolicy: 'network-only', // Always fetch fresh
    });
    
    return {
      categories: data?.serviceCategories?.nodes || [],
      services: data?.services?.nodes || [],
      featuredService: data?.headerSettings?.featuredService || null,
    };
  } catch (error) {
    console.error('[getServicesDropdownData] Error:', error);
    return {
      categories: [],
      services: [],
      featuredService: null,
    };
  }
}
```

#### Step 2.3: Implement Dropdown Component

**File:** `nextjs/src/components/figma/header/service-dropdown.tsx`

```typescript
'use client';

import { useState } from 'react';

interface Service {
  id: string;
  title: string;
  href: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function ServiceDropdown({
  categories,
  services,
  featuredService,
}: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const activeServices = services[activeCategory] || [];
  
  return (
    <div className="absolute left-0 top-full z-50 flex h-[550px] w-full bg-white shadow-lg">
      {/* Left: Category Tabs */}
      <div className="w-[360px] bg-unident-bgElements">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={activeCategory === category.id ? 'active' : ''}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Center: Services List */}
      <div className="flex-1">
        <h2>{categories.find(c => c.id === activeCategory)?.name}</h2>
        {activeServices.map((service) => (
          <a key={service.id} href={service.href}>
            {service.title}
          </a>
        ))}
      </div>
      
      {/* Right: Featured Service */}
      <div>
        <FeaturedServiceCard {...featuredService} />
      </div>
    </div>
  );
}
```

#### Step 2.4: Integrate in Navigation

**File:** `nextjs/src/components/figma/header/navigation.tsx`

```typescript
export function Navigation({ servicesDropdown }: Props) {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  
  // Transform WordPress data
  const categories = servicesDropdown?.categories.map(cat => ({
    id: cat.databaseId.toString(),
    name: cat.name,
    slug: cat.slug,
  })) || [];
  
  const servicesByCategory: Record<string, Service[]> = {};
  servicesDropdown?.services.forEach(service => {
    service.serviceCategories?.nodes.forEach(cat => {
      const categoryId = categories.find(c => c.slug === cat.slug)?.id;
      if (categoryId) {
        if (!servicesByCategory[categoryId]) {
          servicesByCategory[categoryId] = [];
        }
        servicesByCategory[categoryId].push({
          id: service.id,
          title: service.title,
          href: service.uri,
        });
      }
    });
  });
  
  return (
    <nav>
      <div
        onMouseEnter={() => setIsServicesOpen(true)}
        onMouseLeave={() => setIsServicesOpen(false)}
      >
        <a href="/services">Услуги</a>
        
        {isServicesOpen && (
          <ServiceDropdown
            categories={categories}
            services={servicesByCategory}
            featuredService={featuredService}
          />
        )}
      </div>
    </nav>
  );
}
```

---

### Phase 3: Clear Next.js Cache

```bash
# Stop Next.js
# (Ctrl+C in terminal)

# Clear .next cache
rm -rf nextjs/.next/

# Restart Next.js
cd nextjs && npm run dev
```

---

### Phase 4: Browser Testing & Verification

#### Step 4.1: Navigate to Page

```typescript
// Using Playwright MCP
browser_navigate({ url: "http://localhost:3000" })
```

**Wait for:** Page loads, console shows no errors.

#### Step 4.2: Get Initial Snapshot

```typescript
browser_snapshot()
```

**Find:** Services link reference (e.g., `ref=e81`).

#### Step 4.3: Trigger Dropdown

```typescript
browser_hover({ 
  element: "Services link", 
  ref: "e81" 
})
```

**Expected:** Dropdown appears with categories.

#### Step 4.4: Verify Dropdown Content

```typescript
browser_snapshot()
```

**Check in snapshot:**
- All 7 categories visible
- Active category shows services
- Featured service card displays

#### Step 4.5: Check Console Logs

```typescript
browser_console_messages()
```

**Look for:**
- `[Navigation] DEBUG: {categoriesCount: 7, servicesByCategoryCount: 7, ...}`
- No `[ERROR]` messages
- Data loaded successfully

#### Step 4.6: Take Screenshot

```typescript
browser_take_screenshot({ 
  filename: "services-dropdown-working.png" 
})
```

**Save to:** `.playwright-mcp/services-dropdown-working.png`

---

## Verification Checklist

### Backend (WordPress)

- [ ] ACF field group registered in MU-plugin
- [ ] `show_in_graphql: 1` on field group and fields
- [ ] Test data created (categories + services)
- [ ] Services assigned to categories
- [ ] ACF fields filled (price, features)
- [ ] GraphQL query returns all data
- [ ] All caches cleared

### Frontend (Next.js)

- [ ] GraphQL query includes all needed fields
- [ ] API function uses `fetchPolicy: 'network-only'`
- [ ] Data transformed correctly for components
- [ ] Categories grouped by ID
- [ ] Services filtered by category
- [ ] Featured service parsed correctly
- [ ] Dropdown component renders all categories
- [ ] Hover triggers dropdown
- [ ] Active category shows services

### Browser Testing

- [ ] Page loads without errors
- [ ] Dropdown appears on hover
- [ ] All 7 categories visible
- [ ] Services show for each category
- [ ] Featured service card displays
- [ ] No console errors
- [ ] Screenshot captured for reporting

---

## Common Issues & Solutions

### Issue 1: "serviceFields" Not in GraphQL

**Symptoms:**
- Query fails with "Cannot query field 'serviceFields'"
- Fields show in admin but not GraphQL

**Solution:**
```bash
# 1. Check MU-plugin registration
# 2. Verify show_in_graphql: 1 on all fields
# 3. Clear schema cache
docker exec -it template-wordpress-1 wp graphql clear-schema-cache
docker restart template-wordpress-1
```

### Issue 2: Dropdown Shows Only 2 Categories (Fallback)

**Symptoms:**
- Dropdown appears but shows mock data
- Console shows: `hasData: false`

**Solution:**
```bash
# 1. Clear Next.js cache
rm -rf nextjs/.next/

# 2. Restart Next.js completely
pkill -f "node.*next"
cd nextjs && npm run dev

# 3. Hard refresh browser (Ctrl+Shift+R)
```

### Issue 3: Services Not Grouped by Category

**Symptoms:**
- All categories show
- Services list is empty or mixed

**Solution:**
```typescript
// Check services have category assignment:
serviceCategories {
  nodes {
    id
    slug  // ← Must match category slug
  }
}

// Verify grouping logic uses correct ID/slug matching
```

### Issue 4: Featured Service is Null

**Symptoms:**
- Dropdown shows but featured card missing
- `featuredService: null` in console

**Solution:**
```bash
# 1. Check ACF Option Page has service selected
# Go to: WP Admin → Header Settings → Featured Service

# 2. Verify GraphQL query includes featuredService
headerSettings {
  featuredService {
    ... on Service {
      # fields
    }
  }
}

# 3. Clear caches
```

---

## Performance Considerations

### Optimize GraphQL Query

```typescript
// ✅ Fetch only needed fields
serviceFields {
  price
  features
}

// ❌ Don't fetch everything
... on Service {
  # all fields including large ones
}
```

### Lazy Load Dropdown Content

```typescript
// Load dropdown data only when needed
const [dropdownData, setDropdownData] = useState(null);

const loadDropdown = async () => {
  if (!dropdownData) {
    const data = await getServicesDropdownData();
    setDropdownData(data);
  }
};

// Trigger on hover
onMouseEnter={loadDropdown}
```

### Cache Strategy

```typescript
// Use appropriate cache policy
fetchPolicy: 'cache-first'  // For static content
fetchPolicy: 'network-only'  // For dynamic content (option pages)
```

---

## Related Skills

- **acf-graphql-manual-registration** - Step 1.1 details
- **wordpress-test-data-creation** - Step 1.2 details
- **wordpress-nextjs-cache-clearing** - Step 1.3 details
- **playwright-browser-testing** - Phase 4 details
- **graphql-queries** - Query optimization
- **design-system-usage** - Styling components

---

## Complete Example Output

**WordPress:**
```
Categories: 7
- Implantation (10 services)
- Treatment (8 services)
- Prosthetics (12 services)
- Whitening (6 services)
- Braces (9 services)
- Children (7 services)
- Surgery (11 services)

Total Services: 63
Featured Service: "Лечение кариеса" (3 500 ₽)
```

**GraphQL:**
```json
{
  "data": {
    "serviceCategories": { "nodes": [/* 7 categories */] },
    "services": { "nodes": [/* 63 services */] },
    "headerSettings": {
      "featuredService": { "title": "Лечение кариеса" }
    }
  }
}
```

**Frontend:**
```typescript
console.log('[Navigation] DEBUG:', {
  categoriesCount: 7,
  servicesByCategoryCount: 7,
  hasFeaturedService: true,
  hasData: true
});
```

**Browser:**
- ✅ Dropdown shows on hover
- ✅ All 7 categories visible
- ✅ Services filtered by category
- ✅ Featured service card displays
- ✅ No console errors

---

**Status:** ✅ Complete workflow tested
**Version:** 1.0.0
**Created:** 2026-01-21
**Last Updated:** 2026-01-21
