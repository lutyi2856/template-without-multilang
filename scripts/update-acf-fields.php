<?php
/**
 * Update ACF fields for test posts
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo "Starting ACF fields update...\n\n";

// 1. Update Price post (ID: 40) ACF fields
echo "1. Updating Price post (ID: 40) ACF fields...\n";
update_field('regular_price', 67500, 40);
update_field('promo_price', 3750, 40);
update_field('currency', '₽', 40);
update_field('period', 'мес', 40);
update_field('installment_terms', 'Рассрочка 0% на 18 месяцев', 40);
echo "   ✓ Price fields updated\n\n";

// 2. Link Price (40) to Service (41) - bidirectional relationship
echo "2. Linking Price (40) to Service (41)...\n";
$service_post = get_post(41);
if ($service_post) {
    update_field('related_service', 41, 40); // Price -> Service
    echo "   ✓ Price linked to Service\n";
    
    // Check if bidirectional worked
    $related_prices = get_field('related_prices', 41);
    if ($related_prices) {
        echo "   ✓ Bidirectional link confirmed: Service has " . count($related_prices) . " related price(s)\n";
    }
} else {
    echo "   ✗ Service post not found\n";
}
echo "\n";

// 3. Link Promotion (42) to Service (41) - bidirectional relationship
echo "3. Linking Promotion (42) to Service (41)...\n";
update_field('related_services', array(41), 42); // Promotion -> Service
echo "   ✓ Promotion linked to Service\n";

// Check if bidirectional worked
$related_promotions = get_field('related_promotions', 41);
if ($related_promotions) {
    echo "   ✓ Bidirectional link confirmed: Service has " . count($related_promotions) . " related promotion(s)\n";
}
echo "\n";

// 4. Set Featured Promotion in Header Settings
echo "4. Setting Featured Promotion in Header Settings...\n";
update_field('featured_promotion', 42, 'options');
echo "   ✓ Featured Promotion set\n\n";

// Verification
echo "=== VERIFICATION ===\n";
echo "Price (40):\n";
echo "  - regular_price: " . get_field('regular_price', 40) . "\n";
echo "  - promo_price: " . get_field('promo_price', 40) . "\n";
echo "  - currency: " . get_field('currency', 40) . "\n";
echo "  - period: " . get_field('period', 40) . "\n";
$related_service = get_field('related_service', 40);
echo "  - related_service: " . ($related_service ? $related_service->post_title : 'none') . "\n\n";

echo "Service (41):\n";
$prices = get_field('related_prices', 41);
echo "  - related_prices count: " . (is_array($prices) ? count($prices) : 0) . "\n";
$promotions = get_field('related_promotions', 41);
echo "  - related_promotions count: " . (is_array($promotions) ? count($promotions) : 0) . "\n\n";

echo "Promotion (42):\n";
$services = get_field('related_services', 42);
echo "  - related_services count: " . (is_array($services) ? count($services) : 0) . "\n\n";

echo "Header Settings:\n";
$featured_promo = get_field('featured_promotion', 'options');
echo "  - featured_promotion: " . ($featured_promo ? $featured_promo->post_title : 'none') . "\n\n";

echo "✓ All ACF fields updated successfully!\n";
