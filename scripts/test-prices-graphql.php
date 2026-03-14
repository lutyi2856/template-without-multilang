<?php
/**
 * Test Prices GraphQL data
 * 
 * Проверяет GraphQL query для блока цен
 */

// Добавляем query string параметр для запуска
if (isset($_GET['test_prices_graphql'])) {
    // Получаем первую цену для проверки
    $prices = get_posts([
        'post_type' => 'prices',
        'posts_per_page' => 1,
        'post_status' => 'publish',
    ]);

    if (empty($prices)) {
        echo json_encode(['error' => 'No prices found']);
        exit;
    }

    $price_id = $prices[0]->ID;

    // Проверяем ACF поля
    $regular_price = get_field('regular_price', $price_id);
    $average_price_city = get_field('average_price_city', $price_id);
    $currency = get_field('currency', $price_id);
    $period = get_field('period', $price_id);

    // Проверяем связь с Service
    $related_service = get_field('related_service', $price_id);

    echo json_encode([
        'price_id' => $price_id,
        'title' => get_the_title($price_id),
        'regular_price' => $regular_price,
        'average_price_city' => $average_price_city,
        'currency' => $currency,
        'period' => $period,
        'related_service' => $related_service ? $related_service->post_title : null,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}
