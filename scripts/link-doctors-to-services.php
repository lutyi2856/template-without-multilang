<?php
/**
 * Связываем существующих врачей с услугами (test data)
 * 
 * Запуск:
 * docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/link-doctors-to-services.php --allow-root
 */

// Получаем всех врачей
$doctors = get_posts([
    'post_type' => 'doctors',
    'posts_per_page' => -1,
    'post_status' => 'publish',
]);

// Получаем все услуги
$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => -1,
    'post_status' => 'publish',
]);

if (empty($doctors)) {
    echo "❌ Врачей не найдено\n";
    exit(1);
}

if (empty($services)) {
    echo "❌ Услуг не найдено\n";
    exit(1);
}

echo "✅ Найдено врачей: " . count($doctors) . "\n";
echo "✅ Найдено услуг: " . count($services) . "\n\n";

// Связываем каждого врача с 2-3 случайными услугами
foreach ($doctors as $doctor) {
    // Выбираем 2-3 случайные услуги
    $num_services = rand(2, min(3, count($services)));
    $random_keys = array_rand($services, $num_services);
    
    if (!is_array($random_keys)) {
        $random_keys = [$random_keys];
    }
    
    $selected_services = [];
    foreach ($random_keys as $key) {
        $selected_services[] = $services[$key]->ID;
    }
    
    // Связываем врача с услугами (двусторонняя связь)
    update_field('related_services', $selected_services, $doctor->ID);
    
    // Обновляем обратную связь на услугах
    foreach ($selected_services as $service_id) {
        $existing_doctors = get_field('related_doctors', $service_id) ?: [];
        if (!is_array($existing_doctors)) {
            $existing_doctors = [];
        }
        
        // Добавляем врача если еще нет
        if (!in_array($doctor->ID, $existing_doctors)) {
            $existing_doctors[] = $doctor->ID;
            update_field('related_doctors', $existing_doctors, $service_id);
        }
    }
    
    echo "✅ Врач: " . $doctor->post_title . " → " . count($selected_services) . " услуг\n";
}

// Очистка кэша
wp_cache_flush();

echo "\n✅ Связывание завершено!\n";
echo "🔍 Проверьте в GraphQL IDE:\n";
echo "query {\n";
echo "  doctors {\n";
echo "    nodes {\n";
echo "      title\n";
echo "      relatedServices {\n";
echo "        title\n";
echo "      }\n";
echo "    }\n";
echo "  }\n";
echo "}\n";
