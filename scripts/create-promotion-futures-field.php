<?php
/**
 * Скрипт для создания Promotion Futures repeater field
 * Запуск: docker exec wp-new-wordpress wp eval-file scripts/create-promotion-futures-field.php --allow-root
 */

require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "Creating Promotion Futures repeater field...\n";

// Находим field group для promotions
$group = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field-group'",
    'group_promotion_fields'
));

if (!$group) {
    echo "ERROR: Field group 'group_promotion_fields' not found!\n";
    exit(1);
}

echo "Found field group ID: {$group->ID}\n";

// Удаляем существующее поле если есть
$existing_field = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($existing_field) {
    echo "Deleting existing field ID: {$existing_field->ID}\n";
    // Удаляем sub-fields
    $subfields = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} 
         WHERE post_parent = %d AND post_type = 'acf-field'",
        $existing_field->ID
    ));
    foreach ($subfields as $subfield_id) {
        wp_delete_post($subfield_id, true);
        echo "  Deleted subfield ID: {$subfield_id}\n";
    }
    wp_delete_post($existing_field->ID, true);
}

// 1. Создаем REPEATER field
$repeater_config = array(
    'type' => 'repeater',
    'instructions' => 'Добавьте преимущества для бесплатной акции',
    'layout' => 'table',
    'button_label' => 'Add Future',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'futures',
    'conditional_logic' => array(
        array(
            array(
                'field' => 'field_promotion_action_type',
                'operator' => '==',
                'value' => 'free',
            ),
        ),
    ),
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
    echo "ERROR creating repeater: " . $repeater_id->get_error_message() . "\n";
    exit(1);
}

echo "Created repeater field ID: {$repeater_id}\n";

// Сохраняем метаданные repeater
update_post_meta($repeater_id, 'type', 'repeater');
update_post_meta($repeater_id, 'instructions', 'Добавьте преимущества для бесплатной акции');
update_post_meta($repeater_id, 'layout', 'table');
update_post_meta($repeater_id, 'button_label', 'Add Future');
update_post_meta($repeater_id, 'show_in_graphql', 1);
update_post_meta($repeater_id, 'graphql_field_name', 'futures');
update_post_meta($repeater_id, 'conditional_logic', array(
    array(
        array(
            'field' => 'field_promotion_action_type',
            'operator' => '==',
            'value' => 'free',
        ),
    ),
));

// 2. Создаем SUB-FIELD
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
    echo "ERROR creating subfield: " . $subfield_id->get_error_message() . "\n";
    exit(1);
}

echo "Created subfield ID: {$subfield_id}\n";

// Сохраняем метаданные subfield
update_post_meta($subfield_id, 'type', 'text');
update_post_meta($subfield_id, 'show_in_graphql', 1);
update_post_meta($subfield_id, 'graphql_field_name', 'text');

// Очищаем кэш ACF
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
    echo "ACF cache cleared\n";
}

echo "SUCCESS: Promotion Futures repeater field created!\n";
echo "Now go to WordPress Admin -> Promotions -> Edit a promotion\n";
echo "Select 'Free (Бесплатно)' in 'Тип акции' field\n";
echo "The 'Futures' repeater should appear below.\n";
