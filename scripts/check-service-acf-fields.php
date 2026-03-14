<?php
/**
 * Проверка ACF полей для Services
 * Запуск: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/check-service-acf-fields.php --allow-root
 * (или замените wp-new-wordpress на имя вашего WordPress контейнера)
 */

$post_type = 'services';

// 1. Проверка CPT
if (!post_type_exists($post_type)) {
    echo "❌ Post type 'services' не зарегистрирован!\n";
    exit(1);
}
echo "✅ Post type 'services' существует\n";

// 2. Получить field groups для services
$field_groups = acf_get_field_groups(['post_type' => $post_type]);

if (empty($field_groups)) {
    echo "❌ Нет ACF field groups для post_type=services\n";
    echo "   Проверьте location в unident-acf-fields.php\n";
    exit(1);
}

echo "\n✅ Найдено field groups для услуг: " . count($field_groups) . "\n\n";

foreach ($field_groups as $group) {
    echo "--- {$group['title']} (key: {$group['key']}) ---\n";
    
    $fields = acf_get_fields($group['key']);
    if ($fields) {
        foreach ($fields as $field) {
            if ($field['type'] === 'tab') {
                echo "  [TAB] {$field['label']}\n";
            } else {
                $name = $field['name'] ?? $field['key'];
                echo "  - {$field['label']} (name: {$name})\n";
            }
        }
    }
    echo "\n";
}

// 3. Проверить наличие related_doctors
$has_related_doctors = false;
foreach ($field_groups as $group) {
    $fields = acf_get_fields($group['key']);
    foreach ($fields ?? [] as $field) {
        if (($field['name'] ?? '') === 'related_doctors') {
            $has_related_doctors = true;
            echo "✅ Поле related_doctors найдено в группе: {$group['title']}\n";
            break;
        }
    }
}

if (!$has_related_doctors) {
    echo "❌ Поле related_doctors не найдено ни в одной группе!\n";
}
