<?php
/**
 * Скрипт для исправления поля Features - преобразование из text в repeater
 * 
 * Запуск через WordPress Admin:
 * 1. Установить плагин "Code Snippets" или использовать functions.php
 * 2. Или запустить через WP-CLI: wp eval-file scripts/fix-service-features-field.php
 */

// Защита от прямого доступа
if (!defined('ABSPATH')) {
    // Если запускается через WP-CLI
    require_once(__DIR__ . '/../../wp-load.php');
}

if (!function_exists('acf_get_field')) {
    die("ACF plugin не активирован!\n");
}

echo "=== Исправление поля Features для Services ===\n\n";

global $wpdb;

$field_key = 'field_service_features';
$field_group_key = 'group_service_fields';

// Шаг 1: Удаляем старое поле из базы данных
echo "Шаг 1: Удаление старого поля из базы данных...\n";

$field_post = $wpdb->get_row($wpdb->prepare(
    "SELECT * FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'acf-field'",
    $field_key
));

if ($field_post) {
    $field_type = get_post_meta($field_post->ID, 'type', true);
    echo "  Найдено поле типа: {$field_type}\n";
    
    if ($field_type === 'text' || $field_type !== 'repeater') {
        // Удаляем старое поле
        wp_delete_post($field_post->ID, true);
        echo "  ✓ Старое поле удалено\n";
    } else {
        echo "  Поле уже repeater, пропускаем удаление\n";
    }
} else {
    echo "  Поле не найдено в базе, продолжаем...\n";
}

// Шаг 2: Очищаем кэш ACF
echo "\nШаг 2: Очистка кэша ACF...\n";
if (function_exists('acf_get_store')) {
    acf_get_store('fields')->reset();
    echo "  ✓ Кэш очищен\n";
}

// Шаг 3: Проверяем что поле зарегистрировано правильно
echo "\nШаг 3: Проверка регистрации поля...\n";

// Принудительно вызываем регистрацию полей
do_action('acf/init');

// Ждем немного для регистрации
sleep(1);

$registered_field = acf_get_field($field_key);
if ($registered_field) {
    echo "  Поле найдено:\n";
    echo "    Тип: {$registered_field['type']}\n";
    echo "    Label: {$registered_field['label']}\n";
    echo "    Name: {$registered_field['name']}\n";
    
    if ($registered_field['type'] === 'repeater') {
        echo "  ✓ Поле правильно зарегистрировано как REPEATER\n";
        
        if (isset($registered_field['sub_fields']) && is_array($registered_field['sub_fields'])) {
            echo "  Sub fields:\n";
            foreach ($registered_field['sub_fields'] as $sub_field) {
                echo "    - {$sub_field['label']} ({$sub_field['name']}) - {$sub_field['type']}\n";
            }
        }
    } else {
        echo "  ✗ ОШИБКА: Поле НЕ repeater! Текущий тип: {$registered_field['type']}\n";
        echo "  Попробуйте перезагрузить WordPress полностью (перезапустить сервер)\n";
    }
} else {
    echo "  ✗ Поле не найдено после регистрации!\n";
    echo "  Проверьте что функция unident_register_service_fields() вызывается\n";
}

// Шаг 4: Миграция данных
echo "\nШаг 4: Миграция старых данных...\n";

$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => -1,
    'post_status' => 'any',
]);

$migrated_count = 0;
foreach ($services as $service) {
    $post_id = $service->ID;
    $old_features = get_post_meta($post_id, 'features', true);
    
    // Проверяем есть ли старые данные в текстовом формате
    if (is_string($old_features) && !empty($old_features)) {
        $decoded = json_decode($old_features, true);
        
        if (is_array($decoded)) {
            $repeater_data = [];
            foreach ($decoded as $item) {
                if (is_array($item) && isset($item['text'])) {
                    $repeater_data[] = ['text' => sanitize_text_field($item['text'])];
                } elseif (is_string($item)) {
                    $repeater_data[] = ['text' => sanitize_text_field($item)];
                }
            }
            
            if (!empty($repeater_data)) {
                update_field('features', $repeater_data, $post_id);
                $migrated_count++;
                echo "  Мигрированы данные для услуги ID: {$post_id}\n";
            }
        }
    }
}

if ($migrated_count > 0) {
    echo "  ✓ Мигрировано {$migrated_count} услуг\n";
} else {
    echo "  Нет данных для миграции\n";
}

echo "\n=== Готово ===\n";
echo "\nИнструкции:\n";
echo "1. Перезагрузите страницу редактирования услуги в админке WordPress\n";
echo "2. Поле должно отображаться как Repeater с кнопкой 'Добавить особенность'\n";
echo "3. Если поле все еще текстовое, перезапустите WordPress сервер полностью\n";
