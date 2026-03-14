<?php
/**
 * Привязка всех работ (our-works) к единственной клинике
 *
 * В проекте одна клиника — назначаем её всем работам через ACF related_clinics.
 *
 * Запуск:
 *   docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/assign-our-works-clinic.php --allow-root
 */

echo "=== Привязка работ (our-works) к клинике ===\n\n";

$clinics = get_posts(array(
    'post_type' => 'clinics',
    'post_status' => 'publish',
    'numberposts' => -1,
));

if (empty($clinics)) {
    echo "✗ Ошибка: клиники не найдены. Создайте клинику в WordPress.\n";
    exit(1);
}

if (count($clinics) > 1) {
    echo "⚠ Найдено " . count($clinics) . " клиник. Используется первая.\n";
}

$clinic = $clinics[0];
echo "Клиника: {$clinic->post_title} (ID: {$clinic->ID})\n\n";

$works = get_posts([
    'post_type'   => 'our-works',
    'post_status' => 'publish',
    'numberposts' => -1,
]);

if (empty($works)) {
    echo "Работ не найдено.\n";
    exit(0);
}

$updated = 0;
foreach ($works as $work) {
    update_field('related_clinics', array($clinic->ID), $work->ID);
    echo "  ✓ Работа ID {$work->ID} ({$work->post_title})\n";
    $updated++;
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Обновлено: {$updated} работ\n";
echo "\n✓ Готово!\n";
