<?php
/**
 * Обновление Promotion Futures repeater field - убираем conditional logic
 * Запуск: docker exec wp-new-wordpress php /var/www/html/scripts/update-promotion-futures-field.php --allow-root
 */

require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "Updating Promotion Futures field...\n";

$field = $wpdb->get_row($wpdb->prepare(
    "SELECT ID FROM {$wpdb->posts} 
     WHERE post_excerpt = %s AND post_type = %s",
    'field_promotion_futures',
    'acf-field'
));

if (!$field) {
    echo "Field not found. Creating new field...\n";
    // Вызываем функцию создания поля
    if (function_exists('unident_create_promotion_futures_in_database')) {
        unident_create_promotion_futures_in_database();
    }
    exit;
}

echo "Found field ID: {$field->ID}\n";

// Убираем conditional logic
update_post_meta($field->ID, 'conditional_logic', 0);
update_post_meta($field->ID, 'instructions', 'Добавьте преимущества для акции');

// Обновляем post_content
$content = get_post($field->ID)->post_content;
$config = @unserialize($content);
if (is_array($config)) {
    unset($config['conditional_logic']);
    $config['instructions'] = 'Добавьте преимущества для акции';
    wp_update_post(array(
        'ID' => $field->ID,
        'post_content' => serialize($config),
    ));
}

// Очищаем кэш ACF
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
}

echo "SUCCESS: Field updated! Conditional logic removed.\n";
echo "The 'Futures' field should now be visible for all promotion types.\n";
