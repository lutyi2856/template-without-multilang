<?php
/**
 * Тест GraphQL запроса menu items с badgeCount
 */

require_once __DIR__ . '/../wp-config.php';

echo "=== ТЕСТ MENU ITEMS BADGECOUNT ===\n\n";

// GraphQL query
$query = '
{
  menu(id: "PRIMARY", idType: LOCATION) {
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
';

// Execute GraphQL query
if (function_exists('graphql')) {
    $result = graphql(['query' => $query]);
    
    echo "GraphQL Result:\n";
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";
    
    // Анализ результатов
    if (isset($result['data']['menu']['menuItems']['nodes'])) {
        $items = $result['data']['menu']['menuItems']['nodes'];
        
        echo "Анализ badgeCount:\n";
        foreach ($items as $item) {
            $label = $item['label'] ?? 'Unknown';
            $url = $item['url'] ?? '';
            $badgeCount = $item['badgeCount'] ?? 'null';
            
            // Определяем ожидаемый источник
            $url_lower = mb_strtolower($url);
            $label_lower = mb_strtolower($label);
            $check_string = $url_lower . ' ' . $label_lower;
            
            if (
                strpos($check_string, 'review') !== false ||
                strpos($check_string, 'отзыв') !== false ||
                strpos($check_string, 'otzyv') !== false
            ) {
                $expected_source = 'reviews CPT';
                $posts_count = wp_count_posts('reviews');
                $expected_count = isset($posts_count->publish) ? (int) $posts_count->publish : 0;
            } elseif (
                strpos($check_string, 'promotion') !== false ||
                strpos($check_string, 'акци') !== false ||
                strpos($check_string, 'akci') !== false ||
                strpos($check_string, 'promo') !== false
            ) {
                $expected_source = 'promotions CPT';
                $posts_count = wp_count_posts('promotions');
                $expected_count = isset($posts_count->publish) ? (int) $posts_count->publish : 0;
            } else {
                $expected_source = 'ACF fallback';
                $expected_count = 'varies';
            }
            
            $status = '✓';
            if ($expected_count !== 'varies' && $badgeCount !== $expected_count) {
                $status = '✗';
            }
            
            echo "  {$status} {$label} ({$url})\n";
            echo "     badgeCount: {$badgeCount}\n";
            echo "     source: {$expected_source}\n";
            if ($expected_count !== 'varies') {
                echo "     expected: {$expected_count}\n";
            }
            echo "\n";
        }
    }
    
    // Проверка ошибок
    if (isset($result['errors']) && !empty($result['errors'])) {
        echo "\n❌ ОШИБКИ:\n";
        foreach ($result['errors'] as $error) {
            echo "  - " . ($error['message'] ?? 'Unknown error') . "\n";
        }
    }
} else {
    echo "❌ WPGraphQL не доступен!\n";
}

echo "\n✓ Тест завершен!\n";
