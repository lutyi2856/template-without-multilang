---
name: wordpress-featured-image-loading
description: Load and set featured images for WordPress posts (any post type). Use when installing images for CPT posts, downloading images from free sources, setting featured images, creating placeholder images, or bulk image uploads for any custom post type.
---

# WordPress Featured Image Loading

## When to Use

**Use this skill when:**

- Need to install featured images for any WordPress post type (doctors, services, promotions, etc.)
- Downloading images from free sources (Unsplash, Picsum Photos)
- Setting featured images for Custom Post Type posts
- Creating placeholder images when external sources fail
- Bulk image uploads for multiple posts
- Automating image installation for posts without featured images

**Example scenarios:**

- Install PNG images for all doctors without featured images
- Set featured images for services CPT
- Bulk upload images for promotions
- Create placeholder images for any post type

---

## Quick Reference

### Run the Script

```bash
docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/install-featured-images.php --allow-root
```

### Key Functions

- `get_image_url($post_id, $post_type, $attempt)` - Get image URL from free sources
- `download_and_attach_image($url, $post_id, $attempt)` - Download and upload to media library
- `create_placeholder_image($post_id, $text)` - Create placeholder using GD library
- `set_post_thumbnail($post_id, $attachment_id)` - Set as featured image

---

## Detailed Instructions

### Step 1: Create Universal PHP Script

**File:** `scripts/install-featured-images.php`

The script should:

1. Accept post type as parameter
2. Find all posts without featured images
3. Try downloading from free sources
4. Create placeholder if download fails
5. Upload to media library
6. Set as featured image

### Step 2: Include WordPress Media Functions

```php
define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

// Include WordPress media functions
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
```

### Step 3: Get Posts Without Images (Universal)

```php
// Accept post type as parameter or use default
$post_type = isset($argv[1]) ? $argv[1] : 'doctors';

$posts = get_posts([
    'post_type' => $post_type,
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'meta_query' => [
        [
            'key' => '_thumbnail_id',
            'compare' => 'NOT EXISTS'
        ]
    ]
]);
```

### Step 4: Universal Image URL Function

```php
/**
 * Get image URL for post from free sources
 *
 * @param int $post_id Post ID
 * @param string $post_type Post type (for context-specific images)
 * @param int $attempt Attempt number (for retry with different source)
 * @return string Image URL
 */
function get_image_url($post_id, $post_type = 'post', $attempt = 0) {
    // Context-specific image URLs based on post type
    $image_urls_by_type = [
        'doctors' => [
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&fm=png',
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&fm=png',
            // Medical professional images
        ],
        'services' => [
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&fm=png',
            'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&fm=png',
            // Service/medical equipment images
        ],
        'promotions' => [
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&fm=png',
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&fm=png',
            // Promotional/discount images
        ],
    ];

    // Get type-specific URLs or use generic
    $image_urls = $image_urls_by_type[$post_type] ?? [
        'https://picsum.photos/400/400?random=' . ($post_id * 2),
        'https://picsum.photos/400/400?random=' . ($post_id * 3),
        'https://picsum.photos/400/400?random=' . ($post_id * 5),
    ];

    // Use post ID and attempt to get consistent but varied image
    $index = ($post_id + $attempt) % count($image_urls);
    return $image_urls[$index];
}
```

### Step 5: Download Image Function (Universal)

```php
/**
 * Download image from URL and attach to WordPress post
 *
 * @param string $url Image URL
 * @param int $post_id Post ID to attach image to
 * @param int $attempt Attempt number for retry
 * @return int|false Attachment ID on success, false on failure
 */
function download_and_attach_image($url, $post_id, $attempt = 0) {
    $timeout = 30;

    // Use wp_remote_get with User-Agent to avoid blocking
    $response = wp_remote_get($url, [
        'timeout' => $timeout,
        'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'sslverify' => false, // Some free services have SSL issues
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return false;
    }

    $body = wp_remote_retrieve_body($response);
    if (empty($body)) {
        return false;
    }

    // Create temporary file
    $tmp = wp_tempnam('post-image');
    if (!$tmp) {
        return false;
    }

    // Write downloaded content to temp file
    file_put_contents($tmp, $body);

    // Check if file was written successfully
    if (!file_exists($tmp) || filesize($tmp) === 0) {
        @unlink($tmp);
        return false;
    }

    // Get file extension from URL or content
    $file_info = wp_check_filetype(basename(parse_url($url, PHP_URL_PATH)));
    if (!$file_info['ext']) {
        // Try to detect from content
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $tmp);
        finfo_close($finfo);

        $mime_to_ext = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];
        $ext = $mime_to_ext[$mime_type] ?? 'jpg';
    } else {
        $ext = $file_info['ext'];
    }

    $file_array = [
        'name' => 'post-' . $post_id . '-' . time() . '.' . $ext,
        'tmp_name' => $tmp
    ];

    // Upload to media library
    $attachment_id = media_handle_sideload($file_array, $post_id, 'Featured image for ' . get_the_title($post_id));

    // Clean up temp file
    @unlink($tmp);

    if (is_wp_error($attachment_id)) {
        return false;
    }

    return $attachment_id;
}
```

