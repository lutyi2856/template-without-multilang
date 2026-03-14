<?php
/**
 * Clear WPGraphQL and WordPress caches completely
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

echo "=== CLEARING ALL CACHES ===\n\n";

// 1. Clear object cache
wp_cache_flush();
echo "✓ Object cache flushed\n";

// 2. Clear transients
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "✓ Transients cleared\n";

// 3. Flush rewrite rules
flush_rewrite_rules(true);
echo "✓ Rewrite rules flushed\n";

// 4. Clear WPGraphQL schema cache
delete_transient('graphql_schema');
delete_transient('graphql_types');
echo "✓ WPGraphQL schema cache cleared\n";

// 5. Clear WPGraphQL debug cache
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'graphql_%'");
echo "✓ WPGraphQL options cleared\n";

// 6. Clear Redis if available
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
    echo "✓ Redis cache flushed (if available)\n";
}

// 7. Clear PHP OPcache if available
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "✓ OPcache reset\n";
}

// 8. Recreate menu item labels
echo "\n=== RECREATING MENU ITEMS ===\n\n";

// Get menu items and update them
$menu_items = [
    33 => 'Главная',
    34 => 'Услуги',
];

foreach ($menu_items as $id => $label) {
    // Update post_title
    wp_update_post([
        'ID' => $id,
        'post_title' => $label,
    ]);
    
    // Also set _menu_item_title if needed
    update_post_meta($id, '_menu_item_title', '');
    
    echo "Updated menu item ID $id: $label\n";
}

// Update menu term
wp_update_term(19, 'nav_menu', [
    'name' => 'Главное меню',
]);
echo "Updated menu term: Главное меню\n";

echo "\n=== VERIFICATION ===\n\n";

// Verify via WP_Query
$post_33 = get_post(33);
$post_34 = get_post(34);
$menu_term = get_term(19, 'nav_menu');

echo "Menu item 33 title: " . $post_33->post_title . "\n";
echo "Menu item 34 title: " . $post_34->post_title . "\n";
echo "Menu term name: " . $menu_term->name . "\n";

// Clear cache one more time
wp_cache_flush();

echo "\nDone! Please reload the page.\n";
