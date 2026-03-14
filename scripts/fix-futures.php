<?php
require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "Checking for Promotion Futures field...\n";

$field = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($field) {
    echo "Found field ID: {$field->ID}\n";
    update_post_meta($field->ID, 'conditional_logic', 0);
    delete_post_meta($field->ID, 'conditional_logic');
    echo "Removed conditional logic\n";
} else {
    echo "Field not found - will be created on next page load\n";
}

if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
    echo "ACF cache cleared\n";
}

echo "Done! Refresh promotion edit page.\n";
