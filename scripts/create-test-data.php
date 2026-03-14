<?php
/**
 * Create test data for Price/Service/Promotion setup
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo '=== Creating Test Data ===' . PHP_EOL . PHP_EOL;

// 1. Find or create a Service
echo '1. Finding Service...' . PHP_EOL;
$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => 1,
    'post_status' => 'publish'
]);

if (empty($services)) {
    echo '   Creating new Service...' . PHP_EOL;
    $service_id = wp_insert_post([
        'post_title' => 'Test Service - Implantation',
        'post_content' => 'Test service for implantation',
        'post_status' => 'publish',
        'post_type' => 'services'
    ]);
    echo '   Created Service ID: ' . $service_id . PHP_EOL;
} else {
    $service_id = $services[0]->ID;
    echo '   Found Service: ' . $services[0]->post_title . ' (ID: ' . $service_id . ')' . PHP_EOL;
}

// 2. Create or update Price
echo PHP_EOL . '2. Creating Price...' . PHP_EOL;

$existing_prices = get_posts([
    'post_type' => 'prices',
    'posts_per_page' => 1,
    'post_status' => 'publish'
]);

if (!empty($existing_prices)) {
    $price_id = $existing_prices[0]->ID;
    echo '   Found existing Price ID: ' . $price_id . PHP_EOL;
} else {
    $price_id = wp_insert_post([
        'post_title' => 'Implantation Price',
        'post_content' => 'Price for implantation service',
        'post_status' => 'publish',
        'post_type' => 'prices'
    ]);
    echo '   Created Price ID: ' . $price_id . PHP_EOL;
}

// Set ACF fields for Price
update_field('regular_price', 5000, $price_id);
update_field('promo_price', 3750, $price_id);
update_field('currency', '₽', $price_id);
update_field('period', 'мес', $price_id);
update_field('installment_terms', 'Рассрочка 0% на 18 месяцев', $price_id);
update_field('related_service', $service_id, $price_id);

echo '   Set Price fields:' . PHP_EOL;
echo '     - Regular: 5000₽' . PHP_EOL;
echo '     - Promo: 3750₽' . PHP_EOL;
echo '     - Period: мес' . PHP_EOL;
echo '     - Related Service: ' . $service_id . PHP_EOL;

// 3. Find or create Promotion
echo PHP_EOL . '3. Finding Promotion...' . PHP_EOL;
$promotions = get_posts([
    'post_type' => 'promotions',
    'posts_per_page' => 1,
    'post_status' => 'publish'
]);

if (empty($promotions)) {
    echo '   Creating new Promotion...' . PHP_EOL;
    $promotion_id = wp_insert_post([
        'post_title' => 'Test Promotion - Implantation Discount',
        'post_content' => 'Special offer for implantation',
        'post_status' => 'publish',
        'post_type' => 'promotions'
    ]);
    echo '   Created Promotion ID: ' . $promotion_id . PHP_EOL;
} else {
    $promotion_id = $promotions[0]->ID;
    echo '   Found Promotion: ' . $promotions[0]->post_title . ' (ID: ' . $promotion_id . ')' . PHP_EOL;
}

// Set related services for Promotion
update_field('related_services', [$service_id], $promotion_id);
echo '   Set Promotion -> Service relationship' . PHP_EOL;

// 4. Set Featured Promotion in Header Settings
echo PHP_EOL . '4. Setting Header Settings...' . PHP_EOL;
update_field('featured_promotion', $promotion_id, 'option');
echo '   Set Featured Promotion: ' . $promotion_id . PHP_EOL;

// 5. Verify relationships
echo PHP_EOL . '5. Verifying relationships...' . PHP_EOL;

$price_service = get_field('related_service', $price_id);
echo '   Price -> Service: ' . ($price_service ? $price_service->ID : 'NONE') . PHP_EOL;

$service_prices = get_field('related_prices', $service_id);
echo '   Service -> Prices: ' . (is_array($service_prices) ? count($service_prices) : 0) . PHP_EOL;

$service_promotions = get_field('related_promotions', $service_id);
echo '   Service -> Promotions: ' . (is_array($service_promotions) ? count($service_promotions) : 0) . PHP_EOL;

$promo_services = get_field('related_services', $promotion_id);
echo '   Promotion -> Services: ' . (is_array($promo_services) ? count($promo_services) : 0) . PHP_EOL;

$featured_promo = get_field('featured_promotion', 'option');
echo '   Header -> Featured Promotion: ' . ($featured_promo ? $featured_promo->ID : 'NONE') . PHP_EOL;

echo PHP_EOL . '=== Test Data Created Successfully! ===' . PHP_EOL;
echo PHP_EOL . 'Summary:' . PHP_EOL;
echo '  Service ID: ' . $service_id . PHP_EOL;
echo '  Price ID: ' . $price_id . PHP_EOL;
echo '  Promotion ID: ' . $promotion_id . PHP_EOL;
echo PHP_EOL . 'You can now view:' . PHP_EOL;
echo '  - Prices: http://localhost:8002/wp-admin/edit.php?post_type=prices' . PHP_EOL;
echo '  - Services: http://localhost:8002/wp-admin/edit.php?post_type=services' . PHP_EOL;
echo '  - Promotions: http://localhost:8002/wp-admin/edit.php?post_type=promotions' . PHP_EOL;
echo '  - Header Settings: http://localhost:8002/wp-admin/admin.php?page=header-settings' . PHP_EOL;
