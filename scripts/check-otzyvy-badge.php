<?php
/**
 * Проверка откуда берется badgeCount для пункта "Отзывы"
 */

require_once __DIR__ . '/../wp-config.php';

echo "=== ПРОВЕРКА BADGECOUNT ДЛЯ ОТЗЫВЫ ===\n\n";

// 1. Найти menu item "Отзывы"
$menu_items = wp_get_nav_menu_items('Главное меню');
$otzyvy_item = null;

if ($menu_items) {
    foreach ($menu_items as $item) {
        if (strpos(mb_strtolower($item->url), 'otzyv') !== false || 
            strpos(mb_strtolower($item->title), 'отзыв') !== false) {
            $otzyvy_item = $item;
            break;
        }
    }
}

if (!$otzyvy_item) {
    echo "❌ Menu item 'Отзывы' не найден\n";
    exit;
}

echo "1. Menu Item 'Отзывы':\n";
echo "   ID: {$otzyvy_item->ID}\n";
echo "   Title: {$otzyvy_item->title}\n";
echo "   URL: {$otzyvy_item->url}\n\n";

// 2. Проверить ACF поле badge_count
echo "2. ACF поле badge_count:\n";
$badge_count_acf = get_post_meta($otzyvy_item->ID, 'badge_count', true);
echo "   badge_count (ACF): " . ($badge_count_acf ?: 'не задано') . "\n\n";

// 3. Проверить количество reviews CPT
echo "3. Количество reviews CPT:\n";
$reviews_count = wp_count_posts('reviews');
$reviews_published = isset($reviews_count->publish) ? (int) $reviews_count->publish : 0;
echo "   reviews published: {$reviews_published}\n\n";

// 4. Симуляция resolver логики
echo "4. Симуляция resolver для MenuItem ID {$otzyvy_item->ID}:\n";
$url = $otzyvy_item->url ?? '';
$label = $otzyvy_item->title ?? '';

$url_lower = mb_strtolower($url);
$label_lower = mb_strtolower($label);
$check_string = $url_lower . ' ' . $label_lower;

echo "   check_string: '{$check_string}'\n";

// Проверка на reviews
$is_reviews = (
    strpos($check_string, 'review') !== false ||
    strpos($check_string, 'отзыв') !== false ||
    strpos($check_string, 'otzyv') !== false
);

echo "   is_reviews match: " . ($is_reviews ? "✓ YES" : "✗ NO") . "\n";

if ($is_reviews) {
    echo "   → Вернет: {$reviews_published} (из reviews CPT)\n";
} else {
    echo "   → Вернет: {$badge_count_acf} (из ACF fallback)\n";
}
echo "\n";

// 5. Проверка GraphQL query
echo "5. GraphQL запрос:\n";
$query = "
{
  menu(id: 19, idType: DATABASE_ID) {
    menuItems {
      nodes {
        databaseId
        label
        url
        badgeCount
      }
    }
  }
}
";

if (function_exists('graphql')) {
    $result = graphql(['query' => $query]);
    
    if (isset($result['data']['menu']['menuItems']['nodes'])) {
        foreach ($result['data']['menu']['menuItems']['nodes'] as $item) {
            if ($item['databaseId'] == $otzyvy_item->ID) {
                echo "   GraphQL badgeCount для 'Отзывы': " . ($item['badgeCount'] ?? 'null') . "\n";
                
                if ($item['badgeCount'] == $badge_count_acf && $badge_count_acf != $reviews_published) {
                    echo "   ⚠️ ПРОБЛЕМА: Используется ACF значение вместо динамического!\n";
                    echo "   Возможная причина: URL/label не совпадают с паттерном в resolver\n";
                } elseif ($item['badgeCount'] == $reviews_published) {
                    echo "   ✓ Правильно: Используется динамический счетчик из CPT\n";
                }
                break;
            }
        }
    }
}

echo "\n✓ Тест завершен!\n";