### Step 6: Create Placeholder Image (Universal)

```php
/**
 * Create a simple placeholder image using GD library
 *
 * @param int $post_id Post ID
 * @param string $text Text to display on image (e.g., initials, post type)
 * @return string|false Temporary file path on success, false on failure
 */
function create_placeholder_image($post_id, $text = 'POST') {
    if (!function_exists('imagecreatetruecolor')) {
        return false;
    }

    $width = 400;
    $height = 400;

    // Create image
    $img = imagecreatetruecolor($width, $height);

    // Colors (can be customized based on post type)
    $bg_color = imagecolorallocate($img, 74, 144, 226); // Blue background
    $text_color = imagecolorallocate($img, 255, 255, 255); // White text

    // Fill background
    imagefill($img, 0, 0, $bg_color);

    // Add text
    $font = 5; // Built-in font
    $text_width = imagefontwidth($font) * strlen($text);
    $text_height = imagefontheight($font);
    $x = ($width - $text_width) / 2;
    $y = ($height - $text_height) / 2;

    imagestring($img, $font, $x, $y, $text, $text_color);

    // Save to temp file
    $tmp = wp_tempnam('post-image');
    if (!$tmp) {
        imagedestroy($img);
        return false;
    }

    imagepng($img, $tmp);
    imagedestroy($img);

    return $tmp;
}
```

### Step 7: Extract Text for Placeholder

```php
/**
 * Extract text for placeholder (initials, post type abbreviation, etc.)
 *
 * @param string $post_title Post title
 * @param string $post_type Post type
 * @return string Text to display
 */
function extract_placeholder_text($post_title, $post_type = 'post') {
    // Try to extract initials from title
    $words = explode(' ', $post_title);
    $initials = '';

    foreach ($words as $word) {
        if (!empty($word)) {
            $initials .= mb_substr($word, 0, 1, 'UTF-8');
        }
    }

    // If initials are too long or empty, use post type abbreviation
    if (empty($initials) || strlen($initials) > 4) {
        $type_abbr = [
            'doctors' => 'DR',
            'services' => 'SRV',
            'promotions' => 'PROMO',
            'prices' => 'PRICE',
        ];
        return $type_abbr[$post_type] ?? 'POST';
    }

    return strtoupper($initials);
}
```

### Step 8: Main Processing Loop (Universal)

```php
// Get post type from command line argument or use default
$post_type = isset($argv[1]) ? $argv[1] : 'doctors';

echo "=== Installing Featured Images for {$post_type} ===\n\n";

$posts = get_posts([
    'post_type' => $post_type,
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'meta_query' => [
        [
            'key' => '_thumbnail_id',
            'compare' => 'NOT EXISTS'
        ]
    ]
]);

if (empty($posts)) {
    echo "No {$post_type} posts found without featured images.\n";
    exit;
}

echo "Found " . count($posts) . " {$post_type} posts without images.\n\n";

$success_count = 0;
$error_count = 0;

foreach ($posts as $post) {
    echo "Processing: {$post->post_title} (ID: {$post->ID})...\n";

    // Check if already has thumbnail (double check)
    $thumbnail_id = get_post_thumbnail_id($post->ID);
    if ($thumbnail_id) {
        echo "  ⚠ Already has thumbnail (ID: {$thumbnail_id}), skipping...\n\n";
        continue;
    }

    $attachment_id = false;
    $max_attempts = 3; // Try multiple sources

    // Try downloading with retry logic
    for ($attempt = 0; $attempt < $max_attempts; $attempt++) {
        $image_url = get_image_url($post->ID, $post_type, $attempt);
        echo "  Attempt " . ($attempt + 1) . "/{$max_attempts}: Downloading image...\n";

        $attachment_id = download_and_attach_image($image_url, $post->ID, $attempt);

        if ($attachment_id) {
            break; // Success, exit retry loop
        }

        // Wait before retry
        if ($attempt < $max_attempts - 1) {
            sleep(2);
        }
    }

    // If all external sources failed, create placeholder image
    if (!$attachment_id && function_exists('imagecreatetruecolor')) {
        echo "  Creating placeholder image...\n";
        $placeholder_text = extract_placeholder_text($post->post_title, $post_type);

        $tmp_file = create_placeholder_image($post->ID, $placeholder_text);
        if ($tmp_file) {
            $file_array = [
                'name' => $post_type . '-' . $post->ID . '-' . time() . '.png',
                'tmp_name' => $tmp_file
            ];

            $attachment_id = media_handle_sideload($file_array, $post->ID, ucfirst($post_type) . ' placeholder image');
            @unlink($tmp_file);
        }
    }

    if (!$attachment_id) {
        $error_count++;
        echo "  ✗ Failed to download/create image after {$max_attempts} attempts\n\n";
        continue;
    }

    // Set as featured image
    $result = set_post_thumbnail($post->ID, $attachment_id);

    if ($result) {
        $success_count++;
        $image_url_final = wp_get_attachment_image_url($attachment_id, 'full');
        echo "  ✓ Image set successfully (Attachment ID: {$attachment_id})\n";
        echo "    Image URL: {$image_url_final}\n\n";
    } else {
        $error_count++;
        echo "  ✗ Failed to set as featured image\n\n";
        // Clean up orphaned attachment
        wp_delete_attachment($attachment_id, true);
    }

    // Small delay to avoid rate limiting
    sleep(1);
}

echo "=== Summary ===\n";
echo "Post type: {$post_type}\n";
echo "Total posts processed: " . count($posts) . "\n";
echo "Successfully set images: {$success_count}\n";
echo "Errors: {$error_count}\n";
echo "\nDone!\n";
```

