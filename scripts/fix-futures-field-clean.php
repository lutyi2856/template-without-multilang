<?php
/**
 * Clean all duplicates and create ONE Futures field
 */
require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "=== CLEANING DUPLICATES ===\n\n";

// 1. Find group
$group = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} WHERE post_excerpt = %s AND post_type = 'acf-field-group'",
    'group_promotion_fields'
));

if (!$group) {
    die("ERROR: Group not found\n");
}

echo "Group ID: {$group->ID}\n\n";

// 2. Delete ALL Futures fields
$all_futures = $wpdb->get_col($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_parent = %d 
     AND post_type = 'acf-field'
     AND post_excerpt LIKE %s",
    $group->ID,
    'field_promotion_future%'
));

echo "Found " . count($all_futures) . " fields to delete\n";

foreach ($all_futures as $field_id) {
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

echo "Deleted all duplicates\n\n";

// 3. Create ONE field
echo "=== CREATING SINGLE FUTURES FIELD ===\n\n";

$repeater_config = array(
    'type' => 'repeater',
    'instructions' => '',
    'required' => 0,
    'layout' => 'table',
    'button_label' => 'Add Future',
    'min' => '',
    'max' => '',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'futures',
);

$repeater_id = wp_insert_post(array(
    'post_title' => 'Futures',
    'post_name' => 'futures',
    'post_excerpt' => 'field_promotion_futures',
    'post_type' => 'acf-field',
    'post_status' => 'publish',
    'post_parent' => $group->ID,
    'menu_order' => 0,
    'post_content' => serialize($repeater_config),
));

if (is_wp_error($repeater_id)) {
    die("ERROR: " . $repeater_id->get_error_message() . "\n");
}

echo "Created repeater field ID: {$repeater_id}\n";

// 4. Create sub-field
$text_config = array(
    'type' => 'text',
    'instructions' => '',
    'required' => 0,
    'default_value' => '',
    'placeholder' => '',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'text',
);

$subfield_id = wp_insert_post(array(
    'post_title' => 'Text',
    'post_name' => 'text',
    'post_excerpt' => 'field_promotion_future_text',
    'post_type' => 'acf-field',
    'post_status' => 'publish',
    'post_parent' => $repeater_id,
    'menu_order' => 0,
    'post_content' => serialize($text_config),
));

if (is_wp_error($subfield_id)) {
    die("ERROR: " . $subfield_id->get_error_message() . "\n");
}

echo "Created sub-field ID: {$subfield_id}\n\n";

// 5. Clear ALL caches
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
}
wp_cache_flush();

// Delete transients
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_site_transient_%'");

echo "=== CACHE CLEARED ===\n\n";

// 6. Verify
$check = $wpdb->get_results($wpdb->prepare(
    "SELECT ID, post_title FROM {$wpdb->posts} 
     WHERE post_parent = %d AND post_type = 'acf-field'",
    $group->ID
));

echo "Fields in group:\n";
foreach ($check as $f) {
    echo "  - {$f->post_title} (ID: {$f->ID})\n";
}

echo "\n✓ Done. Refresh page: http://localhost:8002/wp-admin/post.php?post=42&action=edit\n";
