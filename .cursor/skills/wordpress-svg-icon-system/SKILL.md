---
name: wordpress-svg-icon-system
description: Full workflow for SVG icon management in headless WordPress + Next.js. Use when adding icon picker fields to ACF, allowing admins to upload custom SVG icons via Media Library, exposing SVG content through WPGraphQL, rendering dynamic icons in Next.js, or migrating existing SVG files into WordPress.
---

# WordPress SVG Icon System

## When to Use

- Need to let admins upload custom SVG icons without deploying code
- ACF Select fields for icons need dynamic choices from Media Library
- New icon types need to be added to the icon picker
- Icons need to be rendered inline (zero HTTP requests) in Next.js
- Migrating existing SVG files from `nextjs/src/icons/` to WordPress Media Library
- Adding icon picker support to a new ACF field or CPT

## Architecture Overview

```
Admin uploads SVG → Media Library
                       ↓ acf/load_field filter
ACF Select field → hybrid choices (built-in + Media Library)
                       ↓
WordPress saves slug: "media-{ID}" or built-in name like "telegram"
                       ↓ WPGraphQL
GraphQL: icon (slug) + iconSvg (raw SVG markup)
                       ↓
Next.js DynamicIcon component:
  - built-in slug → iconMap → React SVG component (zero overhead)
  - "media-*" slug + iconSvg → dangerouslySetInnerHTML (inline SVG)
```

## Quick Reference

| Slug format | Storage | Frontend render |
|---|---|---|
| `telegram`, `tooth`, etc. | Hardcoded built-ins | `iconMap` → React component |
| `media-773`, `media-42`, etc. | WordPress Media Library | `iconSvg` GraphQL field → inline HTML |

## Part 1: WordPress — SVG Upload + Dynamic Choices + GraphQL

### Step 1: Create mu-plugin `unident-svg-icons.php`

File: `wp-content/mu-plugins/unident-svg-icons.php`

The plugin does three things:
1. Allows SVG upload for administrators + sanitization
2. Dynamically injects Media Library SVGs into all ACF icon Select fields
3. Registers `iconSvg` companion GraphQL fields

