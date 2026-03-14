<?php
/**
 * Назначение акциям категорий услуг (service_categories) из связанных услуг
 *
 * Таксономия service_categories привязана к services, doctors и promotions.
 * Каждой акции назначаются категории её связанных услуг (related_services).
 *
 * Запуск:
 *   docker exec -it template-wordpress-1 wp eval-file scripts/assign-promotion-service-categories.php --allow-root
 *
 * Или из корня проекта (если WP в wp/):
 *   docker exec -it <container> wp eval-file /var/www/html/scripts/assign-promotion-service-categories.php --allow-root
 */

echo "=== Назначение категорий услуг акциям из связанных услуг ===\n\n";

$promotions = get_posts([
    'post_type'   => 'promotions',
    'post_status' => 'publish',
    'numberposts' => -1,
]);

$assigned = 0;
foreach ($promotions as $promotion) {
    $related = get_post_meta($promotion->ID, 'related_services', true);

    if (empty($related)) {
        echo "  • Акция ID {$promotion->ID} ({$promotion->post_title}): нет связанных услуг\n";
        continue;
    }
    $related = is_array($related) ? $related : [ $related ];

    $term_ids = [];
    foreach ($related as $item) {
        $service_id = is_object($item) ? ($item->ID ?? null) : (int) $item;
        if ($service_id <= 0) {
            continue;
        }
        $terms = wp_get_post_terms($service_id, 'service_categories');
        if (!empty($terms) && !is_wp_error($terms)) {
            foreach ($terms as $t) {
                $term_ids[$t->term_id] = true;
            }
        }
    }
    $term_ids = array_keys($term_ids);

    if (empty($term_ids)) {
        echo "  • Акция ID {$promotion->ID} ({$promotion->post_title}): у связанных услуг нет категорий\n";
        continue;
    }

    wp_set_object_terms($promotion->ID, $term_ids, 'service_categories');
    $names = array_map(function ($id) {
        $t = get_term($id, 'service_categories');
        return $t && !is_wp_error($t) ? $t->name : '';
    }, $term_ids);
    echo "  ✓ Акция ID {$promotion->ID} ({$promotion->post_title}): " . implode(', ', $names) . "\n";
    $assigned++;
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Акций обновлено: {$assigned}\n";
echo "\n✓ Готово!\n";