---

## Usage Examples

### For Doctors

```bash
docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/install-featured-images.php doctors --allow-root
```

### For Services

```bash
docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/install-featured-images.php services --allow-root
```

### For Promotions

```bash
docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/install-featured-images.php promotions --allow-root
```

### For Any Post Type

```bash
docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/install-featured-images.php <post_type> --allow-root
```

---

## Image Sources by Post Type

### Context-Specific URLs

**Doctors:**

- Medical professional photos from Unsplash
- Doctor consultation images
- Healthcare worker photos

**Services:**

- Medical equipment images
- Dental service photos
- Healthcare service illustrations

**Promotions:**

- Discount/promo images
- Sale banners
- Special offer graphics

**Generic (fallback):**

- Picsum Photos random images
- Placeholder.com images

---

## Common Errors

### Error: "Service Unavailable" or "Forbidden"

**Cause:** External image services blocking requests from Docker container

**Fix:**

1. Add User-Agent header to requests
2. Set `sslverify => false` for SSL issues
3. Use fallback placeholder creation
4. Try multiple image sources

### Error: "GD library not available"

**Cause:** PHP GD extension not installed

**Fix:**

```bash
# Install GD extension in Docker
docker exec wp-new-wordpress apt-get update
docker exec wp-new-wordpress apt-get install -y php-gd
```

### Error: "Post type does not support thumbnails"

**Cause:** CPT registration missing thumbnail support

**Fix:**

```php
// In CPT registration
'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
//                              ^^^^^^^^^^ Add this
```

### Error: "Failed to upload image"

**Cause:** File permissions or invalid image format

**Fix:**

1. Check file exists and has content: `file_exists($tmp) && filesize($tmp) > 0`
2. Verify file extension detection
3. Check WordPress upload directory permissions
4. Verify MIME type detection

---

## Best Practices

### ✅ DO:

1. **Make script accept post type parameter:**

   ```php
   $post_type = isset($argv[1]) ? $argv[1] : 'doctors';
   ```

2. **Use context-specific images when possible:**

   ```php
   $image_urls_by_type = [
       'doctors' => [...],
       'services' => [...],
   ];
   ```

3. **Check before processing:**

   ```php
   $thumbnail_id = get_post_thumbnail_id($post->ID);
   if ($thumbnail_id) {
       continue; // Skip if already has image
   }
   ```

4. **Use retry logic:**

   ```php
   $max_attempts = 3;
   for ($attempt = 0; $attempt < $max_attempts; $attempt++) {
       // Try different source on each attempt
   }
   ```

5. **Create placeholders as fallback:**

   ```php
   if (!$attachment_id && function_exists('imagecreatetruecolor')) {
       // Create placeholder
   }
   ```

6. **Extract meaningful placeholder text:**
   ```php
   $placeholder_text = extract_placeholder_text($post->post_title, $post_type);
   ```

### ❌ DON'T:

1. ❌ Hardcode post type in script - make it parameter
2. ❌ Skip error handling - always check `is_wp_error()`
3. ❌ Forget to clean up temp files - causes disk space issues
4. ❌ Use same image URL for all posts - use ID-based variation
5. ❌ Skip placeholder fallback - ensures all posts get images
6. ❌ Process posts with existing images - check first

---

## Related Skills

- **wordpress-test-data-creation** - creating test data for posts
- **wordpress-nextjs-cache-clearing** - clear caches after image installation
- **acf-graphql-manual-registration** - if images need ACF field registration

---

**Status:** ✅ Активно применять
**Version:** 1.0.0
**Created:** 2026-02-04
