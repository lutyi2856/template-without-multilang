<?php
/**
 * Add related_promotion (Price) and related_price (Promotion) to ACF groups.
 * Idempotent: skips if fields already exist.
 * Updates both DB and JSON so fields appear in admin regardless of load source.
 *
 * Run: docker cp scripts/add-related-promotion-price-to-acf.php wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/add-related-promotion-price-to-acf.php --allow-root
 */
define('WP_USE_THEMES', false);
require '/var/www/html/wp-load.php';

if (!function_exists('acf_get_field_group') || !function_exists('acf_get_fields')) {
    die('ACF not found' . PHP_EOL);
}

$updated = 0;

$related_promotion_field = [
    'key' => 'field_price_related_promotion',
    'label' => 'Связанная акция',
    'name' => 'related_promotion',
    'type' => 'relationship',
    'post_type' => ['promotions'],
    'return_format' => 'object',
    'max' => 1,
    'instructions' => 'Максимум одна акция. При выборе автоматически обновляется обратная связь.',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'relatedPromotion',
];

$related_price_field = [
    'key' => 'field_promotion_related_price',
    'label' => 'Связанная цена',
    'name' => 'related_price',
    'type' => 'relationship',
    'post_type' => ['prices'],
    'return_format' => 'object',
    'max' => 1,
    'instructions' => 'Максимум одна цена. При выборе автоматически обновляется обратная связь.',
    'show_in_graphql' => 1,
    'graphql_field_name' => 'relatedPrice',
];

// 1. group_price_fields + related_promotion
$group = acf_get_field_group('group_price_fields');
if ($group) {
    $fields = acf_get_fields($group);
    if (!is_array($fields)) {
        $fields = [];
    }
    $has_field = false;
    foreach ($fields as $f) {
        if (isset($f['name']) && $f['name'] === 'related_promotion') {
            $has_field = true;
            break;
        }
    }
    if (!$has_field) {
        $group['fields'] = array_merge($fields, [$related_promotion_field]);
        if (function_exists('acf_update_field_group')) {
            acf_update_field_group($group);
            echo "group_price_fields: updated DB with related_promotion\n";
        }
        if (function_exists('acf_write_json_field_group') && acf_write_json_field_group($group)) {
            echo "group_price_fields: wrote JSON with related_promotion\n";
        }
        $updated++;
    } else {
        echo "group_price_fields: related_promotion already exists\n";
    }
} else {
    echo "group_price_fields: group not found\n";
}

// 2. group_promotion_relationships + related_price
$group = acf_get_field_group('group_promotion_relationships');
if ($group) {
    $fields = acf_get_fields($group);
    if (!is_array($fields)) {
        $fields = [];
    }
    $has_field = false;
    foreach ($fields as $f) {
        if (isset($f['name']) && $f['name'] === 'related_price') {
            $has_field = true;
            break;
        }
    }
    if (!$has_field) {
        $group['fields'] = array_merge($fields, [$related_price_field]);
        if (function_exists('acf_update_field_group')) {
            acf_update_field_group($group);
            echo "group_promotion_relationships: updated DB with related_price\n";
        }
        if (function_exists('acf_write_json_field_group') && acf_write_json_field_group($group)) {
            echo "group_promotion_relationships: wrote JSON with related_price\n";
        }
        $updated++;
    } else {
        echo "group_promotion_relationships: related_price already exists\n";
    }
} else {
    echo "group_promotion_relationships: group not found\n";
}

echo "\nDone. Updated {$updated} group(s).\n";
echo "Restart container and hard refresh (Ctrl+Shift+R) the edit pages.\n";
echo "Price edit: Цены → Редактировать → блок 'Price Settings' → поле 'Связанная акция'.\n";
echo "Promotion edit: Акции → Редактировать → блок 'Promotion Relationships' → поле 'Связанная цена'.\n";
