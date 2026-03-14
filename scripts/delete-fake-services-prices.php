<?php
/**
 * Delete fake/old services and prices - keep only KAN import data
 *
 * Keeps only services and prices that have one of the 10 KAN category terms.
 * Deletes all others (old test data).
 *
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/delete-fake-services-prices.php --allow-root
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
    echo "ERROR: No KAN category terms found.\n";
    exit(1);
}

echo "=== Delete fake services & prices ===\n";
echo "KAN term IDs: " . implode(', ', $kan_term_ids) . "\n\n";

// 1. Delete services NOT in KAN categories
$all_services = get_posts([
    'post_type' => 'services',
    'post_status' => 'any',
    'posts_per_page' => -1,
]);
$deleted_services = 0;
$kept_services = 0;

foreach ($all_services as $post) {
    $terms = wp_get_post_terms($post->ID, 'service_categories');
    $in_kan = false;
    foreach ($terms as $t) {
        if (in_array($t->term_id, $kan_term_ids)) {
            $in_kan = true;
            break;
        }
    }
    if (!$in_kan) {
        wp_delete_post($post->ID, true);
        $deleted_services++;
        echo "Deleted service: {$post->post_title} (ID: {$post->ID})\n";
    } else {
        $kept_services++;
    }
}

echo "\nServices: deleted {$deleted_services}, kept {$kept_services}\n";

// 2. Delete prices NOT in KAN categories
$all_prices = get_posts([
    'post_type' => 'prices',
    'post_status' => 'any',
    'posts_per_page' => -1,
]);
$deleted_prices = 0;
$kept_prices = 0;

foreach ($all_prices as $post) {
    $terms = wp_get_post_terms($post->ID, 'service_categories');
    $in_kan = false;
    foreach ($terms as $t) {
        if (in_array($t->term_id, $kan_term_ids)) {
            $in_kan = true;
            break;
        }
    }
    if (!$in_kan) {
        wp_delete_post($post->ID, true);
        $deleted_prices++;
        echo "Deleted price: {$post->post_title} (ID: {$post->ID})\n";
    } else {
        $kept_prices++;
    }
}

echo "\nPrices: deleted {$deleted_prices}, kept {$kept_prices}\n";
echo "\n✓ Done. Run: wp cache flush && wp graphql clear-schema-cache\n";
