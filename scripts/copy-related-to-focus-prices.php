<?php
/**
 * Copy related_prices → focus_prices, build focus_services from related_prices
 *
 * Run: docker cp scripts/copy-related-to-focus-prices.php wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/copy-related-to-focus-prices.php --allow-root
 */
define('WP_USE_THEMES', false);
require '/var/www/html/wp-load.php';

$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => -1,
    'post_status' => 'publish',
]);
$price_to_services = []; // price_id => [service_id, ...]

foreach ($services as $s) {
    $prices = get_field('related_prices', $s->ID);
    if (!$prices || !is_array($prices)) {
        continue;
    }
    $price_ids = array_map(function ($p) {
        return $p instanceof \WP_Post ? $p->ID : (int) $p;
    }, $prices);
    update_field('focus_prices', $price_ids, $s->ID);
    foreach ($price_ids as $pid) {
        if (!isset($price_to_services[$pid])) {
            $price_to_services[$pid] = [];
        }
        $price_to_services[$pid][] = $s->ID;
    }
}

foreach ($price_to_services as $price_id => $service_ids) {
    update_field('focus_services', array_unique($service_ids), $price_id);
}

echo 'Done. Services: ' . count($services) . ', Prices with focus_services: ' . count($price_to_services) . PHP_EOL;