```php
<?php
/**
 * Plugin Name: УниДент SVG Icons
 * Description: SVG upload support, dynamic icon choices from Media Library, and GraphQL iconSvg fields
 * Version: 1.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// === 1. SVG UPLOAD SUPPORT ===

// Allow SVG for admins only
add_filter( 'upload_mimes', function ( $mimes ) {
    if ( current_user_can( 'administrator' ) ) {
        $mimes['svg']  = 'image/svg+xml';
        $mimes['svgz'] = 'image/svg+xml';
    }
    return $mimes;
} );

// Fix MIME type detection
add_filter( 'wp_check_filetype_and_ext', function ( $data, $file, $filename, $mimes ) {
    if ( 'svg' === strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) ) ) {
        $data['type'] = 'image/svg+xml';
        $data['ext']  = 'svg';
    }
    return $data;
}, 10, 4 );

// Sanitize SVG on upload
add_filter( 'wp_handle_upload_prefilter', function ( $file ) {
    if ( 'image/svg+xml' !== $file['type'] ) return $file;
    $content = file_get_contents( $file['tmp_name'] );
    $sanitized = unident_sanitize_svg( $content );
    if ( false === $sanitized ) {
        $file['error'] = 'SVG содержит недопустимый контент.';
        return $file;
    }
    file_put_contents( $file['tmp_name'], $sanitized );
    return $file;
} );

function unident_sanitize_svg( $svg ) {
    $dangerous = [ 'script', 'use', 'foreignObject', 'set', 'animate', 'animateTransform', 'animateMotion' ];
    foreach ( $dangerous as $tag ) {
        $svg = preg_replace( "#<{$tag}\\b[^>]*>.*?</{$tag}>#si", '', $svg );
        $svg = preg_replace( "#<{$tag}\\b[^>]*/>#si", '', $svg );
    }
    $svg = preg_replace( '/\bon\w+\s*=\s*("[\^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $svg );
    $svg = preg_replace( '/xlink:href\s*=\s*"(?!#)[^"]*"/i', '', $svg );
    $svg = preg_replace( '/href\s*=\s*"(?!#)[^"]*"/i', '', $svg );
    return ( stripos( $svg, '<svg' ) !== false ) ? $svg : false;
}

// SVG thumbnails in Media Library
add_filter( 'wp_prepare_attachment_for_js', function ( $response, $attachment ) {
    if ( 'image/svg+xml' === $response['mime'] ) {
        $url = $response['url'];
        $response['sizes'] = [
            'full'      => [ 'url' => $url, 'width' => 100, 'height' => 100 ],
            'thumbnail' => [ 'url' => $url, 'width' => 150, 'height' => 150 ],
            'medium'    => [ 'url' => $url, 'width' => 300, 'height' => 300 ],
        ];
    }
    return $response;
}, 10, 2 );


// === 2. DYNAMIC ACF CHOICES ===

// Built-in icon list (must match keys in Next.js iconMap)
function unident_get_builtin_icon_choices() {
    return [
        'percent'        => '% Процент (скидка)',
        'ruble'          => '₽ Рубль',
        'installment'    => 'Рассрочка',
        'whatsapp'       => 'WhatsApp',
        'vk'             => 'VKontakte',
        'telegram'       => 'Telegram',
        'instagram'      => 'Instagram',
        'star'           => '★ Звезда',
        'clinic-dot'     => 'Точка (клиника)',
        'arrow-up-right' => '↗ Стрелка',
        'menu'           => 'Меню',
        'location'       => '📍 Локация',
        'phone'          => '📞 Телефон',
        'clock'          => '🕐 Часы',
        'tooth'          => '🦷 Зуб',
        'implant'        => 'Имплант',
        'orthodontics'   => 'Ортодонтия',
        'surgery'        => 'Хирургия',
        'hygiene'        => 'Гигиена',
        'children'       => 'Детская стоматология',
        'aesthetic'      => 'Эстетика',
        'diagnostic'     => 'Диагностика',
        'whitening'      => 'Отбеливание',
        'prosthetics'    => 'Протезирование',
        'periodontics'   => 'Пародонтология',
        'endodontics'    => 'Эндодонтия',
    ];
}

// Get SVG attachments from Media Library (cached 5 min)
function unident_get_media_svg_choices() {
    $cached = wp_cache_get( 'unident_svg_icon_choices' );
    if ( false !== $cached ) return $cached;

    $svgs = get_posts( [
        'post_type'      => 'attachment',
        'post_mime_type' => 'image/svg+xml',
        'posts_per_page' => 200,
        'post_status'    => 'inherit',
        'orderby'        => 'title',
        'order'          => 'ASC',
    ] );

    $choices = [];
    foreach ( $svgs as $svg ) {
        $slug = 'media-' . $svg->ID;
        $title = $svg->post_title ?: pathinfo( get_attached_file( $svg->ID ), PATHINFO_FILENAME );
        $choices[ $slug ] = '📎 ' . $title;
    }

    wp_cache_set( 'unident_svg_icon_choices', $choices, '', 300 );
    return $choices;
}

// Combined choices: built-in + Media Library
function unident_get_all_icon_choices() {
    $builtin = unident_get_builtin_icon_choices();
    $media   = unident_get_media_svg_choices();
    if ( empty( $media ) ) return $builtin;
    return [
        'Встроенные иконки'                   => $builtin,
        'Пользовательские (из Media Library)' => $media,
    ];
}

// Invalidate cache on attachment changes
foreach ( [ 'add_attachment', 'delete_attachment', 'edit_attachment' ] as $hook ) {
    add_action( $hook, function () { wp_cache_delete( 'unident_svg_icon_choices' ); } );
}

// ACF field keys that should get dynamic choices
function unident_get_icon_field_keys() {
    return [
        'field_social_icon',
        'field_footer_social_icon',
        'field_contacts_adv_item_icon',
        'field_menu_icon',
        'field_promotion_action_icon',
        'field_service_category_icon',
    ];
}

add_filter( 'acf/load_field', function ( $field ) {
    if ( in_array( $field['key'], unident_get_icon_field_keys(), true ) ) {
        $field['choices'] = unident_get_all_icon_choices();
    }
    return $field;
} );


// === 3. GRAPHQL iconSvg FIELDS ===

// Resolve SVG markup from slug
// - Built-in slugs (no "media-" prefix) → return null (frontend uses iconMap)
// - Media slugs ("media-{ID}") → read SVG file and return markup
function unident_resolve_icon_svg( $icon_slug ) {
    if ( empty( $icon_slug ) || 0 !== strpos( $icon_slug, 'media-' ) ) return null;
    $id = (int) str_replace( 'media-', '', $icon_slug );
    if ( $id <= 0 ) return null;
    $file = get_attached_file( $id );
    if ( ! $file || ! file_exists( $file ) ) return null;
    if ( 'image/svg+xml' !== get_post_mime_type( $id ) ) return null;
    return file_get_contents( $file ) ?: null;
}

add_action( 'graphql_register_types', function () {
    if ( ! function_exists( 'register_graphql_field' ) ) return;

    // Adjust type names and resolve logic per your project's GraphQL schema.
    // These are examples from the УниДент project:

    $option_page_fields = [
        'HeaderSettingsSocialLink' => 'icon',
        'FooterSettingsSocialLink' => 'icon',
        'ContactsAdvantageItem'    => 'icon',
    ];

    foreach ( $option_page_fields as $type => $acf_key ) {
        register_graphql_field( $type, 'iconSvg', [
            'type'        => 'String',
            'description' => 'Inline SVG markup for custom icons from Media Library',
            'resolve'     => function ( $source ) use ( $acf_key ) {
                return unident_resolve_icon_svg( $source[ $acf_key ] ?? null );
            },
        ] );
    }

    // MenuItem (stores icon in post meta)
    register_graphql_field( 'MenuItem', 'iconSvg', [
        'type'    => 'String',
        'resolve' => function ( $menu_item ) {
            $slug = get_post_meta( $menu_item->databaseId ?? 0, 'icon', true );
            return unident_resolve_icon_svg( $slug );
        },
    ] );

    // CPT with ACF field stored in post meta
    register_graphql_field( 'Promotion', 'actionIconSvg', [
        'type'    => 'String',
        'resolve' => function ( $post ) {
            $slug = get_post_meta( $post->databaseId ?? 0, 'action_icon', true );
            return unident_resolve_icon_svg( $slug );
        },
    ] );

    // Taxonomy term (icon stored in term meta)
    register_graphql_field( 'ServiceCategory', 'iconSvg', [
        'type'    => 'String',
        'resolve' => function ( $term ) {
            $slug = get_term_meta( $term->databaseId ?? 0, 'category_icon', true );
            return unident_resolve_icon_svg( $slug );
        },
    ] );
} );
```

