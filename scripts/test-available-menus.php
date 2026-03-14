<?php
/**
 * Проверка доступных меню
 */

require_once __DIR__ . '/../wp-config.php';

echo "=== ДОСТУПНЫЕ МЕНЮ ===\n\n";

// 1. Все меню
$menus = get_terms('nav_menu', ['hide_empty' => false]);
echo "1. Все меню в системе:\n";
if ($menus && !is_wp_error($menus)) {
    foreach ($menus as $menu) {
        echo "   - {$menu->name} (ID: {$menu->term_id}, Slug: {$menu->slug})\n";
    }
} else {
    echo "   Меню не найдены\n";
}
echo "\n";

// 2. Menu locations
$locations = get_nav_menu_locations();
echo "2. Зарегистрированные menu locations:\n";
if ($locations && !empty($locations)) {
    foreach ($locations as $location => $menu_id) {
        $menu = wp_get_nav_menu_object($menu_id);
        $menu_name = $menu ? $menu->name : 'Не назначено';
        echo "   - {$location}: {$menu_name} (Menu ID: {$menu_id})\n";
    }
} else {
    echo "   Locations не настроены\n";
}
echo "\n";

// 3. Проверка конкретных меню
echo "3. Попытка получить меню 'Главное меню':\n";
$main_menu = wp_get_nav_menu_object('Главное меню');
if ($main_menu) {
    echo "   ✓ Найдено: ID={$main_menu->term_id}, Slug={$main_menu->slug}\n";
    
    // Получить items
    $items = wp_get_nav_menu_items($main_menu->term_id);
    if ($items) {
        echo "   Items count: " . count($items) . "\n";
        foreach ($items as $item) {
            echo "     - {$item->title} (ID: {$item->ID}, URL: {$item->url})\n";
        }
    }
} else {
    echo "   ✗ Не найдено\n";
}
echo "\n";

// 4. GraphQL query с правильным идентификатором
if ($menus && !empty($menus)) {
    $first_menu = $menus[0];
    echo "4. Попытка GraphQL запроса с первым меню (ID: {$first_menu->term_id}):\n";
    
    $query = "
    {
      menu(id: {$first_menu->term_id}, idType: DATABASE_ID) {
        name
        menuItems {
          nodes {
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
        
        if (isset($result['data']['menu'])) {
            echo "   ✓ GraphQL запрос успешен!\n";
            $menu_data = $result['data']['menu'];
            echo "   Menu name: {$menu_data['name']}\n";
            
            if (isset($menu_data['menuItems']['nodes'])) {
                foreach ($menu_data['menuItems']['nodes'] as $item) {
                    $badge = $item['badgeCount'] ?? 'null';
                    echo "     - {$item['label']}: badgeCount={$badge}\n";
                }
            }
        } else if (isset($result['errors'])) {
            echo "   ✗ Ошибка: " . $result['errors'][0]['message'] . "\n";
        }
    }
}

echo "\n✓ Тест завершен!\n";
