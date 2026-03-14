<?php
/**
 * Тест динамических счетчиков для бейджей меню
 * 
 * Проверяет:
 * 1. CPT зарегистрированы (reviews, promotions)
 * 2. Количество опубликованных постов
 * 3. Симуляцию GraphQL resolver logic
 */

require_once __DIR__ . '/../wp-config.php';

echo "=== ТЕСТ ДИНАМИЧЕСКИХ СЧЕТЧИКОВ ===\n\n";

// 1. Проверить CPT зарегистрированы
echo "1. Проверка CPT:\n";
$reviews_cpt = get_post_type_object('reviews');
$promotions_cpt = get_post_type_object('promotions');

echo "   reviews: " . ($reviews_cpt ? "✓ Зарегистрирован" : "✗ НЕ найден") . "\n";
echo "   promotions: " . ($promotions_cpt ? "✓ Зарегистрирован" : "✗ НЕ найден") . "\n";

// Дополнительная проверка GraphQL support
if ($reviews_cpt) {
    echo "     - GraphQL enabled: " . ($reviews_cpt->show_in_graphql ? "✓" : "✗") . "\n";
    echo "     - GraphQL single: " . ($reviews_cpt->graphql_single_name ?? 'не задано') . "\n";
    echo "     - GraphQL plural: " . ($reviews_cpt->graphql_plural_name ?? 'не задано') . "\n";
}
if ($promotions_cpt) {
    echo "     - GraphQL enabled: " . ($promotions_cpt->show_in_graphql ? "✓" : "✗") . "\n";
    echo "     - GraphQL single: " . ($promotions_cpt->graphql_single_name ?? 'не задано') . "\n";
    echo "     - GraphQL plural: " . ($promotions_cpt->graphql_plural_name ?? 'не задано') . "\n";
}
echo "\n";

// 2. Подсчитать опубликованные посты
echo "2. Количество опубликованных постов:\n";
$reviews_count = wp_count_posts('reviews');
$promotions_count = wp_count_posts('promotions');

$reviews_published = isset($reviews_count->publish) ? (int) $reviews_count->publish : 0;
$promotions_published = isset($promotions_count->publish) ? (int) $promotions_count->publish : 0;

echo "   reviews: {$reviews_published} шт.\n";
if ($reviews_count) {
    echo "     - publish: {$reviews_count->publish}\n";
    echo "     - draft: {$reviews_count->draft}\n";
    echo "     - trash: {$reviews_count->trash}\n";
}

echo "   promotions: {$promotions_published} шт.\n";
if ($promotions_count) {
    echo "     - publish: {$promotions_count->publish}\n";
    echo "     - draft: {$promotions_count->draft}\n";
    echo "     - trash: {$promotions_count->trash}\n";
}
echo "\n";

// 3. Проверить GraphQL resolver simulation
echo "3. Симуляция GraphQL resolver для badgeCount:\n";
$test_urls = [
    '/reviews/' => 'reviews',
    '/otzyvy/' => 'reviews',
    '/отзывы/' => 'reviews',
    '/promotions/' => 'promotions',
    '/akcii/' => 'promotions',
    '/акции/' => 'promotions',
    '/services/' => 'fallback',
    '/uslugi/' => 'fallback',
];

foreach ($test_urls as $url => $expected) {
    $url_lower = mb_strtolower($url);
    
    // Копия логики из resolver
    if (
        strpos($url_lower, 'review') !== false ||
        strpos($url_lower, 'отзыв') !== false ||
        strpos($url_lower, 'otzyv') !== false
    ) {
        $result = $reviews_published;
        $source = 'reviews CPT';
    } elseif (
        strpos($url_lower, 'promotion') !== false ||
        strpos($url_lower, 'акци') !== false ||
        strpos($url_lower, 'akci') !== false
    ) {
        $result = $promotions_published;
        $source = 'promotions CPT';
    } else {
        $result = 'null';
        $source = 'ACF fallback';
    }
    
    $status = ($expected === 'fallback' && $source === 'ACF fallback') || 
              ($expected !== 'fallback' && strpos($source, $expected) !== false) ? '✓' : '✗';
    
    echo "   {$status} {$url} → {$result} ({$source})\n";
}
echo "\n";

// 4. Проверить headerSettings - locationsCount (динамический)
echo "4. Проверка headerSettings.locationsCount (динамический):\n";
$clinics_count = wp_count_posts('clinics');
$locations_count = isset($clinics_count->publish) ? (int) $clinics_count->publish : 0;
echo "   clinics published: {$locations_count} шт.\n";
echo "   headerSettings.locationsCount вернет: {$locations_count}\n\n";

// 5. Проверить что reviewsCount удален из options
echo "5. Проверка что reviewsCount удален из ACF options:\n";
$old_reviews_count = get_field('reviews_count', 'options');
if ($old_reviews_count !== false && $old_reviews_count !== null) {
    echo "   ⚠️ ВНИМАНИЕ: Поле reviews_count еще существует в БД: {$old_reviews_count}\n";
    echo "   Это нормально - поле удалено из field group, но старые данные могут остаться в БД\n";
} else {
    echo "   ✓ Поле reviews_count не найдено в options (правильно)\n";
}
echo "\n";

echo "✓ Тест завершен!\n\n";

echo "Следующие шаги:\n";
echo "1. Очистить кэши: docker exec wordpress wp cache flush --allow-root\n";
echo "2. Тестировать GraphQL: curl -X POST http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{menu(id:\\\"PRIMARY\\\",idType:LOCATION){menuItems{nodes{label url badgeCount}}}}\"}'\n";
echo "3. Создать тестовые посты reviews и promotions в WordPress Admin\n";
echo "4. Проверить что badgeCount динамически обновляется\n";
