<?php
/**
 * Fix Promotion Futures field - remove conditional logic
 * Run: docker exec wp-new-wordpress wp eval-file scripts/fix-promotion-futures.php --allow-root
 */

if (!defined('ABSPATH')) {
    require_once(__DIR__ . '/../wp-load.php');
}

global $wpdb;

$field = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($field) {
    update_post_meta($field->ID, 'conditional_logic', 0);
    delete_post_meta($field->ID, 'conditional_logic');
    echo "Removed conditional logic from field ID: {$field->ID}\n";
} else {
    echo "Field not found. It will be created on next page load.\n";
}

if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
    echo "ACF cache cleared\n";
}

echo "Done. Refresh promotion edit page.\n";
