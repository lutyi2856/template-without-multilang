<?php
/**
 * Fill Main Page Reviews Section (Секция отзовики) with test data
 *
 * Usage: docker exec wp-new-wordpress php /var/www/html/scripts/fill-mainpage-reviews-section-data.php
 */

require_once('/var/www/html/wp-load.php');

$post_id = 'mainpage_options';

echo "\n=== Filling Main Page Reviews Section (Секция отзовики) ===\n\n";

// 1. Заголовок секции
update_field('reviews_section_title', 'Отзывы наших пациентов', $post_id);
echo "✓ Заголовок секции: Отзывы наших пациентов\n";

// 2. Контент
$content = "Мы ценим каждого пациента и стремимся предоставлять высококачественные стоматологические услуги. Ваши отзывы помогают нам становиться лучше.";
update_field('reviews_section_content', $content, $post_id);
echo "✓ Контент: установлен\n";

// 3. Изображение секции - получаем первое изображение из медиатеки или пропускаем
$attachments = get_posts([
    'post_type' => 'attachment',
    'post_mime_type' => 'image',
    'posts_per_page' => 1,
    'post_status' => 'inherit',
]);
if (!empty($attachments)) {
    update_field('reviews_section_image', $attachments[0]->ID, $post_id);
    echo "✓ Изображение секции: ID {$attachments[0]->ID}\n";
} else {
    echo "○ Изображение секции: медиатеки пуста, пропущено\n";
}

// 4. Средний рейтинг (только суффикс шкалы; число считается на фронте из repeater)
update_field('reviews_section_medium_rating', '/5.0', $post_id);
echo "✓ Средний рейтинг (суффикс): /5.0\n";

// 5. Основание (текст перед числом отзывов; число считается на фронте)
update_field('reviews_section_basis', 'на основе', $post_id);
echo "✓ Основание: на основе\n";

// 6. Repeater - элементы
$first_image_id = !empty($attachments) ? $attachments[0]->ID : null;

$reviews_section_items = [
    [
        'rating' => 5,
        'image' => $first_image_id,
        'text' => 'Отличный сервис, внимательные врачи!',
        'reviews_count' => 127,
    ],
    [
        'rating' => 4.5,
        'image' => $first_image_id,
        'text' => 'Профессиональное лечение, рекомендую.',
        'reviews_count' => 89,
    ],
    [
        'rating' => 5,
        'image' => null,
        'text' => 'Безболезненное лечение, современное оборудование.',
        'reviews_count' => 42,
    ],
];

update_field('reviews_section_items', $reviews_section_items, $post_id);
echo "✓ Элементы repeater: " . count($reviews_section_items) . " записей\n";

echo "\n=== Fill Complete ===\n\n";

// Verify
echo "Verifying...\n";
$title = get_field('reviews_section_title', $post_id);
$items = get_field('reviews_section_items', $post_id);
echo "  reviews_section_title: " . ($title ?: "NULL") . "\n";
echo "  reviews_section_items: " . (is_array($items) ? count($items) . " items" : "NULL") . "\n";

echo "\n✓ Done!\n\n";
