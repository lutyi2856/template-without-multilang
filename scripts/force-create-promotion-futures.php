<?php
/**
 * Принудительное создание/обновление Promotion Futures repeater field
 * Запуск через WordPress admin или wp-cli
 */

// Подключаем WordPress
if (!defined('ABSPATH')) {
    require_once(__DIR__ . '/../wp-load.php');
}

global $wpdb;

echo "=== Force Creating Promotion Futures Field ===\n\n";

// 1. Находим field group
$group = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field-group'",
    'group_promotion_fields'
));

if (!$group) {
    echo "ERROR: Field group 'group_promotion_fields' not found!\n";
    exit(1);
}

echo "✓ Found field group ID: {$group->ID}\n";

// 2. Удаляем существующее поле если есть
$existing_field = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($existing_field) {
    echo "Found existing field ID: {$existing_field->ID}\n";
    
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
    echo "  Deleted existing field\n";
}

// 3. Создаем REPEATER field (БЕЗ conditional logic)
$repeater_id = wp_insert_post(array(
    'post_title' => 'Futures',
    'post_name' => 'field_promotion_futures',
    'post_excerpt' => 'field_promotion_futures',
    'post_type' => 'acf-field',
    'post_status' => 'publish',
    'post_parent' => $group->ID,
    'menu_order' => 10,
    'post_content' => serialize(array(
        'type' => 'repeater',
        'instructions' => 'Добавьте преимущества для акции',
        'layout' => 'table',
        'button_label' => 'Add Future',
        'show_in_graphql' => 1,
        'graphql_field_name' => 'futures',
    )),
));

if (is_wp_error($repeater_id)) {
    echo "ERROR creating repeater: " . $repeater_id->get_error_message() . "\n";
    exit(1);
}

echo "✓ Created repeater field ID: {$repeater_id}\n";

// Сохраняем метаданные repeater
update_post_meta($repeater_id, 'type', 'repeater');
update_post_meta($repeater_id, 'instructions', 'Добавьте преимущества для акции');
update_post_meta($repeater_id, 'layout', 'table');
update_post_meta($repeater_id, 'button_label', 'Add Future');
update_post_meta($repeater_id, 'show_in_graphql', 1);
update_post_meta($repeater_id, 'graphql_field_name', 'futures');
// ВАЖНО: Устанавливаем conditional_logic в 0 (false) - поле видно всегда
update_post_meta($repeater_id, 'conditional_logic', 0);

echo "✓ Saved repeater metadata (conditional_logic = 0)\n";

// 4. Создаем SUB-FIELD
$subfield_id = wp_insert_post(array(
    'post_title' => 'Text',
    'post_name' => 'field_promotion_future_text',
    'post_excerpt' => 'field_promotion_future_text',
    'post_type' => 'acf-field',
    'post_status' => 'publish',
    'post_parent' => $repeater_id,
    'menu_order' => 0,
    'post_content' => serialize(array(
        'type' => 'text',
        'show_in_graphql' => 1,
        'graphql_field_name' => 'text',
    )),
));

if (is_wp_error($subfield_id)) {
    echo "ERROR creating subfield: " . $subfield_id->get_error_message() . "\n";
    exit(1);
}

echo "✓ Created subfield ID: {$subfield_id}\n";

// Сохраняем метаданные subfield
update_post_meta($subfield_id, 'type', 'text');
update_post_meta($subfield_id, 'show_in_graphql', 1);
update_post_meta($subfield_id, 'graphql_field_name', 'text');

echo "✓ Saved subfield metadata\n";

// 5. Очищаем кэш ACF
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
    echo "✓ ACF cache cleared\n";
}

// 6. Проверяем результат
$check_field = $wpdb->get_row($wpdb->prepare(
    "SELECT ID, post_title FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = 'acf-field'",
    'field_promotion_futures'
));

if ($check_field) {
    $conditional = get_post_meta($check_field->ID, 'conditional_logic', true);
    echo "\n=== VERIFICATION ===\n";
    echo "Field ID: {$check_field->ID}\n";
    echo "Field Title: {$check_field->post_title}\n";
    echo "Conditional Logic: " . var_export($conditional, true) . "\n";
    echo "Type: " . get_post_meta($check_field->ID, 'type', true) . "\n";
}

echo "\n=== SUCCESS ===\n";
echo "Promotion Futures repeater field created!\n";
echo "Now refresh the promotion edit page in WordPress Admin.\n";
echo "The 'Futures' field should be visible for ALL promotion types.\n";
