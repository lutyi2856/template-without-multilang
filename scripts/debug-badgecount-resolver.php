<?php
/**
 * Debug: Проверка регистрации badgeCount resolver
 */

require_once __DIR__ . '/../wp-config.php';

echo "=== DEBUG BADGECOUNT RESOLVER ===\n\n";

// 1. Проверить зарегистрирована ли функция
echo "1. Проверка функции:\n";
if (function_exists('unident_register_menu_badge_count_field')) {
    echo "   ✓ unident_register_menu_badge_count_field() существует\n";
} else {
    echo "   ✗ Функция НЕ найдена!\n";
}
echo "\n";

// 2. Проверить что action зарегистрирован
echo "2. Проверка action 'graphql_register_types':\n";
global $wp_filter;
if (isset($wp_filter['graphql_register_types'])) {
    echo "   ✓ Action 'graphql_register_types' зарегистрирован\n";
    echo "   Зарегистрированные функции:\n";
    foreach ($wp_filter['graphql_register_types']->callbacks as $priority => $callbacks) {
        foreach ($callbacks as $callback) {
            $func_name = is_array($callback['function']) 
                ? get_class($callback['function'][0]) . '::' . $callback['function'][1]
                : $callback['function'];
            echo "     - Priority {$priority}: {$func_name}\n";
        }
    }
} else {
    echo "   ✗ Action НЕ зарегистрирован!\n";
}
echo "\n";

// 3. Проверить GraphQL schema для MenuItem
echo "3. Проверка GraphQL schema для MenuItem.badgeCount:\n";
if (function_exists('graphql')) {
    // Introspection query
    $query = '
    {
      __type(name: "MenuItem") {
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
    ';
    
    $result = graphql(['query' => $query]);
    
    if (isset($result['data']['__type']['fields'])) {
        $fields = $result['data']['__type']['fields'];
        $badgeCount_found = false;
        
        foreach ($fields as $field) {
            if ($field['name'] === 'badgeCount') {
                $badgeCount_found = true;
                echo "   ✓ Поле badgeCount найдено в схеме\n";
                echo "     Type: {$field['type']['name']} ({$field['type']['kind']})\n";
                break;
            }
        }
        
        if (!$badgeCount_found) {
            echo "   ✗ Поле badgeCount НЕ найдено в схеме!\n";
        }
    }
}
echo "\n";

// 4. Тест resolver напрямую
echo "4. Тест resolver напрямую:\n";
$menu_item_39 = get_post(39); // Отзывы
if ($menu_item_39) {
    $url = get_post_meta(39, '_menu_item_url', true);
    $label = $menu_item_39->post_title;
    
    echo "   Menu Item ID 39:\n";
    echo "     Title: {$label}\n";
    echo "     URL: {$url}\n";
    
    $url_lower = mb_strtolower($url);
    $label_lower = mb_strtolower($label);
    $check_string = $url_lower . ' ' . $label_lower;
    
    echo "     check_string: '{$check_string}'\n";
    
    $is_reviews = (
        strpos($check_string, 'review') !== false ||
        strpos($check_string, 'отзыв') !== false ||
        strpos($check_string, 'otzyv') !== false
    );
    
    echo "     Match reviews: " . ($is_reviews ? "✓ YES" : "✗ NO") . "\n";
    
    if ($is_reviews) {
        $posts_count = wp_count_posts('reviews');
        $result = isset($posts_count->publish) ? (int) $posts_count->publish : 0;
        echo "     → Должен вернуть: {$result} (из reviews CPT)\n";
    } else {
        $badge_count = get_post_meta(39, 'badge_count', true);
        echo "     → Должен вернуть: {$badge_count} (из ACF)\n";
    }
}

echo "\n✓ Debug завершен!\n";
