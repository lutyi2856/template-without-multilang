<?php
/**
 * Add focus_prices and focus_services to ACF JSON files (no deletion).
 * Idempotent: skips if fields already exist.
 *
 * Run: docker cp scripts/add-focus-to-acf-json.php wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/add-focus-to-acf-json.php --allow-root
 */
define('WP_USE_THEMES', false);
require '/var/www/html/wp-load.php';

if (!function_exists('acf_get_field_group') || !function_exists('acf_write_json_field_group')) {
    die('ACF not found or acf_write_json_field_group missing' . PHP_EOL);
}

$updated = 0;

// 1. group_service_relationships + focus_prices
$group = acf_get_field_group('group_service_relationships');
if ($group) {
    $fields = acf_get_fields($group);
    if (!is_array($fields)) {
        $fields = [];
    }
    $has_focus = false;
    foreach ($fields as $f) {
        if (isset($f['name']) && $f['name'] === 'focus_prices') {
            $has_focus = true;
            break;
        }
    }
    if (!$has_focus) {
        $focus_prices = [
            'key' => 'field_focus_prices',
            'label' => 'Focus Price',
            'name' => 'focus_prices',
            'type' => 'relationship',
            'post_type' => ['prices'],
            'return_format' => 'object',
            'show_in_graphql' => 1,
            'graphql_field_name' => 'focusPrices',
        ];
        $new_fields = [];
        $inserted = false;
        foreach ($fields as $f) {
            $new_fields[] = $f;
            if (isset($f['name']) && $f['name'] === 'related_prices') {
                $new_fields[] = $focus_prices;
                $inserted = true;
            }
        }
        if (!$inserted) {
            $new_fields[] = $focus_prices;
        }
        $group['fields'] = $new_fields;
        if (acf_write_json_field_group($group)) {
            echo "group_service_relationships: added focus_prices\n";
            $updated++;
        } else {
            echo "group_service_relationships: failed to write JSON\n";
        }
    } else {
        echo "group_service_relationships: focus_prices already exists\n";
    }
} else {
    echo "group_service_relationships: group not found (JSON may not exist)\n";
}

// 2. group_price_fields + focus_services
$group = acf_get_field_group('group_price_fields');
if ($group) {
    $fields = acf_get_fields($group);
    if (!is_array($fields)) {
        $fields = [];
    }
    $has_focus = false;
    foreach ($fields as $f) {
        if (isset($f['name']) && $f['name'] === 'focus_services') {
            $has_focus = true;
            break;
        }
    }
    if (!$has_focus) {
        $focus_services = [
            'key' => 'field_focus_services',
            'label' => 'Focus Services',
            'name' => 'focus_services',
            'type' => 'relationship',
            'post_type' => ['services'],
            'return_format' => 'object',
            'show_in_graphql' => 1,
            'graphql_field_name' => 'focusServices',
        ];
        $group['fields'] = array_merge($fields, [$focus_services]);
        if (acf_write_json_field_group($group)) {
            echo "group_price_fields: added focus_services\n";
            $updated++;
        } else {
            echo "group_price_fields: failed to write JSON\n";
        }
    } else {
        echo "group_price_fields: focus_services already exists\n";
    }
} else {
    echo "group_price_fields: group not found (JSON may not exist)\n";
}

echo "\nDone. Updated {$updated} JSON file(s).\n";
echo "Run: wp cache flush && wp graphql clear-schema-cache && docker restart wp-new-wordpress\n";
