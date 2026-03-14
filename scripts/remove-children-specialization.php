<?php
/**
 * Удаление терма detskaya-stomatologiya из doctor_specializations
 *
 * Обрабатывается таксономией doctor_type (detskiy-vrach / vzroslyy-vrach).
 * wp_delete_term автоматически снимает связи со всеми постами.
 *
 * Запуск:
 *   docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/remove-children-specialization.php --allow-root
 */

echo "=== Удаление detskaya-stomatologiya из doctor_specializations ===\n\n";

$term = get_term_by('slug', 'detskaya-stomatologiya', 'doctor_specializations');

if (!$term || is_wp_error($term)) {
    echo "• Терм detskaya-stomatologiya не найден (возможно, уже удалён)\n";
    wp_cache_flush();
    echo "\n✓ Готово!\n";
    exit(0);
}

$deleted = wp_delete_term($term->term_id, 'doctor_specializations');

if (is_wp_error($deleted)) {
    echo "✗ Ошибка: " . $deleted->get_error_message() . "\n";
    exit(1);
}

echo "✓ Терм 'Детская стоматология' (detskaya-stomatologiya) удалён\n";
echo "  (связи с врачами сняты автоматически)\n";

wp_cache_flush();
echo "\n✓ Готово!\n";
