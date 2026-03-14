<?php
/**
 * Создание услуг консультаций по направлениям и связь с врачами
 *
 * - Создаёт категорию услуг «Консультации» (если нет)
 * - Для каждой специализации (doctor_specializations) создаёт услугу «Консультация [название]»
 * - Связывает врачей с услугой консультации по их специализации (consultation_services / consulting_doctors)
 *
 * Запуск (если scripts в контейнере):
 *   docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/create-consultation-services.php --allow-root
 * Иначе: docker cp scripts/. wp-new-wordpress:/var/www/html/scripts/
 */

// Категория для услуг консультаций
$consultation_category_slug = 'konsultacii';
$consultation_category_name = 'Консультации';

$cat_existing = get_term_by('slug', $consultation_category_slug, 'service_categories');
if ($cat_existing) {
    $category_id = $cat_existing->term_id;
    echo "✓ Категория '{$consultation_category_name}' уже существует (ID: {$category_id})\n";
} else {
    $cat_result = wp_insert_term(
        $consultation_category_name,
        'service_categories',
        ['slug' => $consultation_category_slug, 'description' => 'Первичный приём и консультации']
    );
    if (is_wp_error($cat_result)) {
        echo "✗ Ошибка создания категории: " . $cat_result->get_error_message() . "\n";
        exit(1);
    }
    $category_id = $cat_result['term_id'];
    echo "✓ Создана категория '{$consultation_category_name}' (ID: {$category_id})\n";
}

echo "\n=== Создание услуг консультаций ===\n\n";

$specializations = get_terms([
    'taxonomy'   => 'doctor_specializations',
    'hide_empty' => false,
]);

if (empty($specializations) || is_wp_error($specializations)) {
    echo "✗ Нет терминов специализаций. Сначала запустите create-doctor-specializations-data.php\n";
    exit(1);
}

$specialization_to_service = [];

foreach ($specializations as $term) {
    $service_title = 'Консультация ' . mb_strtolower($term->name);
    $slug = 'konsultaciya-' . $term->slug;

    $existing = get_posts([
        'post_type'      => 'services',
        'name'           => $slug,
        'post_status'    => 'publish',
        'numberposts'    => 1,
        'fields'         => 'ids',
    ]);

    if (!empty($existing)) {
        $service_id = $existing[0];
        echo "✓ Услуга '{$service_title}' уже существует (ID: {$service_id})\n";
    } else {
        $service_id = wp_insert_post([
            'post_title'   => $service_title,
            'post_name'    => $slug,
            'post_type'    => 'services',
            'post_status'  => 'publish',
            'post_content' => '<!-- wp:paragraph --><p>Первичный приём и консультация по направлению: ' . $term->name . '.</p><!-- /wp:paragraph -->',
            'post_excerpt' => 'Консультация специалиста',
        ]);
        if (is_wp_error($service_id)) {
            echo "✗ Ошибка создания услуги '{$service_title}': " . $service_id->get_error_message() . "\n";
            continue;
        }
        wp_set_object_terms($service_id, [$category_id], 'service_categories');
        echo "✓ Создана услуга '{$service_title}' (ID: {$service_id})\n";
    }

    $specialization_to_service[$term->term_id] = $service_id;
}

echo "\n=== Связывание врачей с услугами консультаций ===\n\n";

$doctors = get_posts([
    'post_type'   => 'doctors',
    'post_status' => 'publish',
    'numberposts' => -1,
]);

$linked = 0;
foreach ($doctors as $doctor) {
    $doctor_terms = wp_get_object_terms($doctor->ID, 'doctor_specializations');
    if (empty($doctor_terms) || is_wp_error($doctor_terms)) {
        echo "  • Врач ID {$doctor->ID} ({$doctor->post_title}): нет специализаций\n";
        continue;
    }

    $consultation_service_ids = [];
    foreach ($doctor_terms as $t) {
        if (isset($specialization_to_service[$t->term_id])) {
            $consultation_service_ids[] = $specialization_to_service[$t->term_id];
        }
    }
    $consultation_service_ids = array_unique($consultation_service_ids);

    if (empty($consultation_service_ids)) {
        echo "  • Врач ID {$doctor->ID} ({$doctor->post_title}): нет подходящих услуг консультаций\n";
        continue;
    }

    update_field('consultation_services', $consultation_service_ids, $doctor->ID);

    foreach ($consultation_service_ids as $service_id) {
        $existing_doctors = get_field('consulting_doctors', $service_id);
        if (!is_array($existing_doctors)) {
            $existing_doctors = [];
        }
        $existing_ids = array_map(function ($p) {
            return $p instanceof WP_Post ? $p->ID : (int) $p;
        }, $existing_doctors);
        if (!in_array($doctor->ID, $existing_ids, true)) {
            $existing_ids[] = $doctor->ID;
            update_field('consulting_doctors', $existing_ids, $service_id);
        }
    }

    echo "  ✓ Врач ID {$doctor->ID} ({$doctor->post_title}): " . count($consultation_service_ids) . " услуг консультаций\n";
    $linked++;
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Услуг консультаций: " . count($specialization_to_service) . "\n";
echo "Врачей связано: {$linked}\n";
echo "\n✓ Готово!\n";
