<?php
/**
 * Delete duplicate ACF Field Group
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

global $wpdb;

$duplicate_id = 55; // The duplicate Price Settings

echo "=== DELETING DUPLICATE FIELD GROUP ID: $duplicate_id ===\n\n";

// First, delete all fields associated with this group
$fields = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT ID, post_title FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
        $duplicate_id
    )
);

echo "Found " . count($fields) . " fields to delete:\n";
foreach ($fields as $field) {
    echo "- ID: {$field->ID}, Title: {$field->post_title}\n";
    wp_delete_post($field->ID, true);
}

// Delete the field group itself
$result = wp_delete_post($duplicate_id, true);

if ($result) {
    echo "\nSuccessfully deleted field group ID: $duplicate_id\n";
} else {
    echo "\nFailed to delete field group ID: $duplicate_id\n";
}

// Clear caches
wp_cache_flush();

echo "\n=== VERIFICATION ===\n\n";

$groups = $wpdb->get_results(
    "SELECT ID, post_title, post_name FROM {$wpdb->posts} WHERE post_type = 'acf-field-group' ORDER BY ID"
);

echo "Remaining field groups in database:\n";
foreach ($groups as $group) {
    echo "- ID: {$group->ID}, Title: {$group->post_title}, Name: {$group->post_name}\n";
}

echo "\nDone!\n";
