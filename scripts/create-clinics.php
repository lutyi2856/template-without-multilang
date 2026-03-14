<?php
/**
 * Создание 4 клиник УниДент с ACF полями
 * 
 * Usage: docker exec wordpress-new php /var/www/html/scripts/create-clinics.php
 */

// Подключаем WordPress
// Ищем wp-config.php
if (file_exists(__DIR__ . '/../wp-config-custom.php')) {
    require_once __DIR__ . '/../wp-config-custom.php';
} elseif (file_exists(__DIR__ . '/../wp-config.php')) {
    require_once __DIR__ . '/../wp-config.php';
} else {
    die("❌ Не найден wp-config.php\n");
}

echo "=== Создание клиник УниДент ===\n\n";

$clinics = [
    [
        'title' => 'УниДент на Арбатской',
        'address' => 'ул. Арбат, 15, Москва',
        'phone' => '+7 (495) 123-45-67',
        'metro' => 'Арбатская',
        'coordinates' => ['latitude' => 55.751999, 'longitude' => 37.603056],
        'working_hours' => ['weekdays' => 'Пн-Сб 10:00-22:00', 'weekend' => 'Вс 9:00-16:00'],
    ],
    [
        'title' => 'УниДент на Красных Воротах',
        'address' => 'Садовая-Спасская ул., 21, Москва',
        'phone' => '+7 (495) 234-56-78',
        'metro' => 'Красные Ворота',
        'coordinates' => ['latitude' => 55.772000, 'longitude' => 37.649167],
        'working_hours' => ['weekdays' => 'Пн-Пт 9:00-21:00', 'weekend' => 'Сб-Вс 10:00-18:00'],
    ],
    [
        'title' => 'УниДент на Маяковской',
        'address' => 'ул. Тверская-Ямская, 1-я, 14, Москва',
        'phone' => '+7 (495) 345-67-89',
        'metro' => 'Маяковская',
        'coordinates' => ['latitude' => 55.769444, 'longitude' => 37.595833],
        'working_hours' => ['weekdays' => 'Пн-Сб 10:00-22:00', 'weekend' => 'Вс 9:00-16:00'],
    ],
    [
        'title' => 'УниДент на Таганской',
        'address' => 'Таганская площадь, 76/1, стр. 1, Москва',
        'phone' => '+7 (495) 456-78-90',
        'metro' => 'Таганская',
        'coordinates' => ['latitude' => 55.742222, 'longitude' => 37.653611],
        'working_hours' => ['weekdays' => 'Пн-Сб 8:00-20:00', 'weekend' => 'Вс 10:00-17:00'],
    ],
];

$created_count = 0;

foreach ($clinics as $clinic_data) {
    // Проверяем, существует ли клиника с таким названием
    $existing = get_page_by_title($clinic_data['title'], OBJECT, 'clinics');
    
    if ($existing) {
        echo "⚠️  Клиника уже существует: {$clinic_data['title']} (ID: {$existing->ID})\n";
        continue;
    }
    
    // Создаем пост
    $post_id = wp_insert_post([
        'post_title' => $clinic_data['title'],
        'post_content' => '',
        'post_status' => 'publish',
        'post_type' => 'clinics',
    ]);

    if (is_wp_error($post_id)) {
        echo "❌ Ошибка создания клиники: {$clinic_data['title']}\n";
        echo "   Причина: " . $post_id->get_error_message() . "\n";
        continue;
    }

    // Сохраняем ACF поля
    update_field('address', $clinic_data['address'], $post_id);
    update_field('phone', $clinic_data['phone'], $post_id);
    update_field('metro_station', $clinic_data['metro'], $post_id);
    update_field('coordinates', $clinic_data['coordinates'], $post_id);
    update_field('working_hours', $clinic_data['working_hours'], $post_id);

    echo "✅ Создана клиника: {$clinic_data['title']} (ID: {$post_id})\n";
    echo "   Адрес: {$clinic_data['address']}\n";
    echo "   Метро: {$clinic_data['metro']}\n";
    echo "   Телефон: {$clinic_data['phone']}\n\n";
    
    $created_count++;
}

echo "\n=== Итого ===\n";
echo "Создано клиник: {$created_count}\n";

// Подсчитываем общее количество клиник
$total_clinics = wp_count_posts('clinics');
$published_count = isset($total_clinics->publish) ? $total_clinics->publish : 0;
echo "Всего опубликованных клиник: {$published_count}\n";

echo "\n✅ Готово!\n";
