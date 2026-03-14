<?php
/**
 * Fix header settings data
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

echo "=== CURRENT HEADER SETTINGS ===\n\n";

$working_hours = get_field('working_hours', 'options');
echo "Working Hours:\n";
echo "- Weekdays: " . ($working_hours['weekdays'] ?? 'NULL') . "\n";
echo "- Weekend: " . ($working_hours['weekend'] ?? 'NULL') . "\n";

// Fix the working hours
echo "\n=== FIXING WORKING HOURS ===\n\n";

update_field('working_hours', [
    'weekdays' => 'Пн-Сб 10:00-22:00',
    'weekend' => 'Вс 9:00-16:00'
], 'options');

echo "Updated working hours.\n";

// Also fix the Price data - currency and period fields
echo "\n=== CHECKING PRICE DATA ===\n\n";

// Get the test price post
$prices = get_posts([
    'post_type' => 'prices',
    'numberposts' => 1
]);

if (!empty($prices)) {
    $price = $prices[0];
    echo "Price Post: " . $price->post_title . " (ID: " . $price->ID . ")\n";
    
    $currency = get_field('currency', $price->ID);
    $period = get_field('period', $price->ID);
    
    echo "Current Currency: " . $currency . "\n";
    echo "Current Period: " . $period . "\n";
    
    // Fix the values
    update_field('currency', '₽', $price->ID);
    update_field('period', 'мес', $price->ID);
    update_field('installment_terms', 'Рассрочка 0% на 18 месяцев', $price->ID);
    
    echo "\nUpdated Price fields.\n";
}

// Verify
echo "\n=== VERIFICATION ===\n\n";

$working_hours = get_field('working_hours', 'options');
echo "Working Hours:\n";
echo "- Weekdays: " . ($working_hours['weekdays'] ?? 'NULL') . "\n";
echo "- Weekend: " . ($working_hours['weekend'] ?? 'NULL') . "\n";

if (!empty($prices)) {
    $currency = get_field('currency', $prices[0]->ID);
    $period = get_field('period', $prices[0]->ID);
    $terms = get_field('installment_terms', $prices[0]->ID);
    
    echo "\nPrice Fields:\n";
    echo "- Currency: " . $currency . "\n";
    echo "- Period: " . $period . "\n";
    echo "- Installment Terms: " . $terms . "\n";
}

echo "\nDone!\n";
