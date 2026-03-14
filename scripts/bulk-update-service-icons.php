<?php
/**
 * Bulk update service_icon meta for all services.
 * Sets default 'tooth' for services that don't have the icon.
 * Run: docker exec wp-new-wordpress wp eval-file scripts/bulk-update-service-icons.php --allow-root
 */

$ids = get_posts([
    'post_type'      => 'services',
    'posts_per_page' => -1,
    'post_status'    => 'publish',
    'fields'         => 'ids',
]);

$count = 0;
foreach ($ids as $id) {
    $current = get_post_meta($id, 'service_icon', true);
    if (empty($current)) {
        update_post_meta($id, 'service_icon', 'tooth');
        $count++;
    }
}

echo "Updated service_icon to 'tooth' for {$count} services (total: " . count($ids) . ").\n";
