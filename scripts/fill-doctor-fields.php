<?php
/**
 * Fill missing doctor ACF fields with test data
 * 
 * Заполняет недостающие поля врачей случайными тестовыми данными:
 * - experience (стаж)
 * - rating (рейтинг)
 * - rating_source (источник рейтинга)
 * - clinic (клиника)
 * - related_services (услуги)
 * - related_reviews (отзывы)
 * - related_works (работы)
 * 
 * Также обновляет обратные связи (related_doctors) в связанных сущностях.
 * 
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/fill-doctor-fields.php
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get random experience date (5-30 years ago)
 */
function get_random_experience_date() {
    $years_ago = rand(5, 30);
    $date = date('Y-m-d', strtotime("-{$years_ago} years"));
    return $date;
}

/**
 * Get random rating (4.0 - 5.0)
 */
function get_random_rating() {
    return round(rand(400, 500) / 100, 1);
}

/**
 * Get random rating source
 */
function get_random_rating_source() {
    $sources = ['Doctu.ru', 'Prodoctorov.ru', 'Zoon.ru', 'Yandex.Maps'];
    return $sources[array_rand($sources)];
}

/**
 * Update bidirectional relationship
 * Adds doctor to related entity's related_doctors field
 */
function update_bidirectional_relationship($entity_id, $doctor_id) {
    // Get existing related doctors
    $related_doctors = get_field('related_doctors', $entity_id);
    
    // Initialize if empty
    if (!is_array($related_doctors)) {
        $related_doctors = [];
    }
    
    // Convert WP_Post objects to IDs
    $related_doctor_ids = [];
    foreach ($related_doctors as $doctor) {
        if ($doctor instanceof WP_Post) {
            $related_doctor_ids[] = $doctor->ID;
        } elseif (is_numeric($doctor)) {
            $related_doctor_ids[] = (int)$doctor;
        }
    }
    
    // Add doctor if not already in list
    if (!in_array($doctor_id, $related_doctor_ids)) {
        $related_doctor_ids[] = $doctor_id;
        update_field('related_doctors', $related_doctor_ids, $entity_id);
        return true;
    }
    
    return false;
}

// =============================================================================
// Main Script
// =============================================================================

echo "=== Заполнение недостающих полей врачей ===\n\n";

