<?php
/**
 * Backfill: скопировать excerpt из Service в связанные Price посты.
 *
 * Usage:
 *   docker cp scripts/backfill-price-excerpts-from-services.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress php /var/www/html/scripts/backfill-price-excerpts-from-services.php
 *   docker exec wp-new-wordpress php /var/www/html/scripts/backfill-price-excerpts-from-services.php --dry-run
 */
require_once dirname(__DIR__) . '/wp-load.php';

$cli_args = $argv ?? $_SERVER['argv'] ?? [];
$dry_run = in_array('--dry-run', $cli_args, true);

$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => -1,
    'post_status' => 'publish',
]);

$updated = 0;
foreach ($services as $service) {
    $excerpt = $service->post_excerpt ?? '';
    if (empty(trim($excerpt))) {
        continue;
    }
    foreach (['related_prices', 'focus_prices'] as $field) {
        $prices = get_field($field, $service->ID);
        if (!is_array($prices)) {
            continue;
        }
        foreach ($prices as $p) {
            $pid = is_object($p) ? ($p->ID ?? 0) : (int) $p;
            if ($pid > 0) {
                if (!$dry_run) {
                    wp_update_post(['ID' => $pid, 'post_excerpt' => $excerpt]);
                }
                $updated++;
            }
        }
    }
}
echo ($dry_run ? '[DRY-RUN] Would update ' : 'Updated ') . "{$updated} price(s).\n";
