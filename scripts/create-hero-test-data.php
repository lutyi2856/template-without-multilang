<?php
/**
 * Скрипт для создания тестовых данных для Hero блока
 * 
 * Создает:
 * - Термины городов (Москва, Санкт-Петербург, Екатеринбург)
 * - 9 тестовых врачей с разными специальностями и городами
 * 
 * Использование:
 * docker exec wordpress php /var/www/html/scripts/create-hero-test-data.php
 */

define('WP_USE_THEMES', false);
require_once __DIR__ . '/../wp-load.php';

echo "=== Создание тестовых данных для Hero блока ===\n\n";

// 1. Создать термины городов
echo "1. Создание терминов городов...\n";

$cities = [
    ['name' => 'Москва', 'slug' => 'moscow'],
    ['name' => 'Санкт-Петербург', 'slug' => 'spb'],
    ['name' => 'Екатеринбург', 'slug' => 'ekb'],
];

$city_terms = [];
foreach ($cities as $city) {
    $term = term_exists($city['slug'], 'cities');
    
    if (!$term) {
        $term = wp_insert_term($city['name'], 'cities', [
            'slug' => $city['slug'],
        ]);
        
        if (is_wp_error($term)) {
            echo "  ❌ Ошибка создания города {$city['name']}: " . $term->get_error_message() . "\n";
            continue;
        }
        
        echo "  ✅ Создан город: {$city['name']} (ID: {$term['term_id']})\n";
    } else {
        echo "  ℹ️  Город уже существует: {$city['name']} (ID: {$term['term_id']})\n";
    }
    
    $city_terms[$city['slug']] = $term['term_id'];
}

echo "\n";

// 2. Получить существующие клиники для привязки врачей
$clinics = get_posts([
    'post_type' => 'clinics',
    'posts_per_page' => -1,
    'post_status' => 'publish',
]);

if (empty($clinics)) {
    echo "⚠️  Внимание: Нет опубликованных клиник. Врачи будут созданы без привязки к клинике.\n\n";
}

// 3. Создать 9 тестовых врачей
echo "2. Создание 9 тестовых врачей...\n";

$doctors_data = [
    [
        'title' => 'Иванов Иван Иванович',
        'specialization' => 'Стоматолог-терапевт, ортопед',
        'experience' => 15,
        'rating' => 4.8,
        'rating_source' => 'Doctu.ru',
        'city' => 'moscow',
        'clinic_index' => 0,
    ],
    [
        'title' => 'Петрова Мария Сергеевна',
        'specialization' => 'Стоматолог-хирург, имплантолог',
        'experience' => 12,
        'rating' => 4.9,
        'rating_source' => 'Doctu.ru',
        'city' => 'moscow',
        'clinic_index' => 0,
    ],
    [
        'title' => 'Сидоров Алексей Петрович',
        'specialization' => 'Ортодонт',
        'experience' => 8,
        'rating' => 4.7,
        'rating_source' => 'Doctu.ru',
        'city' => 'moscow',
        'clinic_index' => 0,
    ],
    [
        'title' => 'Козлова Елена Викторовна',
        'specialization' => 'Стоматолог-терапевт, эндодонтист',
        'experience' => 20,
        'rating' => 4.9,
        'rating_source' => 'Doctu.ru',
        'city' => 'spb',
        'clinic_index' => min(1, count($clinics) - 1),
    ],
    [
        'title' => 'Морозов Дмитрий Александрович',
        'specialization' => 'Стоматолог-хирург',
        'experience' => 10,
        'rating' => 4.6,
        'rating_source' => 'Doctu.ru',
        'city' => 'spb',
        'clinic_index' => min(1, count($clinics) - 1),
    ],
    [
        'title' => 'Волкова Анна Дмитриевна',
        'specialization' => 'Детский стоматолог',
        'experience' => 7,
        'rating' => 4.8,
        'rating_source' => 'Doctu.ru',
        'city' => 'spb',
        'clinic_index' => min(1, count($clinics) - 1),
    ],
    [
        'title' => 'Лебедев Сергей Николаевич',
        'specialization' => 'Стоматолог-ортопед, протезист',
        'experience' => 18,
        'rating' => 4.9,
        'rating_source' => 'Doctu.ru',
        'city' => 'ekb',
        'clinic_index' => min(2, count($clinics) - 1),
    ],
    [
        'title' => 'Новикова Ольга Игоревна',
        'specialization' => 'Стоматолог-терапевт, пародонтолог',
        'experience' => 14,
        'rating' => 4.7,
        'rating_source' => 'Doctu.ru',
        'city' => 'ekb',
        'clinic_index' => min(2, count($clinics) - 1),
    ],
    [
        'title' => 'Соколов Павел Владимирович',
        'specialization' => 'Имплантолог, челюстно-лицевой хирург',
        'experience' => 22,
        'rating' => 5.0,
        'rating_source' => 'Doctu.ru',
        'city' => 'ekb',
        'clinic_index' => min(2, count($clinics) - 1),
    ],
];

$created_count = 0;
foreach ($doctors_data as $index => $doctor_data) {
    // Проверяем, существует ли уже врач с таким именем
    $existing = get_posts([
        'post_type' => 'doctors',
        'title' => $doctor_data['title'],
        'posts_per_page' => 1,
        'post_status' => 'any',
    ]);
    
    if (!empty($existing)) {
        echo "  ℹ️  Врач уже существует: {$doctor_data['title']}\n";
        continue;
    }
    
    // Создаем пост врача
    $post_id = wp_insert_post([
        'post_title' => $doctor_data['title'],
        'post_content' => "Врач {$doctor_data['specialization']} с опытом работы {$doctor_data['experience']} лет.",
        'post_excerpt' => $doctor_data['specialization'],
        'post_status' => 'publish',
        'post_type' => 'doctors',
    ]);
    
    if (is_wp_error($post_id)) {
        echo "  ❌ Ошибка создания врача {$doctor_data['title']}: " . $post_id->get_error_message() . "\n";
        continue;
    }
    
    // Устанавливаем ACF поля
    if (function_exists('update_field')) {
        update_field('experience', $doctor_data['experience'], $post_id);
        update_field('rating', $doctor_data['rating'], $post_id);
        update_field('rating_source', $doctor_data['rating_source'], $post_id);
        update_field('specialization', $doctor_data['specialization'], $post_id);
        
        // Привязываем клинику (если есть)
        if (!empty($clinics) && isset($clinics[$doctor_data['clinic_index']])) {
            update_field('clinic', $clinics[$doctor_data['clinic_index']]->ID, $post_id);
        }
    }
    
    // Привязываем город (taxonomy)
    if (isset($city_terms[$doctor_data['city']])) {
        wp_set_post_terms($post_id, [$city_terms[$doctor_data['city']]], 'cities');
    }
    
    echo "  ✅ Создан врач: {$doctor_data['title']} (ID: {$post_id}, Город: {$doctor_data['city']})\n";
    $created_count++;
}

echo "\n=== Готово! ===\n";
echo "Создано врачей: {$created_count} из " . count($doctors_data) . "\n";
echo "Терминов городов: " . count($city_terms) . "\n";
