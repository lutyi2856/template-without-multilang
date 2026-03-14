---
name: acf-menu-items
description: ACF custom fields for WordPress nav_menu_item, SVG icon saving, sanitization bypass. Use when working with menu item custom fields, saving SVG/HTML in menu items, or debugging ACF menu save issues.
---

# ACF Custom Fields for Menu Items (nav_menu_item)

## Key Difference: POST Data Location

**CRITICAL:** ACF for menu items uses a DIFFERENT POST array!

```php
// ❌ WRONG - This is for regular posts/pages
$_POST['acf']['field_xxx']

// ✅ CORRECT - This is for menu items
$_POST['menu-item-acf'][$menu_item_id]['field_xxx']
```

## Registering ACF Fields for Menu Items

### Field Group Location

```php
acf_add_local_field_group(array(
    'key' => 'group_menu_item_settings',
    'title' => 'Menu Item Settings',
    'fields' => array(
        array(
            'key' => 'field_menu_icon',
            'label' => 'Icon (SVG code)',
            'name' => 'icon',
            'type' => 'textarea',
            'instructions' => 'Paste SVG code',
            'rows' => 6,
            'new_lines' => '',  // Don't convert to <br>
        ),
        array(
            'key' => 'field_badge_count',
            'label' => 'Badge Count',
            'name' => 'badge_count',
            'type' => 'number',
        ),
    ),
    // ✅ Location for menu items
    'location' => array(
        array(
            array(
                'param' => 'nav_menu_item',
                'operator' => '==',
                'value' => 'all',
            ),
        ),
    ),
));
```

## Saving SVG/HTML Without Sanitization

### Problem

WordPress and ACF sanitize HTML/SVG by default, stripping tags.

### Solution: ACF-Specific Filters

```php
/**
 * Bypass ACF sanitization for SVG fields
 * 
 * IMPORTANT: wp_kses_allowed_html does NOT work for ACF!
 * Must use ACF-specific filters.
 */

// Filter by field key (most specific, recommended)
add_filter('acf/update_value/key=field_menu_icon', function($value, $post_id, $field) {
    return $value;  // Return without sanitization
}, 10, 3);

// Allow unfiltered HTML for administrators
add_filter('acf/allow_unfiltered_html', function($allow) {
    if (current_user_can('administrator')) {
        return true;
    }
    return $allow;
});
```

### Custom Save Hook (if ACF filters don't work)

```php
/**
 * Custom save via wp_update_nav_menu_item hook
 * 
 * ACF data is in $_POST['menu-item-acf'][$menu_item_id]
 */
add_action('wp_update_nav_menu_item', function($menu_id, $menu_item_db_id) {
    // Check for our field in the correct POST location
    if (isset($_POST['menu-item-acf'][$menu_item_db_id]['field_menu_icon'])) {
        $svg_value = $_POST['menu-item-acf'][$menu_item_db_id]['field_menu_icon'];
        
        // Validate it's SVG
        if (!empty($svg_value) && strpos($svg_value, '<svg') !== false) {
            // Remove WordPress magic quotes
            $svg_value = stripslashes($svg_value);
            // Save directly to post_meta
            update_post_meta($menu_item_db_id, 'icon', $svg_value);
        }
    }
}, 99, 2);  // Priority 99 = after ACF
```

## Security: Why Direct $_POST Access is Safe Here

### Context Matters

The `wp_update_nav_menu_item` hook is called **ONLY** from:

```
wp-admin/nav-menus.php
  → check_admin_referer('update-nav_menu', 'update-nav-menu-nonce')  ← NONCE VERIFIED!
    → wp_update_nav_menu()
      → wp_update_nav_menu_item()
        → do_action('wp_update_nav_menu_item', ...)  ← YOUR HOOK
```

**Before your hook executes:**
- ✅ Nonce already verified by WordPress
- ✅ Capability `edit_theme_options` already checked
- ✅ Only administrators can edit menus

**Conclusion:** No need to re-verify nonce in hook - WordPress already did it.

## Exposing Menu Item Fields to GraphQL

### Register Custom GraphQL Field

```php
function register_menu_icon_graphql_field() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    register_graphql_field('MenuItem', 'icon', [
        'type' => 'String',
        'description' => 'SVG icon code',
        'resolve' => function($menu_item, $args, $context, $info) {
            // WPGraphQL MenuItem model uses databaseId
            $post_id = $menu_item->databaseId ?? null;
            
            if ($post_id) {
                $icon = get_post_meta($post_id, 'icon', true);
                return !empty($icon) ? $icon : null;
            }
            
            return null;
        }
    ]);
}
add_action('graphql_register_types', 'register_menu_icon_graphql_field');
```

### GraphQL Query

```graphql
query GetMenu {
  menu(id: "main-menu", idType: SLUG) {
    menuItems {
      nodes {
        label
        url
        icon  # Custom ACF field
      }
    }
  }
}
```

## Frontend: Rendering Inline SVG