// 1. Get all entities
echo "Загружаем данные...\n";
$doctors = get_posts([
    'post_type' => 'doctors',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

$clinics = get_posts([
    'post_type' => 'clinics',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

$services = get_posts([
    'post_type' => 'services',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

$reviews = get_posts([
    'post_type' => 'reviews',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

$works = get_posts([
    'post_type' => 'our-works',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

echo "Найдено врачей: " . count($doctors) . "\n";
echo "Найдено клиник: " . count($clinics) . "\n";
echo "Найдено услуг: " . count($services) . "\n";
echo "Найдено отзывов: " . count($reviews) . "\n";
echo "Найдено работ: " . count($works) . "\n\n";

if (empty($doctors)) {
    echo "❌ Врачи не найдены. Выход.\n";
    exit;
}

// Statistics
$stats = [
    'total_doctors' => count($doctors),
    'filled_experience' => 0,
    'filled_rating' => 0,
    'filled_rating_source' => 0,
    'filled_clinic' => 0,
    'filled_services' => 0,
    'filled_reviews' => 0,
    'filled_works' => 0,
    'skipped_experience' => 0,
    'skipped_rating' => 0,
    'skipped_rating_source' => 0,
    'skipped_clinic' => 0,
    'skipped_services' => 0,
    'skipped_reviews' => 0,
    'skipped_works' => 0,
    'bidirectional_updates' => 0,
];

// 2. Process each doctor
echo "Обрабатываем врачей...\n\n";

foreach ($doctors as $index => $doctor) {
    $progress = $index + 1;
    echo "[$progress/" . count($doctors) . "] {$doctor->post_title} (ID: {$doctor->ID})\n";
    
    // --- Field: experience ---
    $experience = get_field('experience', $doctor->ID);
    if (empty($experience)) {
        $new_date = get_random_experience_date();
        update_field('experience', $new_date, $doctor->ID);
        echo "  ✓ Стаж: {$new_date}\n";
        $stats['filled_experience']++;
    } else {
        echo "  • Стаж: уже заполнен ({$experience})\n";
        $stats['skipped_experience']++;
    }
    
    // --- Field: rating ---
    $rating = get_field('rating', $doctor->ID);
    if (empty($rating) || $rating == 0) {
        $new_rating = get_random_rating();
        update_field('rating', $new_rating, $doctor->ID);
        echo "  ✓ Рейтинг: {$new_rating}\n";
        $stats['filled_rating']++;
    } else {
        echo "  • Рейтинг: уже заполнен ({$rating})\n";
        $stats['skipped_rating']++;
    }
    
    // --- Field: rating_source ---
    $rating_source = get_field('rating_source', $doctor->ID);
    if (empty($rating_source)) {
        $new_source = get_random_rating_source();
        update_field('rating_source', $new_source, $doctor->ID);
        echo "  ✓ Источник: {$new_source}\n";
        $stats['filled_rating_source']++;
    } else {
        echo "  • Источник: уже заполнен ({$rating_source})\n";
        $stats['skipped_rating_source']++;
    }
    
    // --- Field: clinic ---
    $clinic = get_field('clinic', $doctor->ID);
    if (empty($clinic)) {
        if (!empty($clinics)) {
            $random_clinic = $clinics[array_rand($clinics)];
            update_field('clinic', $random_clinic->ID, $doctor->ID);
            echo "  ✓ Клиника: {$random_clinic->post_title}\n";
            $stats['filled_clinic']++;
            
            // Update bidirectional relationship
            if (update_bidirectional_relationship($random_clinic->ID, $doctor->ID)) {
                $stats['bidirectional_updates']++;
            }
        } else {
            echo "  ⚠ Клиника: нет доступных клиник\n";
        }
    } else {
        $clinic_title = is_object($clinic) ? $clinic->post_title : 'ID: ' . $clinic;
        echo "  • Клиника: уже заполнена ({$clinic_title})\n";
        $stats['skipped_clinic']++;
    }
    
    // --- Field: related_services ---
    $existing_services = get_field('related_services', $doctor->ID);
    if (empty($existing_services) || !is_array($existing_services)) {
        if (!empty($services)) {
            $count = rand(3, min(5, count($services)));
            $selected_services = [];
            
            // Select random services
            $service_keys = array_rand($services, min($count, count($services)));
            $service_keys = is_array($service_keys) ? $service_keys : [$service_keys];
            
            foreach ($service_keys as $key) {
                $selected_services[] = $services[$key]->ID;
            }
            
            update_field('related_services', $selected_services, $doctor->ID);
            echo "  ✓ Услуги: добавлено " . count($selected_services) . " услуг\n";
            $stats['filled_services']++;
            
            // Update bidirectional relationships
            foreach ($selected_services as $service_id) {
                if (update_bidirectional_relationship($service_id, $doctor->ID)) {
                    $stats['bidirectional_updates']++;
                }
            }
        } else {
            echo "  ⚠ Услуги: нет доступных услуг\n";
        }
    } else {
        echo "  • Услуги: уже заполнены (" . count($existing_services) . " шт.)\n";
        $stats['skipped_services']++;
    }
    
    // --- Field: related_reviews ---
    $existing_reviews = get_field('related_reviews', $doctor->ID);
    if (empty($existing_reviews) || !is_array($existing_reviews)) {
        if (!empty($reviews)) {
            $count = rand(2, min(4, count($reviews)));
            $selected_reviews = [];
            
            // Select random reviews
            $review_keys = array_rand($reviews, min($count, count($reviews)));
            $review_keys = is_array($review_keys) ? $review_keys : [$review_keys];
            
            foreach ($review_keys as $key) {
                $selected_reviews[] = $reviews[$key]->ID;
            }
            
            update_field('related_reviews', $selected_reviews, $doctor->ID);
            echo "  ✓ Отзывы: добавлено " . count($selected_reviews) . " отзывов\n";
            $stats['filled_reviews']++;
            
            // Update bidirectional relationships
            foreach ($selected_reviews as $review_id) {
                if (update_bidirectional_relationship($review_id, $doctor->ID)) {
                    $stats['bidirectional_updates']++;
                }
            }
        } else {
            echo "  ⚠ Отзывы: нет доступных отзывов\n";
        }
    } else {
        echo "  • Отзывы: уже заполнены (" . count($existing_reviews) . " шт.)\n";
        $stats['skipped_reviews']++;
    }
    
    // --- Field: related_works ---
    $existing_works = get_field('related_works', $doctor->ID);
    if (empty($existing_works) || !is_array($existing_works)) {
        if (!empty($works)) {
            $count = rand(1, min(3, count($works)));
            $selected_works = [];
            
            // Select random works
            $work_keys = array_rand($works, min($count, count($works)));
            $work_keys = is_array($work_keys) ? $work_keys : [$work_keys];
            
            foreach ($work_keys as $key) {
                $selected_works[] = $works[$key]->ID;
            }
            
            update_field('related_works', $selected_works, $doctor->ID);
            echo "  ✓ Работы: добавлено " . count($selected_works) . " работ\n";
            $stats['filled_works']++;
            
            // Update bidirectional relationships
            foreach ($selected_works as $work_id) {
                if (update_bidirectional_relationship($work_id, $doctor->ID)) {
                    $stats['bidirectional_updates']++;
                }
            }
        } else {
            echo "  ⚠ Работы: нет доступных работ\n";
        }
    } else {
        echo "  • Работы: уже заполнены (" . count($existing_works) . " шт.)\n";
        $stats['skipped_works']++;
    }
    
    echo "\n";
}

// =============================================================================
// Summary
// =============================================================================

echo "=== Итоговая статистика ===\n\n";
echo "Всего врачей обработано: {$stats['total_doctors']}\n\n";

echo "Заполнено полей:\n";
echo "  - Стаж: {$stats['filled_experience']}\n";
echo "  - Рейтинг: {$stats['filled_rating']}\n";
echo "  - Источник рейтинга: {$stats['filled_rating_source']}\n";
echo "  - Клиника: {$stats['filled_clinic']}\n";
echo "  - Услуги: {$stats['filled_services']}\n";
echo "  - Отзывы: {$stats['filled_reviews']}\n";
echo "  - Работы: {$stats['filled_works']}\n\n";

echo "Пропущено (уже заполнены):\n";
echo "  - Стаж: {$stats['skipped_experience']}\n";
echo "  - Рейтинг: {$stats['skipped_rating']}\n";
echo "  - Источник рейтинга: {$stats['skipped_rating_source']}\n";
echo "  - Клиника: {$stats['skipped_clinic']}\n";
echo "  - Услуги: {$stats['skipped_services']}\n";
echo "  - Отзывы: {$stats['skipped_reviews']}\n";
echo "  - Работы: {$stats['skipped_works']}\n\n";

echo "Обновлено обратных связей: {$stats['bidirectional_updates']}\n\n";

echo "✓ Готово!\n\n";

echo "Следующие шаги:\n";
echo "1. Очистить кэш:\n";
echo "   docker exec -it template-wordpress-1 wp cache flush\n";
echo "   docker exec -it template-wordpress-1 wp graphql clear-schema-cache\n\n";
echo "2. Проверить результат через GraphQL IDE:\n";
echo "   http://localhost:8002/graphql-ide\n\n";
