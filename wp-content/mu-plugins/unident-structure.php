<?php
/**
 * Plugin Name: УниДент - Структура сайта
 * Description: Регистрация Custom Post Types и Taxonomies для сайта УниДент
 * Version: 1.0.0
 * Author: koystrubvs
 * Text Domain: unident-structure
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Custom Post Type: Services (Услуги)
 */
function unident_register_services_cpt() {
    $labels = array(
        'name'                  => 'Услуги',
        'singular_name'         => 'Услуга',
        'menu_name'             => 'Услуги',
        'name_admin_bar'        => 'Услуга',
        'archives'              => 'Архив услуг',
        'attributes'            => 'Атрибуты услуги',
        'parent_item_colon'     => 'Родительская услуга:',
        'all_items'             => 'Все услуги',
        'add_new_item'          => 'Добавить новую услугу',
        'add_new'               => 'Добавить новую',
        'new_item'              => 'Новая услуга',
        'edit_item'             => 'Редактировать услугу',
        'update_item'           => 'Обновить услугу',
        'view_item'             => 'Просмотреть услугу',
        'view_items'            => 'Просмотреть услуги',
        'search_items'          => 'Искать услугу',
        'not_found'             => 'Не найдено',
        'not_found_in_trash'    => 'Не найдено в корзине',
    );

    $args = array(
        'label'                 => 'Услуга',
        'description'           => 'Стоматологические услуги клиники',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'),
        'taxonomies'            => array('service_categories', 'problematics'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-heart',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'services',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        // GraphQL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'service',
        'graphql_plural_name'   => 'services',
    );

    register_post_type('services', $args);
}
add_action('init', 'unident_register_services_cpt', 0);

/**
 * Register Taxonomy: Service Categories (Категории услуг)
 */
function unident_register_service_categories_taxonomy() {
    $labels = array(
        'name'                       => 'Категории услуг',
        'singular_name'              => 'Категория услуг',
        'menu_name'                  => 'Категории',
        'all_items'                  => 'Все категории',
        'parent_item'                => 'Родительская категория',
        'parent_item_colon'          => 'Родительская категория:',
        'new_item_name'              => 'Новая категория',
        'add_new_item'               => 'Добавить новую категорию',
        'edit_item'                  => 'Редактировать категорию',
        'update_item'                => 'Обновить категорию',
        'view_item'                  => 'Просмотреть категорию',
        'separate_items_with_commas' => 'Разделите категории запятыми',
        'add_or_remove_items'        => 'Добавить или удалить категории',
        'choose_from_most_used'      => 'Выбрать из часто используемых',
        'popular_items'              => 'Популярные категории',
        'search_items'               => 'Искать категории',
        'not_found'                  => 'Не найдено',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'service_categories',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        // GraphQL
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'serviceCategory',
        'graphql_plural_name'        => 'serviceCategories',
    );

    register_taxonomy('service_categories', array('services', 'doctors', 'promotions', 'our-works', 'prices'), $args);
}
add_action('init', 'unident_register_service_categories_taxonomy', 0);

/**
 * Register Taxonomy: Problematics (Проблематика)
 */
function unident_register_problematics_taxonomy() {
    $labels = array(
        'name'                       => 'Проблематика',
        'singular_name'              => 'Проблематика',
        'menu_name'                  => 'Проблематика',
        'all_items'                  => 'Все проблематики',
        'parent_item'                => 'Родительская проблематика',
        'parent_item_colon'          => 'Родительская проблематика:',
        'new_item_name'              => 'Новая проблематика',
        'add_new_item'               => 'Добавить новую проблематику',
        'edit_item'                  => 'Редактировать проблематику',
        'update_item'                => 'Обновить проблематику',
        'view_item'                  => 'Просмотреть проблематику',
        'separate_items_with_commas'  => 'Разделите проблематики запятыми',
        'add_or_remove_items'        => 'Добавить или удалить проблематики',
        'choose_from_most_used'      => 'Выбрать из часто используемых',
        'popular_items'              => 'Популярные проблематики',
        'search_items'               => 'Искать проблематики',
        'not_found'                  => 'Не найдено',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => false,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'problematics',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'problematic',
        'graphql_plural_name'        => 'problematics',
    );

    register_taxonomy('problematics', array('services'), $args);
}
add_action('init', 'unident_register_problematics_taxonomy', 0);

/**
 * Register Custom Post Type: Promotions (Акции/Промо)
 */
function unident_register_promotions_cpt() {
    $labels = array(
        'name'                  => 'Акции',
        'singular_name'         => 'Акция',
        'menu_name'             => 'Акции',
        'name_admin_bar'        => 'Акция',
        'archives'              => 'Архив акций',
        'attributes'            => 'Атрибуты акции',
        'all_items'             => 'Все акции',
        'add_new_item'          => 'Добавить новую акцию',
        'add_new'               => 'Добавить новую',
        'new_item'              => 'Новая акция',
        'edit_item'             => 'Редактировать акцию',
        'update_item'           => 'Обновить акцию',
        'view_item'             => 'Просмотреть акцию',
        'view_items'            => 'Просмотреть акции',
        'search_items'          => 'Искать акцию',
        'not_found'             => 'Не найдено',
        'not_found_in_trash'    => 'Не найдено в корзине',
    );

    $args = array(
        'label'                 => 'Акция',
        'description'           => 'Промо-акции и спецпредложения',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 6,
        'menu_icon'             => 'dashicons-megaphone',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'promotions',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        // GraphQL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'promotion',
        'graphql_plural_name'   => 'promotions',
    );

    register_post_type('promotions', $args);
}
add_action('init', 'unident_register_promotions_cpt', 0);

/**
 * Register Custom Post Type: Prices (Цены)
 */
function unident_register_prices_cpt() {
    $labels = array(
        'name'                  => 'Цены',
        'singular_name'         => 'Цена',
        'menu_name'             => 'Цены',
        'name_admin_bar'        => 'Цена',
        'archives'              => 'Архив цен',
        'attributes'            => 'Атрибуты цены',
        'all_items'             => 'Все цены',
        'add_new_item'          => 'Добавить новую цену',
        'add_new'               => 'Добавить новую',
        'new_item'              => 'Новая цена',
        'edit_item'             => 'Редактировать цену',
        'update_item'           => 'Обновить цену',
        'view_item'             => 'Просмотреть цену',
        'view_items'            => 'Просмотреть цены',
        'search_items'          => 'Искать цену',
        'not_found'             => 'Не найдено',
        'not_found_in_trash'    => 'Не найдено в корзине',
    );

    $args = array(
        'label'                 => 'Цена',
        'description'           => 'Цены на услуги клиники',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'excerpt', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 7,
        'menu_icon'             => 'dashicons-tag',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => false,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => true,
        'publicly_queryable'    => false,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'prices',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        // GraphQL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'price',
        'graphql_plural_name'   => 'prices',
    );

    register_post_type('prices', $args);
}
add_action('init', 'unident_register_prices_cpt', 0);

/**
 * Register Custom Post Type: Clinics (Клиники)
 */
function unident_register_clinics_cpt() {
    $labels = array(
        'name'                  => 'Клиники',
        'singular_name'         => 'Клиника',
        'menu_name'             => 'Клиники',
        'name_admin_bar'        => 'Клиника',
        'archives'              => 'Архив клиник',
        'attributes'            => 'Атрибуты клиники',
        'all_items'             => 'Все клиники',
        'add_new_item'          => 'Добавить новую клинику',
        'add_new'               => 'Добавить новую',
        'new_item'              => 'Новая клиника',
        'edit_item'             => 'Редактировать клинику',
        'update_item'           => 'Обновить клинику',
        'view_item'             => 'Просмотреть клинику',
        'view_items'            => 'Просмотреть клиники',
        'search_items'          => 'Искать клинику',
        'not_found'             => 'Не найдено',
        'not_found_in_trash'    => 'Не найдено в корзине',
    );

    $args = array(
        'label'                 => 'Клиника',
        'description'           => 'Филиалы клиники УниДент',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 8,
        'menu_icon'             => 'dashicons-location',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'clinics',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        // GraphQL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'clinic',
        'graphql_plural_name'   => 'clinics',
    );

    register_post_type('clinics', $args);
}
add_action('init', 'unident_register_clinics_cpt', 0);

/**
 * Register Custom Post Type: Reviews (Отзывы)
 */
function unident_register_reviews_cpt() {
    $labels = array(
        'name'                  => 'Отзывы',
        'singular_name'         => 'Отзыв',
        'menu_name'             => 'Отзывы',
        'name_admin_bar'        => 'Отзыв',
        'archives'              => 'Архив отзывов',
        'attributes'            => 'Атрибуты отзыва',
        'all_items'             => 'Все отзывы',
        'add_new_item'          => 'Добавить новый отзыв',
        'add_new'               => 'Добавить новый',
        'new_item'              => 'Новый отзыв',
        'edit_item'             => 'Редактировать отзыв',
        'update_item'           => 'Обновить отзыв',
        'view_item'             => 'Просмотреть отзыв',
        'view_items'            => 'Просмотреть отзывы',
        'search_items'          => 'Искать отзыв',
        'not_found'             => 'Не найдено',
        'not_found_in_trash'    => 'Не найдено в корзине',
    );

    $args = array(
        'label'                 => 'Отзыв',
        'description'           => 'Отзывы пациентов',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'author', 'thumbnail', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 9,
        'menu_icon'             => 'dashicons-testimonial',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'reviews',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        // GraphQL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'review',
        'graphql_plural_name'   => 'reviews',
    );

    register_post_type('reviews', $args);
}
add_action('init', 'unident_register_reviews_cpt', 0);

/**
 * Register Taxonomy: Review Platform (Платформа отзыва)
 */
function unident_register_review_platform_taxonomy() {
    $labels = array(
        'name'                       => 'Платформа отзыва',
        'singular_name'              => 'Платформа',
        'menu_name'                  => 'Платформы',
        'all_items'                  => 'Все платформы',
        'edit_item'                  => 'Редактировать платформу',
        'view_item'                  => 'Просмотреть платформу',
        'update_item'                => 'Обновить платформу',
        'add_new_item'               => 'Добавить платформу',
        'new_item_name'              => 'Новая платформа',
        'search_items'               => 'Искать платформы',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => false,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'review_platform',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'reviewPlatform',
        'graphql_plural_name'        => 'reviewPlatforms',
    );

    register_taxonomy('review_platform', array('reviews'), $args);
}
add_action('init', 'unident_register_review_platform_taxonomy', 0);

/**
 * Register Custom Post Type: Doctors (Врачи)
 */
function unident_register_doctors_cpt() {
    $labels = array(
        'name'                  => 'Врачи',
        'singular_name'         => 'Врач',
        'menu_name'             => 'Врачи',
        'name_admin_bar'        => 'Врач',
        'archives'              => 'Архив врачей',
        'attributes'            => 'Атрибуты врача',
        'all_items'             => 'Все врачи',
        'add_new_item'          => 'Добавить нового врача',
        'add_new'               => 'Добавить нового',
        'new_item'              => 'Новый врач',
        'edit_item'             => 'Редактировать врача',
        'update_item'           => 'Обновить врача',
        'view_item'             => 'Просмотреть врача',
        'view_items'            => 'Просмотреть врачей',
        'search_items'          => 'Искать врача',
        'not_found'             => 'Не найдено',
        'not_found_in_trash'    => 'Не найдено в корзине',
    );

    $args = array(
        'label'                 => 'Врач',
        'description'           => 'Врачи клиники УниДент',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
        'taxonomies'            => array('doctor_specializations', 'doctor_type', 'doctor_position', 'doctor_rank', 'service_categories'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 10,
        'menu_icon'             => 'dashicons-businessperson',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'doctors',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        // GraphQL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'doctor',
        'graphql_plural_name'   => 'doctors',
    );

    register_post_type('doctors', $args);
}
add_action('init', 'unident_register_doctors_cpt', 0);

/**
 * Register Custom Post Type: Our Works (Наши работы)
 */
function unident_register_our_works_cpt() {
    $labels = array(
        'name'                  => 'Наши работы',
        'singular_name'         => 'Работа',
        'menu_name'             => 'Наши работы',
        'name_admin_bar'        => 'Работа',
        'archives'              => 'Архив работ',
        'attributes'            => 'Атрибуты работы',
        'all_items'             => 'Все работы',
        'add_new_item'          => 'Добавить новую работу',
        'add_new'               => 'Добавить новую',
        'new_item'              => 'Новая работа',
        'edit_item'             => 'Редактировать работу',
        'update_item'           => 'Обновить работу',
        'view_item'             => 'Просмотреть работу',
        'view_items'            => 'Просмотреть работы',
        'search_items'          => 'Искать работу',
        'not_found'             => 'Не найдено',
        'not_found_in_trash'    => 'Не найдено в корзине',
    );

    $args = array(
        'label'                 => 'Работа',
        'description'           => 'Примеры работ клиники УниДент',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 11,
        'menu_icon'             => 'dashicons-portfolio',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'our-works',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        // GraphQL
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'ourWork',
        'graphql_plural_name'   => 'ourWorks',
    );

    register_post_type('our-works', $args);
}
add_action('init', 'unident_register_our_works_cpt', 0);

/**
 * Register Taxonomy: Cities (Города)
 *
 * Используется для фильтрации клиник по городам
 */
function unident_register_cities_taxonomy() {
    $labels = array(
        'name'                       => 'Города',
        'singular_name'              => 'Город',
        'menu_name'                  => 'Города',
        'all_items'                  => 'Все города',
        'parent_item'                => 'Родительский город',
        'parent_item_colon'          => 'Родительский город:',
        'new_item_name'              => 'Новый город',
        'add_new_item'               => 'Добавить новый город',
        'edit_item'                  => 'Редактировать город',
        'update_item'                => 'Обновить город',
        'view_item'                  => 'Просмотреть город',
        'separate_items_with_commas' => 'Разделите города запятыми',
        'add_or_remove_items'        => 'Добавить или удалить города',
        'choose_from_most_used'      => 'Выбрать из часто используемых',
        'popular_items'              => 'Популярные города',
        'search_items'               => 'Искать города',
        'not_found'                  => 'Не найдено',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'cities',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        // GraphQL
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'city',
        'graphql_plural_name'        => 'cities',
    );

    register_taxonomy('cities', array('clinics'), $args);
}
add_action('init', 'unident_register_cities_taxonomy', 0);

/**
 * Register Taxonomy: Doctor Specializations (Специализации врачей)
 *
 * Используется для фильтрации врачей по специализациям (стоматология, терапия и т.д.)
 */
function unident_register_doctor_specializations_taxonomy() {
    $labels = array(
        'name'                       => 'Специализации',
        'singular_name'              => 'Специализация',
        'menu_name'                  => 'Специализации',
        'all_items'                  => 'Все специализации',
        'parent_item'                => 'Родительская специализация',
        'parent_item_colon'          => 'Родительская специализация:',
        'new_item_name'              => 'Новая специализация',
        'add_new_item'               => 'Добавить специализацию',
        'edit_item'                  => 'Редактировать специализацию',
        'update_item'                => 'Обновить специализацию',
        'view_item'                  => 'Просмотреть специализацию',
        'separate_items_with_commas' => 'Разделите специализации запятыми',
        'add_or_remove_items'        => 'Добавить или удалить специализации',
        'choose_from_most_used'      => 'Выбрать из часто используемых',
        'popular_items'              => 'Популярные специализации',
        'search_items'               => 'Искать специализации',
        'not_found'                  => 'Не найдено',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'doctor_specializations',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        // GraphQL (camelCase for root field, as serviceCategory)
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'doctorSpecialization',
        'graphql_plural_name'        => 'doctorSpecializations',
    );

    register_taxonomy('doctor_specializations', array('doctors'), $args);
}
add_action('init', 'unident_register_doctor_specializations_taxonomy', 0);

/**
 * Register Taxonomy: Doctor Type (Тип врача — детский/взрослый)
 */
function unident_register_doctor_type_taxonomy() {
    $labels = array(
        'name'                       => 'Тип врача',
        'singular_name'              => 'Тип врача',
        'menu_name'                  => 'Тип врача',
        'all_items'                  => 'Все типы',
        'new_item_name'              => 'Новый тип',
        'add_new_item'               => 'Добавить тип',
        'edit_item'                  => 'Редактировать тип',
        'update_item'                => 'Обновить тип',
        'view_item'                  => 'Просмотреть тип',
        'search_items'               => 'Искать тип',
        'not_found'                  => 'Не найдено',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => false,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'doctor_type',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'DoctorType',
        'graphql_plural_name'        => 'doctorTypes',
    );

    register_taxonomy('doctor_type', array('doctors'), $args);
}
add_action('init', 'unident_register_doctor_type_taxonomy', 0);

/**
 * Register Taxonomy: Doctor Position (Должность)
 */
function unident_register_doctor_position_taxonomy() {
    $labels = array(
        'name'                       => 'Должности',
        'singular_name'              => 'Должность',
        'menu_name'                  => 'Должности',
        'all_items'                  => 'Все должности',
        'new_item_name'              => 'Новая должность',
        'add_new_item'               => 'Добавить должность',
        'edit_item'                  => 'Редактировать должность',
        'update_item'                => 'Обновить должность',
        'view_item'                  => 'Просмотреть должность',
        'search_items'               => 'Искать должность',
        'not_found'                  => 'Не найдено',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => false,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'doctor_position',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'DoctorPosition',
        'graphql_plural_name'        => 'doctorPositions',
    );

    register_taxonomy('doctor_position', array('doctors'), $args);
}
add_action('init', 'unident_register_doctor_position_taxonomy', 0);

/**
 * Register Taxonomy: Doctor Rank (Категория/ранг врача)
 */
function unident_register_doctor_rank_taxonomy() {
    $labels = array(
        'name'                       => 'Категория врача',
        'singular_name'              => 'Категория',
        'menu_name'                  => 'Категории врачей',
        'all_items'                  => 'Все категории',
        'new_item_name'              => 'Новая категория',
        'add_new_item'               => 'Добавить категорию',
        'edit_item'                  => 'Редактировать категорию',
        'update_item'                => 'Обновить категорию',
        'view_item'                  => 'Просмотреть категорию',
        'search_items'               => 'Искать категорию',
        'not_found'                  => 'Не найдено',
    );

    $args = array(
        'labels'                     => $labels,
        'hierarchical'               => true,
        'public'                     => true,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => false,
        'show_tagcloud'              => false,
        'show_in_rest'               => true,
        'rest_base'                  => 'doctor_rank',
        'rest_controller_class'      => 'WP_REST_Terms_Controller',
        'show_in_graphql'            => true,
        'graphql_single_name'        => 'DoctorRank',
        'graphql_plural_name'        => 'doctorRanks',
    );

    register_taxonomy('doctor_rank', array('doctors'), $args);
}
add_action('init', 'unident_register_doctor_rank_taxonomy', 0);

/**
 * Register nav menu locations for header (primary) and footer (footer_left, footer_right).
 * WPGraphQL exposes menus by location; theme may register 'primary', we add footer locations.
 */
function unident_register_nav_menus() {
    $locations = array(
        'primary'      => __('Primary Menu', 'unident-structure'),
        'footer_left'  => __('Footer Left Menu', 'unident-structure'),
        'footer_right' => __('Footer Right Menu', 'unident-structure'),
    );
    register_nav_menus($locations);
}
add_action('after_setup_theme', 'unident_register_nav_menus');