```typescript
// types/menu.ts
interface MenuItem {
  label: string;
  url: string;
  icon?: string | null;  // SVG code
}

// components/nav-item.tsx
function NavItem({ item }: { item: MenuItem }) {
  return (
    <a href={item.url} className="flex items-center gap-2">
      {/* Render inline SVG */}
      {item.icon && (
        <div 
          className="w-5 h-5"
          dangerouslySetInnerHTML={{ __html: item.icon }}
        />
      )}
      <span>{item.label}</span>
    </a>
  );
}
```

## Debugging: Log POST Data

### Create Debug MU-Plugin

```php
// wp-content/mu-plugins/debug-acf-menu.php
<?php
/**
 * Temporary debug plugin - DELETE after debugging!
 */

add_action('wp_update_nav_menu', function($menu_id) {
    $log = "=== MENU SAVE ===\n";
    $log .= "Menu ID: $menu_id\n";
    $log .= "POST data:\n";
    $log .= print_r($_POST, true);
    
    file_put_contents('/tmp/acf-menu-debug.log', $log);
}, 10, 1);
```

### Check Debug Log

```bash
docker exec container_name cat /tmp/acf-menu-debug.log
```

### Expected POST Structure

```php
[menu-item-acf] => Array
(
    [34] => Array  // Menu item ID
    (
        [field_menu_icon] => <svg>...</svg>
        [field_badge_count] => 5
    )
    [35] => Array  // Another menu item
    (
        [field_menu_icon] => 
        [field_badge_count] => 
    )
)
```

## Common Issues

### Issue 1: SVG Stripped After Save

**Cause:** ACF sanitization removes HTML/SVG

**Fix:** Add `acf/update_value/key=field_xxx` filter

### Issue 2: SVG Shows in Admin But Not in GraphQL

**Cause:** GraphQL resolver not registered

**Fix:** Add `register_graphql_field` on `graphql_register_types` hook

### Issue 3: ACF Filters Not Working

**Cause:** Filter priority too low or wrong filter name

**Fix:**
1. Use correct field key: `acf/update_value/key=field_menu_icon`
2. Use priority 10 or higher
3. Restart WordPress after changes

### Issue 4: File Changes Not Applied in Docker

**Cause:** Docker volume not syncing

**Fix:** Manually copy file to container:

```bash
docker cp wp-content/mu-plugins/file.php container:/var/www/html/wp-content/mu-plugins/file.php
```

## Full Working Example

```php
// wp-content/mu-plugins/menu-icons.php
<?php
/**
 * ACF Menu Item Icons with GraphQL Support
 */

// 1. Register ACF field
add_action('acf/init', function() {
    if (!function_exists('acf_add_local_field_group')) return;
    
    acf_add_local_field_group(array(
        'key' => 'group_menu_icons',
        'title' => 'Menu Icons',
        'fields' => array(
            array(
                'key' => 'field_menu_icon',
                'label' => 'Icon (SVG)',
                'name' => 'icon',
                'type' => 'textarea',
                'new_lines' => '',
            ),
        ),
        'location' => array(
            array(array('param' => 'nav_menu_item', 'operator' => '==', 'value' => 'all')),
        ),
    ));
});

// 2. Bypass sanitization
add_filter('acf/update_value/key=field_menu_icon', function($value) {
    return $value;
}, 10, 3);

add_filter('acf/allow_unfiltered_html', function($allow) {
    return current_user_can('administrator');
});

// 3. Custom save hook (backup)
add_action('wp_update_nav_menu_item', function($menu_id, $menu_item_db_id) {
    if (isset($_POST['menu-item-acf'][$menu_item_db_id]['field_menu_icon'])) {
        $svg = $_POST['menu-item-acf'][$menu_item_db_id]['field_menu_icon'];
        if (!empty($svg) && strpos($svg, '<svg') !== false) {
            update_post_meta($menu_item_db_id, 'icon', stripslashes($svg));
        }
    }
}, 99, 2);

// 4. GraphQL field
add_action('graphql_register_types', function() {
    if (!function_exists('register_graphql_field')) return;
    
    register_graphql_field('MenuItem', 'icon', [
        'type' => 'String',
        'resolve' => function($menu_item) {
            $id = $menu_item->databaseId ?? null;
            return $id ? get_post_meta($id, 'icon', true) ?: null : null;
        }
    ]);
});
```

## Best Practices

### ✅ DO:

1. Use `acf/update_value/key=field_xxx` (specific filter)
2. Check `$_POST['menu-item-acf'][$id]` for menu item ACF data
3. Use `databaseId` in GraphQL resolvers for menu items
4. Add `stripslashes()` when reading from POST
5. Restart WordPress after mu-plugin changes

### ❌ DON'T:

1. ❌ Use `wp_kses_allowed_html` for ACF (doesn't work!)
2. ❌ Check `$_POST['acf']` for menu items (wrong location!)
3. ❌ Re-verify nonce in `wp_update_nav_menu_item` hook (already done)
4. ❌ Use broad filters like `acf/update_value/name=icon` (affects all 'icon' fields)
5. ❌ Forget to copy files to Docker container
