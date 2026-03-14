<?php
/**
 * Final fix: Delete ALL duplicates, let mu-plugin create ONE correct field
 */
require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "=== FINAL FIX ===\n\n";

// 1. Find group
$group = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} WHERE post_excerpt = %s AND post_type = 'acf-field-group'",
    'group_promotion_fields'
));

if (!$group) {
    die("ERROR: Group not found\n");
}

echo "Group ID: {$group->ID}\n\n";

// 2. Delete ALL fields with field_promotion_future% keys
$all_fields = $wpdb->get_col($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_parent = %d 
     AND post_type = 'acf-field'
     AND post_excerpt LIKE %s",
    $group->ID,
    'field_promotion_future%'
));

echo "Found " . count($all_fields) . " fields to delete\n";

foreach ($all_fields as $field_id) {
    // Delete sub-fields first
    $subs = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
        $field_id
    ));
    foreach ($subs as $sub_id) {
        wp_delete_post($sub_id, true);
    }
    wp_delete_post($field_id, true);
}

echo "✓ Deleted all duplicates\n\n";

// 3. Clear cache
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
}
wp_cache_flush();
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");

echo "✓ Cache cleared\n\n";

// 4. Call mu-plugin function to create field
if (function_exists('unident_create_promotion_futures_in_database')) {
    unident_create_promotion_futures_in_database();
    echo "✓ Called mu-plugin function\n\n";
}

// 5. Verify
$check = $wpdb->get_results($wpdb->prepare(
    "SELECT ID, post_title, post_excerpt FROM {$wpdb->posts} 
     WHERE post_parent = %d AND post_type = 'acf-field'",
    $group->ID
));

echo "Fields in group:\n";
foreach ($check as $f) {
    echo "  - {$f->post_title} (key: {$f->post_excerpt}, ID: {$f->ID})\n";
}

echo "\n✓ DONE. Refresh: http://localhost:8002/wp-admin/post.php?post=42&action=edit\n";
