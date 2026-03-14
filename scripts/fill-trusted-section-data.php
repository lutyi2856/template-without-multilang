<?php
/**
 * Fill Main Page Trusted section (Нам доверили) with test data
 *
 * Usage: docker cp scripts/fill-trusted-section-data.php wp-new-wordpress:/var/www/html/scripts/
 *        docker exec wp-new-wordpress php /var/www/html/scripts/fill-trusted-section-data.php
 */

require_once('/var/www/html/wp-load.php');

$post_id = 'mainpage_options';

echo "\n=== Filling Main Page Trusted section (Нам доверили) ===\n\n";

$trusted_title = 'Нам доверили уже 1 204 пациента';
$trusted_description = '<p>Унидент — многопрофильная научная стоматология с сертификатом качества Росздравнадзора. Мы стремимся сделать высококачественную стоматологическую помощь доступной.</p>';

$trusted_items = [
    [
        'number' => '01',
        'title' => 'Честные цены, без хитрых уловок',
        'description' => 'Фиксируем цены в плане лечения и не меняем их без согласования. Никаких скрытых доплат.',
    ],
    [
        'number' => '02',
        'title' => 'Общаемся по-человечески',
        'description' => 'Легко и просто: на звонки отвечает человек, а не автоответчик. Записываем к нужному врачу без очередей.',
    ],
    [
        'number' => '03',
        'title' => 'Слушаем, объясняем, лечим с умом',
        'description' => 'Не давим, не пугаем и не лечим «на глаз». Подбираем варианты лечения под запросы пациента.',
    ],
];

update_field('trusted_title', $trusted_title, $post_id);
echo "✓ trusted_title\n";

update_field('trusted_description', $trusted_description, $post_id);
echo "✓ trusted_description\n";

update_field('trusted_items', $trusted_items, $post_id);
echo "✓ trusted_items: " . count($trusted_items) . " записей\n";

update_field('trusted_columns', 3, $post_id);
echo "✓ trusted_columns: 3\n";

echo "\n=== Fill Complete ===\n\n";

// Verify
echo "Verifying...\n";
$title = get_field('trusted_title', $post_id);
$desc = get_field('trusted_description', $post_id);
$items = get_field('trusted_items', $post_id);
$cols = get_field('trusted_columns', $post_id);

echo "  trusted_title: " . ($title ?: "NULL") . "\n";
echo "  trusted_description: " . ($desc ? substr(strip_tags($desc), 0, 50) . "..." : "NULL") . "\n";
echo "  trusted_items: " . (is_array($items) ? count($items) . " items" : "NULL") . "\n";
echo "  trusted_columns: " . ($cols !== null && $cols !== '' ? $cols : "NULL") . "\n";

if (is_array($items)) {
    foreach ($items as $i => $item) {
        echo "    [" . ($i + 1) . "] number={$item['number']}, title={$item['title']}\n";
    }
}

echo "\n✓ Done!\n\n";
