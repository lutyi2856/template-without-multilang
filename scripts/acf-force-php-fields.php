<?php
/**
 * Check ACF field groups and optionally remove DB versions that override PHP.
 * Run when PHP-added fields (e.g. focus_prices) don't appear in admin.
 *
 * Run: docker cp scripts/acf-force-php-fields.php wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/acf-force-php-fields.php --allow-root
 *
 * To delete DB overrides: ADD_DELETE=1 docker exec ... (or set ADD_DELETE=1 in env)
 */
define('WP_USE_THEMES', false);
require '/var/www/html/wp-load.php';

global $wpdb;
$do_delete = !empty(getenv('ADD_DELETE'));

$groups_to_check = [
    'group_service_relationships',
    'group_price_fields',
    'group_promotion_relationships',
];
$found_db_groups = false;

echo "ACF Field Groups check (service, price, promotion relationships)\n\n";

foreach ($groups_to_check as $group_key) {
    $ids = $wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'acf-field-group' AND (post_excerpt = %s OR post_name = %s)",
        $group_key,
        $group_key
    ));

    if (empty($ids)) {
        echo "{$group_key}: no DB version (PHP only) - OK\n";
        continue;
    }

    $found_db_groups = true;
    echo "{$group_key}: found " . count($ids) . " DB version(s) - may override PHP\n";

    if ($do_delete) {
        foreach ($ids as $id) {
            wp_delete_post((int) $id, true);
            echo "  Deleted ID: {$id}\n";
        }
    }
}

if (!$do_delete && $found_db_groups) {
    echo "\nTo remove DB overrides and use PHP fields: run with ADD_DELETE=1\n";
}
echo "\nAfter ADD_DELETE=1: docker restart wp-new-wordpress, then hard refresh (Ctrl+Shift+R) the edit pages.\n";
echo "\nIf related_price/related_promotion still don't appear, run:\n";
echo "  docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/add-related-promotion-price-to-acf.php --allow-root\n";
echo "This adds the fields to DB and JSON.\n";
