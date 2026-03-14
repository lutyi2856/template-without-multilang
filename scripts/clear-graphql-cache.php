<?php
require('/var/www/html/wp-load.php');

echo 'Clearing WPGraphQL schema cache...' . PHP_EOL;

// Delete all GraphQL transients
global $wpdb;
$deleted = $wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_graphql%' OR option_name LIKE '_transient_timeout_graphql%'");
echo 'Deleted ' . $deleted . ' GraphQL transients' . PHP_EOL;

// Clear WPGraphQL schema
if (function_exists('graphql_clear_schema')) {
    graphql_clear_schema();
    echo 'Called graphql_clear_schema()' . PHP_EOL;
}

// Clear object cache
wp_cache_flush();
echo 'Flushed object cache' . PHP_EOL;

// Flush rewrite rules
flush_rewrite_rules();
echo 'Flushed rewrite rules' . PHP_EOL;

echo PHP_EOL . 'Done! GraphQL schema cache cleared.' . PHP_EOL;
echo 'Please restart WordPress container now.' . PHP_EOL;