---

## Part 2: Next.js — DynamicIcon Component

### Update `DynamicIcon` to support inline SVG markup

File: `nextjs/src/components/dynamic-icon.tsx`

```typescript
export interface DynamicIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Icon name from ACF: built-in slug like 'telegram', or 'media-42' */
  name: string | null | undefined;
  /** Raw SVG markup from GraphQL iconSvg field (for Media Library icons) */
  svgMarkup?: string | null;
  fallback?: ReactNode;
}

export function DynamicIcon({ name, svgMarkup, fallback = null, className, ...props }: DynamicIconProps) {
  // Priority 1: built-in icon from iconMap (zero overhead)
  const Icon = getIcon(name);
  if (Icon) return <Icon className={className} {...props} />;

  // Priority 2: custom SVG from Media Library (inline HTML)
  if (svgMarkup) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
        role="img"
        aria-hidden="true"
      />
    );
  }

  return <>{fallback}</>;
}
```

### Update GraphQL queries

Add `iconSvg` alongside every `icon` field:

```graphql
# Before
socialLinks {
  icon
  url
}

# After
socialLinks {
  icon
  iconSvg
  url
}
```

Do the same for `actionIcon` → add `actionIconSvg` for Promotions.

### Update TypeScript interfaces

```typescript
// Add iconSvg to any interface that has an icon field
interface SocialLink {
  icon?: string | null;
  iconSvg?: string | null;  // add this
  url: string;
}
```

### Pass svgMarkup in components

```tsx
// Before
<DynamicIcon name={item.icon} />

// After
<DynamicIcon name={item.icon} svgMarkup={item.iconSvg} />
```

