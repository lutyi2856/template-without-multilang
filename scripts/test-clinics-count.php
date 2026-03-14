<?php
/**
 * Проверка динамического подсчета клиник через GraphQL
 */

// Подключаем WordPress
if (file_exists(__DIR__ . '/../wp-config-custom.php')) {
    require_once __DIR__ . '/../wp-config-custom.php';
} elseif (file_exists(__DIR__ . '/../wp-config.php')) {
    require_once __DIR__ . '/../wp-config.php';
} else {
    die("❌ Не найден wp-config.php\n");
}

echo "=== Проверка динамического счетчика клиник ===\n\n";

// 1. Прямой подсчет через wp_count_posts
$clinics_count = wp_count_posts('clinics');
$published_count = isset($clinics_count->publish) ? $clinics_count->publish : 0;

echo "1. Прямой подсчет wp_count_posts('clinics'):\n";
echo "   Опубликовано клиник: {$published_count}\n\n";

// 2. Получение через ACF (старый способ - должен вернуть null/старое значение)
$old_locations_count = get_field('locations_count', 'options');
echo "2. Старое ACF поле locations_count:\n";
echo "   Значение: " . ($old_locations_count ?: 'null/не задано') . "\n\n";

// 3. Симуляция GraphQL resolver
echo "3. Симуляция GraphQL resolver (новый способ):\n";
$clinics_count_resolver = wp_count_posts('clinics');
$locations_count_resolver = isset($clinics_count_resolver->publish) ? (int) $clinics_count_resolver->publish : 0;
echo "   locationsCount: {$locations_count_resolver}\n\n";

// 4. Список всех клиник
echo "4. Список созданных клиник:\n";
$clinics = get_posts([
    'post_type' => 'clinics',
    'post_status' => 'publish',
    'numberposts' => -1,
]);

foreach ($clinics as $clinic) {
    $address = get_field('address', $clinic->ID);
    $metro = get_field('metro_station', $clinic->ID);
    echo "   - {$clinic->post_title}\n";
    echo "     Адрес: {$address}\n";
    echo "     Метро: {$metro}\n";
}

echo "\n✅ Проверка завершена!\n";
echo "\n💡 Ожидаемый результат в header: \"4 клиники рядом с метро\"\n";
