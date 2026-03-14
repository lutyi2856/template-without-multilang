<?php
/**
 * Debug and create Promotion Futures field
 */
require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "=== DIAGNOSTIC ===\n\n";

// 1. Check field group exists
echo "1. Checking field group...\n";
$group = $wpdb->get_row($wpdb->prepare(
    "SELECT ID, post_title FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field-group'",
    'group_promotion_fields'
));

if (!$group) {
    echo "ERROR: Field group 'group_promotion_fields' not found!\n";
    echo "Available groups:\n";
    $groups = $wpdb->get_results("SELECT ID, post_title, post_excerpt FROM {$wpdb->posts} WHERE post_type = 'acf-field-group'");
    foreach ($groups as $g) {
        echo "  - {$g->post_title} (key: {$g->post_excerpt})\n";
    }
    exit(1);
}

echo "  ✓ Found group: {$group->post_title} (ID: {$group->ID})\n\n";

// 2. Check existing fields in group
echo "2. Existing fields in group:\n";
$fields = $wpdb->get_results($wpdb->prepare(
    "SELECT ID, post_title, post_excerpt FROM {$wpdb->posts} 
     WHERE post_parent = %d AND post_type = 'acf-field'",
    $group->ID
));

foreach ($fields as $field) {
    echo "  - {$field->post_title} (key: {$field->post_excerpt})\n";
}
echo "\n";

// 3. Check if Futures field exists
echo "3. Checking for Futures field...\n";
$existing = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($existing) {
    echo "  Found existing field ID: {$existing->ID}\n";
    echo "  Deleting and recreating...\n";
    // Delete sub-fields
    $subs = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
        $existing->ID
    ));
    foreach ($subs as $sub_id) {
        wp_delete_post($sub_id, true);
    }
    wp_delete_post($existing->ID, true);
    echo "  Deleted.\n";
}

echo "\n=== CREATING FIELD ===\n\n";

// 4. Create REPEATER field
echo "4. Creating repeater field...\n";
$repeater_config = array(
    'type' => 'repeater',
    'instructions' => 'Добавьте преимущества для акции',
    'layout' => 'table',
    'button_label' => 'Add Future',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'futures',
);

$repeater_id = wp_insert_post(array(
    'post_title' => 'Futures',
    'post_name' => 'field_promotion_futures',
    'post_excerpt' => 'field_promotion_futures',
    'post_type' => 'acf-field',
    'post_status' => 'publish',
    'post_parent' => $group->ID,
    'menu_order' => 10,
    'post_content' => serialize($repeater_config),
));

if (is_wp_error($repeater_id)) {
    echo "  ERROR: " . $repeater_id->get_error_message() . "\n";
    exit(1);
}

echo "  ✓ Created repeater field ID: {$repeater_id}\n\n";

// 5. Create SUB-FIELD
echo "5. Creating sub-field...\n";
$text_config = array(
    'type' => 'text',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'text',
);

$subfield_id = wp_insert_post(array(
    'post_title' => 'Text',
    'post_name' => 'field_promotion_future_text',
    'post_excerpt' => 'field_promotion_future_text',
    'post_type' => 'acf-field',
    'post_status' => 'publish',
    'post_parent' => $repeater_id,
    'menu_order' => 0,
    'post_content' => serialize($text_config),
));

if (is_wp_error($subfield_id)) {
    echo "  ERROR: " . $subfield_id->get_error_message() . "\n";
    exit(1);
}

echo "  ✓ Created subfield ID: {$subfield_id}\n\n";

// 6. Clear ACF cache
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
    echo "6. ✓ ACF cache cleared\n\n";
}

// 7. Verify
echo "=== VERIFICATION ===\n\n";
$check = $wpdb->get_row($wpdb->prepare(
    "SELECT ID, post_title, post_parent FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($check) {
    echo "✓ Field exists in database:\n";
    echo "  ID: {$check->ID}\n";
    echo "  Title: {$check->post_title}\n";
    echo "  Parent: {$check->post_parent}\n";
    
    $sub = $wpdb->get_row($wpdb->prepare(
        "SELECT ID, post_title FROM {$wpdb->posts} 
         WHERE post_parent = %d AND post_type = 'acf-field' LIMIT 1",
        $check->ID
    ));
    if ($sub) {
        echo "  Sub-field: {$sub->post_title} (ID: {$sub->ID})\n";
    }
}

echo "\n=== SUCCESS ===\n";
echo "Field created! Refresh promotion edit page.\n";
