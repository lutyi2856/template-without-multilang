<?php
/**
 * Flush ALL caches
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo "Flushing ALL caches...\n\n";

// 1. Flush object cache
wp_cache_flush();
echo "✓ Object cache flushed\n";

// 2. Flush rewrite rules
flush_rewrite_rules();
echo "✓ Rewrite rules flushed\n";

// 3. Delete all transients
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%_transient_%'");
echo "✓ All transients deleted\n";

// 4. Clear WPGraphQL schema cache
if (function_exists('WPGraphQL\clear_schema_cache')) {
    \WPGraphQL\clear_schema_cache();
    echo "✓ WPGraphQL schema cache cleared\n";
}

// 5. Clear ACF cache
if (function_exists('acf_reset_local')) {
    acf_reset_local();
    echo "✓ ACF local cache reset\n";
}

echo "\n✓ All caches flushed! Please restart WordPress container.\n";
