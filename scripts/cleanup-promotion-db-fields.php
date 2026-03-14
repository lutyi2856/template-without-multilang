<?php
/**
 * Cleanup: Delete fields from database (now registered in PHP)
 */
require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "=== CLEANUP DATABASE FIELDS ===\n\n";

// Find group in database
$group = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} WHERE post_excerpt = %s AND post_type = 'acf-field-group'",
    'group_promotion_fields'
));

if ($group) {
    echo "Found group ID: {$group->ID} in database\n";
    
    // Delete ALL fields from this group
    $fields = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
        $group->ID
    ));
    
    echo "Deleting " . count($fields) . " fields from database...\n";
    
    foreach ($fields as $field_id) {
        // Delete sub-fields
        $subs = $wpdb->get_col($wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
            $field_id
        ));
        foreach ($subs as $sub_id) {
            wp_delete_post($sub_id, true);
        }
        wp_delete_post($field_id, true);
    }
    
    // Delete group from database
    wp_delete_post($group->ID, true);
    echo "Deleted group from database\n";
}

// Clear cache
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
}
wp_cache_flush();

echo "\n✓ Database cleaned. Fields now registered in PHP only.\n";
echo "Refresh: http://localhost:8002/wp-admin/post.php?post=42&action=edit\n";
