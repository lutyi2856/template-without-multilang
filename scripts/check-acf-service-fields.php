<?php
/**
 * Скрипт для проверки структуры ACF полей для Services
 * 
 * Запуск: wp eval-file scripts/check-acf-service-fields.php
 */

if (!function_exists('acf_get_field')) {
    die("ACF plugin не активирован!\n");
}

echo "=== Проверка ACF полей для Services ===\n\n";

// Проверяем field group
$field_group = acf_get_field_group('group_service_fields');
if ($field_group) {
    echo "✓ Field Group найден: {$field_group['title']}\n";
    echo "  Key: {$field_group['key']}\n";
    echo "  Active: " . ($field_group['active'] ? 'Yes' : 'No') . "\n\n";
} else {
    echo "✗ Field Group НЕ найден!\n\n";
}

// Проверяем поле features
$features_field = acf_get_field('field_service_features');
if ($features_field) {
    echo "✓ Поле features найдено:\n";
    echo "  Key: {$features_field['key']}\n";
    echo "  Label: {$features_field['label']}\n";
    echo "  Name: {$features_field['name']}\n";
    echo "  Type: {$features_field['type']}\n";
    
    if ($features_field['type'] === 'repeater') {
        echo "  ✓ Тип правильный: REPEATER\n";
        if (isset($features_field['sub_fields']) && is_array($features_field['sub_fields'])) {
            echo "  Sub fields:\n";
            foreach ($features_field['sub_fields'] as $sub_field) {
                echo "    - {$sub_field['label']} ({$sub_field['name']}) - {$sub_field['type']}\n";
            }
        }
    } else {
        echo "  ✗ НЕПРАВИЛЬНЫЙ ТИП! Должен быть 'repeater', а сейчас: '{$features_field['type']}'\n";
    }
} else {
    echo "✗ Поле features НЕ найдено!\n";
}

echo "\n=== Проверка данных в базе ===\n\n";

// Проверяем есть ли услуги
$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => 3,
    'post_status' => 'any',
]);

if (empty($services)) {
    echo "Нет услуг для проверки\n";
} else {
    echo "Проверяем данные для первых " . count($services) . " услуг:\n\n";
    
    foreach ($services as $service) {
        echo "Service ID: {$service->ID} - {$service->post_title}\n";
        
        // Проверяем метаданные
        $features_meta = get_post_meta($service->ID, 'features', true);
        $features_field_value = get_field('features', $service->ID);
        
        echo "  get_post_meta('features'): ";
        if (is_array($features_meta)) {
            echo "Array с " . count($features_meta) . " элементами\n";
            if (!empty($features_meta)) {
                echo "    Первый элемент: " . print_r($features_meta[0], true) . "\n";
            }
        } elseif (is_string($features_meta)) {
            echo "String: " . substr($features_meta, 0, 100) . "...\n";
        } else {
            echo "Empty/null\n";
        }
        
        echo "  get_field('features'): ";
        if (is_array($features_field_value)) {
            echo "Array с " . count($features_field_value) . " элементами\n";
            if (!empty($features_field_value)) {
                echo "    Первый элемент: " . print_r($features_field_value[0], true) . "\n";
            }
        } elseif (is_string($features_field_value)) {
            echo "String: " . substr($features_field_value, 0, 100) . "...\n";
        } else {
            echo "Empty/null\n";
        }
        
        echo "\n";
    }
}

echo "\n=== Конец проверки ===\n";
