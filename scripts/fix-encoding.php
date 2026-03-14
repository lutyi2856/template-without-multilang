<?php
/**
 * Fix encoding issues in WordPress database
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

global $wpdb;

echo "=== FIXING ENCODING ISSUES ===\n\n";

// 1. Fix working hours in options
echo "1. Fixing Header Settings (working hours)...\n";

// Get current values from wp_options
$weekdays_key = 'options_working_hours_weekdays';
$weekend_key = 'options_working_hours_weekend';

$current_weekdays = get_option($weekdays_key);
$current_weekend = get_option($weekend_key);

echo "Current weekdays: " . $current_weekdays . "\n";
echo "Current weekend: " . $current_weekend . "\n";

// Update with correct values
update_option($weekdays_key, 'Пн-Сб 10:00-22:00');
update_option($weekend_key, 'Вс 9:00-16:00');

echo "Updated to:\n";
echo "- weekdays: Пн-Сб 10:00-22:00\n";
echo "- weekend: Вс 9:00-16:00\n\n";

// 2. Fix Price fields
echo "2. Fixing Price fields...\n";

$price_id = 40; // The test price post ID
update_post_meta($price_id, 'currency', '₽');
update_post_meta($price_id, 'period', 'мес');
update_post_meta($price_id, 'installment_terms', 'Рассрочка 0% на 18 месяцев');

echo "Updated Price ID $price_id:\n";
echo "- currency: ₽\n";
echo "- period: мес\n";
echo "- installment_terms: Рассрочка 0% на 18 месяцев\n\n";

// 3. Fix Menu items
echo "3. Fixing Menu items...\n";

// Fix menu name
$wpdb->update(
    $wpdb->terms,
    ['name' => 'Главное меню'],
    ['term_id' => 19]
);
echo "Fixed menu name: Главное меню\n";

// Fix menu item labels
$menu_items = [
    33 => 'Главная',
    34 => 'Услуги',
];

foreach ($menu_items as $post_id => $label) {
    $wpdb->update(
        $wpdb->posts,
        ['post_title' => $label],
        ['ID' => $post_id]
    );
    echo "Fixed menu item ID $post_id: $label\n";
}

// 4. Clear WordPress caches
echo "\n4. Clearing caches...\n";

// Clear object cache
wp_cache_flush();
echo "- Object cache cleared\n";

// Clear transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "- Transients cleared\n";

// Clear WPGraphQL cache if available
if (function_exists('graphql_clear_cache')) {
    graphql_clear_cache();
    echo "- WPGraphQL cache cleared\n";
}

echo "\n=== VERIFICATION ===\n\n";

// Verify working hours
echo "Working Hours:\n";
echo "- weekdays: " . get_option($weekdays_key) . "\n";
echo "- weekend: " . get_option($weekend_key) . "\n\n";

// Verify price
echo "Price Fields (ID $price_id):\n";
echo "- currency: " . get_post_meta($price_id, 'currency', true) . "\n";
echo "- period: " . get_post_meta($price_id, 'period', true) . "\n";
echo "- installment_terms: " . get_post_meta($price_id, 'installment_terms', true) . "\n\n";

// Verify menu
$menu_term = $wpdb->get_row("SELECT name FROM {$wpdb->terms} WHERE term_id = 19");
echo "Menu name: " . $menu_term->name . "\n";

foreach ($menu_items as $post_id => $expected) {
    $post = get_post($post_id);
    echo "Menu item ID $post_id: " . $post->post_title . "\n";
}

echo "\nDone!\n";
