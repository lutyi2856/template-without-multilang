<?php
/**
 * Назначение работам (our-works) категорий услуг (service_categories)
 *
 * Таксономия service_categories привязана к services, doctors, promotions и our-works.
 * - Для работ с related_services: категории берутся из связанных услуг.
 * - Для работ без related_services: назначаются 1–2 случайные существующие категории (тестовые данные).
 *
 * Запуск:
 *   docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/assign-our-works-service-categories.php --allow-root
 */

echo "=== Назначение категорий услуг работам (our-works) ===\n\n";

$works = get_posts([
    'post_type'   => 'our-works',
    'post_status' => 'publish',
    'numberposts' => -1,
]);

$all_terms = get_terms([
    'taxonomy'   => 'service_categories',
    'hide_empty' => false,
]);
$all_term_ids = [];
if (!empty($all_terms) && !is_wp_error($all_terms)) {
    $all_term_ids = array_map(function ($t) {
        return (int) $t->term_id;
    }, $all_terms);
}

$assigned_from_services = 0;
$assigned_fake = 0;

foreach ($works as $work) {
    $related = get_post_meta($work->ID, 'related_services', true);
    $term_ids = [];

    if (!empty($related)) {
        $related = is_array($related) ? $related : [ $related ];
        foreach ($related as $item) {
            $service_id = is_object($item) ? ($item->ID ?? null) : (int) $item;
            if ($service_id <= 0) {
                continue;
            }
            $terms = wp_get_post_terms($service_id, 'service_categories');
            if (!empty($terms) && !is_wp_error($terms)) {
                foreach ($terms as $t) {
                    $term_ids[(int) $t->term_id] = true;
                }
            }
        }
        $term_ids = array_keys($term_ids);
    }

    if (empty($term_ids) && !empty($all_term_ids)) {
        $count = min(2, count($all_term_ids));
        $rand_keys = array_rand($all_term_ids, $count);
        $term_ids = is_array($rand_keys)
            ? array_map(function ($k) use ($all_term_ids) {
                return $all_term_ids[$k];
            }, $rand_keys)
            : [ $all_term_ids[$rand_keys] ];
        $assigned_fake++;
    } elseif (!empty($term_ids)) {
        $assigned_from_services++;
    }

    if (empty($term_ids)) {
        echo "  • Работа ID {$work->ID} ({$work->post_title}): нет категорий и нет существующих терминов\n";
        continue;
    }

    wp_set_object_terms($work->ID, $term_ids, 'service_categories');
    $names = array_map(function ($id) {
        $t = get_term($id, 'service_categories');
        return $t && !is_wp_error($t) ? $t->name : '';
    }, $term_ids);
    $src = !empty($related) ? 'из услуг' : 'фейковые';
    echo "  ✓ Работа ID {$work->ID} ({$work->post_title}) [{$src}]: " . implode(', ', $names) . "\n";
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Из связанных услуг: {$assigned_from_services}\n";
echo "Фейковые категории: {$assigned_fake}\n";
echo "\n✓ Готово!\n";
