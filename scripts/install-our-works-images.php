<?php
/**
 * Install test images for Our Works posts
 * 
 * Downloads free dental before/after images from Unsplash and attaches to our-works posts
 * 
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/install-our-works-images.php --allow-root
 */

// Free dental/teeth related images from Unsplash (3 images per work)
$unsplash_images = [
    // Work 1: Имплантация зубов - полное восстановление (ID: 585)
    [
        'before' => 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80', // Dental before
        'after' => 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',  // Dental smile
        'general' => 'https://images.unsplash.com/photo-1609840114035-3c981960afb8?w=800&q=80', // Dental work
    ],
    // Work 2: Отбеливание зубов (ID: 586)
    [
        'before' => 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80',
        'after' => 'https://images.unsplash.com/photo-1628598578466-6aeeb8a01d1c?w=800&q=80',
        'general' => 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80',
    ],
    // Work 3: Протезирование зубов (ID: 587)
    [
        'before' => 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
        'after' => 'https://images.unsplash.com/photo-1609556848674-0dbac03a4116?w=800&q=80',
        'general' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80',
    ],
    // Work 4: Исправление прикуса (ID: 588)
    [
        'before' => 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
        'after' => 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
        'general' => 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80',
    ],
    // Work 5: Лечение кариеса (ID: 589)
    [
        'before' => 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
        'after' => 'https://images.unsplash.com/photo-1609556848674-0dbac03a4116?w=800&q=80',
        'general' => 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80',
    ],
];

/**
 * Download image from URL and save to WordPress media library
 */
function download_and_attach_image($image_url, $post_id, $title) {
    // Download file
    $tmp = download_url($image_url);
    
    if (is_wp_error($tmp)) {
        echo "✗ Error downloading {$title}: " . $tmp->get_error_message() . "\n";
        return false;
    }
    
    // Get file name from URL
    $file_array = array(
        'name'     => basename(parse_url($image_url, PHP_URL_PATH)),
        'tmp_name' => $tmp
    );
    
    // Upload to media library
    $attachment_id = media_handle_sideload($file_array, $post_id, $title);
    
    // Clean up
    @unlink($tmp);
    
    if (is_wp_error($attachment_id)) {
        echo "✗ Error creating attachment: " . $attachment_id->get_error_message() . "\n";
        return false;
    }
    
    return $attachment_id;
}

echo "=== Installing Our Works Images ===\n\n";

// Get all our-works posts
$works = get_posts([
    'post_type' => 'our-works',
    'posts_per_page' => 5,
    'orderby' => 'ID',
    'order' => 'ASC',
]);

if (empty($works)) {
    echo "✗ No our-works posts found!\n";
    exit(1);
}

echo "Found " . count($works) . " our-works posts\n\n";

foreach ($works as $index => $work) {
    echo "Processing: {$work->post_title} (ID: {$work->ID})\n";
    
    $images = $unsplash_images[$index] ?? null;
    
    if (!$images) {
        echo "  ⚠ No images defined for this work\n\n";
        continue;
    }
    
    // Check if images already exist
    $existing_before = get_field('photo_before', $work->ID);
    $existing_after = get_field('photo_after', $work->ID);
    $existing_general = get_field('general_photo', $work->ID);
    
    if ($existing_before && $existing_after) {
        echo "  ✓ Images already exist, skipping\n\n";
        continue;
    }
    
    // Download and attach before image
    if (!$existing_before && isset($images['before'])) {
        echo "  Downloading before image...\n";
        $before_id = download_and_attach_image(
            $images['before'],
            $work->ID,
            "{$work->post_title} - До"
        );
        
        if ($before_id) {
            update_field('photo_before', $before_id, $work->ID);
            echo "  ✓ Before image attached (ID: {$before_id})\n";
        }
    }
    
    // Download and attach after image
    if (!$existing_after && isset($images['after'])) {
        echo "  Downloading after image...\n";
        $after_id = download_and_attach_image(
            $images['after'],
            $work->ID,
            "{$work->post_title} - После"
        );
        
        if ($after_id) {
            update_field('photo_after', $after_id, $work->ID);
            echo "  ✓ After image attached (ID: {$after_id})\n";
        }
    }
    
    // Download and attach general image
    if (!$existing_general && isset($images['general'])) {
        echo "  Downloading general image...\n";
        $general_id = download_and_attach_image(
            $images['general'],
            $work->ID,
            "{$work->post_title} - Общее"
        );
        
        if ($general_id) {
            update_field('general_photo', $general_id, $work->ID);
            echo "  ✓ General image attached (ID: {$general_id})\n";
        }
    }
    
    echo "\n";
}

echo "✓ Done!\n";
