<?php
/**
 * Создание двух меню футера и назначение на footer_left и footer_right.
 * Требует: register_nav_menus в unident-structure.php (footer_left, footer_right).
 *
 * Usage:
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/setup-footer-menus.php --allow-root
 * или из корня проекта с wp-load.php
 */

if (!defined('ABSPATH') && !defined('WP_CLI')) {
    define('ABSPATH', dirname(__FILE__) . '/../');
    require_once ABSPATH . 'wp-load.php';
}

echo "🚀 Создание меню футера...\n\n";

$locations = get_theme_mod('nav_menu_locations') ?: [];

// ---------------------------------------------------------------------------
// Footer Left Menu: Услуги, О клинике (с подменю), Врачи, Акции, Кейсы
// ---------------------------------------------------------------------------
$left_menu = wp_get_nav_menu_object('Footer Left Menu');
if ($left_menu) {
    echo "⏭️  Меню 'Footer Left Menu' уже существует (ID: {$left_menu->term_id})\n";
    $left_menu_id = $left_menu->term_id;
} else {
    $left_menu_id = wp_create_nav_menu('Footer Left Menu');
    if (is_wp_error($left_menu_id)) {
        echo "❌ Ошибка создания Footer Left Menu: " . $left_menu_id->get_error_message() . "\n";
        exit(1);
    }
    echo "✅ Создано меню 'Footer Left Menu' (ID: $left_menu_id)\n";

    $order = 1;
    // Услуги
    wp_update_nav_menu_item($left_menu_id, 0, [
        'menu-item-title'     => 'Услуги',
        'menu-item-url'       => '/services',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);

    // О клинике (родитель)
    $about_id = wp_update_nav_menu_item($left_menu_id, 0, [
        'menu-item-title'     => 'О клинике',
        'menu-item-url'       => '/about',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);
    wp_update_nav_menu_item($left_menu_id, 0, [
        'menu-item-title'        => 'Наша команда',
        'menu-item-url'          => '/about/team',
        'menu-item-status'       => 'publish',
        'menu-item-type'         => 'custom',
        'menu-item-parent-id'    => $about_id,
    ]);
    wp_update_nav_menu_item($left_menu_id, 0, [
        'menu-item-title'        => 'История клиники',
        'menu-item-url'          => '/about/history',
        'menu-item-status'       => 'publish',
        'menu-item-type'         => 'custom',
        'menu-item-parent-id'    => $about_id,
    ]);

    wp_update_nav_menu_item($left_menu_id, 0, [
        'menu-item-title'     => 'Врачи',
        'menu-item-url'       => '/doctors',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);
    wp_update_nav_menu_item($left_menu_id, 0, [
        'menu-item-title'     => 'Акции',
        'menu-item-url'       => '/promotions',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);
    wp_update_nav_menu_item($left_menu_id, 0, [
        'menu-item-title'     => 'Кейсы',
        'menu-item-url'       => '/our-works',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);
}

$locations['footer_left'] = $left_menu_id;

// ---------------------------------------------------------------------------
// Footer Right Menu: Цены, Отзывы, Пациентам (с подменю), Контакты
// ---------------------------------------------------------------------------
$right_menu = wp_get_nav_menu_object('Footer Right Menu');
if ($right_menu) {
    echo "⏭️  Меню 'Footer Right Menu' уже существует (ID: {$right_menu->term_id})\n";
    $right_menu_id = $right_menu->term_id;
} else {
    $right_menu_id = wp_create_nav_menu('Footer Right Menu');
    if (is_wp_error($right_menu_id)) {
        echo "❌ Ошибка создания Footer Right Menu: " . $right_menu_id->get_error_message() . "\n";
        exit(1);
    }
    echo "✅ Создано меню 'Footer Right Menu' (ID: $right_menu_id)\n";

    $order = 1;
    wp_update_nav_menu_item($right_menu_id, 0, [
        'menu-item-title'     => 'Цены',
        'menu-item-url'       => '/prices',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);
    wp_update_nav_menu_item($right_menu_id, 0, [
        'menu-item-title'     => 'Отзывы',
        'menu-item-url'       => '/reviews',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);

    $patients_id = wp_update_nav_menu_item($right_menu_id, 0, [
        'menu-item-title'     => 'Пациентам',
        'menu-item-url'       => '/patients',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);
    wp_update_nav_menu_item($right_menu_id, 0, [
        'menu-item-title'        => 'Вопросы-ответы',
        'menu-item-url'          => '/patients/voprosy-otvety',
        'menu-item-status'       => 'publish',
        'menu-item-type'         => 'custom',
        'menu-item-parent-id'    => $patients_id,
    ]);
    wp_update_nav_menu_item($right_menu_id, 0, [
        'menu-item-title'        => 'Гарантии',
        'menu-item-url'          => '/patients/garantii',
        'menu-item-status'       => 'publish',
        'menu-item-type'         => 'custom',
        'menu-item-parent-id'    => $patients_id,
    ]);

    wp_update_nav_menu_item($right_menu_id, 0, [
        'menu-item-title'     => 'Контакты',
        'menu-item-url'       => '/contacts',
        'menu-item-status'    => 'publish',
        'menu-item-type'      => 'custom',
        'menu-item-position'  => $order++,
    ]);
}

$locations['footer_right'] = $right_menu_id;

set_theme_mod('nav_menu_locations', $locations);
echo "✅ Меню назначены на footer_left и footer_right\n\n";
echo "✨ Готово. Проверка GraphQL: menu(id: \"footer_left\", idType: LOCATION) { menuItems { nodes { label path } } }\n";
