<?php
/**
 * Назначение врачам категорий услуг (service_categories) по их специализациям
 *
 * Таксономия service_categories привязана к doctors и services.
 * Каждому врачу назначаются категории услуг плюс-минус по специализациям:
 * специализация -> примерное соответствие категории услуг.
 *
 * Запуск (если scripts в контейнере):
 *   docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/assign-doctor-service-categories.php --allow-root
 */

// Сопоставление slug специализации врача -> slug категории услуг
// Включает как slugs из create-doctor-specializations (terapiya, ortodontiya...),
// так и фактически используемые в БД (stomatolog-terapevt, stomatolog-ortodont...)
$specialization_to_category_slug = [
    'terapiya'                      => 'terapiya',
    'ortodontiya'                   => 'orthodontics',
    'gnatologiya'                   => 'gnatologiya',
    'ortopediya'                    => 'ortopediya',
    'endodontiya'                   => 'endodontiya',
    'gigiena'                       => 'gigiena',
    'hirurgiya'                     => 'surgery',
    'implantaciya'                  => 'implantation',
    'implantologiya'                => 'implantation',
    'stomatologiya'                 => 'terapiya',
    'parodontologiya'               => 'treatment',
    'protezirovanie'                => 'prosthetics',
    'otbelivanie'                   => 'whitening',
    'kosmeticheskaya-stomatologiya' => 'whitening',
    'chelyustno-licevaya-hirurgiya' => 'surgery',
    // Фактические slugs в БД (doctor_position / doctor_specializations)
    'stomatolog-terapevt'           => 'terapiya',
    'stomatolog-ortodont'           => 'orthodontics',
    'ortodont-gnatolog'             => ['orthodontics', 'gnatologiya'],
    'stomatolog-ortoped'            => 'ortopediya',
    'stomatolog-endodontist'        => 'endodontiya',
    'gigienist'                     => 'gigiena',
    'stomatolog-gigienist'          => 'gigiena',
    'stomatolog-hirurg'             => 'surgery',
    'implantolog'                   => 'implantation',
    'stomatolog-parodontolog'       => 'treatment',
];

echo "=== Назначение категорий услуг врачам по специализациям ===\n\n";

$doctors = get_posts([
    'post_type'   => 'doctors',
    'post_status' => 'publish',
    'numberposts' => -1,
]);

$assigned = 0;
foreach ($doctors as $doctor) {
    $terms = wp_get_object_terms($doctor->ID, 'doctor_specializations');
    if (empty($terms) || is_wp_error($terms)) {
        echo "  • Врач ID {$doctor->ID} ({$doctor->post_title}): нет специализаций\n";
        continue;
    }

    $category_slugs = [];
    foreach ($terms as $t) {
        if (isset($specialization_to_category_slug[$t->slug])) {
            $mapped = $specialization_to_category_slug[$t->slug];
            foreach ((array) $mapped as $slug) {
                $category_slugs[$slug] = true;
            }
        }
    }
    $category_slugs = array_keys($category_slugs);

    if (empty($category_slugs)) {
        echo "  • Врач ID {$doctor->ID} ({$doctor->post_title}): нет подходящих категорий\n";
        continue;
    }

    $term_ids = [];
    foreach ($category_slugs as $slug) {
        $term = get_term_by('slug', $slug, 'service_categories');
        if ($term && !is_wp_error($term)) {
            $term_ids[] = $term->term_id;
        }
    }

    if (!empty($term_ids)) {
        wp_set_object_terms($doctor->ID, $term_ids, 'service_categories');
        $names = array_map(function ($id) {
            $t = get_term($id, 'service_categories');
            return $t && !is_wp_error($t) ? $t->name : '';
        }, $term_ids);
        echo "  ✓ Врач ID {$doctor->ID} ({$doctor->post_title}): " . implode(', ', $names) . "\n";
        $assigned++;
    }
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Врачей обновлено: {$assigned}\n";
echo "\n✓ Готово!\n";