---

## Part 3: Migrate Existing SVGs to Media Library (Optional)

This step moves `nextjs/src/icons/*.svg` files into WordPress so they appear in the dynamic choices picker.

### Method: bash script inside Docker

1. Copy SVG files into the WordPress container:
```powershell
docker cp d:\template\nextjs\src\icons wp-new-wordpress:/var/www/html/nextjs-icons
```

2. Create the import script locally:
```bash
#!/bin/sh
for f in /var/www/html/nextjs-icons/*.svg; do
  slug=$(basename "$f" .svg)
  result=$(wp --allow-root media import "$f" --title="$slug" --porcelain 2>/dev/null)
  if [ -n "$result" ]; then
    echo "OK: $slug (ID: $result)"
  else
    echo "FAIL: $slug"
  fi
done
```

3. Copy script to container (CRITICAL: must use docker cp, not inline bash — PowerShell breaks `$()` in bash strings):
```powershell
docker cp d:\template\scripts\import-svg.sh wp-new-wordpress:/tmp/import-svg.sh
```

4. Fix Windows line endings and run:
```powershell
docker exec wp-new-wordpress sed -i "s/\r//" /tmp/import-svg.sh
docker exec wp-new-wordpress sh /tmp/import-svg.sh
```

5. Cleanup:
```powershell
docker exec wp-new-wordpress rm -rf /var/www/html/nextjs-icons /tmp/import-svg.sh
```

---

## Common Errors

### Error: SVG not showing in ACF Select choices

**Cause:** Cache not invalidated after upload, or SVG MIME type not registered.
**Fix:** Check that the `unident_svg_icon_choices` cache is being invalidated via `add_attachment` hook. Try `wp_cache_flush` to force refresh.

### Error: `iconSvg` returns null for built-in icons

**Cause:** This is correct behavior. Built-in slugs (no `media-` prefix) return null intentionally so the frontend uses `iconMap`.
**Fix:** No fix needed. Ensure `DynamicIcon` checks `iconMap` first, falls back to `svgMarkup`.

### Error: GraphQL "Cannot query field iconSvg"

**Cause:** `graphql_register_types` hook fired but the type name doesn't match the actual WPGraphQL schema.
**Fix:** Verify type names via WPGraphQL IDE (`/__graphql`). Introspect: `{ __type(name: "HeaderSettingsSocialLink") { fields { name } } }`.

### Error: PowerShell `$()` breaks bash script when using `docker exec ... bash -c`

**Cause:** PowerShell interprets `$()` as subexpressions before passing to bash.
**Fix:** Never pass multi-line bash scripts inline via PowerShell. Always:
1. Write script to a `.sh` file
2. `docker cp` the file into container
3. `sed -i "s/\r//" /tmp/script.sh` to fix Windows line endings
4. `docker exec container sh /tmp/script.sh`

### Error: WP-CLI "YIKES! It looks like you're running this as root"

**Cause:** WordPress Docker containers often run as root.
**Fix:** Always append `--allow-root` to all `wp` commands in Docker.

---

## Best Practices

### DO ✅

1. **Separate mu-plugin** for icon logic — don't put it in the main `unident-acf-fields.php`
2. **Cache Media Library SVG query** for 5 minutes (`wp_cache_set`) — it's called on every ACF field load
3. **Sanitize SVGs on upload** — strip `<script>`, event handlers, external `href` references
4. **Return null from GraphQL for built-in icons** — let the frontend handle them via `iconMap`
5. **Invalidate cache** on `add_attachment`, `delete_attachment`, `edit_attachment` hooks
6. **Use `--allow-root`** for all WP-CLI commands inside Docker

### DON'T ❌

1. ❌ Don't skip SVG sanitization — SVGs can carry XSS payloads
2. ❌ Don't allow non-admins to upload SVGs (`current_user_can('administrator')` check is required)
3. ❌ Don't use `dangerouslySetInnerHTML` for untrusted SVG content — only use it for SVGs from your own WordPress
4. ❌ Don't remove built-in choices from ACF Select — existing saved values would break
5. ❌ Don't pass multi-line bash scripts inline via PowerShell's `docker exec ... bash -c` — always use `docker cp` + file execution
