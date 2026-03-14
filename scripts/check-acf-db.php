<?php
/**
 * Check ACF Field Groups in database
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

global $wpdb;

echo "=== ACF FIELD GROUPS IN DATABASE ===\n\n";

$groups = $wpdb->get_results(
    "SELECT ID, post_title, post_name, post_excerpt FROM {$wpdb->posts} WHERE post_type = 'acf-field-group' ORDER BY ID"
);

echo "Found " . count($groups) . " field groups in database:\n\n";

foreach ($groups as $group) {
    echo "ID: " . $group->ID . "\n";
    echo "Title: " . $group->post_title . "\n";
    echo "Name: " . $group->post_name . "\n";
    echo "Key (excerpt): " . $group->post_excerpt . "\n";
    echo "---\n";
}

// Also check wp_options for ACF local groups
echo "\n=== ACF LOCAL GROUPS (in options) ===\n\n";

$local_groups = get_option('acf_local_field_groups', []);
if (!empty($local_groups)) {
    echo "Found " . count($local_groups) . " local field groups in options.\n";
} else {
    echo "No local groups stored in options.\n";
}
