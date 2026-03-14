<?php
/**
 * Delete KAN services and prices from WordPress (for reimport)
 *
 * Deletes only services and prices that have one of the 10 KAN category terms.
 * Use before reimporting fresh data from kan-data/services-prices.json
 *
 * Run: docker cp scripts/delete-kan-services-prices.php wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/delete-kan-services-prices.php --allow-root
 */

$kan_slugs = [
    'ispravlenie-prikusa',
    'otbelivanie-zubov',
    'diagnostika',
    'ortopediya-koronki',
    'ortopediya-viniry',
    'terapevticheskoe-i-endodonticheskoe-lechenie',
    'prof-gigiena',
    'hirurgiya-i-implantaciya',
    'detskoe-lechenie',
    'sedaciya-zaks',
];

$kan_term_ids = [];
foreach ($kan_slugs as $slug) {
    $term = get_term_by('slug', $slug, 'service_categories');
    if ($term) {
        $kan_term_ids[] = $term->term_id;
    }
}

if (empty($kan_term_ids)) {
    echo "No KAN category terms found. Nothing to delete.\n";
    exit(0);
}

echo "=== Delete KAN services & prices ===\n";
echo "KAN term IDs: " . implode(', ', $kan_term_ids) . "\n\n";

// 1. Delete services in KAN categories
$all_services = get_posts([
    'post_type' => 'services',
    'post_status' => 'any',
    'posts_per_page' => -1,
]);

$deleted_services = 0;
foreach ($all_services as $post) {
    $terms = wp_get_post_terms($post->ID, 'service_categories');
    foreach ($terms as $t) {
        if (in_array($t->term_id, $kan_term_ids)) {
            wp_delete_post($post->ID, true);
            $deleted_services++;
            echo "Deleted service: {$post->post_title} (ID: {$post->ID})\n";
            break;
        }
    }
}

echo "\nServices deleted: {$deleted_services}\n";

// 2. Delete prices in KAN categories
$all_prices = get_posts([
    'post_type' => 'prices',
    'post_status' => 'any',
    'posts_per_page' => -1,
]);

$deleted_prices = 0;
foreach ($all_prices as $post) {
    $terms = wp_get_post_terms($post->ID, 'service_categories');
    foreach ($terms as $t) {
        if (in_array($t->term_id, $kan_term_ids)) {
            wp_delete_post($post->ID, true);
            $deleted_prices++;
            echo "Deleted price: {$post->post_title} (ID: {$post->ID})\n";
            break;
        }
    }
}

echo "\nPrices deleted: {$deleted_prices}\n";
echo "\n✓ Done. KAN terms kept. Run import: wp eval-file .../import-kan-services-prices.php\n";
