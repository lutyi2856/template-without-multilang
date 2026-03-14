<?php
/**
 * Complete creation of Promotion Fields group and Futures repeater
 * Согласно skills: создаем все в базе данных
 */
require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "=== CREATING PROMOTION FIELDS ===\n\n";

// 1. Check if field group exists in database
$existing_group = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field-group'",
    'group_promotion_fields'
));

if (!$existing_group) {
    echo "1. Creating field group in database...\n";
    
    $group_id = wp_insert_post(array(
        'post_title' => 'Настройки акции',
        'post_name' => 'group_promotion_fields',
        'post_excerpt' => 'group_promotion_fields',  // KEY!
        'post_type' => 'acf-field-group',
        'post_status' => 'publish',
        'post_content' => '',
    ));
    
    if (is_wp_error($group_id)) {
        echo "ERROR: " . $group_id->get_error_message() . "\n";
        exit(1);
    }
    
    // Group meta
    update_post_meta($group_id, 'location', array(
        array(
            array(
                'param' => 'post_type',
                'operator' => '==',
                'value' => 'promotions',
            ),
        ),
    ));
    update_post_meta($group_id, 'position', 'normal');
    update_post_meta($group_id, 'style', 'default');
    update_post_meta($group_id, 'active', 1);
    update_post_meta($group_id, 'show_in_graphql', 1);
    update_post_meta($group_id, 'graphql_field_name', 'promotionFields');
    
    echo "  ✓ Created field group ID: {$group_id}\n\n";
} else {
    $group_id = $existing_group->ID;
    echo "1. Field group already exists: ID {$group_id}\n\n";
}

// 2. Delete existing Futures field if exists
$existing_field = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($existing_field) {
    echo "2. Deleting existing Futures field...\n";
    $subs = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_parent = %d AND post_type = 'acf-field'",
        $existing_field->ID
    ));
    foreach ($subs as $sub_id) {
        wp_delete_post($sub_id, true);
    }
    wp_delete_post($existing_field->ID, true);
    echo "  ✓ Deleted\n\n";
}

// 3. Create REPEATER field
echo "3. Creating Futures repeater field...\n";
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
    'post_parent' => $group_id,
    'menu_order' => 10,
    'post_content' => serialize($repeater_config),
));

if (is_wp_error($repeater_id)) {
    echo "ERROR: " . $repeater_id->get_error_message() . "\n";
    exit(1);
}

echo "  ✓ Created repeater ID: {$repeater_id}\n\n";

// 4. Create SUB-FIELD
echo "4. Creating Text sub-field...\n";
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
    echo "ERROR: " . $subfield_id->get_error_message() . "\n";
    exit(1);
}

echo "  ✓ Created subfield ID: {$subfield_id}\n\n";

// 5. Clear cache
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
}
wp_cache_flush();

echo "=== SUCCESS ===\n";
echo "Futures repeater field created!\n";
echo "Refresh promotion edit page in WordPress Admin.\n";
