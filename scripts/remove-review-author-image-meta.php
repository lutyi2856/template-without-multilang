<?php
/**
 * Миграция: удаление meta author_image и _author_image из записей CPT reviews
 *
 * Поле author_image (Фото автора) удалено из ACF. ACF не чистит meta при удалении поля.
 * Скрипт удаляет оставшиеся записи в wp_postmeta.
 *
 * Запуск:
 *   Dry-run (без изменений):
 *     docker cp scripts/. wp-new-wordpress:/var/www/html/scripts/
 *     docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/remove-review-author-image-meta.php --allow-root
 *
 *   Реальное удаление:
 *     docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/remove-review-author-image-meta.php --allow-root -- --apply
 */

$argv = $GLOBALS['argv'] ?? $_SERVER['argv'] ?? [];
$apply = in_array('--apply', $argv, true);

// WordPress уже загружен при запуске через wp eval-file
$reviews = get_posts([
    'post_type' => 'reviews',
    'post_status' => 'any',
    'posts_per_page' => -1,
    'fields' => 'ids',
]);

echo "=== Удаление author_image meta из Reviews ===\n";
echo "Режим: " . ($apply ? "ПРИМЕНЕНИЕ (удаление meta)" : "DRY-RUN (только просмотр)") . "\n";
echo "Всего отзывов: " . count($reviews) . "\n\n";

$cleaned = 0;
$skipped = 0;

foreach ($reviews as $post_id) {
    $value = get_post_meta($post_id, 'author_image', true);

    if (empty($value) && $value !== '0') {
        $skipped++;
        continue;
    }

    $title = get_the_title($post_id);

    if ($apply) {
        delete_post_meta($post_id, 'author_image');
        delete_post_meta($post_id, '_author_image');
        $cleaned++;
        echo "  ✓ [{$post_id}] {$title}: meta удалены\n";
    } else {
        $cleaned++;
        echo "  [{$post_id}] {$title}: будет удалено (запустите с --apply)\n";
    }
}

if ($apply && $cleaned > 0) {
    wp_cache_flush();
}

echo "\n=== Итого ===\n";
echo "С meta author_image: {$cleaned}\n";
echo "Без meta: {$skipped}\n";
echo ($apply ? "\n✓ Готово. Meta удалены.\n" : "\n(DRY-RUN: изменения не сохранены. Запустите с --apply для применения.)\n");
