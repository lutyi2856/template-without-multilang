<?php
/**
 * Обновление service_categories: создать Гнатология, Гигиена; удалить Детская стоматология (pediatric)
 *
 * Запуск:
 *   docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/update-service-categories.php --allow-root
 */

echo "=== Обновление service_categories ===\n\n";

// 1. Создать недостающие термы
$to_create = [
    ['name' => 'Гнатология', 'slug' => 'gnatologiya', 'description' => 'Лечение дисфункций ВНЧС'],
    ['name' => 'Гигиена', 'slug' => 'gigiena', 'description' => 'Профессиональная гигиена полости рта'],
];

foreach ($to_create as $cat) {
    $existing = get_term_by('slug', $cat['slug'], 'service_categories');
    if ($existing && !is_wp_error($existing)) {
        echo "✓ Категория '{$cat['name']}' уже существует (ID: {$existing->term_id})\n";
    } else {
        $result = wp_insert_term($cat['name'], 'service_categories', [
            'slug'        => $cat['slug'],
            'description' => $cat['description'] ?? '',
        ]);
        if (is_wp_error($result)) {
            echo "✗ Ошибка создания '{$cat['name']}': " . $result->get_error_message() . "\n";
        } else {
            echo "✓ Создана категория '{$cat['name']}' (ID: {$result['term_id']})\n";
        }
    }
}

// 2. Удалить Детская стоматология (pediatric)
echo "\n--- Удаление Детская стоматология (pediatric) ---\n";
$pediatric = get_term_by('slug', 'pediatric', 'service_categories');
if ($pediatric && !is_wp_error($pediatric)) {
    $deleted = wp_delete_term($pediatric->term_id, 'service_categories');
    if (is_wp_error($deleted)) {
        echo "✗ Ошибка удаления pediatric: " . $deleted->get_error_message() . "\n";
    } else {
        echo "✓ Категория 'Детская стоматология' удалена\n";
    }
} else {
    echo "• Категория pediatric не найдена (возможно, уже удалена)\n";
}

wp_cache_flush();
echo "\n✓ Готово!\n";
