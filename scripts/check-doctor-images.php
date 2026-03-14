<?php
/**
 * Check which doctors have featured images
 * 
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/check-doctor-images.php --allow-root
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

$doctors = get_posts([
    'post_type' => 'doctors',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'orderby' => 'ID',
    'order' => 'ASC'
]);

echo "=== Doctor Images Status ===\n\n";
echo "Total doctors: " . count($doctors) . "\n\n";

$with_images = 0;
$without_images = 0;

foreach ($doctors as $doctor) {
    $thumb_id = get_post_thumbnail_id($doctor->ID);
    
    if ($thumb_id) {
        $image_url = wp_get_attachment_image_url($thumb_id, 'thumbnail');
        echo "✓ {$doctor->post_title} (ID: {$doctor->ID}) - Image ID: {$thumb_id}\n";
        echo "  URL: {$image_url}\n";
        $with_images++;
    } else {
        echo "✗ {$doctor->post_title} (ID: {$doctor->ID}) - NO IMAGE\n";
        $without_images++;
    }
    echo "\n";
}

echo "=== Summary ===\n";
echo "With images: {$with_images}\n";
echo "Without images: {$without_images}\n";
echo "\n";
