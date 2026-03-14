---
name: acf-option-pages-manual-graphql
description: Manual GraphQL registration for ACF Option Pages, repeater fields, textarea for inline SVG. Use when working with ACF Option Pages, custom types not auto-registered, or need to expose non-post data to GraphQL.
---

# ACF Option Pages with Manual GraphQL Registration

## The Problem

ACF Option Pages DO NOT automatically expose fields to WPGraphQL v2.
**Manual registration required** for all option page fields.

## Creating ACF Option Page

### Register Option Page

```php
// wp-content/mu-plugins/unident-acf-fields.php
if (function_exists('acf_add_options_page')) {
    acf_add_options_page(array(
        'page_title' => 'Header Settings',
        'menu_title' => 'Header Settings',
        'menu_slug' => 'header-settings',
        'capability' => 'edit_posts',
        'redirect' => false,
        'show_in_graphql' => true,
    ));
}
```

## Adding Fields with PHP

### Simple Fields

```php
acf_add_local_field_group(array(
    'key' => 'group_header_settings',
    'title' => 'Header Settings',
    'fields' => array(
        array(
            'key' => 'field_phone',
            'label' => 'Phone',
            'name' => 'phone',
            'type' => 'text',
            'show_in_graphql' => 1,
            'graphql_field_name' => 'phone',
        ),
        array(
            'key' => 'field_email',
            'label' => 'Email',
            'name' => 'email',
            'type' => 'email',
            'show_in_graphql' => 1,
            'graphql_field_name' => 'email',
        ),
    ),
    'location' => array(
        array(
            array(
                'param' => 'options_page',
                'operator' => '==',
                'value' => 'header-settings',
            ),
        ),
    ),
));
```

### Repeater with Textarea (for Inline SVG)

```php
// Social Links repeater with inline SVG support
array(
    'key' => 'field_social_links',
    'label' => 'Social Links',
    'name' => 'social_links',
    'type' => 'repeater',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'socialLinks',
    'layout' => 'table',
    'button_label' => 'Add Social Link',
    'sub_fields' => array(
        array(
            'key' => 'field_social_name',
            'label' => 'Name',
            'name' => 'name',
            'type' => 'text',
            'required' => 1,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'name',
        ),
        array(
            'key' => 'field_social_icon',
            'label' => 'Icon (SVG code)',
            'name' => 'icon',
            'type' => 'textarea',
            'instructions' => 'Paste SVG code (e.g. <svg>...</svg>)',
            'required' => 1,
            'rows' => 8,
            'new_lines' => '', // Don't convert to <br>
            'show_in_graphql' => 1,
            'graphql_field_name' => 'icon',
        ),
        array(
            'key' => 'field_social_url',
            'label' => 'URL',
            'name' => 'url',
            'type' => 'url',
            'required' => 1,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'url',
        ),
    ),
),
```

## Manual GraphQL Registration (REQUIRED!)

### Step 1: Register Custom Object Type

```php
add_action('graphql_register_types', function() {
    if (!function_exists('register_graphql_object_type')) return;

    // Register main settings type
    register_graphql_object_type('HeaderSettings', [
        'description' => __('Header settings from ACF Option Page', 'unident'),
        'fields' => [
            'phone' => [
                'type' => 'String',
                'description' => __('Phone number', 'unident'),
            ],
            'email' => [
                'type' => 'String',
                'description' => __('Email address', 'unident'),
            ],
            'socialLinks' => [
                'type' => ['list_of' => 'HeaderSettingsSocialLink'],
                'description' => __('Social media links', 'unident'),
            ],
        ],
    ]);

    // Register repeater item type
    register_graphql_object_type('HeaderSettingsSocialLink', [
        'description' => __('Social media link', 'unident'),
        'fields' => [
            'name' => [
                'type' => 'String',
                'description' => __('Social network name', 'unident'),
            ],
            'icon' => [
                'type' => 'String',
                'description' => __('SVG icon code', 'unident'),
            ],
            'url' => [
                'type' => 'String',
                'description' => __('Social network URL', 'unident'),
            ],
        ],
    ]);
});
```

### Step 2: Register Root Query Field

```php
add_action('graphql_register_types', function() {
    if (!function_exists('register_graphql_field')) return;

    register_graphql_field('RootQuery', 'headerSettings', [
        'type' => 'HeaderSettings',
        'description' => __('Header settings', 'unident'),
        'resolve' => function() {
            // Get simple fields
            $phone = get_field('phone', 'options');
            $email = get_field('email', 'options');
            
            // Get repeater field
            $social_links = get_field('social_links', 'options');
            
            // Format repeater data
            $formatted_social_links = null;
            if ($social_links && is_array($social_links)) {
                $formatted_social_links = array_map(function($link) {
                    return [
                        'name' => $link['name'] ?? null,
                        'icon' => $link['icon'] ?? null, // SVG string
                        'url' => $link['url'] ?? null,
                    ];
                }, $social_links);
            }
            
            return [
                'phone' => $phone,
                'email' => $email,
                'socialLinks' => $formatted_social_links,
            ];
        }
    ]);
});
```

### Step 3: For post_object Fields (Relationships)

