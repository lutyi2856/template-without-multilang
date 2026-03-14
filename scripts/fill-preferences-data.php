<?php
/**
 * Fill Main Page Preferences block (Преимущества / StatsBlock) with test data
 *
 * Usage: docker cp scripts/fill-preferences-data.php wp-new-wordpress:/var/www/html/scripts/
 *        docker exec wp-new-wordpress php /var/www/html/scripts/fill-preferences-data.php
 */

require_once('/var/www/html/wp-load.php');

$post_id = 'mainpage_options';

echo "\n=== Filling Main Page Preferences (Преимущества) ===\n\n";

$preferences_items = [
    [
        'icon' => 'percent',
        'title' => 'Лечение по ОМС/ ДМС',
        'description' => 'качественное лечение по страховому полису',
        'href' => '/oms-treatment',
    ],
    [
        'icon' => 'ruble',
        'title' => 'Налоговый вычет',
        'description' => 'качественное лечение по страховому полису',
        'href' => '/tax-return',
    ],
    [
        'icon' => 'installment',
        'title' => 'Лечение в рассрочку',
        'description' => 'качественное лечение по страховому полису',
        'href' => '/installment-treatment',
    ],
];

update_field('preferences_items', $preferences_items, $post_id);
echo "✓ preferences_items: " . count($preferences_items) . " записей\n";

echo "\n=== Fill Complete ===\n\n";

// Verify
echo "Verifying...\n";
$items = get_field('preferences_items', $post_id);
echo "  preferences_items: " . (is_array($items) ? count($items) . " items" : "NULL") . "\n";
if (is_array($items)) {
    foreach ($items as $i => $item) {
        echo "    [" . ($i + 1) . "] icon={$item['icon']}, title={$item['title']}\n";
    }
}

echo "\n✓ Done!\n\n";
