<?php
/**
 * Remove duplicate ACF Field Group from database
 * Keep only JSON version for "Price Settings"
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

global $wpdb;

echo "=== FIXING ACF DUPLICATES ===\n\n";

// Find and delete the database version of group_price_fields
$post = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT ID, post_title FROM {$wpdb->posts} WHERE post_type = 'acf-field-group' AND post_excerpt = %s",
        'group_price_fields'
    )
);

if ($post) {
    echo "Found database version: ID={$post->ID}, Title={$post->post_title}\n";
    
    // Delete associated fields first
    $fields = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
            $post->ID
        )
    );
    
    echo "Deleting " . count($fields) . " associated fields...\n";
    
    foreach ($fields as $field) {
        wp_delete_post($field->ID, true);
    }
    
    // Delete the field group
    wp_delete_post($post->ID, true);
    echo "Deleted field group from database.\n";
} else {
    echo "No database version found for group_price_fields.\n";
}

// Clear ACF cache
if (function_exists('acf_reset_local_fields')) {
    acf_reset_local_fields();
}
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}

echo "\n=== VERIFICATION ===\n\n";

// Verify remaining groups
$field_groups = acf_get_field_groups();

echo "Remaining field groups:\n";
foreach ($field_groups as $group) {
    if (strpos($group['key'], 'price') !== false || strpos($group['key'], 'service') !== false || strpos($group['key'], 'promotion') !== false) {
        echo "- " . $group['title'] . " (Key: " . $group['key'] . ", Local: " . (isset($group['local']) ? $group['local'] : "database") . ")\n";
    }
}

echo "\nDone!\n";