```php
// For post_object or relationship fields
$featured_promotion = get_field('featured_promotion', 'options');

return [
    'featuredPromotion' => $featured_promotion 
        ? \WPGraphQL\Data\DataSource::resolve_post_object(
            $featured_promotion->ID, 
            \WPGraphQL::get_app_context()
          ) 
        : null,
];
```

## GraphQL Query

```graphql
query GetHeaderSettings {
  headerSettings {
    phone
    email
    socialLinks {
      name
      icon  # Returns SVG string directly
      url
    }
  }
}
```

## Frontend: Next.js Server Component

```typescript
// lib/wordpress/api-header.ts
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const GET_HEADER_SETTINGS = gql`
  query GetHeaderSettings {
    headerSettings {
      phone
      email
      socialLinks {
        name
        icon
        url
      }
    }
  }
`;

export async function fetchHeaderSettings() {
  const client = new ApolloClient({
    uri: process.env.WORDPRESS_GRAPHQL_URL,
    cache: new InMemoryCache(),
  });

  const { data } = await client.query({
    query: GET_HEADER_SETTINGS,
    fetchPolicy: 'network-only', // Always fetch fresh
  });

  return data.headerSettings;
}
```

## Rendering Inline SVG

```typescript
// components/social-links.tsx
interface SocialLink {
  name: string;
  icon: string; // SVG code
  url: string;
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex gap-2">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          aria-label={link.name}
          className="w-[37px] h-[37px] bg-white rounded-full flex items-center justify-center"
        >
          {/* Inline SVG for zero HTTP requests */}
          <div dangerouslySetInnerHTML={{ __html: link.icon }} />
        </a>
      ))}
    </div>
  );
}
```

## Populating Data via PHP Script

```php
<?php
/**
 * Add data to ACF Option Page
 */
define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

$social_links = array(
    array(
        'name' => 'Telegram',
        'icon' => '<svg width="20" height="20">...</svg>',
        'url' => 'https://t.me/yourcompany',
    ),
    array(
        'name' => 'Instagram',
        'icon' => '<svg width="20" height="20">...</svg>',
        'url' => 'https://instagram.com/yourcompany',
    ),
);

// Update repeater field
update_field('social_links', $social_links, 'options');

// Update simple fields
update_field('phone', '+7 (495) 123-45-67', 'options');
update_field('email', 'info@company.com', 'options');

echo "✓ Data added successfully!\n";
```

**Run inside Docker:**

```bash
docker cp scripts/add-data.php wp-container:/tmp/
docker exec wp-container php /tmp/add-data.php
```

## Troubleshooting

### Field Not in GraphQL Schema

**Symptoms:** Field doesn't appear in GraphQL query

**Fixes:**
1. ✅ Add `show_in_graphql => 1` to field definition
2. ✅ Create manual GraphQL registration
3. ✅ Clear WPGraphQL cache: `docker exec wp wp cache flush --allow-root`
4. ✅ Restart WordPress container: `docker restart wp-container`

### Empty Data Returned

**Symptoms:** Query returns null or empty array

**Fixes:**
1. ✅ Check data exists: `get_field('field_name', 'options')`
2. ✅ Verify field name matches ACF definition
3. ✅ Check resolve function returns correct format
4. ✅ For repeater: ensure array is properly formatted

### TypeError in resolve()

**Symptoms:** `Cannot read properties of undefined`

**Fixes:**
```php
// Always check if field exists and is array
$social_links = get_field('social_links', 'options');

if ($social_links && is_array($social_links)) {
    // Process data
} else {
    return null; // or empty array
}
```

### SVG Not Rendering

**Symptoms:** SVG shows as text or doesn't display

**Fixes:**
1. ✅ Use `dangerouslySetInnerHTML={{ __html: icon }}`
2. ✅ Ensure SVG is complete (includes `<svg>` tags)
3. ✅ Check `new_lines => ''` in textarea field config
4. ✅ Verify SVG code doesn't have escaped characters

## Cache Clearing

### WordPress Cache

```bash
# WPGraphQL schema cache
docker exec wp-container wp graphql clear-schema-cache --allow-root

# Object cache
docker exec wp-container wp cache flush --allow-root

# Transients
docker exec wp-container wp transient delete --all --allow-root
```

### Next.js Cache

```bash
# Clear .next directory
rm -rf .next/

# Restart dev server
npm run dev
```

## Best Practices

### ✅ DO:

1. Always use `show_in_graphql => 1` on fields
2. Manual registration for ALL option page fields
3. Use `textarea` with `new_lines => ''` for inline SVG
4. Check if data exists before processing in resolve()
5. Use `network-only` fetchPolicy for dynamic data

### ❌ DON'T:

1. ❌ Assume option page fields auto-register to GraphQL
2. ❌ Use `get_option()` - use `get_field('field', 'options')`
3. ❌ Forget to format repeater data in resolve()
4. ❌ Use `image` field for icons (creates HTTP requests)
5. ❌ Skip cache clearing when debugging

## Key Points

- **Option Pages ≠ Posts**: Require manual GraphQL registration
- **Repeater Fields**: Need custom object type registration
- **Inline SVG**: Use `textarea` + `dangerouslySetInnerHTML` for performance
- **Always Fresh**: Use `fetchPolicy: 'network-only'` for option page data
- **Cache Everything**: Clear WordPress + Next.js cache when debugging
