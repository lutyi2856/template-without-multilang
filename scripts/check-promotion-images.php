<?php
/**
 * Check which promotions have featured images (Изображение поста)
 *
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/check-promotion-images.php --allow-root
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

$promotions = get_posts([
    'post_type' => 'promotions',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

echo "=== Promotion Featured Images ===\n\n";
echo "Total promotions: " . count($promotions) . "\n\n";

$with_images = 0;
$without_images = 0;

foreach ($promotions as $p) {
    $thumb_id = get_post_thumbnail_id($p->ID);
    if ($thumb_id) {
        $url = wp_get_attachment_image_url($thumb_id, 'full');
        echo "✓ {$p->post_title} (ID: {$p->ID}) - thumb_id: {$thumb_id}\n";
        echo "  URL: {$url}\n";
        $with_images++;
    } else {
        echo "✗ {$p->post_title} (ID: {$p->ID}) - NO FEATURED IMAGE\n";
        $without_images++;
    }
    echo "\n";
}

echo "=== Summary ===\n";
echo "With images: {$with_images}\n";
echo "Without images: {$without_images}\n";
echo "\n";
