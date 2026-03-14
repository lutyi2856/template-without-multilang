<?php
/**
 * Скрипт для создания структуры меню УниДент
 * 
 * Создает:
 * - Страницы-заглушки
 * - Меню Primary Menu с правильной иерархией
 * - ACF поля для пунктов меню (badge count)
 * 
 * Usage: 
 * docker compose exec wordpress wp eval-file scripts/setup-menu-structure.php
 */

// Защита от прямого доступа
if (!defined('ABSPATH') && !defined('WP_CLI')) {
    define('ABSPATH', dirname(__FILE__) . '/../');
    require_once ABSPATH . 'wp-load.php';
}

echo "🚀 Начинаем создание структуры меню УниДент...\n\n";

// ============================================================================
// 1. Создание страниц
// ============================================================================

echo "📄 Создание страниц-заглушек...\n";

$pages = [
    // Основные страницы
    'about' => [
        'title' => 'О клинике',
        'content' => '<h1>О клинике</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
    'prices' => [
        'title' => 'Цены',
        'content' => '<h1>Цены</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
    'contacts' => [
        'title' => 'Контакты',
        'content' => '<h1>Контакты</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
    'patients' => [
        'title' => 'Пациентам',
        'content' => '<h1>Пациентам</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
];

// Подстраницы "О клинике"
$about_subpages = [
    'history' => [
        'title' => 'История клиники',
        'content' => '<h1>История клиники</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
    'team' => [
        'title' => 'Наша команда',
        'content' => '<h1>Наша команда</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
];

// Подстраницы "Пациентам"
$patients_subpages = [
    'faq' => [
        'title' => 'Часто задаваемые вопросы',
        'content' => '<h1>Часто задаваемые вопросы</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
    'garantii' => [
        'title' => 'Гарантии',
        'content' => '<h1>Гарантии</h1><p>Страница в разработке. Содержимое будет добавлено позже.</p>',
    ],
];

$created_pages = [];

// Создаем основные страницы
foreach ($pages as $slug => $page_data) {
    // Проверяем, существует ли страница
    $existing = get_page_by_path($slug);
    
    if ($existing) {
        echo "  ⏭️  Страница '$slug' уже существует (ID: {$existing->ID})\n";
        $created_pages[$slug] = $existing->ID;
        continue;
    }
    
    $page_id = wp_insert_post([
        'post_title' => $page_data['title'],
        'post_content' => $page_data['content'],
        'post_status' => 'publish',
        'post_type' => 'page',
        'post_name' => $slug,
        'post_author' => 1,
    ]);
    
    if (is_wp_error($page_id)) {
        echo "  ❌ Ошибка создания страницы '$slug': " . $page_id->get_error_message() . "\n";
    } else {
        echo "  ✅ Создана страница '$slug' (ID: $page_id)\n";
        $created_pages[$slug] = $page_id;
    }
}

// Создаем подстраницы "О клинике"
if (isset($created_pages['about'])) {
    foreach ($about_subpages as $slug => $page_data) {
        $existing = get_page_by_path("about/$slug");
        
        if ($existing) {
            echo "  ⏭️  Страница 'about/$slug' уже существует (ID: {$existing->ID})\n";
            $created_pages["about_$slug"] = $existing->ID;
            continue;
        }
        
        $page_id = wp_insert_post([
            'post_title' => $page_data['title'],
            'post_content' => $page_data['content'],
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => $slug,
            'post_parent' => $created_pages['about'],
            'post_author' => 1,
        ]);
        
        if (is_wp_error($page_id)) {
            echo "  ❌ Ошибка создания страницы 'about/$slug': " . $page_id->get_error_message() . "\n";
        } else {
            echo "  ✅ Создана страница 'about/$slug' (ID: $page_id)\n";
            $created_pages["about_$slug"] = $page_id;
        }
    }
}

// Создаем подстраницы "Пациентам"
if (isset($created_pages['patients'])) {
    foreach ($patients_subpages as $slug => $page_data) {
        $existing = get_page_by_path("patients/$slug");
        
        if ($existing) {
            echo "  ⏭️  Страница 'patients/$slug' уже существует (ID: {$existing->ID})\n";
            $created_pages["patients_$slug"] = $existing->ID;
            continue;
        }
        
        $page_id = wp_insert_post([
            'post_title' => $page_data['title'],
            'post_content' => $page_data['content'],
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => $slug,
            'post_parent' => $created_pages['patients'],
            'post_author' => 1,
        ]);
        
        if (is_wp_error($page_id)) {
            echo "  ❌ Ошибка создания страницы 'patients/$slug': " . $page_id->get_error_message() . "\n";
        } else {
            echo "  ✅ Создана страница 'patients/$slug' (ID: $page_id)\n";
            $created_pages["patients_$slug"] = $page_id;
        }
    }
}

echo "\n";

// ============================================================================
// 2. Создание или обновление меню
// ============================================================================

echo "🗂️  Создание меню Primary Menu...\n";

// Проверяем, существует ли меню
$menu_exists = wp_get_nav_menu_object('Primary Menu');

if ($menu_exists) {
    echo "  ⏭️  Меню 'Primary Menu' уже существует (ID: {$menu_exists->term_id})\n";
    echo "  ℹ️  Для пересоздания меню удалите существующее через WordPress Admin\n";
    $menu_id = $menu_exists->term_id;
} else {
    $menu_id = wp_create_nav_menu('Primary Menu');
    
    if (is_wp_error($menu_id)) {
        echo "  ❌ Ошибка создания меню: " . $menu_id->get_error_message() . "\n";
        exit(1);
    } else {
        echo "  ✅ Создано меню 'Primary Menu' (ID: $menu_id)\n";
    }
    
    // ============================================================================
    // 3. Добавление пунктов меню
    // ============================================================================
    
    echo "\n📋 Добавление пунктов меню...\n";
    
    $menu_order = 1;
    
    // 1. Услуги (Custom Link с dropdown)
    $services_item_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => 'Услуги',
        'menu-item-url' => '/services',
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
        'menu-item-position' => $menu_order++,
    ]);
    echo "  ✅ Добавлен пункт 'Услуги' (ID: $services_item_id)\n";
    
    // Подпункты для "Услуги"
    wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => 'Все услуги',
        'menu-item-url' => '/services',
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
        'menu-item-parent-id' => $services_item_id,
    ]);
    
    // 2. О клинике (Page с dropdown)
    if (isset($created_pages['about'])) {
        $about_item_id = wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'О клинике',
            'menu-item-object-id' => $created_pages['about'],
            'menu-item-object' => 'page',
            'menu-item-type' => 'post_type',
            'menu-item-status' => 'publish',
            'menu-item-position' => $menu_order++,
        ]);
        echo "  ✅ Добавлен пункт 'О клинике' (ID: $about_item_id)\n";
        
        // Подпункты для "О клинике"
        if (isset($created_pages['about_history'])) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title' => 'История',
                'menu-item-object-id' => $created_pages['about_history'],
                'menu-item-object' => 'page',
                'menu-item-type' => 'post_type',
                'menu-item-status' => 'publish',
                'menu-item-parent-id' => $about_item_id,
            ]);
        }
        
        if (isset($created_pages['about_team'])) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title' => 'Команда',
                'menu-item-object-id' => $created_pages['about_team'],
                'menu-item-object' => 'page',
                'menu-item-type' => 'post_type',
                'menu-item-status' => 'publish',
                'menu-item-parent-id' => $about_item_id,
            ]);
        }
    }
    
    // 3. Врачи (Archive)
    $doctors_item_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => 'Врачи',
        'menu-item-url' => '/doctors',
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
        'menu-item-position' => $menu_order++,
    ]);
    echo "  ✅ Добавлен пункт 'Врачи' (ID: $doctors_item_id)\n";
    
    // 4. Акции (Archive) с badge
    $promotions_item_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => 'Акции',
        'menu-item-url' => '/promotions',
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
        'menu-item-position' => $menu_order++,
    ]);
    // Добавить ACF поле badge_count = 3
    update_field('badge_count', 3, $promotions_item_id);
    echo "  ✅ Добавлен пункт 'Акции' с badge=3 (ID: $promotions_item_id)\n";
    
    // 5. Кейсы (Archive)
    $cases_item_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => 'Кейсы',
        'menu-item-url' => '/cases',
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
        'menu-item-position' => $menu_order++,
    ]);
    echo "  ✅ Добавлен пункт 'Кейсы' (ID: $cases_item_id)\n";
    
    // 6. Цены (Page)
    if (isset($created_pages['prices'])) {
        $prices_item_id = wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'Цены',
            'menu-item-object-id' => $created_pages['prices'],
            'menu-item-object' => 'page',
            'menu-item-type' => 'post_type',
            'menu-item-status' => 'publish',
            'menu-item-position' => $menu_order++,
        ]);
        echo "  ✅ Добавлен пункт 'Цены' (ID: $prices_item_id)\n";
    }
    
    // 7. Отзывы (Archive) с badge
    $reviews_item_id = wp_update_nav_menu_item($menu_id, 0, [
        'menu-item-title' => 'Отзывы',
        'menu-item-url' => '/reviews',
        'menu-item-status' => 'publish',
        'menu-item-type' => 'custom',
        'menu-item-position' => $menu_order++,
    ]);
    // Добавить ACF поле badge_count = 1294
    update_field('badge_count', 1294, $reviews_item_id);
    echo "  ✅ Добавлен пункт 'Отзывы' с badge=1294 (ID: $reviews_item_id)\n";
    
    // 8. Пациентам (Page с dropdown)
    if (isset($created_pages['patients'])) {
        $patients_item_id = wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'Пациентам',
            'menu-item-object-id' => $created_pages['patients'],
            'menu-item-object' => 'page',
            'menu-item-type' => 'post_type',
            'menu-item-status' => 'publish',
            'menu-item-position' => $menu_order++,
        ]);
        echo "  ✅ Добавлен пункт 'Пациентам' (ID: $patients_item_id)\n";
        
        // Подпункты для "Пациентам"
        if (isset($created_pages['patients_faq'])) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title' => 'FAQ',
                'menu-item-object-id' => $created_pages['patients_faq'],
                'menu-item-object' => 'page',
                'menu-item-type' => 'post_type',
                'menu-item-status' => 'publish',
                'menu-item-parent-id' => $patients_item_id,
            ]);
        }
        
        if (isset($created_pages['patients_garantii'])) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title' => 'Гарантии',
                'menu-item-object-id' => $created_pages['patients_garantii'],
                'menu-item-object' => 'page',
                'menu-item-type' => 'post_type',
                'menu-item-status' => 'publish',
                'menu-item-parent-id' => $patients_item_id,
            ]);
        }
    }
    
    // 9. Контакты (Page)
    if (isset($created_pages['contacts'])) {
        $contacts_item_id = wp_update_nav_menu_item($menu_id, 0, [
            'menu-item-title' => 'Контакты',
            'menu-item-object-id' => $created_pages['contacts'],
            'menu-item-object' => 'page',
            'menu-item-type' => 'post_type',
            'menu-item-status' => 'publish',
            'menu-item-position' => $menu_order++,
        ]);
        echo "  ✅ Добавлен пункт 'Контакты' (ID: $contacts_item_id)\n";
    }
    
    echo "\n";
    
    // ============================================================================
    // 4. Назначение меню на location
    // ============================================================================
    
    echo "📍 Назначение меню на location 'primary'...\n";
    
    $locations = get_theme_mod('nav_menu_locations') ?: [];
    $locations['primary'] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);
    
    echo "  ✅ Меню назначено на location 'primary'\n";
}

echo "\n";

// ============================================================================
// 5. Резюме
// ============================================================================

echo "✨ Готово!\n\n";
echo "📊 Резюме:\n";
echo "  - Создано страниц: " . count($created_pages) . "\n";
echo "  - ID меню: $menu_id\n";
echo "\n";
echo "🔗 Следующие шаги:\n";
echo "  1. Откройте WordPress Admin → Внешний вид → Меню\n";
echo "  2. Добавьте иконки (SVG код) к пунктам меню через ACF поле 'Иконка'\n";
echo "  3. Проверьте GraphQL запрос в GraphiQL:\n";
echo "     query { menu(id: \"primary\", idType: LOCATION) { menuItems { nodes { label menuItemSettings { icon badgeCount } } } } }\n";
echo "\n";
