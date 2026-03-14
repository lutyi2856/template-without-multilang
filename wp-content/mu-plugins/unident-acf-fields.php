<?php
/**
 * Plugin Name: УниДент ACF Fields
 * Description: ACF поля для header settings и menu items с автоматической регистрацией в WPGraphQL
 * Version: 2.1
 * Author: УниДент
 */

// Защита от прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Настройка ACF JSON для сохранения и загрузки field groups
 * Это позволяет админу редактировать field groups через WordPress Admin
 */
add_filter('acf/settings/save_json', function($path) {
    return WP_CONTENT_DIR . '/acf-json';
});

add_filter('acf/settings/load_json', function($paths) {
    unset($paths[0]); // Удаляем дефолтный путь
    $paths[] = WP_CONTENT_DIR . '/acf-json';
    return $paths;
});

/**
 * Санитизация excerpt при сохранении: удалить HTML и ведущий паттерн CSS-селектора
 * (p.font-gilroy.font-normal.text-[14px]... при копировании из Figma/кода).
 * Применяется только к promotions.
 */
add_filter('wp_insert_post_data', function($data, $postarr) {
    if (($data['post_type'] ?? '') !== 'promotions' || empty($data['post_excerpt'])) {
        return $data;
    }
    $raw = wp_strip_all_tags($data['post_excerpt']);
    $raw = trim(preg_replace('/^\s*[a-z]+(\.[a-zA-Z0-9\[\]\(\)_-]+)+\s*/i', '', $raw));
    $data['post_excerpt'] = trim($raw);
    return $data;
}, 10, 2);

/**
 * Register ACF Option Page для Header Settings
 */
function unident_register_header_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки Header',
            'menu_title'    => 'Header Settings',
            'menu_slug'     => 'header-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-admin-generic',
        ));
    }
}
add_action('acf/init', 'unident_register_header_settings_page');

/**
 * Register ACF Option Page для Main Page Settings (Главная страница)
 */
function unident_register_mainpage_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки главной страницы',
            'menu_title'    => 'Главная страница',
            'menu_slug'     => 'mainpage-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'mainpage_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-admin-home',
        ));
    }
}
add_action('acf/init', 'unident_register_mainpage_settings_page');

/**
 * Register ACF Option Page для Contacts Settings
 */
function unident_register_contacts_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Контакты сайта',
            'menu_title'    => 'Контакты',
            'menu_slug'     => 'contacts-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'contacts_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-phone',
        ));
    }
}
add_action('acf/init', 'unident_register_contacts_settings_page');

/**
 * Block Prices Settings — данные перенесены в Main Page Settings, таб "Block 10 | Блок цен".
 * Отдельная option page удалена.
 */

/**
 * Register ACF Option Page для Price Archive Settings (страница /prices)
 */
function unident_register_price_archive_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки архива цен',
            'menu_title'    => 'Архив цен',
            'menu_slug'     => 'price-archive-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'price_archive_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-money-alt',
        ));
    }
}
add_action('acf/init', 'unident_register_price_archive_settings_page');

/**
 * Register ACF Option Page для Archive Actions (Архив акций, страница /promotions)
 */
function unident_register_actions_archive_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки архива акций',
            'menu_title'    => 'Архив акций',
            'menu_slug'     => 'actions-archive-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'actions_archive_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-megaphone',
        ));
    }
}
add_action('acf/init', 'unident_register_actions_archive_settings_page');

/**
 * Register ACF Option Page для Our Works Archive (Архив наших работ, страница /our-works)
 */
function unident_register_our_works_archive_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки архива наших работ',
            'menu_title'    => 'Архив наших работ',
            'menu_slug'     => 'our-works-archive-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'our_works_archive_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-portfolio',
        ));
    }
}
add_action('acf/init', 'unident_register_our_works_archive_settings_page');

/**
 * Register ACF Option Page для Reviews Archive (страница /reviews — CTA блок)
 */
function unident_register_reviews_archive_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки архива отзывов',
            'menu_title'    => 'Архив отзывов',
            'menu_slug'     => 'reviews-archive-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'reviews_archive_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-star-filled',
        ));
    }
}
add_action('acf/init', 'unident_register_reviews_archive_settings_page');

/**
 * Register ACF Option Page для Footer Settings
 */
function unident_register_footer_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки футера',
            'menu_title'    => 'Футер',
            'menu_slug'     => 'footer-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'footer_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-editor-kitchensink',
        ));
    }
}
add_action('acf/init', 'unident_register_footer_settings_page');

/**
 * Register ACF Option Page для Service Pages Settings (страницы услуг)
 */
function unident_register_service_pages_settings_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title'    => 'Настройки страниц услуг',
            'menu_title'    => 'Страницы услуг',
            'menu_slug'     => 'service-pages-settings',
            'capability'    => 'edit_posts',
            'post_id'       => 'service_pages_options',
            'autoload'      => true,
            'icon_url'      => 'dashicons-admin-tools',
        ));
    }
}
add_action('acf/init', 'unident_register_service_pages_settings_page');

/**
 * Register ACF Fields для Header Settings Option Page
 * 
 * WPGraphQL ACF v2 автоматически экспонирует эти поля если:
 * - Field group имеет 'show_in_graphql' => 1
 * - Каждое поле имеет 'show_in_graphql' => 1
 */
function unident_register_header_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_header_settings',
            'title' => 'Настройки Header',
            'fields' => array(
                // Logo Mode (switcher)
                array(
                    'key' => 'field_header_logo_mode',
                    'label' => 'Режим логотипа',
                    'name' => 'logo_mode',
                    'type' => 'radio',
                    'instructions' => 'Что показывать в качестве логотипа: изображение или иконку.',
                    'choices' => array(
                        'image' => 'Изображение (загрузить картинку)',
                        'icon' => 'Иконка (выбрать из списка)',
                    ),
                    'default_value' => 'image',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'logoMode',
                ),
                // Logo (Image)
                array(
                    'key' => 'field_header_logo',
                    'label' => 'Логотип (изображение)',
                    'name' => 'logo',
                    'type' => 'image',
                    'instructions' => 'Загрузите изображение логотипа (PNG, WebP, SVG). Если заполнено — отображается вместо текста.',
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'logo',
                ),
                // Logo Icon (Select — использует динамические choices)
                array(
                    'key' => 'field_header_logo_icon',
                    'label' => 'Иконка логотипа',
                    'name' => 'logo_icon',
                    'type' => 'select',
                    'instructions' => 'Выберите иконку. Если заполнено — отображается рядом с изображением или вместо него.',
                    'choices' => array(),
                    'return_format' => 'value',
                    'allow_null' => 1,
                    'default_value' => '',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'logoIcon',
                ),
                // Phone
                array(
                    'key' => 'field_phone',
                    'label' => 'Телефон',
                    'name' => 'phone',
                    'type' => 'text',
                    'instructions' => 'Контактный телефон для отображения в header',
                    'required' => 1,
                    'default_value' => '+7 (495) 123-45-67',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'phone',
                ),
                // Phone Schedule
                array(
                    'key' => 'field_phone_schedule',
                    'label' => 'Расписание работы телефона',
                    'name' => 'phone_schedule',
                    'type' => 'text',
                    'instructions' => 'Текст под номером телефона (например: "Ежедневно с 8:00 до 10:00")',
                    'required' => 0,
                    'default_value' => 'Ежедневно с 8:00 до 10:00',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'phoneSchedule',
                ),
                // Email
                array(
                    'key' => 'field_email',
                    'label' => 'Email',
                    'name' => 'email',
                    'type' => 'email',
                    'instructions' => 'Контактный email для отображения в header',
                    'required' => 0,
                    'default_value' => 'info@unident.ru',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'email',
                ),
                // Working Hours - NESTED GROUP (WPGraphQL ACF автоматически создаст WorkingHours type)
                array(
                    'key' => 'field_working_hours',
                    'label' => 'Часы работы',
                    'name' => 'working_hours',
                    'type' => 'group',
                    'layout' => 'block',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'workingHours',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_weekdays',
                            'label' => 'Будние дни',
                            'name' => 'weekdays',
                            'type' => 'text',
                            'default_value' => 'Пн-Сб 10:00-22:00',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'weekdays',
                        ),
                        array(
                            'key' => 'field_weekend',
                            'label' => 'Выходные',
                            'name' => 'weekend',
                            'type' => 'text',
                            'default_value' => 'Вс 9:00-16:00',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'weekend',
                        ),
                    ),
                ),
                // Locations Count
                array(
                    'key' => 'field_locations_count',
                    'label' => 'Количество филиалов',
                    'name' => 'locations_count',
                    'type' => 'number',
                    'instructions' => 'Общее количество филиалов клиники',
                    'required' => 0,
                    'default_value' => 3,
                    'min' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'locationsCount',
                ),
                // Featured Promotion
                array(
                    'key' => 'field_featured_promotion',
                    'label' => 'Featured Promotion',
                    'name' => 'featured_promotion',
                    'type' => 'post_object',
                    'instructions' => 'Выберите акцию для отображения в header promo block. Из нее будет взята связанная услуга и цена.',
                    'required' => 0,
                    'post_type' => array('promotions'),
                    'taxonomy' => array(),
                    'allow_null' => 1,
                    'multiple' => 0,
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'featuredPromotion',
                ),
                // Featured Service (для Services Dropdown)
                array(
                    'key' => 'field_featured_service',
                    'label' => 'Featured Service (Services Dropdown)',
                    'name' => 'featured_service',
                    'type' => 'post_object',
                    'instructions' => 'Выберите продвигаемую услугу для отображения в Services Dropdown меню (карточка справа)',
                    'required' => 0,
                    'post_type' => array('services'),
                    'taxonomy' => array(),
                    'allow_null' => 1,
                    'multiple' => 0,
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'featuredService',
                ),
                // Social Links Repeater
                array(
                    'key' => 'field_social_links',
                    'label' => 'Социальные сети',
                    'name' => 'social_links',
                    'type' => 'repeater',
                    'instructions' => 'Добавьте ссылки на социальные сети для отображения в header',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить соц. сеть',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'socialLinks',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_social_name',
                            'label' => 'Название',
                            'name' => 'name',
                            'type' => 'text',
                            'instructions' => 'Название социальной сети (например: Telegram)',
                            'required' => 1,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'name',
                        ),
                        array(
                            'key' => 'field_social_icon',
                            'label' => 'Иконка',
                            'name' => 'icon',
                            'type' => 'select',
                            'instructions' => 'Выберите иконку социальной сети. Иконки рендерятся на фронте из библиотеки @/icons.',
                            'required' => 1,
                            'choices' => array(
                                // Social Media
                                'whatsapp' => 'WhatsApp',
                                'vk' => 'VKontakte',
                                'telegram' => 'Telegram',
                                'instagram' => 'Instagram',
                                'facebook' => 'Facebook',
                                'google' => 'Google Reviews',
                                'yandex' => 'Yandex',
                                // Info (на случай если нужны другие)
                                'phone' => 'Телефон',
                                'location' => 'Локация',
                            ),
                            'default_value' => 'telegram',
                            'return_format' => 'value',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'icon',
                        ),
                        array(
                            'key' => 'field_social_url',
                            'label' => 'Ссылка',
                            'name' => 'url',
                            'type' => 'url',
                            'instructions' => 'Полная ссылка на страницу в социальной сети',
                            'required' => 1,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'url',
                        ),
                    ),
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'header-settings',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'headerSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_header_settings_fields');

/**
 * Register ACF Fields для Main Page Settings Option Page
 * 
 * Поля:
 * - featured_action (post_object → promotions) - Акция для главной страницы
 * - hero_image (image) - Изображение для hero-блока
 */
function unident_register_mainpage_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_mainpage_settings',
            'title' => 'Настройки главной страницы',
            'fields' => array(
                // Tab: Hero Block
                array(
                    'key' => 'field_mainpage_tab_hero',
                    'label' => 'Hero блок',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // Hero Image
                array(
                    'key' => 'field_mainpage_hero_image',
                    'label' => 'Изображение Hero',
                    'name' => 'hero_image',
                    'type' => 'image',
                    'instructions' => 'Изображение для hero-блока на главной странице. Рекомендуемый размер: 600x700px',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'heroImage',
                ),
                // Hero Vector Image (декоративный логотип на фоне)
                array(
                    'key' => 'field_mainpage_hero_vector_image',
                    'label' => 'Декоративный вектор Hero',
                    'name' => 'hero_vector_image',
                    'type' => 'image',
                    'instructions' => 'Декоративное изображение на фоне hero-блока (логотип). Если пусто — не отображается.',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp,svg',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'heroVectorImage',
                ),
                // Hero Title (опционально)
                array(
                    'key' => 'field_mainpage_hero_title',
                    'label' => 'Заголовок Hero',
                    'name' => 'hero_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок для hero-блока (опционально, если нужно переопределить)',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'heroTitle',
                ),
                // Hero Subtitle (опционально)
                array(
                    'key' => 'field_mainpage_hero_subtitle',
                    'label' => 'Подзаголовок Hero',
                    'name' => 'hero_subtitle',
                    'type' => 'textarea',
                    'instructions' => 'Подзаголовок для hero-блока (опционально)',
                    'required' => 0,
                    'rows' => 3,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'heroSubtitle',
                ),
                // Hero Badges (repeater) — динамические бейджи под кнопкой
                array(
                    'key' => 'field_mainpage_hero_badges',
                    'label' => 'Бейджи Hero',
                    'name' => 'hero_badges',
                    'type' => 'repeater',
                    'instructions' => 'Бейджи под кнопкой (4+ клиник, 15+ врачей и т.д.). Пустые элементы не экспортируются.',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить бейдж',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'heroBadges',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_mainpage_hero_badge_text',
                            'label' => 'Текст',
                            'name' => 'text',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'text',
                        ),
                    ),
                ),
                // Tab: Action (Promotion)
                array(
                    'key' => 'field_mainpage_tab_action',
                    'label' => 'Акция',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // Featured Action (Promotion)
                array(
                    'key' => 'field_mainpage_featured_action',
                    'label' => 'Акция',
                    'name' => 'featured_action',
                    'type' => 'post_object',
                    'instructions' => 'Выберите акцию для отображения на главной странице',
                    'required' => 0,
                    'post_type' => array('promotions'),
                    'taxonomy' => array(),
                    'allow_null' => 1,
                    'multiple' => 0,
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'featuredAction',
                ),
                // Tab: CTA
                array(
                    'key' => 'field_mainpage_tab_cta',
                    'label' => 'CTA',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // CTA Title
                array(
                    'key' => 'field_mainpage_cta_title',
                    'label' => 'Заголовок',
                    'name' => 'cta_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок блока CTA',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaTitle',
                ),
                // CTA Description
                array(
                    'key' => 'field_mainpage_cta_description',
                    'label' => 'Описание',
                    'name' => 'cta_description',
                    'type' => 'textarea',
                    'instructions' => 'Описание блока CTA с текстом и телефоном',
                    'required' => 0,
                    'rows' => 4,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaDescription',
                ),
                // CTA Phone
                array(
                    'key' => 'field_mainpage_cta_phone',
                    'label' => 'Телефон',
                    'name' => 'cta_phone',
                    'type' => 'text',
                    'instructions' => 'Номер телефона для связи (будет отображаться как кликабельная ссылка)',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaPhone',
                ),
                // CTA Privacy Text
                array(
                    'key' => 'field_mainpage_cta_privacy_text',
                    'label' => 'Текст политики конфиденциальности',
                    'name' => 'cta_privacy_text',
                    'type' => 'text',
                    'instructions' => 'Текст согласия с политикой конфиденциальности',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaPrivacyText',
                ),
                // CTA Privacy Link
                array(
                    'key' => 'field_mainpage_cta_privacy_link',
                    'label' => 'Ссылка на политику конфиденциальности',
                    'name' => 'cta_privacy_link',
                    'type' => 'url',
                    'instructions' => 'URL страницы политики конфиденциальности (отобразится в тексте согласия)',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaPrivacyLink',
                ),
                // CTA Doctor Image
                array(
                    'key' => 'field_mainpage_cta_doctor_image',
                    'label' => 'Фото врача',
                    'name' => 'cta_doctor_image',
                    'type' => 'image',
                    'instructions' => 'Изображение врача для блока CTA',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaDoctorImage',
                ),
                // CTA Background Image
                array(
                    'key' => 'field_mainpage_cta_background_image',
                    'label' => 'Фоновое изображение',
                    'name' => 'cta_background_image',
                    'type' => 'image',
                    'instructions' => 'Фоновое изображение блока CTA (необязательно)',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaBackgroundImage',
                ),
                // CTA Doctor Image (second STA)
                array(
                    'key' => 'field_mainpage_cta_doctor_image_2',
                    'label' => "The doctor's image for the second STA",
                    'name' => 'cta_doctor_image_2',
                    'type' => 'image',
                    'instructions' => 'Изображение врача для второго блока CTA',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaDoctorImage2',
                ),
                // Tab: Guidance
                array(
                    'key' => 'field_mainpage_tab_guidance',
                    'label' => 'Руководство',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // Guidance Image
                array(
                    'key' => 'field_mainpage_guidance_image',
                    'label' => 'Изображение',
                    'name' => 'guidance_image',
                    'type' => 'image',
                    'instructions' => 'Изображение для раздела руководства',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'guidanceImage',
                ),
                // Guidance Content (WYSIWYG)
                array(
                    'key' => 'field_mainpage_guidance_content',
                    'label' => 'Контент',
                    'name' => 'guidance_content',
                    'type' => 'wysiwyg',
                    'instructions' => 'Текстовый редактор для контента руководства',
                    'required' => 0,
                    'tabs' => 'all',
                    'toolbar' => 'full',
                    'media_upload' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'guidanceContent',
                ),
                // Guidance Manager Image
                array(
                    'key' => 'field_mainpage_guidance_manager_image',
                    'label' => 'Изображение руководителя',
                    'name' => 'guidance_manager_image',
                    'type' => 'image',
                    'instructions' => 'Изображение руководителя',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'guidanceManagerImage',
                ),
                // Guidance Subscribe (WYSIWYG)
                array(
                    'key' => 'field_mainpage_guidance_subscribe',
                    'label' => 'Фамилия и имя',
                    'name' => 'guidance_subscribe',
                    'type' => 'wysiwyg',
                    'instructions' => 'Фамилия и имя руководителя',
                    'required' => 0,
                    'tabs' => 'all',
                    'toolbar' => 'full',
                    'media_upload' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'guidanceSubscribe',
                ),
                // Guidance Positions
                array(
                    'key' => 'field_mainpage_guidance_positions',
                    'label' => 'Должности',
                    'name' => 'guidance_positions',
                    'type' => 'text',
                    'instructions' => 'Текстовое поле "Должности"',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'guidancePositions',
                ),
                // Guidance Media Image
                array(
                    'key' => 'field_mainpage_guidance_media_image',
                    'label' => 'Медиа изображение',
                    'name' => 'guidance_media_image',
                    'type' => 'image',
                    'instructions' => 'Медиа поле для изображения',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'guidanceMediaImage',
                ),
                // Tab: Promotions Section
                array(
                    'key' => 'field_mainpage_tab_promotions_section',
                    'label' => 'Акции',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // Promotions Section Title
                array(
                    'key' => 'field_mainpage_promotions_section_title',
                    'label' => 'Заголовок секции',
                    'name' => 'promotions_section_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок для секции "Акции" на главной странице',
                    'default_value' => 'Акции',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'promotionsSectionTitle',
                ),
                // Promotions Section Description
                array(
                    'key' => 'field_mainpage_promotions_section_description',
                    'label' => 'Описание секции',
                    'name' => 'promotions_section_description',
                    'type' => 'textarea',
                    'instructions' => 'Описание для секции "Акции" на главной странице',
                    'default_value' => 'Специальные предложения и акции нашей клиники',
                    'required' => 0,
                    'rows' => 3,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'promotionsSectionDescription',
                ),
                // Promotions Fallback Image
                array(
                    'key' => 'field_mainpage_promotions_fallback_image',
                    'label' => 'Фолбэк изображение для карточек акций',
                    'name' => 'promotions_fallback_image',
                    'type' => 'image',
                    'instructions' => 'Изображение используется если у акции нет собственного изображения',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'promotionsFallbackImage',
                ),
                // Tab: Секция отзовики (Reviews Section)
                array(
                    'key' => 'field_mainpage_tab_reviews_section',
                    'label' => 'Секция отзовики',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // 1. Заголовок секции
                array(
                    'key' => 'field_mainpage_reviews_section_title',
                    'label' => 'Заголовок секции',
                    'name' => 'reviews_section_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок для секции отзовиков на главной странице',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'reviewsSectionTitle',
                ),
                // 2. Контент
                array(
                    'key' => 'field_mainpage_reviews_section_content',
                    'label' => 'Контент',
                    'name' => 'reviews_section_content',
                    'type' => 'textarea',
                    'instructions' => 'Контент секции отзовиков',
                    'required' => 0,
                    'rows' => 4,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'reviewsSectionContent',
                ),
                // 3. Изображение секции
                array(
                    'key' => 'field_mainpage_reviews_section_image',
                    'label' => 'Изображение секции',
                    'name' => 'reviews_section_image',
                    'type' => 'image',
                    'instructions' => 'Изображение для секции отзовиков',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'reviewsSectionImage',
                ),
                // 4. Средний рейтинг
                array(
                    'key' => 'field_mainpage_reviews_section_medium_rating',
                    'label' => 'Средний рейтинг',
                    'name' => 'reviews_section_medium_rating',
                    'type' => 'text',
                    'instructions' => 'Текстовое поле среднего рейтинга',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'reviewsSectionMediumRating',
                ),
                // 5. Основание
                array(
                    'key' => 'field_mainpage_reviews_section_basis',
                    'label' => 'Основание',
                    'name' => 'reviews_section_basis',
                    'type' => 'text',
                    'instructions' => 'Основание для рейтинга (например, источник данных)',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'reviewsSectionBasis',
                ),
                // 6. Repeater - элементы
                array(
                    'key' => 'field_mainpage_reviews_section_items',
                    'label' => 'Элементы',
                    'name' => 'reviews_section_items',
                    'type' => 'repeater',
                    'instructions' => 'Элементы секции отзовиков (рейтинг, изображение, текст)',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить элемент',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'reviewsSectionItems',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_mainpage_reviews_section_item_rating',
                            'label' => 'Рейтинг',
                            'name' => 'rating',
                            'type' => 'number',
                            'required' => 0,
                            'min' => 0,
                            'max' => 5,
                            'step' => 0.1,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'rating',
                        ),
                        array(
                            'key' => 'field_mainpage_reviews_section_item_image',
                            'label' => 'Изображение',
                            'name' => 'image',
                            'type' => 'image',
                            'required' => 0,
                            'return_format' => 'array',
                            'preview_size' => 'medium',
                            'library' => 'all',
                            'mime_types' => 'jpg,jpeg,png,webp',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'image',
                        ),
                        array(
                            'key' => 'field_mainpage_reviews_section_item_text',
                            'label' => 'Текст',
                            'name' => 'text',
                            'type' => 'text',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'text',
                        ),
                        array(
                            'key' => 'field_mainpage_reviews_section_item_reviews_count',
                            'label' => 'Количество отзывов',
                            'name' => 'reviews_count',
                            'type' => 'number',
                            'instructions' => 'Число отзывов',
                            'required' => 0,
                            'min' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'reviewsCount',
                        ),
                        array(
                            'key' => 'field_mainpage_reviews_section_item_link',
                            'label' => 'Ссылка',
                            'name' => 'link',
                            'type' => 'url',
                            'instructions' => 'URL для перехода при клике на карточку (например, страница отзывов на платформе)',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'link',
                        ),
                    ),
                ),
                // Tab: Лицензии
                array(
                    'key' => 'field_mainpage_tab_licenses',
                    'label' => 'Лицензии',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // Заголовок секции лицензий
                array(
                    'key' => 'field_mainpage_licenses_section_title',
                    'label' => 'Заголовок секции',
                    'name' => 'licenses_section_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок для секции "Наши лицензии" на главной странице',
                    'default_value' => 'Наши лицензии',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'licensesSectionTitle',
                ),
                // Repeater Licensee
                array(
                    'key' => 'field_mainpage_licensee',
                    'label' => 'Лицензии',
                    'name' => 'licensee',
                    'type' => 'repeater',
                    'instructions' => 'Добавьте лицензии (изображение, название, описание)',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить лицензию',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'licensee',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_mainpage_licensee_image',
                            'label' => 'Изображение лицензии',
                            'name' => 'license_image',
                            'type' => 'image',
                            'required' => 0,
                            'return_format' => 'array',
                            'preview_size' => 'medium',
                            'library' => 'all',
                            'mime_types' => 'jpg,jpeg,png,webp',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'image',
                        ),
                        array(
                            'key' => 'field_mainpage_licensee_title',
                            'label' => 'Название лицензии',
                            'name' => 'license_title',
                            'type' => 'text',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'licenseTitle',
                        ),
                        array(
                            'key' => 'field_mainpage_licensee_text_licenzia',
                            'label' => 'text-licenzia',
                            'name' => 'text_licenzia',
                            'type' => 'text',
                            'instructions' => 'Описание лицензии (например: Качество и безопасность медицинской деятельности)',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'textLicenzia',
                        ),
                    ),
                ),
                // Tab: Преимущества (Preferences block)
                array(
                    'key' => 'field_mainpage_tab_preferences',
                    'label' => 'Преимущества',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // Repeater: карточки преимуществ
                array(
                    'key' => 'field_mainpage_preferences_items',
                    'label' => 'Карточки преимуществ',
                    'name' => 'preferences_items',
                    'type' => 'repeater',
                    'instructions' => 'Карточки блока «Преимущества» (ОМС/ДМС, Налоговый вычет, Рассрочка)',
                    'required' => 0,
                    'layout' => 'table',
                    'min' => 0,
                    'max' => 5,
                    'button_label' => 'Добавить карточку',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'preferencesItems',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_mainpage_pref_icon',
                            'label' => 'Иконка',
                            'name' => 'icon',
                            'type' => 'select',
                            'instructions' => 'Встроенные иконки + пользовательские из Media Library (см. unident-svg-icons)',
                            'show_in_graphql' => 1,
                        ),
                        array(
                            'key' => 'field_mainpage_pref_title',
                            'label' => 'Заголовок',
                            'name' => 'title',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                        ),
                        array(
                            'key' => 'field_mainpage_pref_description',
                            'label' => 'Описание',
                            'name' => 'description',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                        ),
                        array(
                            'key' => 'field_mainpage_pref_href',
                            'label' => 'Ссылка (href)',
                            'name' => 'href',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                        ),
                    ),
                ),
                // Tab: Нам доверили (Trusted section)
                array(
                    'key' => 'field_mainpage_tab_trusted',
                    'label' => 'Нам доверили',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                // Заголовок секции
                array(
                    'key' => 'field_mainpage_trusted_title',
                    'label' => 'Заголовок секции',
                    'name' => 'trusted_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок секции «Нам доверили» на главной странице',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'trustedTitle',
                ),
                // Описание секции (WYSIWYG)
                array(
                    'key' => 'field_mainpage_trusted_description',
                    'label' => 'Описание секции',
                    'name' => 'trusted_description',
                    'type' => 'wysiwyg',
                    'instructions' => 'Описание под заголовком секции',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'trustedDescription',
                ),
                // Repeater: карточки
                array(
                    'key' => 'field_mainpage_trusted_items',
                    'label' => 'Карточки',
                    'name' => 'trusted_items',
                    'type' => 'repeater',
                    'instructions' => 'Карточки преимуществ с номерами (01, 02, 03…)',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить карточку',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'trustedItems',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_mainpage_trusted_item_number',
                            'label' => 'Номер',
                            'name' => 'number',
                            'type' => 'text',
                            'instructions' => '01, 02, 03…',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'number',
                        ),
                        array(
                            'key' => 'field_mainpage_trusted_item_title',
                            'label' => 'Заголовок карточки',
                            'name' => 'title',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'title',
                        ),
                        array(
                            'key' => 'field_mainpage_trusted_item_description',
                            'label' => 'Описание карточки',
                            'name' => 'description',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'description',
                        ),
                    ),
                ),
                // Колонок на десктопе
                array(
                    'key' => 'field_mainpage_trusted_columns',
                    'label' => 'Колонок на десктопе',
                    'name' => 'trusted_columns',
                    'type' => 'select',
                    'instructions' => 'Сколько карточек в ряд на десктопе. 2 колонки даёт 2x2 для 4 карточек.',
                    'required' => 0,
                    'choices' => array(
                        '1' => '1 колонка',
                        '2' => '2 колонки (2x2 для 4 карточек)',
                        '3' => '3 колонки',
                        '4' => '4 колонки',
                    ),
                    'default_value' => '3',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'trustedColumns',
                ),
                // ── Tab: Карта ──
                array(
                    'key'       => 'field_mainpage_map_tab',
                    'label'     => 'Карта',
                    'name'      => '',
                    'type'      => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key'           => 'field_mainpage_clinics_map_title',
                    'label'         => 'Заголовок секции карты',
                    'name'          => 'clinics_map_title',
                    'type'          => 'text',
                    'default_value' => 'Наши клиники на карте Москвы',
                    'instructions'  => 'Заголовок над картой с клиниками на главной странице',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'clinicsMapTitle',
                ),
                // ── Tab: Блок цен ──
                array(
                    'key'       => 'field_mainpage_block10_tab',
                    'label'     => 'Блок цен',
                    'name'      => '',
                    'type'      => 'tab',
                    'placement' => 'top',
                ),
                // Выбранная акция для блока цен
                array(
                    'key'               => 'field_mainpage_block10_selected_promotion',
                    'label'             => 'Акция для блока цен',
                    'name'              => 'selected_promotion_block10',
                    'type'              => 'post_object',
                    'instructions'      => 'Выберите акцию для отображения в правой колонке блока цен',
                    'required'          => 0,
                    'post_type'         => array('promotions'),
                    'taxonomy'          => array(),
                    'allow_null'        => 1,
                    'multiple'          => 0,
                    'return_format'     => 'object',
                    'show_in_graphql'   => 1,
                    'graphql_field_name' => 'selectedPromotion',
                ),
                array(
                    'key'               => 'field_mainpage_block10_title',
                    'label'             => 'Заголовок блока цен',
                    'name'              => 'block_price_title',
                    'type'              => 'text',
                    'instructions'      => 'Заголовок секции цен на главной странице',
                    'required'          => 0,
                    'default_value'     => 'Сколько стоит забота о себе',
                    'show_in_graphql'   => 1,
                    'graphql_field_name' => 'blockPriceTitle',
                ),
                array(
                    'key'               => 'field_mainpage_block10_selected_services',
                    'label'             => 'Выбранные услуги',
                    'name'              => 'selected_services_block_price',
                    'type'              => 'relationship',
                    'instructions'      => 'Услуги для блока цен',
                    'required'          => 0,
                    'post_type'         => array('services'),
                    'return_format'     => 'object',
                    'multiple'          => 1,
                    'filters'           => array('search'),
                    'show_in_graphql'   => 1,
                    'graphql_field_name' => 'selectedServicesBlockPrice',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'mainpage-settings',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'mainpageSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_mainpage_settings_fields');

/**
 * Register ACF Fields для Service Pages Settings Option Page
 * Табы: Секция врачей | Switcher «Узнать точную стоимость» | STA block | Блок услуг
 */
function unident_register_service_pages_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_service_pages_settings',
            'title' => 'Настройки страниц услуг',
            'fields' => array(
                // Tab 1: Секция врачей
                array(
                    'key' => 'field_service_pages_tab_doctors',
                    'label' => 'Секция врачей',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_pages_doctors_title',
                    'label' => 'Заголовок секции врачей',
                    'name' => 'doctors_section_title',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'doctorsSectionTitle',
                ),
                array(
                    'key' => 'field_service_pages_doctors_description',
                    'label' => 'Описание секции врачей',
                    'name' => 'doctors_section_description',
                    'type' => 'textarea',
                    'required' => 0,
                    'rows' => 4,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'doctorsSectionDescription',
                ),
                array(
                    'key' => 'field_service_pages_selected_doctors',
                    'label' => 'Выбранные врачи',
                    'name' => 'selected_doctors',
                    'type' => 'relationship',
                    'instructions' => 'Врачи для отображения в секции',
                    'required' => 0,
                    'post_type' => array('doctors'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'selectedDoctors',
                ),
                // Tab 2: Узнать точную стоимость
                array(
                    'key' => 'field_service_pages_tab_exact_price',
                    'label' => 'Узнать точную стоимость',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_pages_show_price_block',
                    'label' => 'Показать блок «Узнать точную стоимость»',
                    'name' => 'show_price_block',
                    'type' => 'true_false',
                    'required' => 0,
                    'default_value' => 1,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'showPriceBlock',
                ),
                array(
                    'key' => 'field_service_pages_exact_price_icon',
                    'label' => 'Иконка',
                    'name' => 'exact_price_block_icon',
                    'type' => 'select',
                    'choices' => array(
                        'telegram' => 'Telegram',
                        'whatsapp' => 'WhatsApp',
                        'vk' => 'VKontakte',
                    ),
                    'default_value' => 'telegram',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'exactPriceBlockIcon',
                ),
                array(
                    'key' => 'field_service_pages_exact_price_text',
                    'label' => 'Текст',
                    'name' => 'exact_price_block_text',
                    'type' => 'text',
                    'default_value' => 'Узнать точную стоимость в Телеграм',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'exactPriceBlockText',
                ),
                array(
                    'key' => 'field_service_pages_exact_price_link',
                    'label' => 'Ссылка',
                    'name' => 'exact_price_block_link',
                    'type' => 'url',
                    'instructions' => 'Ссылка для блока (Telegram, WhatsApp и т.д.). Пусто — используется Telegram из контактов.',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'exactPriceBlockLink',
                ),
                // Tab 3: STA block (CTA)
                array(
                    'key' => 'field_service_pages_tab_sta',
                    'label' => 'STA block',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_pages_sta_title',
                    'label' => 'Заголовок',
                    'name' => 'sta_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок блока CTA',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staTitle',
                ),
                array(
                    'key' => 'field_service_pages_sta_description',
                    'label' => 'Описание',
                    'name' => 'sta_description',
                    'type' => 'textarea',
                    'instructions' => 'Описание блока CTA с текстом и телефоном',
                    'required' => 0,
                    'rows' => 4,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staDescription',
                ),
                array(
                    'key' => 'field_service_pages_sta_phone',
                    'label' => 'Телефон',
                    'name' => 'sta_phone',
                    'type' => 'text',
                    'instructions' => 'Номер телефона для связи',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staPhone',
                ),
                array(
                    'key' => 'field_service_pages_sta_privacy_text',
                    'label' => 'Текст политики конфиденциальности',
                    'name' => 'sta_privacy_text',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staPrivacyText',
                ),
                array(
                    'key' => 'field_service_pages_sta_privacy_link',
                    'label' => 'Ссылка на политику конфиденциальности',
                    'name' => 'sta_privacy_link',
                    'type' => 'url',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staPrivacyLink',
                ),
                array(
                    'key' => 'field_service_pages_sta_doctor_image',
                    'label' => 'Фото врача',
                    'name' => 'sta_doctor_image',
                    'type' => 'image',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staDoctorImage',
                ),
                array(
                    'key' => 'field_service_pages_sta_background_image',
                    'label' => 'Фоновое изображение',
                    'name' => 'sta_background_image',
                    'type' => 'image',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staBackgroundImage',
                ),
                // Tab 3: Блок услуг
                array(
                    'key' => 'field_service_pages_tab_services',
                    'label' => 'Блок услуг',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_pages_show_services_block',
                    'label' => 'Показать блок услуг',
                    'name' => 'show_services_block',
                    'type' => 'true_false',
                    'required' => 0,
                    'default_value' => 1,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'servicesBlockShow',
                ),
                array(
                    'key' => 'field_service_pages_services_title',
                    'label' => 'Заголовок блока услуг',
                    'name' => 'services_block_title',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'servicesBlockTitle',
                ),
                array(
                    'key' => 'field_service_pages_selected_services',
                    'label' => 'Выбранные услуги',
                    'name' => 'selected_services',
                    'type' => 'relationship',
                    'instructions' => 'Услуги для отображения в блоке',
                    'required' => 0,
                    'post_type' => array('services'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'selectedServices',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'service-pages-settings',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'servicePagesSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_service_pages_settings_fields');

/**
 * Register ACF Fields для Contacts Settings Option Page
 * 
 * Поля:
 * - email (email) - Email для контактов
 * - phone (text) - Телефон для контактов
 * - social_contacts (repeater) - Социальные сети (icon + url)
 */
function unident_register_contacts_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_contacts_settings',
            'title' => 'Настройки контактов',
            'fields' => array(

                // ── Tab: Контакты ──
                array(
                    'key'   => 'field_contacts_tab_main',
                    'label' => 'Контакты',
                    'type'  => 'tab',
                ),
                array(
                    'key' => 'field_contacts_email',
                    'label' => 'Email',
                    'name' => 'email',
                    'type' => 'email',
                    'instructions' => 'Email для связи',
                    'required' => 0,
                    'default_value' => 'info@unident.ru',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'email',
                ),
                array(
                    'key' => 'field_contacts_phone',
                    'label' => 'Телефон',
                    'name' => 'phone',
                    'type' => 'text',
                    'instructions' => 'Телефон для связи',
                    'required' => 0,
                    'default_value' => '+7 (495) 123-45-67',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'phone',
                ),
                array(
                    'key' => 'field_social_contacts',
                    'label' => 'Социальные сети',
                    'name' => 'social_contacts',
                    'type' => 'repeater',
                    'instructions' => 'Добавьте ссылки на социальные сети (как в header/footer)',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить соц. сеть',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'socialContacts',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_social_contact_name',
                            'label' => 'Название',
                            'name' => 'name',
                            'type' => 'text',
                            'instructions' => 'Название социальной сети (например: Telegram)',
                            'required' => 1,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'name',
                        ),
                        array(
                            'key' => 'field_social_contact_icon',
                            'label' => 'Иконка',
                            'name' => 'icon',
                            'type' => 'select',
                            'instructions' => 'Выберите иконку социальной сети. Иконки рендерятся на фронте из библиотеки @/icons.',
                            'required' => 1,
                            'choices' => array(
                                'whatsapp' => 'WhatsApp',
                                'vk' => 'VKontakte',
                                'telegram' => 'Telegram',
                                'instagram' => 'Instagram',
                                'facebook' => 'Facebook',
                                'google' => 'Google Reviews',
                                'yandex' => 'Yandex',
                                'phone' => 'Телефон',
                                'location' => 'Локация',
                            ),
                            'default_value' => 'telegram',
                            'return_format' => 'value',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'icon',
                        ),
                        array(
                            'key' => 'field_social_contact_url',
                            'label' => 'Ссылка',
                            'name' => 'url',
                            'type' => 'url',
                            'instructions' => 'Полная ссылка на страницу в социальной сети',
                            'required' => 1,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'url',
                        ),
                    ),
                ),

                // ── Tab: Карта ──
                array(
                    'key'   => 'field_contacts_tab_map',
                    'label' => 'Карта',
                    'type'  => 'tab',
                ),
                array(
                    'key'           => 'field_contacts_map_title',
                    'label'         => 'Заголовок секции карты',
                    'name'          => 'contacts_map_title',
                    'type'          => 'text',
                    'default_value' => 'Наши клиники на карте Москвы',
                    'instructions'  => 'Заголовок над картой с клиниками',
                ),

                // ── Tab: Преимущества ──
                array(
                    'key'   => 'field_contacts_tab_adv',
                    'label' => 'Преимущества',
                    'type'  => 'tab',
                ),
                array(
                    'key'           => 'field_contacts_adv_title',
                    'label'         => 'Заголовок блока преимуществ',
                    'name'          => 'contacts_adv_title',
                    'type'          => 'text',
                    'default_value' => 'Начните лечение прямо сейчас',
                ),
                array(
                    'key'          => 'field_contacts_adv_description',
                    'label'        => 'Описание блока преимуществ',
                    'name'         => 'contacts_adv_description',
                    'type'         => 'textarea',
                    'rows'         => 3,
                ),
                array(
                    'key'          => 'field_contacts_adv_items',
                    'label'        => 'Карточки преимуществ',
                    'name'         => 'contacts_adv_items',
                    'type'         => 'repeater',
                    'layout'       => 'block',
                    'button_label' => 'Добавить преимущество',
                    'instructions' => 'Иконка + заголовок + описание',
                    'sub_fields'   => array(
                        array(
                            'key'     => 'field_contacts_adv_item_icon',
                            'label'   => 'Иконка',
                            'name'    => 'icon',
                            'type'    => 'select',
                            'choices' => array(
                                'percent'       => '% Процент (скидка)',
                                'ruble'         => '₽ Рубль',
                                'installment'   => 'Рассрочка',
                                'phone'         => 'Телефон',
                                'location'      => 'Локация (адрес)',
                                'clock'         => 'Часы (время работы)',
                                'star'          => 'Звезда (рейтинг)',
                                'arrow-up-right'=> 'Стрелка',
                                'tooth'         => 'Зуб (терапия)',
                                'implant'       => 'Имплант',
                                'orthodontics'  => 'Ортодонтия',
                                'surgery'       => 'Хирургия',
                                'hygiene'       => 'Гигиена',
                                'children'      => 'Детская стоматология',
                                'aesthetic'     => 'Эстетика',
                                'diagnostic'    => 'Диагностика',
                            ),
                            'default_value' => 'tooth',
                            'instructions'  => 'Выберите иконку из списка. Новые: nextjs/src/icons/ + icon-map.ts',
                            'column_width'  => '25',
                        ),
                        array(
                            'key'          => 'field_contacts_adv_item_title',
                            'label'        => 'Заголовок',
                            'name'         => 'item_title',
                            'type'         => 'text',
                            'column_width' => '35',
                        ),
                        array(
                            'key'          => 'field_contacts_adv_item_description',
                            'label'        => 'Описание',
                            'name'         => 'item_description',
                            'type'         => 'textarea',
                            'rows'         => 2,
                            'column_width' => '40',
                        ),
                    ),
                ),

                // ── Tab: Баннер ──
                array(
                    'key'   => 'field_contacts_tab_banner',
                    'label' => 'Баннер',
                    'type'  => 'tab',
                ),
                array(
                    'key'           => 'field_contacts_banner_heading',
                    'label'         => 'Заголовок баннера',
                    'name'          => 'contacts_banner_heading',
                    'type'          => 'text',
                    'default_value' => 'Ваша улыбка — наша забота',
                ),
                array(
                    'key'   => 'field_contacts_banner_description',
                    'label' => 'Описание баннера',
                    'name'  => 'contacts_banner_description',
                    'type'  => 'textarea',
                    'rows'  => 3,
                ),
                array(
                    'key'           => 'field_contacts_banner_button_text',
                    'label'         => 'Текст кнопки',
                    'name'          => 'contacts_banner_button_text',
                    'type'          => 'text',
                    'default_value' => 'Записаться',
                ),
                array(
                    'key'  => 'field_contacts_banner_button_url',
                    'label'=> 'Ссылка кнопки',
                    'name' => 'contacts_banner_button_url',
                    'type' => 'url',
                    'placeholder' => '/contacts',
                ),
                array(
                    'key'           => 'field_contacts_banner_logo',
                    'label'         => 'Логотип баннера',
                    'name'          => 'contacts_banner_logo',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'preview_size'  => 'thumbnail',
                ),
                array(
                    'key'           => 'field_contacts_banner_image',
                    'label'         => 'Изображение баннера',
                    'name'          => 'contacts_banner_image',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'preview_size'  => 'medium',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'contacts-settings',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'contactsSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_contacts_settings_fields');

/**
 * Block Prices Settings — поля перенесены в Main Page Settings (group_mainpage_settings), таб "Block 10 | Блок цен".
 */

/**
 * Register ACF Fields для Price Archive Settings Option Page
 *
 * Страница /prices: описание, преимущества, PDF прайс-лист, выбранные акции, CTA блок.
 */
function unident_register_price_archive_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_price_archive_settings',
            'title' => 'Настройки архива цен',
            'fields' => array(
                array(
                    'key' => 'field_price_archive_tab_general',
                    'label' => 'Общее',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_price_archive_show_average_in_city',
                    'label' => 'Показывать колонку «Средняя в городе»',
                    'name' => 'show_average_in_city',
                    'type' => 'true_false',
                    'default_value' => 1,
                    'ui' => 1,
                    'instructions' => 'Включено — колонка отображается. Выключено — скрыта, «Наша цена» занимает место двух колонок.',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_page_description',
                    'label' => 'Описание страницы',
                    'name' => 'price_page_description',
                    'type' => 'textarea',
                    'rows' => 4,
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_list_pdf',
                    'label' => 'PDF прайс-лист',
                    'name' => 'price_list_pdf',
                    'type' => 'file',
                    'return_format' => 'array',
                    'mime_types' => 'pdf',
                    'show_in_graphql' => 1,
                    'instructions' => 'Загрузите PDF файл прайс-листа. Кнопка «Прайс-лист» появится на странице цен.',
                ),
                array(
                    'key' => 'field_price_archive_tab_advantages',
                    'label' => 'Преимущества',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_price_archive_advantages',
                    'label' => 'Преимущества',
                    'name' => 'advantages',
                    'type' => 'repeater',
                    'layout' => 'block',
                    'min' => 0,
                    'max' => 6,
                    'show_in_graphql' => 1,
                    'sub_fields' => array(
                        array(
                            'key' => 'field_price_advantage_headline',
                            'label' => 'Заголовок',
                            'name' => 'headline',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                        ),
                        array(
                            'key' => 'field_price_advantage_image',
                            'label' => 'Иконка',
                            'name' => 'image',
                            'type' => 'image',
                            'return_format' => 'array',
                            'show_in_graphql' => 1,
                        ),
                    ),
                ),
                array(
                    'key' => 'field_price_archive_tab_promotions',
                    'label' => 'Акции',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_price_archive_selected_promotions',
                    'label' => 'Выбранные акции',
                    'name' => 'selected_promotions',
                    'type' => 'relationship',
                    'post_type' => array('promotion'),
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_archive_tab_cta',
                    'label' => 'CTA блок',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_price_archive_cta_title',
                    'label' => 'Заголовок CTA',
                    'name' => 'cta_title',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_archive_cta_description',
                    'label' => 'Описание CTA',
                    'name' => 'cta_description',
                    'type' => 'textarea',
                    'rows' => 3,
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_archive_cta_phone',
                    'label' => 'Телефон CTA',
                    'name' => 'cta_phone',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_archive_cta_privacy_text',
                    'label' => 'Текст политики конфиденциальности',
                    'name' => 'cta_privacy_text',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_archive_cta_privacy_link',
                    'label' => 'Ссылка на политику конфиденциальности',
                    'name' => 'cta_privacy_link',
                    'type' => 'url',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_price_archive_cta_doctor_image',
                    'label' => 'Изображение врача (CTA)',
                    'name' => 'cta_doctor_image',
                    'type' => 'image',
                    'return_format' => 'array',
                    'show_in_graphql' => 1,
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'price-archive-settings',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'priceArchiveSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_price_archive_settings_fields');

/**
 * Register ACF Fields для Actions Archive Settings Option Page
 *
 * Страница /promotions: описание, преимущества, CTA блок (без PDF и вкладки Акции).
 */
function unident_register_actions_archive_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_actions_archive_settings',
            'title' => 'Настройки архива акций',
            'fields' => array(
                array(
                    'key' => 'field_actions_archive_tab_general',
                    'label' => 'Общее',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_actions_archive_page_description',
                    'label' => 'Описание страницы',
                    'name' => 'action_page_description',
                    'type' => 'textarea',
                    'rows' => 4,
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_actions_archive_tab_advantages',
                    'label' => 'Преимущества',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_actions_archive_advantages',
                    'label' => 'Преимущества',
                    'name' => 'advantages',
                    'type' => 'repeater',
                    'layout' => 'block',
                    'min' => 0,
                    'max' => 6,
                    'show_in_graphql' => 1,
                    'sub_fields' => array(
                        array(
                            'key' => 'field_actions_archive_advantage_headline',
                            'label' => 'Заголовок',
                            'name' => 'headline',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                        ),
                        array(
                            'key' => 'field_actions_archive_advantage_image',
                            'label' => 'Иконка',
                            'name' => 'image',
                            'type' => 'image',
                            'return_format' => 'array',
                            'show_in_graphql' => 1,
                        ),
                    ),
                ),
                array(
                    'key' => 'field_actions_archive_tab_cta',
                    'label' => 'CTA блок',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_actions_archive_cta_title',
                    'label' => 'Заголовок CTA',
                    'name' => 'cta_title',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_actions_archive_cta_description',
                    'label' => 'Описание CTA',
                    'name' => 'cta_description',
                    'type' => 'textarea',
                    'rows' => 3,
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_actions_archive_cta_phone',
                    'label' => 'Телефон CTA',
                    'name' => 'cta_phone',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_actions_archive_cta_privacy_text',
                    'label' => 'Текст политики конфиденциальности',
                    'name' => 'cta_privacy_text',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_actions_archive_cta_privacy_link',
                    'label' => 'Ссылка на политику конфиденциальности',
                    'name' => 'cta_privacy_link',
                    'type' => 'url',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_actions_archive_cta_doctor_image',
                    'label' => 'Изображение врача (CTA)',
                    'name' => 'cta_doctor_image',
                    'type' => 'image',
                    'return_format' => 'array',
                    'show_in_graphql' => 1,
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'actions-archive-settings',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'actionsArchiveSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_actions_archive_settings_fields');

/**
 * Register ACF Fields для Our Works Archive Settings Option Page
 *
 * Страница /our-works: описание, преимущества, CTA блок (идентично архиву акций).
 */
function unident_register_our_works_archive_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_our_works_archive_settings',
            'title' => 'Настройки архива наших работ',
            'fields' => array(
                array(
                    'key' => 'field_our_works_archive_tab_general',
                    'label' => 'Общее',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_our_works_archive_page_description',
                    'label' => 'Описание страницы',
                    'name' => 'action_page_description',
                    'type' => 'textarea',
                    'rows' => 4,
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_our_works_archive_tab_advantages',
                    'label' => 'Преимущества',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_our_works_archive_advantages',
                    'label' => 'Преимущества',
                    'name' => 'advantages',
                    'type' => 'repeater',
                    'layout' => 'block',
                    'min' => 0,
                    'max' => 6,
                    'show_in_graphql' => 1,
                    'sub_fields' => array(
                        array(
                            'key' => 'field_our_works_archive_advantage_headline',
                            'label' => 'Заголовок',
                            'name' => 'headline',
                            'type' => 'text',
                            'show_in_graphql' => 1,
                        ),
                        array(
                            'key' => 'field_our_works_archive_advantage_image',
                            'label' => 'Иконка',
                            'name' => 'image',
                            'type' => 'image',
                            'return_format' => 'array',
                            'show_in_graphql' => 1,
                        ),
                    ),
                ),
                array(
                    'key' => 'field_our_works_archive_tab_cta',
                    'label' => 'CTA блок',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_our_works_archive_cta_title',
                    'label' => 'Заголовок CTA',
                    'name' => 'cta_title',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_our_works_archive_cta_description',
                    'label' => 'Описание CTA',
                    'name' => 'cta_description',
                    'type' => 'textarea',
                    'rows' => 3,
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_our_works_archive_cta_phone',
                    'label' => 'Телефон CTA',
                    'name' => 'cta_phone',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_our_works_archive_cta_privacy_text',
                    'label' => 'Текст политики конфиденциальности',
                    'name' => 'cta_privacy_text',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_our_works_archive_cta_privacy_link',
                    'label' => 'Ссылка на политику конфиденциальности',
                    'name' => 'cta_privacy_link',
                    'type' => 'url',
                    'show_in_graphql' => 1,
                ),
                array(
                    'key' => 'field_our_works_archive_cta_doctor_image',
                    'label' => 'Изображение врача (CTA)',
                    'name' => 'cta_doctor_image',
                    'type' => 'image',
                    'return_format' => 'array',
                    'show_in_graphql' => 1,
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'our-works-archive-settings',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'ourWorksArchiveSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_our_works_archive_settings_fields');

/**
 * Register ACF Fields для Reviews Archive Settings Option Page
 *
 * CTA блок страницы /reviews (Figma 440:4263): заголовок, описание, кнопка, фоновый декор, иконка, фото людей, подарок.
 */
function unident_register_reviews_archive_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_reviews_archive_settings',
            'title' => 'CTA блок архива отзывов',
            'fields' => array(
                array(
                    'key' => 'field_ra_cta_title',
                    'label' => 'Заголовок CTA',
                    'name' => 'cta_title',
                    'type' => 'text',
                    'instructions' => 'Заголовок блока призыва оставить отзыв (H2)',
                    'default_value' => 'Оставьте отзыв и получите бонус при следующем посещении',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaTitle',
                ),
                array(
                    'key' => 'field_ra_cta_description',
                    'label' => 'Описание CTA',
                    'name' => 'cta_description',
                    'type' => 'textarea',
                    'instructions' => 'Текст под заголовком',
                    'rows' => 3,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaDescription',
                ),
                array(
                    'key' => 'field_ra_cta_button_text',
                    'label' => 'Текст кнопки',
                    'name' => 'cta_button_text',
                    'type' => 'text',
                    'default_value' => 'Оставить отзыв',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaButtonText',
                ),
                array(
                    'key' => 'field_ra_cta_background',
                    'label' => 'Фоновый декор (Vector)',
                    'name' => 'cta_background',
                    'type' => 'image',
                    'instructions' => 'Декоративный overlay (SVG/Image). Figma 440:4264.',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp,svg',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaBackground',
                ),
                array(
                    'key' => 'field_ra_cta_icon',
                    'label' => 'Иконка (75×75)',
                    'name' => 'cta_icon',
                    'type' => 'image',
                    'instructions' => 'Иконка облачко с карандашом. Figma 440:4279.',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'thumbnail',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp,svg',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaIcon',
                ),
                array(
                    'key' => 'field_ra_cta_content_image',
                    'label' => 'Фото людей',
                    'name' => 'cta_content_image',
                    'type' => 'image',
                    'instructions' => 'Фото (мужчина и женщина, thumbs up). Figma 440:4278.',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaContentImage',
                ),
                array(
                    'key' => 'field_ra_cta_gift_image',
                    'label' => 'Изображение подарка',
                    'name' => 'cta_gift_image',
                    'type' => 'image',
                    'instructions' => 'Иллюстрация подарочной коробки. Figma 440:4276.',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ctaGiftImage',
                ),
                array(
                    'key' => 'field_ra_tab_review_card',
                    'label' => 'Карточка отзыва в списке',
                    'name' => '',
                    'type' => 'tab',
                ),
                array(
                    'key' => 'field_ra_clinic_logo_review_card',
                    'label' => 'Логотип клиники для карточки отзыва',
                    'name' => 'clinic_logo_review_card',
                    'type' => 'image',
                    'instructions' => 'Отображается в блоке «Ответ клиники» на карточках отзывов.',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'thumbnail',
                    'library' => 'all',
                    'mime_types' => 'jpg,jpeg,png,webp,svg',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'clinicLogoReviewCard',
                ),
                array(
                    'key' => 'field_ra_clinic_logo_review_card_bg',
                    'label' => 'Цвет фона логотипа клиники',
                    'name' => 'clinic_logo_review_card_bg_color',
                    'type' => 'color_picker',
                    'instructions' => 'Фон контейнера с логотипом в блоке «Ответ клиники». По умолчанию — белый.',
                    'default_value' => '#FFFFFF',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'clinicLogoReviewCardBackgroundColor',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'reviews-archive-settings',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'reviewsArchiveSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_reviews_archive_settings_fields');

/**
 * Register ACF Fields для Footer Settings Option Page
 *
 * Поля: подпись под телефоном, ссылка на схему проезда, часы работы, копирайт, дисклеймер.
 * Телефон и соцсети берутся из Contacts; при необходимости часы из Header.
 */
function unident_register_footer_settings_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_footer_settings',
            'title' => 'Настройки футера',
            'fields' => array(
                // Logo Mode (switcher)
                array(
                    'key' => 'field_footer_logo_mode',
                    'label' => 'Режим логотипа',
                    'name' => 'logo_mode',
                    'type' => 'radio',
                    'instructions' => 'Что показывать в качестве логотипа: изображение или иконку.',
                    'choices' => array(
                        'image' => 'Изображение (загрузить картинку)',
                        'icon' => 'Иконка (выбрать из списка)',
                    ),
                    'default_value' => 'image',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'logoMode',
                ),
                // Logo (Image)
                array(
                    'key' => 'field_footer_logo',
                    'label' => 'Логотип (изображение)',
                    'name' => 'logo',
                    'type' => 'image',
                    'instructions' => 'Загрузите изображение логотипа (PNG, WebP, SVG). Если заполнено — отображается вместо текста.',
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'logo',
                ),
                // Logo Icon (Select — использует динамические choices)
                array(
                    'key' => 'field_footer_logo_icon',
                    'label' => 'Иконка логотипа',
                    'name' => 'logo_icon',
                    'type' => 'select',
                    'instructions' => 'Выберите иконку. Если заполнено — отображается рядом с изображением или вместо него.',
                    'choices' => array(),
                    'return_format' => 'value',
                    'allow_null' => 1,
                    'default_value' => '',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'logoIcon',
                ),
                array(
                    'key' => 'field_footer_phone_caption',
                    'label' => 'Подпись под телефоном',
                    'name' => 'phone_caption',
                    'type' => 'text',
                    'instructions' => 'Текст под номером телефона (например: "Ежедневно с 8:00 до 10:00"). Если пусто — используется из настроек Header.',
                    'default_value' => 'Ежедневно с 8:00 до 10:00',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'phoneCaption',
                ),
                array(
                    'key' => 'field_footer_address_scheme_url',
                    'label' => 'Ссылка «Адрес / Схема проезда»',
                    'name' => 'address_scheme_url',
                    'type' => 'url',
                    'instructions' => 'Куда ведёт блок «Адрес / Схема проезда». По умолчанию на фронте используется /clinics.',
                    'placeholder' => 'https://... или оставьте пустым для /clinics',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'addressSchemeUrl',
                ),
                array(
                    'key' => 'field_footer_working_hours',
                    'label' => 'Часы работы (переопределение)',
                    'name' => 'working_hours',
                    'type' => 'group',
                    'instructions' => 'Если заполнено — используются в футере. Иначе берутся из настроек Header.',
                    'layout' => 'block',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'workingHours',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_footer_weekdays',
                            'label' => 'Будние',
                            'name' => 'weekdays',
                            'type' => 'text',
                            'default_value' => '10:00 - 22:00 Пн-Сб',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'weekdays',
                        ),
                        array(
                            'key' => 'field_footer_weekend',
                            'label' => 'Выходные',
                            'name' => 'weekend',
                            'type' => 'text',
                            'default_value' => '9:00 - 16:00 Вс',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'weekend',
                        ),
                    ),
                ),
                array(
                    'key' => 'field_footer_copyright_left',
                    'label' => 'Копирайт (левая колонка низа)',
                    'name' => 'copyright_left',
                    'type' => 'textarea',
                    'instructions' => 'Текст слева внизу футера. Например: 2022 © ООО "Унидент", Сеть стоматологических клиник "Унидент", Все права защищены.',
                    'default_value' => "2022 © ООО \"Унидент\"\nСеть стоматологических клиник \"Унидент\"\nВсе права защищены",
                    'rows' => 4,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'copyrightLeft',
                ),
                array(
                    'key' => 'field_footer_disclaimer_center',
                    'label' => 'Дисклеймер (центр низа)',
                    'name' => 'disclaimer_center',
                    'type' => 'textarea',
                    'instructions' => 'Юридический текст по центру низа футера (противопоказания, не является офертой).',
                    'default_value' => 'Имеются противопоказания, необходима консультация специалиста. Все права защищены. Обращаем ваше внимание на то, что данный интернет сайт носит исключительно информационный характер и ни при каких условиях не является публичной офертой, определяемой положением Статьи 437 Гражданского кодекса',
                    'rows' => 5,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'disclaimerCenter',
                ),
                // Social Links Repeater (футер — те же значения icon, подписи отличаются от Header)
                array(
                    'key' => 'field_footer_social_links',
                    'label' => 'Социальные сети',
                    'name' => 'social_links',
                    'type' => 'repeater',
                    'instructions' => 'Добавьте ссылки на социальные сети для отображения в футере (иконки 45×45).',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить соц. сеть',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'socialLinks',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_footer_social_name',
                            'label' => 'Название',
                            'name' => 'name',
                            'type' => 'text',
                            'instructions' => 'Название социальной сети (например: Telegram)',
                            'required' => 1,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'name',
                        ),
                        array(
                            'key' => 'field_footer_social_icon',
                            'label' => 'Иконка',
                            'name' => 'icon',
                            'type' => 'select',
                            'instructions' => 'Иконки для футера (45×45). Отличаются от иконок в Header.',
                            'required' => 1,
                            'choices' => array(
                                'whatsapp' => 'WhatsApp',
                                'vk' => 'VKontakte',
                                'telegram' => 'Telegram',
                                'instagram' => 'Instagram',
                                'facebook' => 'Facebook',
                                'google' => 'Google Reviews',
                                'yandex' => 'Yandex',
                            ),
                            'default_value' => 'telegram',
                            'return_format' => 'value',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'icon',
                        ),
                        array(
                            'key' => 'field_footer_social_url',
                            'label' => 'Ссылка',
                            'name' => 'url',
                            'type' => 'url',
                            'instructions' => 'Полная ссылка на страницу в социальной сети',
                            'required' => 1,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'url',
                        ),
                    ),
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'footer-settings',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'footerSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_footer_settings_fields');

/**
 * Service Fields (group_service_fields) - НЕ регистрируем через PHP!
 * 
 * ВАЖНО: Эта группа управляется через ACF JSON Sync (wp-content/acf-json/)
 * Чтобы редактировать поля в админке без конфликтов.
 * 
 * Файл: wp-content/acf-json/group_service_fields.json
 * Содержит: Features repeater
 * 
 * НЕ ДОБАВЛЯТЬ acf_add_local_field_group() для этой группы!
 */

/**
 * Register ACF Fields для Menu Items
 * 
 * КРИТИЧНО: WPGraphQL ACF автоматически экспонирует image field с return_format = 'array'
 * как MediaItem объект с полями: url, width, height, altText и другими
 */
function unident_register_menu_item_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_menu_item_settings',
            'title' => 'Настройки пункта меню',
            'fields' => array(
                // Badge Count
                // Note: Это поле используется как FALLBACK для пунктов меню без динамических счетчиков
                // Автоматическая регистрация в GraphQL отключена (show_in_graphql => 0)
                // Регистрация происходит через custom resolver unident_register_menu_badge_count_field()
                array(
                    'key' => 'field_badge_count',
                    'label' => 'Счетчик (бейдж) - fallback',
                    'name' => 'badge_count',
                    'type' => 'number',
                    'instructions' => 'Число для отображения в бейдже (только для пунктов БЕЗ динамических счетчиков). Для "Акций" и "Отзывов" счетчик берется автоматически из количества постов.',
                    'required' => 0,
                    'min' => 0,
                    'show_in_graphql' => 0, // Отключена автоматическая регистрация!
                    'graphql_field_name' => 'badgeCount',
                ),
                        // Icon (Select from predefined icons)
                        array(
                            'key' => 'field_menu_icon',
                            'label' => 'Иконка пункта меню',
                            'name' => 'icon',
                            'type' => 'select',
                            'instructions' => 'Выберите иконку для пункта меню. Иконки рендерятся на фронте из библиотеки @/icons.',
                            'required' => 0,
                            'choices' => array(
                                // Dental/Medical (для меню услуг)
                                'tooth' => 'Зуб (терапия)',
                                'implant' => 'Имплант',
                                'orthodontics' => 'Ортодонтия (брекеты)',
                                'surgery' => 'Хирургия',
                                'hygiene' => 'Гигиена',
                                'children' => 'Детская стоматология',
                                'aesthetic' => 'Эстетика',
                                'diagnostic' => 'Диагностика',
                                // Info
                                'location' => 'Локация (адрес)',
                                'phone' => 'Телефон',
                                'clock' => 'Часы (время работы)',
                                // Stats/Finance
                                'percent' => 'Процент (скидка)',
                                'ruble' => 'Рубль',
                                'installment' => 'Рассрочка',
                                // UI
                                'star' => 'Звезда (рейтинг)',
                                'arrow-up-right' => 'Стрелка',
                                'menu' => 'Меню (гамбургер)',
                                'menu-lines' => 'Меню (три линии)',
                            ),
                            'default_value' => '',
                            'allow_null' => 1,
                            'return_format' => 'value',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'icon',
                        ),
                // Mega Menu Enabled
                array(
                    'key' => 'field_mega_menu_enabled',
                    'label' => 'Включить мега-меню',
                    'name' => 'mega_menu_enabled',
                    'type' => 'true_false',
                    'instructions' => 'Включить мега-меню с категориями и услугами',
                    'required' => 0,
                    'default_value' => 0,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'hasMegaMenu',
                ),
                // Mega Menu Categories
                array(
                    'key' => 'field_mega_menu_categories',
                    'label' => 'Категории для мега-меню',
                    'name' => 'mega_menu_categories',
                    'type' => 'taxonomy',
                    'instructions' => 'Выберите категории услуг для отображения в мега-меню. Если не выбрано - показываются все категории.',
                    'required' => 0,
                    'taxonomy' => 'service_categories',
                    'field_type' => 'select',
                    'multiple' => 1,
                    'allow_null' => 1,
                    'return_format' => 'id',
                    'conditional_logic' => array(
                        array(
                            array(
                                'field' => 'field_mega_menu_enabled',
                                'operator' => '==',
                                'value' => '1',
                            ),
                        ),
                    ),
                    'show_in_graphql' => 0, // Отключаем автоматическую регистрацию, будем регистрировать вручную
                    'graphql_field_name' => 'megaMenuCategories',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'nav_menu_item',
                        'operator' => '==',
                        'value' => 'all',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'menuItemSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_menu_item_fields');

/**
 * Register ACF Fields для Clinics
 * 
 * WPGraphQL ACF v2 автоматически экспонирует эти поля если:
 * - Field group имеет 'show_in_graphql' => 1
 * - Каждое поле имеет 'show_in_graphql' => 1
 */
function unident_register_clinic_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_clinic_fields',
            'title' => 'Настройки клиники',
            'fields' => array(
                // Адрес
                array(
                    'key' => 'field_clinic_address',
                    'label' => 'Адрес',
                    'name' => 'address',
                    'type' => 'text',
                    'instructions' => 'Полный адрес клиники',
                    'required' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'address',
                ),
                // Телефон
                array(
                    'key' => 'field_clinic_phone',
                    'label' => 'Телефон',
                    'name' => 'phone',
                    'type' => 'text',
                    'instructions' => 'Контактный телефон клиники',
                    'required' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'phone',
                ),
                // Станция метро
                array(
                    'key' => 'field_clinic_metro',
                    'label' => 'Станция метро',
                    'name' => 'metro_station',
                    'type' => 'text',
                    'instructions' => 'Ближайшая станция метро',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'metroStation',
                ),
                // Координаты (group)
                array(
                    'key' => 'field_clinic_coordinates',
                    'label' => 'Координаты',
                    'name' => 'coordinates',
                    'type' => 'group',
                    'instructions' => 'GPS координаты для карты. Из ссылки Яндекс.Карт (ll=долгота,широта): первое число — долгота, второе — широта.',
                    'layout' => 'block',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'coordinates',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_longitude',
                            'label' => 'Долгота (1-е число из ll=)',
                            'name' => 'longitude',
                            'type' => 'number',
                            'step' => 0.000001,
                            'instructions' => 'Из Яндекс.Карт: первое число из ll= или poi[point]= (напр. 69.322997)',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'longitude',
                        ),
                        array(
                            'key' => 'field_latitude',
                            'label' => 'Широта (2-е число из ll=)',
                            'name' => 'latitude',
                            'type' => 'number',
                            'step' => 0.000001,
                            'instructions' => 'Из Яндекс.Карт: второе число из ll= или poi[point]= (напр. 41.324563)',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'latitude',
                        ),
                    ),
                ),
                // Часы работы (group)
                array(
                    'key' => 'field_clinic_working_hours',
                    'label' => 'Часы работы',
                    'name' => 'working_hours',
                    'type' => 'group',
                    'instructions' => 'Режим работы клиники',
                    'layout' => 'block',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'workingHours',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_clinic_weekdays',
                            'label' => 'Будние дни',
                            'name' => 'weekdays',
                            'type' => 'text',
                            'default_value' => 'Пн-Сб 10:00-22:00',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'weekdays',
                        ),
                        array(
                            'key' => 'field_clinic_weekend',
                            'label' => 'Выходные',
                            'name' => 'weekend',
                            'type' => 'text',
                            'default_value' => 'Вс 9:00-16:00',
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'weekend',
                        ),
                    ),
                ),
                // Связь с работами (двусторонняя)
                array(
                    'key' => 'field_clinic_related_works',
                    'label' => 'Наши работы',
                    'name' => 'related_works',
                    'type' => 'relationship',
                    'instructions' => 'Работы, выполненные в этой клинике',
                    'required' => 0,
                    'post_type' => array('our-works'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedWorks',
                ),
                // Связь с врачами (двусторонняя)
                array(
                    'key' => 'field_clinic_related_doctors',
                    'label' => 'Врачи',
                    'name' => 'related_doctors',
                    'type' => 'relationship',
                    'instructions' => 'Врачи, работающие в этой клинике',
                    'required' => 0,
                    'post_type' => array('doctors'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedDoctors',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'clinics',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'clinicFields',
        ));
    }
}
add_action('acf/init', 'unident_register_clinic_fields');

/**
 * Register ACF Fields для Prices
 */
function unident_register_price_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_price_fields',
            'title' => 'Price Settings',
            'fields' => [
                [
                    'key' => 'field_price_type',
                    'label' => 'Price Type',
                    'name' => 'price_type',
                    'type' => 'select',
                    'instructions' => 'Выберите тип цены',
                    'required' => 0,
                    'choices' => [
                        'regular' => 'Regular (Обычная)',
                        'free' => 'Free (Бесплатно)',
                        'installment' => 'Installment (Рассрочка)',
                    ],
                    'default_value' => 'regular',
                    'allow_null' => 0,
                    'multiple' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'priceType',
                ],
                [
                    'key' => 'field_regular_price',
                    'label' => 'Regular Price',
                    'name' => 'regular_price',
                    'type' => 'number',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'regularPrice',
                ],
                [
                    'key' => 'field_promo_price',
                    'label' => 'Promo Price',
                    'name' => 'promo_price',
                    'type' => 'number',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'promoPrice',
                ],
                [
                    'key' => 'field_currency',
                    'label' => 'Currency',
                    'name' => 'currency',
                    'type' => 'text',
                    'default_value' => 'RUB',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'currency',
                ],
                [
                    'key' => 'field_period',
                    'label' => 'Period',
                    'name' => 'period',
                    'type' => 'text',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'period',
                ],
                [
                    'key' => 'field_installment_terms',
                    'label' => 'Installment Terms',
                    'name' => 'installment_terms',
                    'type' => 'textarea',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'installmentTerms',
                ],
                // Average Price in the City
                [
                    'key' => 'field_average_price_city',
                    'label' => 'Average Price in the City',
                    'name' => 'average_price_city',
                    'type' => 'number',
                    'instructions' => 'Средняя цена на эту услугу в городе для сравнения',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'averagePriceCity',
                ],
                // Futures repeater для типа "free"
                [
                    'key' => 'field_futures',
                    'label' => 'Futures',
                    'name' => 'futures',
                    'type' => 'repeater',
                    'instructions' => 'Добавьте преимущества для бесплатной услуги',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Add Future',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'futures',
                    'conditional_logic' => [
                        [
                            [
                                'field' => 'field_price_type',
                                'operator' => '==',
                                'value' => 'free',
                            ],
                        ],
                    ],
                    'sub_fields' => [
                        [
                            'key' => 'field_future_text',
                            'label' => 'Text',
                            'name' => 'text',
                            'type' => 'text',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'text',
                        ],
                    ],
                ],
                [
                    'key' => 'field_focus_services',
                    'label' => 'Focus Services',
                    'name' => 'focus_services',
                    'type' => 'relationship',
                    'post_type' => ['services'],
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'focusServices',
                ],
                [
                    'key' => 'field_price_related_promotion',
                    'label' => 'Связанная акция',
                    'name' => 'related_promotion',
                    'type' => 'relationship',
                    'post_type' => ['promotions'],
                    'return_format' => 'object',
                    'max' => 1,
                    'instructions' => 'Максимум одна акция. При выборе автоматически обновляется обратная связь.',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedPromotion',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'prices',
                    ],
                ],
            ],
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'priceFields',
        ]);
    }
}
add_action('acf/init', 'unident_register_price_fields');

/**
 * Register ACF Fields для Service Relationships
 */
function unident_register_service_relationships() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_service_relationships',
            'title' => 'Service Relationships',
            'fields' => [
                [
                    'key' => 'field_related_prices',
                    'label' => 'Related Prices',
                    'name' => 'related_prices',
                    'type' => 'relationship',
                    'post_type' => ['prices'],
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedPrices',
                ],
                [
                    'key' => 'field_focus_prices',
                    'label' => 'Focus Price',
                    'name' => 'focus_prices',
                    'type' => 'relationship',
                    'post_type' => ['prices'],
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'focusPrices',
                ],
                [
                    'key' => 'field_related_promotions',
                    'label' => 'Related Promotions',
                    'name' => 'related_promotions',
                    'type' => 'relationship',
                    'post_type' => ['promotions'],
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedPromotions',
                ],
                [
                    'key' => 'field_service_consulting_doctors',
                    'label' => 'Врачи (консультации)',
                    'name' => 'consulting_doctors',
                    'type' => 'relationship',
                    'instructions' => 'Врачи, оказывающие эту услугу консультации / первичного приёма',
                    'post_type' => ['doctors'],
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => ['search'],
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'consultingDoctors',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'services',
                    ],
                ],
            ],
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'serviceRelationships',
        ]);
    }
}
add_action('acf/init', 'unident_register_service_relationships');

/**
 * Register ACF Fields для Service — блоки страницы услуги (секция врачей, STA, блок услуг)
 * Location: post_type == services
 */
function unident_register_service_page_blocks_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_service_page_blocks',
            'title' => 'Блоки страницы услуги',
            'fields' => array(
                // Tab 1: Секция врачей
                array(
                    'key' => 'field_service_blocks_tab_doctors',
                    'label' => 'Секция врачей',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_blocks_doctors_show',
                    'label' => 'Показать блок',
                    'name' => 'doctors_section_show',
                    'type' => 'true_false',
                    'required' => 0,
                    'default_value' => 1,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'doctorsSectionShow',
                ),
                array(
                    'key' => 'field_service_blocks_doctors_title',
                    'label' => 'Заголовок секции врачей',
                    'name' => 'doctors_section_title',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'doctorsSectionTitle',
                ),
                array(
                    'key' => 'field_service_blocks_doctors_description',
                    'label' => 'Описание секции врачей',
                    'name' => 'doctors_section_description',
                    'type' => 'textarea',
                    'required' => 0,
                    'rows' => 4,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'doctorsSectionDescription',
                ),
                array(
                    'key' => 'field_service_blocks_related_doctors',
                    'label' => 'Врачи (двусторонняя связь)',
                    'name' => 'related_doctors',
                    'type' => 'relationship',
                    'instructions' => 'Врачи, оказывающие эту услугу. Связь синхронизируется с полем «Оказываемые услуги» на странице врача.',
                    'post_type' => array('doctors'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedDoctors',
                ),
                // Tab 2: Узнать точную стоимость
                array(
                    'key' => 'field_service_blocks_tab_exact_price',
                    'label' => 'Узнать точную стоимость',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_blocks_show_price_block',
                    'label' => 'Показать блок «Узнать точную стоимость»',
                    'name' => 'show_price_block',
                    'type' => 'true_false',
                    'required' => 0,
                    'default_value' => 1,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'showPriceBlock',
                ),
                array(
                    'key' => 'field_service_blocks_exact_price_icon',
                    'label' => 'Иконка',
                    'name' => 'exact_price_block_icon',
                    'type' => 'select',
                    'choices' => array(
                        'telegram' => 'Telegram',
                        'whatsapp' => 'WhatsApp',
                        'vk' => 'VKontakte',
                    ),
                    'default_value' => 'telegram',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'exactPriceBlockIcon',
                ),
                array(
                    'key' => 'field_service_blocks_exact_price_text',
                    'label' => 'Текст',
                    'name' => 'exact_price_block_text',
                    'type' => 'text',
                    'default_value' => 'Узнать точную стоимость в Телеграм',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'exactPriceBlockText',
                ),
                array(
                    'key' => 'field_service_blocks_exact_price_link',
                    'label' => 'Ссылка',
                    'name' => 'exact_price_block_link',
                    'type' => 'url',
                    'instructions' => 'Ссылка для блока (Telegram, WhatsApp и т.д.). Пусто — используется Telegram из контактов.',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'exactPriceBlockLink',
                ),
                // Tab 3: STA block
                array(
                    'key' => 'field_service_blocks_tab_sta',
                    'label' => 'STA block',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_blocks_sta_title',
                    'label' => 'Заголовок',
                    'name' => 'sta_title',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staTitle',
                ),
                array(
                    'key' => 'field_service_blocks_sta_description',
                    'label' => 'Описание',
                    'name' => 'sta_description',
                    'type' => 'textarea',
                    'required' => 0,
                    'rows' => 4,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staDescription',
                ),
                array(
                    'key' => 'field_service_blocks_sta_phone',
                    'label' => 'Телефон',
                    'name' => 'sta_phone',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staPhone',
                ),
                array(
                    'key' => 'field_service_blocks_sta_privacy_text',
                    'label' => 'Текст политики конфиденциальности',
                    'name' => 'sta_privacy_text',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staPrivacyText',
                ),
                array(
                    'key' => 'field_service_blocks_sta_privacy_link',
                    'label' => 'Ссылка на политику конфиденциальности',
                    'name' => 'sta_privacy_link',
                    'type' => 'url',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staPrivacyLink',
                ),
                array(
                    'key' => 'field_service_blocks_sta_doctor_image',
                    'label' => 'Фото врача',
                    'name' => 'sta_doctor_image',
                    'type' => 'image',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staDoctorImage',
                ),
                array(
                    'key' => 'field_service_blocks_sta_background_image',
                    'label' => 'Фоновое изображение',
                    'name' => 'sta_background_image',
                    'type' => 'image',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'staBackgroundImage',
                ),
                // Tab 3: Блок услуг (с bidirectional)
                array(
                    'key' => 'field_service_blocks_tab_services',
                    'label' => 'Блок услуг',
                    'name' => '',
                    'type' => 'tab',
                    'placement' => 'top',
                ),
                array(
                    'key' => 'field_service_blocks_show_services_block',
                    'label' => 'Показать блок услуг',
                    'name' => 'show_services_block',
                    'type' => 'true_false',
                    'required' => 0,
                    'default_value' => 1,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'servicesBlockShow',
                ),
                array(
                    'key' => 'field_service_blocks_services_title',
                    'label' => 'Заголовок блока услуг',
                    'name' => 'services_block_title',
                    'type' => 'text',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'servicesBlockTitle',
                ),
                array(
                    'key' => 'field_service_block_services',
                    'label' => 'Услуги для блока',
                    'name' => 'block_services',
                    'type' => 'relationship',
                    'instructions' => 'Услуги для отображения в блоке. При выборе B, C — на страницах B и C автоматически появится эта услуга.',
                    'required' => 0,
                    'post_type' => array('services'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'blockServices',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'services',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'servicePageBlocks',
        ));
    }
}
add_action('acf/init', 'unident_register_service_page_blocks_fields');

/**
 * Service ↔ Service: двусторонняя синхронизация block_services
 * При сохранении Service A с выбранными B, C — добавить A в block_services у B и C
 */
function unident_sync_service_block_services_bidirectional($value, $post_id, $field) {
    $global_name = 'is_updating_service_block_services';
    if (!empty($GLOBALS[$global_name])) {
        return $value;
    }
    $GLOBALS[$global_name] = 1;

    $service_a_id = (int) $post_id;
    if (get_post_type($service_a_id) !== 'services') {
        $GLOBALS[$global_name] = 0;
        return $value;
    }

    $new_ids = array();
    if (is_array($value) && !empty($value)) {
        foreach ($value as $p) {
            $pid = is_object($p) && isset($p->ID) ? (int) $p->ID : (int) $p;
            if ($pid > 0 && $pid !== $service_a_id) {
                $new_ids[] = $pid;
            }
        }
    }

    foreach ($new_ids as $service_b_id) {
        $current = get_field('block_services', $service_b_id);
        $current_ids = array();
        if (is_array($current) && !empty($current)) {
            foreach ($current as $c) {
                $cid = is_object($c) && isset($c->ID) ? (int) $c->ID : (int) $c;
                if ($cid > 0) {
                    $current_ids[] = $cid;
                }
            }
        }
        if (!in_array($service_a_id, $current_ids)) {
            $current_ids[] = $service_a_id;
            $GLOBALS[$global_name] = 0;
            update_field('block_services', $current_ids, $service_b_id);
            $GLOBALS[$global_name] = 1;
        }
    }

    $GLOBALS[$global_name] = 0;
    return $value;
}
add_filter('acf/update_value/key=field_service_block_services', 'unident_sync_service_block_services_bidirectional', 10, 3);

/**
 * Register ACF Fields для записей блога (Post) — связь с врачами
 * Двусторонняя связь: Post ↔ Doctor (Отвечает врач)
 */
function unident_register_post_relationships() {
	if (function_exists('acf_add_local_field_group')) {
		acf_add_local_field_group(array(
			'key' => 'group_post_relationships',
			'title' => 'Связь с врачами',
			'fields' => array(
				array(
					'key' => 'field_post_related_doctors',
					'label' => 'Отвечает врач',
					'name' => 'related_doctors',
					'type' => 'relationship',
					'instructions' => 'Врачи, связанные с этой записью (блок «Отвечает врач»)',
					'required' => 0,
					'post_type' => array('doctors'),
					'return_format' => 'object',
					'multiple' => 1,
					'filters' => array('search'),
					'show_in_graphql' => 1,
					'graphql_field_name' => 'relatedDoctors',
				),
				array(
					'key' => 'field_post_thank_you_fun_postcards',
					'label' => 'Thank you. Fun. Postcards.',
					'name' => 'thank_you_fun_postcards',
					'type' => 'image',
					'instructions' => 'Изображение (медиа) для блока открыток / благодарность.',
					'required' => 0,
					'return_format' => 'array',
					'preview_size' => 'medium',
					'library' => 'all',
					'show_in_graphql' => 1,
					'graphql_field_name' => 'thankYouFunPostcards',
				),
				array(
					'key' => 'field_post_card_style',
					'label' => 'Стиль карточки',
					'name' => 'card_style',
					'type' => 'select',
					'instructions' => 'Выберите стиль оформления карточки.',
					'required' => 0,
					'choices' => array(
						'light' => 'Светлая',
						'dark'  => 'Тёмная',
					),
					'default_value' => 'light',
					'show_in_graphql' => 1,
					'graphql_field_name' => 'cardStyle',
				),
			),
			'location' => array(
				array(
					array(
						'param' => 'post_type',
						'operator' => '==',
						'value' => 'post',
					),
				),
			),
			'style' => 'default',
			'active' => true,
			'show_in_graphql' => 1,
			'graphql_field_name' => 'postRelationships',
		));
	}
}
add_action('acf/init', 'unident_register_post_relationships');

/**
 * Register ACF Fields для Promotion Relationships
 * Связь: Promotion → Service (для получения цены через Service → Price)
 */
function unident_register_promotion_relationships() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_promotion_relationships',
            'title' => 'Promotion Relationships',
            'fields' => [
                [
                    'key' => 'field_promotion_related_services',
                    'label' => 'Related Services',
                    'name' => 'related_services',
                    'type' => 'relationship',
                    'required' => 0,
                    'instructions' => 'Выберите услуги, связанные с этой акцией. Цена будет взята из первой связанной услуги.',
                    'post_type' => ['services'],
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedServices',
                ],
                [
                    'key' => 'field_promotion_related_price',
                    'label' => 'Связанная цена',
                    'name' => 'related_price',
                    'type' => 'relationship',
                    'post_type' => ['prices'],
                    'return_format' => 'object',
                    'max' => 1,
                    'instructions' => 'Максимум одна цена. При выборе автоматически обновляется обратная связь.',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedPrice',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'promotions',
                    ],
                ],
            ],
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'promotionRelationships',
        ]);
    }
}
add_action('acf/init', 'unident_register_promotion_relationships');

/**
 * Принудительно сделать Related Services необязательным (перекрывает версию из БД)
 */
add_filter('acf/load_field/key=field_promotion_related_services', function($field) {
    $field['required'] = 0;
    return $field;
}, 999, 1);

/**
 * Однократно обновить related_services в БД: required=0.
 * Выполняется при загрузке админки, если поле ещё required.
 */
add_action('acf/init', function() {
    if (get_option('unident_promotion_related_services_fixed', false)) {
        return;
    }
    $field = acf_get_field('field_promotion_related_services');
    if ($field && !empty($field['required'])) {
        $field['required'] = 0;
        acf_update_field($field);
        update_option('unident_promotion_related_services_fixed', true);
    }
}, 99);

/**
 * Разрешить сохранение акции без выбора related_services (всегда валидно).
 * Позволяет сохранять пост в любом состоянии — с discount text, без услуг и т.д.
 */
add_filter('acf/validate_value/key=field_promotion_related_services', function($valid, $value, $field, $input) {
    return true;
}, 10, 4);

/**
 * Fallback: разрешить related_services для акций при любом ключе поля
 * (на случай если поле загружается из БД с другим key)
 */
add_filter('acf/validate_value/name=related_services', function($valid, $value, $field, $input) {
    $post_id = isset($_POST['post_ID']) ? intval($_POST['post_ID']) : 0;
    if ($post_id && get_post_type($post_id) === 'promotions') {
        return true;
    }
    return $valid;
}, 9999, 4);

/**
 * Price: сделать related_service необязательным.
 * Позволяет сохранять цены без привязки к услуге (free/standalone prices).
 */
add_filter('acf/load_field/key=field_related_service', function($field) {
    $field['required'] = 0;
    return $field;
}, 999, 1);

add_action('acf/init', function() {
    if (get_option('unident_price_related_service_fixed', false)) {
        return;
    }
    $field = acf_get_field('field_related_service');
    if ($field && !empty($field['required'])) {
        $field['required'] = 0;
        acf_update_field($field);
        update_option('unident_price_related_service_fixed', true);
    }
}, 99);

add_filter('acf/validate_value/key=field_related_service', function($valid, $value, $field, $input) {
    return true;
}, 10, 4);

add_filter('acf/validate_value/name=related_service', function($valid, $value, $field, $input) {
    $post_id = isset($_POST['post_ID']) ? intval($_POST['post_ID']) : 0;
    if ($post_id && get_post_type($post_id) === 'prices') {
        return true;
    }
    return $valid;
}, 9999, 4);

/**
 * Promotion ↔ Price: двусторонняя синхронизация 1:1
 * При сохранении Promotion.related_price обновляет Price.related_promotion и наоборот.
 */
function unident_sync_promotion_price_bidirectional($value, $post_id, $field) {
    $global_name = 'is_updating_promotion_price';
    if (!empty($GLOBALS[$global_name])) {
        return $value;
    }
    $GLOBALS[$global_name] = 1;

    $promotion_id = (int) $post_id;
    if (get_post_type($promotion_id) !== 'promotions') {
        $GLOBALS[$global_name] = 0;
        return $value;
    }

    $new_price_ids = [];
    if (is_array($value) && !empty($value)) {
        foreach ($value as $p) {
            $pid = is_object($p) && isset($p->ID) ? (int) $p->ID : (int) $p;
            if ($pid > 0) {
                $new_price_ids[] = $pid;
            }
        }
    }

    $old_value = get_field('related_price', $promotion_id, false);
    $old_price_ids = [];
    if (is_array($old_value) && !empty($old_value)) {
        foreach ($old_value as $p) {
            $pid = is_object($p) && isset($p->ID) ? (int) $p->ID : (int) $p;
            if ($pid > 0) {
                $old_price_ids[] = $pid;
            }
        }
    }

    foreach ($new_price_ids as $price_id) {
        $current = get_field('related_promotion', $price_id, false);
        $current_ids = [];
        if (is_array($current) && !empty($current)) {
            foreach ($current as $c) {
                $cid = is_object($c) && isset($c->ID) ? (int) $c->ID : (int) $c;
                if ($cid > 0) {
                    $current_ids[] = $cid;
                }
            }
        }
        if (!in_array($promotion_id, $current_ids, true)) {
            $current_ids[] = $promotion_id;
            update_field('related_promotion', [$promotion_id], $price_id);
        }
    }

    foreach ($old_price_ids as $price_id) {
        if (in_array($price_id, $new_price_ids, true)) {
            continue;
        }
        $current = get_field('related_promotion', $price_id, false);
        if (empty($current) || !is_array($current)) {
            continue;
        }
        $filtered = [];
        foreach ($current as $c) {
            $cid = is_object($c) && isset($c->ID) ? (int) $c->ID : (int) $c;
            if ($cid !== $promotion_id && $cid > 0) {
                $filtered[] = $cid;
            }
        }
        update_field('related_promotion', $filtered, $price_id);
    }

    $GLOBALS[$global_name] = 0;
    return $value;
}
add_filter('acf/update_value/name=related_price', 'unident_sync_promotion_price_bidirectional', 10, 3);

function unident_sync_price_promotion_bidirectional($value, $post_id, $field) {
    $global_name = 'is_updating_promotion_price';
    if (!empty($GLOBALS[$global_name])) {
        return $value;
    }
    $GLOBALS[$global_name] = 1;

    $price_id = (int) $post_id;
    if (get_post_type($price_id) !== 'prices') {
        $GLOBALS[$global_name] = 0;
        return $value;
    }

    $new_promo_ids = [];
    if (is_array($value) && !empty($value)) {
        foreach ($value as $p) {
            $pid = is_object($p) && isset($p->ID) ? (int) $p->ID : (int) $p;
            if ($pid > 0) {
                $new_promo_ids[] = $pid;
            }
        }
    }

    $old_value = get_field('related_promotion', $price_id, false);
    $old_promo_ids = [];
    if (is_array($old_value) && !empty($old_value)) {
        foreach ($old_value as $p) {
            $pid = is_object($p) && isset($p->ID) ? (int) $p->ID : (int) $p;
            if ($pid > 0) {
                $old_promo_ids[] = $pid;
            }
        }
    }

    foreach ($new_promo_ids as $promo_id) {
        $current = get_field('related_price', $promo_id, false);
        $current_ids = [];
        if (is_array($current) && !empty($current)) {
            foreach ($current as $c) {
                $cid = is_object($c) && isset($c->ID) ? (int) $c->ID : (int) $c;
                if ($cid > 0) {
                    $current_ids[] = $cid;
                }
            }
        }
        if (!in_array($price_id, $current_ids, true)) {
            $current_ids[] = $price_id;
            update_field('related_price', [$price_id], $promo_id);
        }
    }

    foreach ($old_promo_ids as $promo_id) {
        if (in_array($promo_id, $new_promo_ids, true)) {
            continue;
        }
        $current = get_field('related_price', $promo_id, false);
        if (empty($current) || !is_array($current)) {
            continue;
        }
        $filtered = [];
        foreach ($current as $c) {
            $cid = is_object($c) && isset($c->ID) ? (int) $c->ID : (int) $c;
            if ($cid !== $price_id && $cid > 0) {
                $filtered[] = $cid;
            }
        }
        update_field('related_price', $filtered, $promo_id);
    }

    $GLOBALS[$global_name] = 0;
    return $value;
}
add_filter('acf/update_value/name=related_promotion', 'unident_sync_price_promotion_bidirectional', 10, 3);

/**
 * Service → Price: копирование excerpt при сохранении услуги.
 * Все цены из related_prices и focus_prices получают excerpt услуги.
 */
function unident_sync_service_excerpt_to_prices($post_id) {
    if (get_post_type($post_id) !== 'services') {
        return;
    }
    $service = get_post($post_id);
    if (!$service || $service->post_status !== 'publish' || empty(trim($service->post_excerpt ?? ''))) {
        return;
    }
    $global_name = 'is_syncing_service_excerpt_to_prices';
    if (!empty($GLOBALS[$global_name])) {
        return;
    }
    $GLOBALS[$global_name] = 1;
    $excerpt = $service->post_excerpt;
    $price_ids = [];
    foreach (['related_prices', 'focus_prices'] as $field) {
        $prices = get_field($field, $post_id);
        if (is_array($prices)) {
            foreach ($prices as $p) {
                $pid = is_object($p) ? ($p->ID ?? 0) : (int) $p;
                if ($pid > 0) {
                    $price_ids[] = $pid;
                }
            }
        }
    }
    $price_ids = array_unique($price_ids);
    foreach ($price_ids as $price_id) {
        wp_update_post([
            'ID' => $price_id,
            'post_excerpt' => $excerpt,
        ]);
    }
    $GLOBALS[$global_name] = 0;
}
add_action('acf/save_post', 'unident_sync_service_excerpt_to_prices', 20);

/**
 * Manual GraphQL Registration для Promotion → Service relationship
 * Регистрирует поле relatedServices напрямую на Promotion
 */
function unident_register_promotion_relationships_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    // Register relatedServices field directly on Promotion
    register_graphql_field('Promotion', 'relatedServices', [
        'type' => ['list_of' => 'Service'],
        'description' => __('Связанные услуги (для получения цены)', 'unident-acf-fields'),
        'resolve' => function($source, $args, $context, $info) {
            // Получаем post_id из WPGraphQL Post model
            $post_id = $source->databaseId ?? ($source->ID ?? null);
            
            if (!$post_id) {
                return null;
            }
            
            // Получаем связанные услуги из post_meta
            $services = get_post_meta($post_id, 'related_services', true);
            
            if (empty($services) || !is_array($services)) {
                return null;
            }
            
            // Конвертируем ID в GraphQL Service объекты
            $resolved_services = [];
            foreach ($services as $service_id) {
                $service_id = (int) $service_id;
                if ($service_id > 0) {
                    $resolved = \WPGraphQL\Data\DataSource::resolve_post_object($service_id, $context);
                    if ($resolved) {
                        $resolved_services[] = $resolved;
                    }
                }
            }
            
            return !empty($resolved_services) ? $resolved_services : null;
        }
    ]);

    // Promotion.relatedPrice (1:1)
    register_graphql_field('Promotion', 'relatedPrice', [
        'type' => 'Price',
        'description' => __('Связанная цена (1:1)', 'unident-acf-fields'),
        'resolve' => function($source, $args, $context, $info) {
            $post_id = $source->databaseId ?? ($source->ID ?? null);
            if (!$post_id) {
                return null;
            }
            $prices = get_field('related_price', $post_id);
            if (!$prices || !is_array($prices)) {
                return null;
            }
            $price_post = $prices[0] ?? null;
            if (!$price_post instanceof \WP_Post) {
                return null;
            }
            return \WPGraphQL\Data\DataSource::resolve_post_object($price_post->ID, $context);
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_promotion_relationships_graphql', 10);

/**
 * Manual GraphQL Registration для Price Fields
 */
function unident_register_price_graphql_fields() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    // Register PriceFuture type для repeater
    register_graphql_object_type('PriceFuture', [
        'description' => __('Преимущество для бесплатной услуги (из repeater поля)', 'unident-acf-fields'),
        'fields' => [
            'text' => [
                'type' => 'String',
                'description' => __('Текст преимущества', 'unident-acf-fields'),
            ],
        ],
    ]);
    
    // Register Price fields
    register_graphql_field('Price', 'priceType', [
        'type' => 'String',
        'description' => 'Price type (regular, free, installment)',
        'resolve' => function($post) {
            return get_field('price_type', $post->ID) ?: 'regular';
        }
    ]);
    
    register_graphql_field('Price', 'regularPrice', [
        'type' => 'Float',
        'description' => 'Regular price',
        'resolve' => function($post) {
            $value = get_field('regular_price', $post->ID);
            return $value ? (float) $value : null;
        }
    ]);
    
    register_graphql_field('Price', 'promoPrice', [
        'type' => 'Float',
        'description' => 'Promo price',
        'resolve' => function($post) {
            $value = get_field('promo_price', $post->ID);
            return $value ? (float) $value : null;
        }
    ]);
    
    register_graphql_field('Price', 'currency', [
        'type' => 'String',
        'description' => 'Currency code',
        'resolve' => function($post) {
            return get_field('currency', $post->ID) ?: 'RUB';
        }
    ]);
    
    register_graphql_field('Price', 'period', [
        'type' => 'String',
        'description' => 'Payment period',
        'resolve' => function($post) {
            return get_field('period', $post->ID);
        }
    ]);
    
    register_graphql_field('Price', 'installmentTerms', [
        'type' => 'String',
        'description' => 'Installment terms',
        'resolve' => function($post) {
            return get_field('installment_terms', $post->ID);
        }
    ]);
    
    register_graphql_field('Price', 'averagePriceCity', [
        'type' => 'Float',
        'description' => 'Average price in the city for comparison',
        'resolve' => function($post) {
            $value = get_field('average_price_city', $post->ID);
            return $value ? (float) $value : null;
        }
    ]);
    
    // Register futures repeater field
    register_graphql_field('Price', 'futures', [
        'type' => ['list_of' => 'PriceFuture'],
        'description' => __('Преимущества для бесплатной услуги (repeater)', 'unident-acf-fields'),
        'resolve' => function($post, $args, $context, $info) {
            $post_id = $post->databaseId ?? null;
            
            if (!$post_id || !function_exists('get_field')) {
                return null;
            }
            
            // ACF get_field() для repeater поля
            $futures_data = get_field('futures', $post_id);
            
            if (empty($futures_data) || !is_array($futures_data)) {
                return null;
            }
            
            $futures = [];
            foreach ($futures_data as $index => $future) {
                // Проверяем разные форматы данных от ACF
                $text = null;
                if (is_array($future)) {
                    // Формат: ['text' => '...']
                    $text = isset($future['text']) ? $future['text'] : null;
                } elseif (is_string($future)) {
                    // Если это просто строка (старый формат)
                    $text = $future;
                }
                
                if (!empty($text) && trim($text)) {
                    $futures[] = [
                        'text' => sanitize_text_field($text),
                    ];
                }
            }
            
            return !empty($futures) ? $futures : null;
        }
    ]);

    // Price.relatedPromotion (1:1)
    register_graphql_field('Price', 'relatedPromotion', [
        'type' => 'Promotion',
        'description' => __('Связанная акция (1:1)', 'unident-acf-fields'),
        'resolve' => function($source, $args, $context, $info) {
            $post_id = $source->databaseId ?? ($source->ID ?? null);
            if (!$post_id) {
                return null;
            }
            $promotions = get_field('related_promotion', $post_id);
            if (!$promotions || !is_array($promotions)) {
                return null;
            }
            $promo_post = $promotions[0] ?? null;
            if (!$promo_post instanceof \WP_Post) {
                return null;
            }
            return \WPGraphQL\Data\DataSource::resolve_post_object($promo_post->ID, $context);
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_price_graphql_fields', 10);

/**
 * Manual GraphQL Registration для Service Relationships
 */
function unident_register_service_relationships_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    
    // Register relatedPrices connection field (list format для обратной совместимости)
    register_graphql_field('Service', 'relatedPrices', [
        'type' => ['list_of' => 'Price'],
        'description' => 'Related prices for this service',
        'resolve' => function($service, $args, $context, $info) {
            $prices = get_field('related_prices', $service->ID);
            
            if (!$prices || !is_array($prices)) {
                return null;
            }
            
            // Convert WP_Post objects to GraphQL types using DataSource
            $resolved = [];
            foreach ($prices as $price_post) {
                if ($price_post instanceof \WP_Post) {
                    $resolved_price = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $price_post->ID,
                        $context
                    );
                    if ($resolved_price) {
                        $resolved[] = $resolved_price;
                    }
                }
            }
            
            return !empty($resolved) ? $resolved : null;
        }
    ]);

    // Register focusPrices connection field
    register_graphql_field('Service', 'focusPrices', [
        'type' => ['list_of' => 'Price'],
        'description' => 'Focus prices for this service',
        'resolve' => function($service, $args, $context, $info) {
            $prices = get_field('focus_prices', $service->ID);
            if (!$prices || !is_array($prices)) {
                return null;
            }
            $resolved = [];
            foreach ($prices as $price_post) {
                if ($price_post instanceof \WP_Post) {
                    $resolved_price = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $price_post->ID,
                        $context
                    );
                    if ($resolved_price) {
                        $resolved[] = $resolved_price;
                    }
                }
            }
            return !empty($resolved) ? $resolved : null;
        }
    ]);
    
    // Register relatedPromotions connection field  
    register_graphql_field('Service', 'relatedPromotions', [
        'type' => ['list_of' => 'Promotion'],
        'description' => 'Related promotions for this service',
        'resolve' => function($service, $args, $context, $info) {
            $post_id = $service->databaseId ?? $service->ID ?? null;
            if (!$post_id) {
                return null;
            }
            $raw = get_field('related_promotions', $post_id);
            
            if (!$raw || !is_array($raw)) {
                return null;
            }
            
            $result = [];
            foreach ($raw as $p) {
                if ($p === null) continue;
                $pid = is_object($p) ? ($p->ID ?? null) : (is_numeric($p) ? (int) $p : null);
                if (!$pid || get_post_status($pid) !== 'publish' || get_post_type($pid) !== 'promotions') continue;
                $resolved = \WPGraphQL\Data\DataSource::resolve_post_object($pid, $context);
                if ($resolved) $result[] = $resolved;
            }
            return !empty($result) ? $result : null;
        }
    ]);

    // Root query: promotions that have this service in their related_services (Promotion → Service)
    register_graphql_field('RootQuery', 'promotionsByServiceId', [
        'type' => ['list_of' => 'Promotion'],
        'description' => 'Promotions that have the given service in their related_services',
        'args' => [
            'serviceId' => [
                'type' => ['non_null' => 'Int'],
                'description' => 'Service database ID',
            ],
            'first' => [
                'type' => 'Int',
                'description' => 'Max number of promotions to return',
                'defaultValue' => 8,
            ],
        ],
        'resolve' => function ($root, $args, $context, $info) {
            $service_id = (int) $args['serviceId'];
            $first = isset($args['first']) ? (int) $args['first'] : 8;
            if ($service_id <= 0) {
                return [];
            }

            $promo_ids = get_posts([
                'post_type' => 'promotions',
                'post_status' => 'publish',
                'posts_per_page' => 100,
                'fields' => 'ids',
            ]);

            $result = [];
            foreach ($promo_ids as $promo_id) {
                $services = get_field('related_services', $promo_id);
                if (!$services || !is_array($services)) {
                    continue;
                }
                // ACF return_format=object: массив WP_Post; извлекаем ID
                $ids = array_map(function ($s) {
                    return is_object($s) && isset($s->ID) ? (int) $s->ID : (int) $s;
                }, (array) $services);
                if (in_array($service_id, $ids, true)) {
                    $resolved = \WPGraphQL\Data\DataSource::resolve_post_object($promo_id, $context);
                    if ($resolved) {
                        $result[] = $resolved;
                    }
                    if (count($result) >= $first) {
                        break;
                    }
                }
            }
            return $result;
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_service_relationships_graphql', 10);

/**
 * Manual GraphQL Registration для Service.servicePageBlocks
 */
function unident_register_service_page_blocks_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_object_type('ServicePageBlocksStaImage', [
        'description' => __('Изображение STA на странице услуги', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('ServicePageBlocks', [
        'description' => __('Блоки страницы услуги (секция врачей, STA, блок услуг)', 'unident-acf-fields'),
        'fields' => [
            'doctorsSectionShow' => ['type' => 'Boolean'],
            'doctorsSectionTitle' => ['type' => 'String'],
            'doctorsSectionDescription' => ['type' => 'String'],
            'showPriceBlock' => ['type' => 'Boolean'],
            'exactPriceBlockIcon' => ['type' => 'String'],
            'exactPriceBlockText' => ['type' => 'String'],
            'exactPriceBlockLink' => ['type' => 'String'],
            'staTitle' => ['type' => 'String'],
            'staDescription' => ['type' => 'String'],
            'staPhone' => ['type' => 'String'],
            'staPrivacyText' => ['type' => 'String'],
            'staPrivacyLink' => ['type' => 'String'],
            'staDoctorImage' => ['type' => 'ServicePageBlocksStaImage'],
            'staBackgroundImage' => ['type' => 'ServicePageBlocksStaImage'],
            'servicesBlockShow' => ['type' => 'Boolean'],
            'servicesBlockTitle' => ['type' => 'String'],
            'blockServices' => ['type' => ['list_of' => 'Service']],
            'relatedDoctors' => ['type' => ['list_of' => 'Doctor']],
        ],
    ]);

    register_graphql_field('Service', 'servicePageBlocks', [
        'type' => 'ServicePageBlocks',
        'description' => __('Блоки страницы услуги', 'unident-acf-fields'),
        'resolve' => function($service, $args, $context, $info) {
            $post_id = $service->databaseId ?? $service->ID ?? null;
            if (!$post_id) {
                return null;
            }

            $format_image = function($img) {
                if (!$img || !is_array($img)) {
                    return null;
                }
                return [
                    'url' => $img['url'] ?? null,
                    'width' => isset($img['width']) ? (int) $img['width'] : null,
                    'height' => isset($img['height']) ? (int) $img['height'] : null,
                    'alt' => $img['alt'] ?? null,
                ];
            };

            $block_services_raw = get_field('block_services', $post_id);
            $block_services = null;
            if ($block_services_raw && is_array($block_services_raw)) {
                $block_services = array_filter(array_map(function($p) use ($context) {
                    if ($p instanceof \WP_Post) {
                        return \WPGraphQL\Data\DataSource::resolve_post_object($p->ID, $context);
                    }
                    return null;
                }, $block_services_raw));
                $block_services = array_values($block_services);
            }

            $related_doctors_raw = get_field('related_doctors', $post_id);
            $related_doctors = null;
            if ($related_doctors_raw && is_array($related_doctors_raw)) {
                $related_doctors = array_filter(array_map(function($p) use ($context) {
                    if ($p instanceof \WP_Post) {
                        return \WPGraphQL\Data\DataSource::resolve_post_object($p->ID, $context);
                    }
                    return null;
                }, $related_doctors_raw));
                $related_doctors = array_values($related_doctors);
            }

            return [
                'doctorsSectionShow' => (bool) get_field('doctors_section_show', $post_id),
                'doctorsSectionTitle' => get_field('doctors_section_title', $post_id) ?: null,
                'doctorsSectionDescription' => get_field('doctors_section_description', $post_id) ?: null,
                'showPriceBlock' => ($v = get_field('show_price_block', $post_id)) === null ? null : (bool) $v,
                'exactPriceBlockIcon' => get_field('exact_price_block_icon', $post_id) ?: null,
                'exactPriceBlockText' => get_field('exact_price_block_text', $post_id) ?: null,
                'exactPriceBlockLink' => get_field('exact_price_block_link', $post_id) ?: null,
                'staTitle' => get_field('sta_title', $post_id) ?: null,
                'staDescription' => get_field('sta_description', $post_id) ?: null,
                'staPhone' => get_field('sta_phone', $post_id) ?: null,
                'staPrivacyText' => get_field('sta_privacy_text', $post_id) ?: null,
                'staPrivacyLink' => unident_parse_cta_privacy_link(get_field('sta_privacy_link', $post_id)),
                'staDoctorImage' => $format_image(get_field('sta_doctor_image', $post_id)),
                'staBackgroundImage' => $format_image(get_field('sta_background_image', $post_id)),
                'servicesBlockShow' => ($v = get_field('show_services_block', $post_id)) === null ? null : (bool) $v,
                'servicesBlockTitle' => get_field('services_block_title', $post_id) ?: null,
                'blockServices' => $block_services,
                'relatedDoctors' => $related_doctors,
            ];
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_service_page_blocks_graphql', 10);

/**
 * Manual GraphQL Registration для Price.focusServices
 */
function unident_register_price_focus_services_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    register_graphql_field('Price', 'focusServices', [
        'type' => ['list_of' => 'Service'],
        'description' => 'Focus services for this price',
        'resolve' => function($source, $args, $context, $info) {
            $post_id = $source->databaseId ?? ($source->ID ?? null);
            if (!$post_id) {
                return null;
            }
            $services = get_post_meta($post_id, 'focus_services', true);
            if (empty($services) || !is_array($services)) {
                return null;
            }
            $resolved = [];
            foreach ($services as $sid) {
                $sid = (int) $sid;
                if ($sid > 0) {
                    $r = \WPGraphQL\Data\DataSource::resolve_post_object($sid, $context);
                    if ($r) {
                        $resolved[] = $r;
                    }
                }
            }
            return !empty($resolved) ? $resolved : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_price_focus_services_graphql', 10);

/**
 * Register ACF Fields для Doctors
 * 
 * WPGraphQL ACF v2 автоматически экспонирует эти поля если:
 * - Field group имеет 'show_in_graphql' => 1
 * - Каждое поле имеет 'show_in_graphql' => 1
 */
function unident_register_doctor_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_doctor_fields',
            'title' => 'Информация о враче',
            'fields' => array(
                // Дата начала работы
                array(
                    'key' => 'field_doctor_experience',
                    'label' => 'Стаж (лет)',
                    'name' => 'experience',
                    'type' => 'date_picker',
                    'instructions' => 'Дата начала работы врача',
                    'required' => 0,
                    'display_format' => 'd/m/Y',
                    'return_format' => 'Y-m-d',
                    'first_day' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'experience',
                ),
                // Рейтинг
                array(
                    'key' => 'field_doctor_rating',
                    'label' => 'Рейтинг',
                    'name' => 'rating',
                    'type' => 'number',
                    'instructions' => 'Рейтинг врача (от 0 до 5)',
                    'required' => 0,
                    'min' => 0,
                    'max' => 5,
                    'step' => 0.1,
                    'default_value' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'rating',
                ),
                // Источник рейтинга
                array(
                    'key' => 'field_doctor_rating_source',
                    'label' => 'Источник рейтинга',
                    'name' => 'rating_source',
                    'type' => 'text',
                    'instructions' => 'Источник рейтинга (например: Doctu.ru)',
                    'required' => 0,
                    'default_value' => 'Doctu.ru',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'ratingSource',
                ),
                // Специализация
                array(
                    'key' => 'field_doctor_specialization',
                    'label' => 'Специализация',
                    'name' => 'specialization',
                    'type' => 'repeater',
                    'instructions' => 'Специализация врача (например: Стоматолог-терапевт, ортопед)',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить специализацию',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'specialization',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_doctor_specialization_item',
                            'label' => 'Специализация',
                            'name' => 'specialization_item',
                            'type' => 'text',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'specializationItem',
                        ),
                    ),
                ),
                // Клиника
                array(
                    'key' => 'field_doctor_clinic',
                    'label' => 'Клиника',
                    'name' => 'clinic',
                    'type' => 'relationship',
                    'instructions' => 'Выберите клинику, где работает врач',
                    'required' => 0,
                    'post_type' => array('clinics'),
                    'taxonomy' => array(),
                    'allow_null' => 1,
                    'multiple' => 0,
                    'return_format' => 'object',
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'clinic',
                ),
                // Видео-визитка
                array(
                    'key' => 'field_doctor_video_url',
                    'label' => 'Видео-визитка (URL)',
                    'name' => 'video_url',
                    'type' => 'url',
                    'instructions' => 'Ссылка на видео-визитку врача (YouTube, Vimeo и т.д.)',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'videoUrl',
                ),
                // Образование (repeater)
                array(
                    'key' => 'field_doctor_education',
                    'label' => 'Образование',
                    'name' => 'education',
                    'type' => 'repeater',
                    'instructions' => 'Учебные заведения и годы окончания',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Добавить образование',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'education',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_doctor_education_year',
                            'label' => 'Год',
                            'name' => 'year',
                            'type' => 'text',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'year',
                        ),
                        array(
                            'key' => 'field_doctor_education_place',
                            'label' => 'Место учёбы',
                            'name' => 'place',
                            'type' => 'text',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'place',
                        ),
                        array(
                            'key' => 'field_doctor_education_type',
                            'label' => 'Тип обучения',
                            'name' => 'education_type',
                            'type' => 'text',
                            'instructions' => 'Например: очные курсы, семинар, подготовительные курсы',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'educationType',
                        ),
                    ),
                ),
                // Сертификаты (gallery)
                array(
                    'key' => 'field_doctor_certificates',
                    'label' => 'Сертификаты',
                    'name' => 'certificates',
                    'type' => 'gallery',
                    'instructions' => 'Изображения сертификатов и дипломов',
                    'required' => 0,
                    'return_format' => 'id',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'certificates',
                ),
                // Услуги консультаций (первичный приём / консультация) — отдельная связь
                array(
                    'key' => 'field_doctor_consultation_services',
                    'label' => 'Услуги консультаций',
                    'name' => 'consultation_services',
                    'type' => 'relationship',
                    'instructions' => 'Услуги типа первичный приём или консультация по направлению врача',
                    'required' => 0,
                    'post_type' => array('services'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'consultationServices',
                ),
                // Связь с отзывами (двусторонняя)
                array(
                    'key' => 'field_doctor_related_reviews',
                    'label' => 'Отзывы',
                    'name' => 'related_reviews',
                    'type' => 'relationship',
                    'instructions' => 'Отзывы о враче',
                    'required' => 0,
                    'post_type' => array('reviews'),
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedReviews',
                ),
                // Связь с услугами (двусторонняя)
                array(
                    'key' => 'field_doctor_related_services',
                    'label' => 'Оказываемые услуги',
                    'name' => 'related_services',
                    'type' => 'relationship',
                    'instructions' => 'Услуги, которые оказывает врач',
                    'required' => 0,
                    'post_type' => array('services'),
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedServices',
                ),
                // Связь с работами (двусторонняя)
                array(
                    'key' => 'field_doctor_related_works',
                    'label' => 'Наши работы',
                    'name' => 'related_works',
                    'type' => 'relationship',
                    'instructions' => 'Работы, выполненные врачом',
                    'required' => 0,
                    'post_type' => array('our-works'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedWorks',
                ),
                // Связь с записями блога (двусторонняя Post ↔ Doctor)
                array(
                    'key' => 'field_doctor_related_posts',
                    'label' => 'Связанные записи блога',
                    'name' => 'related_posts',
                    'type' => 'relationship',
                    'instructions' => 'Записи блога, в которых участвует врач (Отвечает врач)',
                    'required' => 0,
                    'post_type' => array('post'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedPosts',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'doctors',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'doctorFields',
        ));
    }
}
add_action('acf/init', 'unident_register_doctor_fields');

/**
 * Register ACF Fields для Promotions (Action Card)
 * 
 * WPGraphQL ACF v2 автоматически экспонирует эти поля если:
 * - Field group имеет 'show_in_graphql' => 1
 * - Каждое поле имеет 'show_in_graphql' => 1
 */
function unident_register_promotion_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_promotion_fields',
            'title' => 'Настройки акции',
            'fields' => array(
                // Иконка акции (Select from predefined icons)
                array(
                    'key' => 'field_promotion_action_icon',
                    'label' => 'Иконка акции',
                    'name' => 'action_icon',
                    'type' => 'select',
                    'instructions' => 'Выберите иконку для акции. Иконки рендерятся на фронте из библиотеки @/icons.',
                    'required' => 0,
                    'choices' => array(
                        // Stats/Finance (наиболее подходящие для акций)
                        'percent' => 'Процент (скидка)',
                        'ruble' => 'Рубль',
                        'installment' => 'Рассрочка',
                        // Dental
                        'tooth' => 'Зуб (терапия)',
                        'implant' => 'Имплант',
                        'orthodontics' => 'Ортодонтия',
                        'surgery' => 'Хирургия',
                        'hygiene' => 'Гигиена',
                        'children' => 'Детская стоматология',
                        'aesthetic' => 'Эстетика',
                        'diagnostic' => 'Диагностика',
                        // UI
                        'star' => 'Звезда (рейтинг)',
                        'menu' => 'Меню (гамбургер)',
                    ),
                    'default_value' => 'percent',
                    'allow_null' => 1,
                    'return_format' => 'value',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'actionIcon',
                ),
                // Тип акции
                array(
                    'key' => 'field_promotion_action_type',
                    'label' => 'Тип акции',
                    'name' => 'action_type',
                    'type' => 'select',
                    'instructions' => 'Выберите тип акции для применения соответствующего стиля',
                    'required' => 0,
                    'choices' => array(
                        'promo' => 'Промо (стандартный)',
                        'special' => 'Специальное предложение',
                        'limited' => 'Ограниченное предложение',
                        'sale' => 'Распродажа',
                        'free' => 'Free (Бесплатно)',
                    ),
                    'default_value' => 'promo',
                    'allow_null' => 0,
                    'multiple' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'actionType',
                ),
                // Дата окончания акции
                array(
                    'key' => 'field_promotion_end_date',
                    'label' => 'Дата окончания акции',
                    'name' => 'end_date',
                    'type' => 'date_time_picker',
                    'instructions' => 'Дата и время окончания акции (для обратного отсчета)',
                    'required' => 0,
                    'display_format' => 'd/m/Y H:i',
                    'return_format' => 'Y-m-d H:i:s',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'endDate',
                ),
                // Futures repeater - регистрируем ЗДЕСЬ, а не в базе данных
                array(
                    'key' => 'field_promotion_futures',
                    'label' => 'Futures',
                    'name' => 'futures',
                    'type' => 'repeater',
                    'instructions' => 'Добавьте преимущества для акции',
                    'required' => 0,
                    'layout' => 'table',
                    'button_label' => 'Add Future',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'futures',
                    'sub_fields' => array(
                        array(
                            'key' => 'field_promotion_future_text',
                            'label' => 'Text',
                            'name' => 'text',
                            'type' => 'text',
                            'required' => 0,
                            'show_in_graphql' => 1,
                            'graphql_field_name' => 'text',
                        ),
                    ),
                ),
                // Лейбл текста скидки (для промо-баннера страницы услуги)
                array(
                    'key' => 'field_promotion_discount_label_text',
                    'label' => 'Лейбл текста скидки',
                    'name' => 'discount_label_text',
                    'type' => 'text',
                    'instructions' => 'Текст скидки (напр. «Семейная скидка»). % добавляется автоматически из Price, если включён переключатель.',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'discountLabelText',
                ),
                // Показывать % в тексте скидки
                array(
                    'key' => 'field_promotion_show_discount_percent',
                    'label' => 'Показывать % скидки в тексте',
                    'name' => 'show_discount_percent',
                    'type' => 'true_false',
                    'instructions' => 'Рассчитывается из regularPrice и promoPrice связанной цены. Если выкл — показывается только лейбл без процента.',
                    'required' => 0,
                    'default_value' => 1,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'showDiscountPercent',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'promotions',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'promotionFields',
        ));
    }
}
add_action('acf/init', 'unident_register_promotion_fields');


/**
 * Manual GraphQL Registration для Header Settings Option Page
 * 
 * WPGraphQL ACF v2 НЕ ПОДДЕРЖИВАЕТ автоматическую регистрацию Option Pages!
 * Требуется manual registration согласно официальной документации:
 * https://www.wpgraphql.com/docs/build-your-first-wpgraphql-extension
 */
function unident_register_header_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Register WorkingHours nested type
    register_graphql_object_type('HeaderSettingsWorkingHours', [
        'description' => __('Working hours', 'unident-acf-fields'),
        'fields' => [
            'weekdays' => [
                'type' => 'String',
                'description' => __('Working hours on weekdays', 'unident-acf-fields'),
            ],
            'weekend' => [
                'type' => 'String',
                'description' => __('Working hours on weekend', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register HeaderSettingsLogo type for logo image
    register_graphql_object_type('HeaderSettingsLogo', [
        'description' => __('Header logo image', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'alt' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
        ],
    ]);

    // Register SocialLink type for repeater
    register_graphql_object_type('HeaderSettingsSocialLink', [
        'description' => __('Social media link', 'unident-acf-fields'),
        'fields' => [
            'name' => [
                'type' => 'String',
                'description' => __('Social network name', 'unident-acf-fields'),
            ],
            'icon' => [
                'type' => 'String',
                'description' => __('SVG icon code', 'unident-acf-fields'),
            ],
            'url' => [
                'type' => 'String',
                'description' => __('Social network URL', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register HeaderSettings type
    register_graphql_object_type('HeaderSettings', [
        'description' => __('Settings for the site header from ACF Option Page', 'unident-acf-fields'),
        'fields' => [
            'logoMode' => [
                'type' => 'String',
                'description' => __('Logo display mode: image or icon', 'unident-acf-fields'),
            ],
            'logo' => [
                'type' => 'HeaderSettingsLogo',
                'description' => __('Logo image', 'unident-acf-fields'),
            ],
            'logoIcon' => [
                'type' => 'String',
                'description' => __('Logo icon slug', 'unident-acf-fields'),
            ],
            'phone' => [
                'type' => 'String',
                'description' => __('Contact phone number', 'unident-acf-fields'),
            ],
            'phoneSchedule' => [
                'type' => 'String',
                'description' => __('Phone working hours schedule', 'unident-acf-fields'),
            ],
            'email' => [
                'type' => 'String',
                'description' => __('Contact email', 'unident-acf-fields'),
            ],
            'workingHours' => [
                'type' => 'HeaderSettingsWorkingHours',
                'description' => __('Working hours', 'unident-acf-fields'),
            ],
            'locationsCount' => [
                'type' => 'Int',
                'description' => __('Number of clinic locations', 'unident-acf-fields'),
            ],
            'doctorsCount' => [
                'type' => 'Int',
                'description' => __('Number of doctors', 'unident-acf-fields'),
            ],
            'featuredPromotion' => [
                'type' => 'Promotion',
                'description' => __('Featured promotion for header promo block', 'unident-acf-fields'),
            ],
            'featuredService' => [
                'type' => 'Service',
                'description' => __('Featured service for services dropdown menu', 'unident-acf-fields'),
            ],
            'socialLinks' => [
                'type' => ['list_of' => 'HeaderSettingsSocialLink'],
                'description' => __('Social media links', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register headerSettings field on RootQuery
    register_graphql_field('RootQuery', 'headerSettings', [
        'type' => 'HeaderSettings',
        'description' => __('Settings for the site header', 'unident-acf-fields'),
        'resolve' => function() {
            // Get ACF fields from options page
            // Note: For group fields, get_field() returns all subfields as array
            $phone = get_field('phone', 'options');
            $phone_schedule = get_field('phone_schedule', 'options');
            $email = get_field('email', 'options');
            $working_hours = get_field('working_hours', 'options');
            
            // Динамический подсчет количества клиник
            $clinics_count = wp_count_posts('clinics');
            $locations_count = isset($clinics_count->publish) ? (int) $clinics_count->publish : 0;
            
            // Динамический подсчет количества врачей
            $doctors_count = wp_count_posts('doctors');
            $doctors_total = isset($doctors_count->publish) ? (int) $doctors_count->publish : 0;
            
            $featured_promotion = get_field('featured_promotion', 'options');
            $featured_service = get_field('featured_service', 'options');
            $social_links = get_field('social_links', 'options');
            $logo_mode = get_field('logo_mode', 'options');
            $logo = get_field('logo', 'options');
            $logo_icon = get_field('logo_icon', 'options');

            // Fallback: get subfields directly if group doesn't work
            if (!$working_hours || empty($working_hours)) {
                $weekdays = get_field('working_hours_weekdays', 'options') ?: get_option('options_working_hours_weekdays');
                $weekend = get_field('working_hours_weekend', 'options') ?: get_option('options_working_hours_weekend');
                $working_hours = [
                    'weekdays' => $weekdays,
                    'weekend' => $weekend,
                ];
            }

            // Format social links for GraphQL
            $formatted_social_links = null;
            if ($social_links && is_array($social_links)) {
                $formatted_social_links = array_map(function($link) {
                    return [
                        'name' => $link['name'] ?? null,
                        'icon' => $link['icon'] ?? null, // SVG код напрямую
                        'url' => $link['url'] ?? null,
                    ];
                }, $social_links);
            }

            // Format logo for GraphQL
            $logo_formatted = null;
            if ($logo && is_array($logo) && !empty($logo['url'])) {
                $logo_formatted = [
                    'url' => $logo['url'] ?? null,
                    'alt' => $logo['alt'] ?? null,
                    'width' => isset($logo['width']) ? (int) $logo['width'] : null,
                    'height' => isset($logo['height']) ? (int) $logo['height'] : null,
                ];
            }

            return [
                'logoMode' => ($logo_mode === 'icon' || $logo_mode === 'image') ? $logo_mode : 'image',
                'logo' => $logo_formatted,
                'logoIcon' => $logo_icon ?: null,
                'phone' => $phone ?: null,
                'phoneSchedule' => $phone_schedule ?: null,
                'email' => $email ?: null,
                'workingHours' => ($working_hours && !empty(array_filter($working_hours))) ? [
                    'weekdays' => $working_hours['weekdays'] ?? null,
                    'weekend' => $working_hours['weekend'] ?? null,
                ] : null,
                'locationsCount' => $locations_count ? (int) $locations_count : null,
                'doctorsCount' => $doctors_total ? (int) $doctors_total : null,
                'featuredPromotion' => $featured_promotion ? \WPGraphQL\Data\DataSource::resolve_post_object($featured_promotion->ID, \WPGraphQL::get_app_context()) : null,
                'featuredService' => $featured_service ? \WPGraphQL\Data\DataSource::resolve_post_object($featured_service->ID, \WPGraphQL::get_app_context()) : null,
                'socialLinks' => $formatted_social_links,
            ];
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_header_settings_in_graphql');

/**
 * Manual GraphQL Registration для Main Page Settings Option Page
 * 
 * WPGraphQL ACF v2 НЕ ПОДДЕРЖИВАЕТ автоматическую регистрацию Option Pages!
 * Требуется manual registration
 */
function unident_register_mainpage_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Register HeroImage type для image field
    register_graphql_object_type('MainPageHeroImage', [
        'description' => __('Hero изображение для главной страницы', 'unident-acf-fields'),
        'fields' => [
            'url' => [
                'type' => 'String',
                'description' => __('URL изображения', 'unident-acf-fields'),
            ],
            'width' => [
                'type' => 'Int',
                'description' => __('Ширина изображения', 'unident-acf-fields'),
            ],
            'height' => [
                'type' => 'Int',
                'description' => __('Высота изображения', 'unident-acf-fields'),
            ],
            'alt' => [
                'type' => 'String',
                'description' => __('Alt текст изображения', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register MainPageCtaImage type для CTA изображений
    register_graphql_object_type('MainPageCtaImage', [
        'description' => __('Изображение для блока CTA', 'unident-acf-fields'),
        'fields' => [
            'url' => [
                'type' => 'String',
                'description' => __('URL изображения', 'unident-acf-fields'),
            ],
            'width' => [
                'type' => 'Int',
                'description' => __('Ширина изображения', 'unident-acf-fields'),
            ],
            'height' => [
                'type' => 'Int',
                'description' => __('Высота изображения', 'unident-acf-fields'),
            ],
            'alt' => [
                'type' => 'String',
                'description' => __('Alt текст изображения', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register MainPageReviewsSectionItem type для repeater в секции отзовики
    register_graphql_object_type('MainPageReviewsSectionItem', [
        'description' => __('Элемент секции отзовиков (рейтинг, изображение, текст)', 'unident-acf-fields'),
        'fields' => [
            'rating' => [
                'type' => 'Float',
                'description' => __('Рейтинг', 'unident-acf-fields'),
            ],
            'image' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Изображение элемента', 'unident-acf-fields'),
            ],
            'text' => [
                'type' => 'String',
                'description' => __('Текст элемента', 'unident-acf-fields'),
            ],
            'reviewsCount' => [
                'type' => 'Int',
                'description' => __('Количество отзывов', 'unident-acf-fields'),
            ],
            'link' => [
                'type' => 'String',
                'description' => __('Ссылка на источник отзывов', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register MainPageLicenseItem type для repeater лицензий
    register_graphql_object_type('MainPageLicenseItem', [
        'description' => __('Элемент секции лицензий (изображение, название, описание)', 'unident-acf-fields'),
        'fields' => [
            'image' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Изображение лицензии', 'unident-acf-fields'),
            ],
            'licenseTitle' => [
                'type' => 'String',
                'description' => __('Название лицензии', 'unident-acf-fields'),
            ],
            'textLicenzia' => [
                'type' => 'String',
                'description' => __('Описание лицензии (text-licenzia)', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register MainPageTrustedItem type для repeater секции «Нам доверили»
    register_graphql_object_type('MainPageTrustedItem', [
        'description' => __('Карточка секции «Нам доверили»', 'unident-acf-fields'),
        'fields' => [
            'number' => [
                'type' => 'String',
                'description' => __('Номер карточки (01, 02, 03…)', 'unident-acf-fields'),
            ],
            'title' => [
                'type' => 'String',
                'description' => __('Заголовок карточки', 'unident-acf-fields'),
            ],
            'description' => [
                'type' => 'String',
                'description' => __('Описание карточки', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register MainPagePreferenceItem type для repeater блока Преимущества (StatsBlock)
    register_graphql_object_type('MainPagePreferenceItem', [
        'description' => __('Карточка преимущества (StatsBlock)', 'unident-acf-fields'),
        'fields' => [
            'icon' => [
                'type' => 'String',
                'description' => __('Иконка (percent, ruble, installment)', 'unident-acf-fields'),
            ],
            'title' => [
                'type' => 'String',
                'description' => __('Заголовок карточки', 'unident-acf-fields'),
            ],
            'description' => [
                'type' => 'String',
                'description' => __('Описание карточки', 'unident-acf-fields'),
            ],
            'href' => [
                'type' => 'String',
                'description' => __('Ссылка карточки', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register MainPageHeroBadge type для repeater бейджей Hero
    register_graphql_object_type('MainPageHeroBadge', [
        'description' => __('Бейдж Hero-блока (текст)', 'unident-acf-fields'),
        'fields' => [
            'text' => [
                'type' => 'String',
                'description' => __('Текст бейджа', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register MainPageSettings type
    register_graphql_object_type('MainPageSettings', [
        'description' => __('Настройки главной страницы из ACF Option Page', 'unident-acf-fields'),
        'fields' => [
            'heroImage' => [
                'type' => 'MainPageHeroImage',
                'description' => __('Изображение для hero-блока', 'unident-acf-fields'),
            ],
            'heroVectorImage' => [
                'type' => 'MainPageHeroImage',
                'description' => __('Декоративный вектор на фоне hero-блока', 'unident-acf-fields'),
            ],
            'heroTitle' => [
                'type' => 'String',
                'description' => __('Заголовок hero-блока', 'unident-acf-fields'),
            ],
            'heroSubtitle' => [
                'type' => 'String',
                'description' => __('Подзаголовок hero-блока', 'unident-acf-fields'),
            ],
            'heroBadges' => [
                'type' => ['list_of' => 'MainPageHeroBadge'],
                'description' => __('Бейджи Hero-блока (динамический repeater)', 'unident-acf-fields'),
            ],
            'featuredAction' => [
                'type' => 'Promotion',
                'description' => __('Акция для главной страницы', 'unident-acf-fields'),
            ],
            'ctaTitle' => [
                'type' => 'String',
                'description' => __('Заголовок блока CTA', 'unident-acf-fields'),
            ],
            'ctaDescription' => [
                'type' => 'String',
                'description' => __('Описание блока CTA', 'unident-acf-fields'),
            ],
            'ctaPhone' => [
                'type' => 'String',
                'description' => __('Номер телефона для блока CTA', 'unident-acf-fields'),
            ],
            'ctaPrivacyText' => [
                'type' => 'String',
                'description' => __('Текст политики конфиденциальности для блока CTA', 'unident-acf-fields'),
            ],
            'ctaPrivacyLink' => [
                'type' => 'String',
                'description' => __('Ссылка на страницу политики конфиденциальности', 'unident-acf-fields'),
            ],
            'ctaDoctorImage' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Фото врача для блока CTA', 'unident-acf-fields'),
            ],
            'ctaBackgroundImage' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Фоновое изображение для блока CTA', 'unident-acf-fields'),
            ],
            'ctaDoctorImage2' => [
                'type' => 'MainPageCtaImage',
                'description' => __("The doctor's image for the second STA", 'unident-acf-fields'),
            ],
            'ctaDoctorImageMobile' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Фото врача CTA 1 (планшет и мобайл)', 'unident-acf-fields'),
            ],
            'ctaDoctorImage2Mobile' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Фото врача CTA 2 (планшет и мобайл)', 'unident-acf-fields'),
            ],
            'guidanceImage' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Изображение для раздела руководства', 'unident-acf-fields'),
            ],
            'guidanceContent' => [
                'type' => 'String',
                'description' => __('Контент руководства (WYSIWYG)', 'unident-acf-fields'),
            ],
            'guidanceManagerImage' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Изображение руководителя для руководства', 'unident-acf-fields'),
            ],
            'guidanceSubscribe' => [
                'type' => 'String',
                'description' => __('Фамилия и имя руководителя (WYSIWYG)', 'unident-acf-fields'),
            ],
            'guidancePositions' => [
                'type' => 'String',
                'description' => __('Должности руководства', 'unident-acf-fields'),
            ],
            'guidanceMediaImage' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Медиа изображение для руководства', 'unident-acf-fields'),
            ],
            'promotionsSectionTitle' => [
                'type' => 'String',
                'description' => __('Заголовок секции "Акции"', 'unident-acf-fields'),
            ],
            'promotionsSectionDescription' => [
                'type' => 'String',
                'description' => __('Описание секции "Акции"', 'unident-acf-fields'),
            ],
            'promotionsFallbackImage' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Фолбэк изображение для карточек акций без featured image', 'unident-acf-fields'),
            ],
            'reviewsSectionTitle' => [
                'type' => 'String',
                'description' => __('Заголовок секции отзовиков', 'unident-acf-fields'),
            ],
            'reviewsSectionContent' => [
                'type' => 'String',
                'description' => __('Контент секции отзовиков', 'unident-acf-fields'),
            ],
            'reviewsSectionImage' => [
                'type' => 'MainPageCtaImage',
                'description' => __('Изображение секции отзовиков', 'unident-acf-fields'),
            ],
            'reviewsSectionMediumRating' => [
                'type' => 'String',
                'description' => __('Средний рейтинг', 'unident-acf-fields'),
            ],
            'reviewsSectionBasis' => [
                'type' => 'String',
                'description' => __('Основание для рейтинга', 'unident-acf-fields'),
            ],
            'reviewsSectionItems' => [
                'type' => ['list_of' => 'MainPageReviewsSectionItem'],
                'description' => __('Элементы секции отзовиков', 'unident-acf-fields'),
            ],
            'licensesSectionTitle' => [
                'type' => 'String',
                'description' => __('Заголовок секции лицензий', 'unident-acf-fields'),
            ],
            'licensee' => [
                'type' => ['list_of' => 'MainPageLicenseItem'],
                'description' => __('Лицензии (repeater)', 'unident-acf-fields'),
            ],
            'preferencesItems' => [
                'type' => ['list_of' => 'MainPagePreferenceItem'],
                'description' => __('Карточки блока Преимущества (StatsBlock)', 'unident-acf-fields'),
            ],
            'trustedTitle' => [
                'type' => 'String',
                'description' => __('Заголовок секции «Нам доверили»', 'unident-acf-fields'),
            ],
            'trustedDescription' => [
                'type' => 'String',
                'description' => __('Описание секции «Нам доверили» (HTML из WYSIWYG)', 'unident-acf-fields'),
            ],
            'trustedItems' => [
                'type' => ['list_of' => 'MainPageTrustedItem'],
                'description' => __('Карточки секции «Нам доверили»', 'unident-acf-fields'),
            ],
            'trustedColumns' => [
                'type' => 'Int',
                'description' => __('Колонок на десктопе (1–4)', 'unident-acf-fields'),
            ],
            'clinicsMapTitle' => [
                'type' => 'String',
                'description' => __('Заголовок секции «Клиники на карте»', 'unident-acf-fields'),
            ],
            'selectedPromotion' => [
                'type' => 'Promotion',
                'description' => __('Выбранная акция для блока цен (Block 10)', 'unident-acf-fields'),
            ],
            'blockPriceTitle' => [
                'type' => 'String',
                'description' => __('Заголовок блока цен', 'unident-acf-fields'),
            ],
            'selectedServicesBlockPrice' => [
                'type' => ['list_of' => 'Service'],
                'description' => __('Выбранные услуги для блока цен', 'unident-acf-fields'),
            ],
        ],
    ]);

    // Register mainPageSettings field on RootQuery
    register_graphql_field('RootQuery', 'mainPageSettings', [
        'type' => 'MainPageSettings',
        'description' => __('Настройки главной страницы', 'unident-acf-fields'),
        'resolve' => function() {
            // Get ACF fields from options page
            // ВАЖНО: используем 'mainpage_options' как post_id (указан в acf_add_options_page)
            $hero_image = get_field('hero_image', 'mainpage_options');
            $hero_vector_image = get_field('hero_vector_image', 'mainpage_options');
            $hero_title = get_field('hero_title', 'mainpage_options');
            $hero_subtitle = get_field('hero_subtitle', 'mainpage_options');
            $hero_badges = get_field('hero_badges', 'mainpage_options');
            $featured_action = get_field('featured_action', 'mainpage_options');
            
            // CTA fields
            $cta_title = get_field('cta_title', 'mainpage_options');
            $cta_description = get_field('cta_description', 'mainpage_options');
            $cta_phone = get_field('cta_phone', 'mainpage_options');
            $cta_privacy_text = get_field('cta_privacy_text', 'mainpage_options');
            $cta_privacy_link = get_field('cta_privacy_link', 'mainpage_options');
            $cta_doctor_image = get_field('cta_doctor_image', 'mainpage_options');
            $cta_background_image = get_field('cta_background_image', 'mainpage_options');
            $cta_doctor_image_2 = get_field('cta_doctor_image_2', 'mainpage_options');
            $cta_doctor_image_mobile = get_field('cta_doctor_image_mobile', 'mainpage_options');
            $cta_doctor_image_2_mobile = get_field('cta_doctor_image_2_mobile', 'mainpage_options');
            
            // Guidance fields
            $guidance_image = get_field('guidance_image', 'mainpage_options');
            $guidance_content = get_field('guidance_content', 'mainpage_options');
            $guidance_manager_image = get_field('guidance_manager_image', 'mainpage_options');
            $guidance_subscribe = get_field('guidance_subscribe', 'mainpage_options');
            $guidance_positions = get_field('guidance_positions', 'mainpage_options');
            $guidance_media_image = get_field('guidance_media_image', 'mainpage_options');
            
            // Promotions Section fields
            $promotions_section_title = get_field('promotions_section_title', 'mainpage_options');
            $promotions_section_description = get_field('promotions_section_description', 'mainpage_options');
            $promotions_fallback_image = get_field('promotions_fallback_image', 'mainpage_options');

            // Reviews Section fields (Секция отзовики)
            $reviews_section_title = get_field('reviews_section_title', 'mainpage_options');
            $reviews_section_content = get_field('reviews_section_content', 'mainpage_options');
            $reviews_section_image = get_field('reviews_section_image', 'mainpage_options');
            $reviews_section_medium_rating = get_field('reviews_section_medium_rating', 'mainpage_options');
            $reviews_section_basis = get_field('reviews_section_basis', 'mainpage_options');
            $reviews_section_items = get_field('reviews_section_items', 'mainpage_options');

            // Licenses Section fields (Лицензии)
            $licenses_section_title = get_field('licenses_section_title', 'mainpage_options');
            $licensee = get_field('licensee', 'mainpage_options');

            // Preferences block (Преимущества / StatsBlock)
            $preferences_items = get_field('preferences_items', 'mainpage_options');

            // Trusted section (Нам доверили)
            $trusted_title = get_field('trusted_title', 'mainpage_options');
            $trusted_description = get_field('trusted_description', 'mainpage_options');
            $trusted_items = get_field('trusted_items', 'mainpage_options');
            $trusted_columns = get_field('trusted_columns', 'mainpage_options');

            // Карта (секция «Клиники на карте»)
            $clinics_map_title = get_field('clinics_map_title', 'mainpage_options');

            // Блок цен
            $selected_promotion_block10 = get_field('selected_promotion_block10', 'mainpage_options');
            $block_price_title = get_field('block_price_title', 'mainpage_options');
            $selected_services_block_price_raw = get_field('selected_services_block_price', 'mainpage_options');

            // Resolve selected_services_block_price для GraphQL (WP_Post[] → Service[])
            $selected_services_block_price = null;
            if ($selected_services_block_price_raw && is_array($selected_services_block_price_raw)) {
                $context = \WPGraphQL::get_app_context();
                $selected_services_block_price = array_values(array_filter(array_map(
                    function ($p) use ($context) {
                        return $p instanceof \WP_Post
                            ? \WPGraphQL\Data\DataSource::resolve_post_object($p->ID, $context)
                            : null;
                    },
                    $selected_services_block_price_raw
                )));
            }

            // Format hero image (null if empty or no url — не экспортировать пустое)
            $formatted_hero_image = null;
            if ($hero_image && is_array($hero_image) && !empty($hero_image['url'])) {
                $formatted_hero_image = [
                    'url' => $hero_image['url'] ?? null,
                    'width' => isset($hero_image['width']) ? (int) $hero_image['width'] : null,
                    'height' => isset($hero_image['height']) ? (int) $hero_image['height'] : null,
                    'alt' => $hero_image['alt'] ?? null,
                ];
            }

            // Format hero vector image (null if empty — не экспортировать пустое)
            $formatted_hero_vector_image = null;
            if ($hero_vector_image && is_array($hero_vector_image) && !empty($hero_vector_image['url'])) {
                $formatted_hero_vector_image = [
                    'url' => $hero_vector_image['url'] ?? null,
                    'width' => isset($hero_vector_image['width']) ? (int) $hero_vector_image['width'] : null,
                    'height' => isset($hero_vector_image['height']) ? (int) $hero_vector_image['height'] : null,
                    'alt' => $hero_vector_image['alt'] ?? null,
                ];
            }

            // Format CTA images
            $formatted_cta_doctor_image = null;
            if ($cta_doctor_image && is_array($cta_doctor_image)) {
                $formatted_cta_doctor_image = [
                    'url' => $cta_doctor_image['url'] ?? null,
                    'width' => isset($cta_doctor_image['width']) ? (int) $cta_doctor_image['width'] : null,
                    'height' => isset($cta_doctor_image['height']) ? (int) $cta_doctor_image['height'] : null,
                    'alt' => $cta_doctor_image['alt'] ?? null,
                ];
            }

            $formatted_cta_background_image = null;
            if ($cta_background_image && is_array($cta_background_image)) {
                $formatted_cta_background_image = [
                    'url' => $cta_background_image['url'] ?? null,
                    'width' => isset($cta_background_image['width']) ? (int) $cta_background_image['width'] : null,
                    'height' => isset($cta_background_image['height']) ? (int) $cta_background_image['height'] : null,
                    'alt' => $cta_background_image['alt'] ?? null,
                ];
            }

            $formatted_cta_doctor_image_2 = null;
            if ($cta_doctor_image_2 && is_array($cta_doctor_image_2)) {
                $formatted_cta_doctor_image_2 = [
                    'url' => $cta_doctor_image_2['url'] ?? null,
                    'width' => isset($cta_doctor_image_2['width']) ? (int) $cta_doctor_image_2['width'] : null,
                    'height' => isset($cta_doctor_image_2['height']) ? (int) $cta_doctor_image_2['height'] : null,
                    'alt' => $cta_doctor_image_2['alt'] ?? null,
                ];
            }

            $formatted_cta_doctor_image_mobile = null;
            if ($cta_doctor_image_mobile && is_array($cta_doctor_image_mobile)) {
                $formatted_cta_doctor_image_mobile = [
                    'url' => $cta_doctor_image_mobile['url'] ?? null,
                    'width' => isset($cta_doctor_image_mobile['width']) ? (int) $cta_doctor_image_mobile['width'] : null,
                    'height' => isset($cta_doctor_image_mobile['height']) ? (int) $cta_doctor_image_mobile['height'] : null,
                    'alt' => $cta_doctor_image_mobile['alt'] ?? null,
                ];
            }

            $formatted_cta_doctor_image_2_mobile = null;
            if ($cta_doctor_image_2_mobile && is_array($cta_doctor_image_2_mobile)) {
                $formatted_cta_doctor_image_2_mobile = [
                    'url' => $cta_doctor_image_2_mobile['url'] ?? null,
                    'width' => isset($cta_doctor_image_2_mobile['width']) ? (int) $cta_doctor_image_2_mobile['width'] : null,
                    'height' => isset($cta_doctor_image_2_mobile['height']) ? (int) $cta_doctor_image_2_mobile['height'] : null,
                    'alt' => $cta_doctor_image_2_mobile['alt'] ?? null,
                ];
            }

            // Format Guidance images
            $formatted_guidance_image = null;
            if ($guidance_image && is_array($guidance_image)) {
                $formatted_guidance_image = [
                    'url' => $guidance_image['url'] ?? null,
                    'width' => isset($guidance_image['width']) ? (int) $guidance_image['width'] : null,
                    'height' => isset($guidance_image['height']) ? (int) $guidance_image['height'] : null,
                    'alt' => $guidance_image['alt'] ?? null,
                ];
            }

            $formatted_guidance_manager_image = null;
            if ($guidance_manager_image && is_array($guidance_manager_image)) {
                $formatted_guidance_manager_image = [
                    'url' => $guidance_manager_image['url'] ?? null,
                    'width' => isset($guidance_manager_image['width']) ? (int) $guidance_manager_image['width'] : null,
                    'height' => isset($guidance_manager_image['height']) ? (int) $guidance_manager_image['height'] : null,
                    'alt' => $guidance_manager_image['alt'] ?? null,
                ];
            }

            $formatted_guidance_media_image = null;
            if ($guidance_media_image && is_array($guidance_media_image)) {
                $formatted_guidance_media_image = [
                    'url' => $guidance_media_image['url'] ?? null,
                    'width' => isset($guidance_media_image['width']) ? (int) $guidance_media_image['width'] : null,
                    'height' => isset($guidance_media_image['height']) ? (int) $guidance_media_image['height'] : null,
                    'alt' => $guidance_media_image['alt'] ?? null,
                ];
            }

            // Format Promotions fallback image
            $formatted_promotions_fallback_image = null;
            if ($promotions_fallback_image && is_array($promotions_fallback_image)) {
                $formatted_promotions_fallback_image = [
                    'url' => $promotions_fallback_image['url'] ?? null,
                    'width' => isset($promotions_fallback_image['width']) ? (int) $promotions_fallback_image['width'] : null,
                    'height' => isset($promotions_fallback_image['height']) ? (int) $promotions_fallback_image['height'] : null,
                    'alt' => $promotions_fallback_image['alt'] ?? null,
                ];
            }

            // Format Reviews Section image
            $formatted_reviews_section_image = null;
            if ($reviews_section_image && is_array($reviews_section_image)) {
                $formatted_reviews_section_image = [
                    'url' => $reviews_section_image['url'] ?? null,
                    'width' => isset($reviews_section_image['width']) ? (int) $reviews_section_image['width'] : null,
                    'height' => isset($reviews_section_image['height']) ? (int) $reviews_section_image['height'] : null,
                    'alt' => $reviews_section_image['alt'] ?? null,
                ];
            }

            // Format Reviews Section repeater items
            $formatted_reviews_section_items = null;
            if ($reviews_section_items && is_array($reviews_section_items)) {
                $formatted_reviews_section_items = array_map(function ($item) {
                    $item_image = $item['image'] ?? null;
                    $formatted_image = null;
                    if ($item_image && is_array($item_image)) {
                        $formatted_image = [
                            'url' => $item_image['url'] ?? null,
                            'width' => isset($item_image['width']) ? (int) $item_image['width'] : null,
                            'height' => isset($item_image['height']) ? (int) $item_image['height'] : null,
                            'alt' => $item_image['alt'] ?? null,
                        ];
                    }
                    return [
                        'rating' => isset($item['rating']) ? (float) $item['rating'] : null,
                        'image' => $formatted_image,
                        'text' => $item['text'] ?? null,
                        'reviewsCount' => isset($item['reviews_count']) ? (int) $item['reviews_count'] : null,
                        'link' => $item['link'] ?? null,
                    ];
                }, $reviews_section_items);
            }

            // Format Licensee repeater items
            $formatted_licensee = null;
            if ($licensee && is_array($licensee)) {
                $formatted_licensee = array_map(function ($item) {
                    $item_image = $item['license_image'] ?? null;
                    $formatted_image = null;
                    if ($item_image && is_array($item_image)) {
                        $formatted_image = [
                            'url' => $item_image['url'] ?? null,
                            'width' => isset($item_image['width']) ? (int) $item_image['width'] : null,
                            'height' => isset($item_image['height']) ? (int) $item_image['height'] : null,
                            'alt' => $item_image['alt'] ?? null,
                        ];
                    }
                    return [
                        'image' => $formatted_image,
                        'licenseTitle' => $item['license_title'] ?? null,
                        'textLicenzia' => $item['text_licenzia'] ?? null,
                    ];
                }, $licensee);
            }

            // Format Preferences repeater items
            $formatted_preferences_items = null;
            if ($preferences_items && is_array($preferences_items)) {
                $formatted_preferences_items = array_map(function ($item) {
                    return [
                        'icon' => $item['icon'] ?? null,
                        'title' => $item['title'] ?? null,
                        'description' => $item['description'] ?? null,
                        'href' => $item['href'] ?? null,
                    ];
                }, $preferences_items);
            }

            // Format Trusted section repeater items
            $formatted_trusted_items = null;
            if ($trusted_items && is_array($trusted_items)) {
                $formatted_trusted_items = array_map(function ($item) {
                    return [
                        'number' => $item['number'] ?? null,
                        'title' => $item['title'] ?? null,
                        'description' => $item['description'] ?? null,
                    ];
                }, $trusted_items);
            }

            // Trusted columns: ACF select returns string '1'–'4', cast to int for GraphQL
            $trusted_columns_val = null;
            if ($trusted_columns !== null && $trusted_columns !== '') {
                $trusted_columns_val = (int) $trusted_columns;
                if ($trusted_columns_val < 1 || $trusted_columns_val > 4) {
                    $trusted_columns_val = 3;
                }
            }

            // Hero block: null если пусто — не экспортировать (trim для строк)
            $hero_title_val = is_string($hero_title) ? trim($hero_title) : '';
            $hero_subtitle_val = is_string($hero_subtitle) ? trim($hero_subtitle) : '';

            // Hero badges: только заполненные элементы
            $formatted_hero_badges = null;
            if ($hero_badges && is_array($hero_badges)) {
                $filtered = array_filter($hero_badges, function ($item) {
                    $text = isset($item['text']) ? trim((string) $item['text']) : '';
                    return $text !== '';
                });
                if (!empty($filtered)) {
                    $formatted_hero_badges = array_map(function ($item) {
                        return ['text' => trim((string) ($item['text'] ?? ''))];
                    }, $filtered);
                }
            }

            return [
                'heroImage' => $formatted_hero_image,
                'heroVectorImage' => $formatted_hero_vector_image,
                'heroTitle' => $hero_title_val !== '' ? $hero_title_val : null,
                'heroSubtitle' => $hero_subtitle_val !== '' ? $hero_subtitle_val : null,
                'heroBadges' => $formatted_hero_badges,
                'featuredAction' => $featured_action 
                    ? \WPGraphQL\Data\DataSource::resolve_post_object($featured_action->ID, \WPGraphQL::get_app_context()) 
                    : null,
                'ctaTitle' => $cta_title ?: null,
                'ctaDescription' => $cta_description ?: null,
                'ctaPhone' => $cta_phone ?: null,
                'ctaPrivacyText' => $cta_privacy_text ?: null,
                'ctaPrivacyLink' => unident_parse_cta_privacy_link($cta_privacy_link),
                'ctaDoctorImage' => $formatted_cta_doctor_image,
                'ctaBackgroundImage' => $formatted_cta_background_image,
                'ctaDoctorImage2' => $formatted_cta_doctor_image_2,
                'ctaDoctorImageMobile' => $formatted_cta_doctor_image_mobile,
                'ctaDoctorImage2Mobile' => $formatted_cta_doctor_image_2_mobile,
                'guidanceImage' => $formatted_guidance_image,
                'guidanceContent' => $guidance_content ?: null,
                'guidanceManagerImage' => $formatted_guidance_manager_image,
                'guidanceSubscribe' => $guidance_subscribe ?: null,
                'guidancePositions' => $guidance_positions ?: null,
                'guidanceMediaImage' => $formatted_guidance_media_image,
                'promotionsSectionTitle' => $promotions_section_title ?: null,
                'promotionsSectionDescription' => $promotions_section_description ?: null,
                'promotionsFallbackImage' => $formatted_promotions_fallback_image,
                'reviewsSectionTitle' => $reviews_section_title ?: null,
                'reviewsSectionContent' => $reviews_section_content ?: null,
                'reviewsSectionImage' => $formatted_reviews_section_image,
                'reviewsSectionMediumRating' => $reviews_section_medium_rating ?: null,
                'reviewsSectionBasis' => $reviews_section_basis ?: null,
                'reviewsSectionItems' => $formatted_reviews_section_items,
                'licensesSectionTitle' => $licenses_section_title ?: null,
                'licensee' => $formatted_licensee,
                'preferencesItems' => $formatted_preferences_items,
                'trustedTitle' => $trusted_title ?: null,
                'trustedDescription' => $trusted_description ?: null,
                'trustedItems' => $formatted_trusted_items,
                'trustedColumns' => $trusted_columns_val,
                'clinicsMapTitle' => $clinics_map_title ?: 'Наши клиники на карте Москвы',
                'selectedPromotion' => $selected_promotion_block10
                    ? \WPGraphQL\Data\DataSource::resolve_post_object($selected_promotion_block10->ID, \WPGraphQL::get_app_context())
                    : null,
                'blockPriceTitle' => $block_price_title,
                'selectedServicesBlockPrice' => $selected_services_block_price,
            ];
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_mainpage_settings_in_graphql');

/**
 * Manual GraphQL Registration для Contacts Settings Option Page
 * 
 * WPGraphQL ACF v2 НЕ ПОДДЕРЖИВАЕТ автоматическую регистрацию Option Pages!
 * Требуется manual registration
 */
function unident_register_contacts_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Register SocialContact type (same structure as HeaderSettingsSocialLink)
    register_graphql_object_type('ContactsSocialContact', [
        'description' => __('Социальная сеть (Telegram, WhatsApp и др.)', 'unident-acf-fields'),
        'fields' => [
            'name' => ['type' => 'String'],
            'icon' => ['type' => 'String'],
            'url'  => ['type' => 'String'],
        ],
    ]);

    // Register AdvantageItem type
    register_graphql_object_type('ContactsAdvantageItem', [
        'description' => __('Карточка преимущества', 'unident-acf-fields'),
        'fields' => [
            'icon'        => ['type' => 'String'],
            'title'       => ['type' => 'String'],
            'description' => ['type' => 'String'],
        ],
    ]);

    // Register BannerImage type
    register_graphql_object_type('ContactsBannerImage', [
        'description' => __('Изображение баннера', 'unident-acf-fields'),
        'fields' => [
            'url'    => ['type' => 'String'],
            'width'  => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
        ],
    ]);

    // Register BannerData type
    register_graphql_object_type('ContactsBannerData', [
        'description' => __('Данные баннера контактов', 'unident-acf-fields'),
        'fields' => [
            'heading'    => ['type' => 'String'],
            'description'=> ['type' => 'String'],
            'buttonText' => ['type' => 'String'],
            'buttonUrl'  => ['type' => 'String'],
            'logo'       => ['type' => 'ContactsBannerImage'],
            'image'      => ['type' => 'ContactsBannerImage'],
        ],
    ]);

    // Register ContactsSettings type (all fields)
    register_graphql_object_type('ContactsSettings', [
        'description' => __('Контакты сайта из ACF Option Page', 'unident-acf-fields'),
        'fields' => [
            'email'          => ['type' => 'String'],
            'phone'          => ['type' => 'String'],
            'socialContacts' => ['type' => ['list_of' => 'ContactsSocialContact']],
            'mapTitle'       => ['type' => 'String'],
            'advTitle'       => ['type' => 'String'],
            'advDescription' => ['type' => 'String'],
            'advItems'       => ['type' => ['list_of' => 'ContactsAdvantageItem']],
            'banner'         => ['type' => 'ContactsBannerData'],
        ],
    ]);

    // Register contactsSettings field on RootQuery
    register_graphql_field('RootQuery', 'contactsSettings', [
        'type' => 'ContactsSettings',
        'description' => __('Контакты сайта', 'unident-acf-fields'),
        'resolve' => function() {
            $pid = 'contacts_options';

            $email            = get_field('email', $pid);
            $phone            = get_field('phone', $pid);
            $social_contacts  = get_field('social_contacts', $pid);
            $map_title        = get_field('contacts_map_title', $pid);
            $adv_title        = get_field('contacts_adv_title', $pid);
            $adv_description  = get_field('contacts_adv_description', $pid);
            $adv_items        = get_field('contacts_adv_items', $pid);
            $banner_heading   = get_field('contacts_banner_heading', $pid);
            $banner_desc      = get_field('contacts_banner_description', $pid);
            $banner_btn_text  = get_field('contacts_banner_button_text', $pid);
            $banner_btn_url   = get_field('contacts_banner_button_url', $pid);
            $banner_logo      = get_field('contacts_banner_logo', $pid);
            $banner_image     = get_field('contacts_banner_image', $pid);

            $formatted_socials = [];
            if (is_array($social_contacts)) {
                foreach ($social_contacts as $c) {
                    $formatted_socials[] = [
                        'name' => $c['name'] ?? null,
                        'icon' => $c['icon'] ?? null,
                        'url'  => $c['url'] ?? null,
                    ];
                }
            }

            $formatted_adv_items = [];
            if (is_array($adv_items)) {
                foreach ($adv_items as $item) {
                    $formatted_adv_items[] = [
                        'icon'        => $item['icon']             ?? null,
                        'title'       => $item['item_title']       ?? null,
                        'description' => $item['item_description'] ?? null,
                    ];
                }
            }

            $format_image = function($img) {
                if (!is_array($img) || empty($img['url'])) return null;
                return [
                    'url'    => $img['url'],
                    'width'  => $img['width']  ?? null,
                    'height' => $img['height'] ?? null,
                ];
            };

            return [
                'email'          => $email ?: null,
                'phone'          => $phone ?: null,
                'socialContacts' => !empty($formatted_socials) ? $formatted_socials : null,
                'mapTitle'       => $map_title ?: null,
                'advTitle'       => $adv_title ?: null,
                'advDescription' => $adv_description ?: null,
                'advItems'       => !empty($formatted_adv_items) ? $formatted_adv_items : null,
                'banner'         => [
                    'heading'     => $banner_heading  ?: null,
                    'description' => $banner_desc     ?: null,
                    'buttonText'  => $banner_btn_text ?: null,
                    'buttonUrl'   => $banner_btn_url  ?: null,
                    'logo'        => $format_image($banner_logo),
                    'image'       => $format_image($banner_image),
                ],
            ];
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_contacts_settings_in_graphql');

/**
 * Block Prices Settings — GraphQL поле blockPricesSettings удалено.
 * selectedPromotion теперь в mainPageSettings (Main Page Settings).
 */

/**
 * Manual GraphQL Registration для Price Archive Settings Option Page
 *
 * Страница /prices: описание, преимущества, PDF, акции, CTA блок.
 */
function unident_register_price_archive_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_object_type('PriceArchiveAdvantageImage', [
        'description' => __('Изображение преимущества архива цен', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('PriceArchiveAdvantage', [
        'description' => __('Преимущество на странице цен', 'unident-acf-fields'),
        'fields' => [
            'headline' => ['type' => 'String'],
            'image' => ['type' => 'PriceArchiveAdvantageImage'],
        ],
    ]);

    register_graphql_object_type('PriceArchivePdf', [
        'description' => __('PDF прайс-лист', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'id' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('PriceArchiveCtaImage', [
        'description' => __('Изображение CTA архива цен', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('PriceArchiveSettings', [
        'description' => __('Настройки архива цен (страница /prices)', 'unident-acf-fields'),
        'fields' => [
            'showAverageInCity' => ['type' => 'Boolean', 'description' => __('Показывать колонку «Средняя в городе»', 'unident-acf-fields')],
            'pricePageDescription' => ['type' => 'String', 'description' => __('Описание страницы', 'unident-acf-fields')],
            'advantages' => ['type' => ['list_of' => 'PriceArchiveAdvantage'], 'description' => __('Преимущества', 'unident-acf-fields')],
            'selectedPromotions' => ['type' => ['list_of' => 'PriceArchivePromotion'], 'description' => __('Выбранные акции', 'unident-acf-fields')],
            'priceListPdf' => ['type' => 'PriceArchivePdf', 'description' => __('PDF прайс-лист', 'unident-acf-fields')],
            'ctaTitle' => ['type' => 'String', 'description' => __('Заголовок CTA', 'unident-acf-fields')],
            'ctaDescription' => ['type' => 'String', 'description' => __('Описание CTA', 'unident-acf-fields')],
            'ctaPhone' => ['type' => 'String', 'description' => __('Телефон CTA', 'unident-acf-fields')],
            'ctaPrivacyText' => ['type' => 'String', 'description' => __('Текст политики', 'unident-acf-fields')],
            'ctaPrivacyLink' => ['type' => 'String', 'description' => __('Ссылка на политику конфиденциальности', 'unident-acf-fields')],
            'ctaDoctorImage' => ['type' => 'PriceArchiveCtaImage', 'description' => __('Изображение врача CTA', 'unident-acf-fields')],
        ],
    ]);

    register_graphql_object_type('PriceArchivePromotion', [
        'description' => __('Акция на странице цен', 'unident-acf-fields'),
        'fields' => [
            'id' => ['type' => 'String'],
            'databaseId' => ['type' => 'Int'],
        ],
    ]);

    register_graphql_field('RootQuery', 'priceArchiveSettings', [
        'type' => 'PriceArchiveSettings',
        'description' => __('Настройки архива цен', 'unident-acf-fields'),
        'resolve' => function() {
            $post_id = 'price_archive_options';

            $format_image = function($img) {
                if (!$img || !is_array($img)) {
                    return null;
                }
                return [
                    'url' => $img['url'] ?? null,
                    'width' => isset($img['width']) ? (int) $img['width'] : null,
                    'height' => isset($img['height']) ? (int) $img['height'] : null,
                    'alt' => $img['alt'] ?? null,
                ];
            };

            $advantages_raw = get_field('advantages', $post_id);
            $advantages = null;
            if ($advantages_raw && is_array($advantages_raw)) {
                $advantages = array_map(function($row) use ($format_image) {
                    return [
                        'headline' => $row['headline'] ?? null,
                        'image' => $format_image($row['image'] ?? null),
                    ];
                }, $advantages_raw);
            }

            $promotions_raw = get_field('selected_promotions', $post_id);
            $promotions = null;
            if ($promotions_raw && is_array($promotions_raw)) {
                $promotions = array_map(function($post) {
                    return [
                        'id' => base64_encode('post:' . $post->ID),
                        'databaseId' => (int) $post->ID,
                    ];
                }, $promotions_raw);
            }

            $pdf = get_field('price_list_pdf', $post_id);
            $pdf_data = null;
            if ($pdf && is_array($pdf)) {
                $pdf_data = [
                    'url' => $pdf['url'] ?? null,
                    'id' => isset($pdf['ID']) ? (string) $pdf['ID'] : null,
                ];
            }

            $show_average = get_field('show_average_in_city', $post_id);
            $show_average_in_city = ($show_average === false || $show_average === 0 || $show_average === '0') ? false : true;

            return [
                'showAverageInCity' => $show_average_in_city,
                'pricePageDescription' => get_field('price_page_description', $post_id) ?: null,
                'advantages' => $advantages,
                'selectedPromotions' => $promotions,
                'priceListPdf' => $pdf_data,
                'ctaTitle' => get_field('cta_title', $post_id) ?: null,
                'ctaDescription' => get_field('cta_description', $post_id) ?: null,
                'ctaPhone' => get_field('cta_phone', $post_id) ?: null,
                'ctaPrivacyText' => get_field('cta_privacy_text', $post_id) ?: null,
                'ctaPrivacyLink' => unident_parse_cta_privacy_link(get_field('cta_privacy_link', $post_id)),
                'ctaDoctorImage' => $format_image(get_field('cta_doctor_image', $post_id)),
            ];
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_price_archive_settings_in_graphql');

function unident_parse_cta_privacy_link($val) {
    if (!$val) return null;
    if (is_string($val) && $val !== '') return $val;
    if (is_array($val) && !empty($val['url'])) return $val['url'];
    return null;
}

/**
 * Manual GraphQL Registration для Actions Archive Settings Option Page
 *
 * Страница /promotions: описание, преимущества, CTA блок (без PDF и акций).
 */
function unident_register_actions_archive_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_object_type('ActionsArchiveAdvantageImage', [
        'description' => __('Изображение преимущества архива акций', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('ActionsArchiveAdvantage', [
        'description' => __('Преимущество на странице акций', 'unident-acf-fields'),
        'fields' => [
            'headline' => ['type' => 'String'],
            'image' => ['type' => 'ActionsArchiveAdvantageImage'],
        ],
    ]);

    register_graphql_object_type('ActionsArchiveCtaImage', [
        'description' => __('Изображение CTA архива акций', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('ActionsArchiveSettings', [
        'description' => __('Настройки архива акций (страница /promotions)', 'unident-acf-fields'),
        'fields' => [
            'actionPageDescription' => ['type' => 'String', 'description' => __('Описание страницы', 'unident-acf-fields')],
            'advantages' => ['type' => ['list_of' => 'ActionsArchiveAdvantage'], 'description' => __('Преимущества', 'unident-acf-fields')],
            'ctaTitle' => ['type' => 'String', 'description' => __('Заголовок CTA', 'unident-acf-fields')],
            'ctaDescription' => ['type' => 'String', 'description' => __('Описание CTA', 'unident-acf-fields')],
            'ctaPhone' => ['type' => 'String', 'description' => __('Телефон CTA', 'unident-acf-fields')],
            'ctaPrivacyText' => ['type' => 'String', 'description' => __('Текст политики', 'unident-acf-fields')],
            'ctaPrivacyLink' => ['type' => 'String', 'description' => __('Ссылка на политику конфиденциальности', 'unident-acf-fields')],
            'ctaDoctorImage' => ['type' => 'ActionsArchiveCtaImage', 'description' => __('Изображение врача CTA', 'unident-acf-fields')],
        ],
    ]);

    register_graphql_field('RootQuery', 'actionsArchiveSettings', [
        'type' => 'ActionsArchiveSettings',
        'description' => __('Настройки архива акций', 'unident-acf-fields'),
        'resolve' => function() {
            $post_id = 'actions_archive_options';

            $format_image = function($img) {
                if (!$img || !is_array($img)) {
                    return null;
                }
                return [
                    'url' => $img['url'] ?? null,
                    'width' => isset($img['width']) ? (int) $img['width'] : null,
                    'height' => isset($img['height']) ? (int) $img['height'] : null,
                    'alt' => $img['alt'] ?? null,
                ];
            };

            $advantages_raw = get_field('advantages', $post_id);
            $advantages = null;
            if ($advantages_raw && is_array($advantages_raw)) {
                $advantages = array_map(function($row) use ($format_image) {
                    return [
                        'headline' => $row['headline'] ?? null,
                        'image' => $format_image($row['image'] ?? null),
                    ];
                }, $advantages_raw);
            }

            return [
                'actionPageDescription' => get_field('action_page_description', $post_id) ?: null,
                'advantages' => $advantages,
                'ctaTitle' => get_field('cta_title', $post_id) ?: null,
                'ctaDescription' => get_field('cta_description', $post_id) ?: null,
                'ctaPhone' => get_field('cta_phone', $post_id) ?: null,
                'ctaPrivacyText' => get_field('cta_privacy_text', $post_id) ?: null,
                'ctaPrivacyLink' => unident_parse_cta_privacy_link(get_field('cta_privacy_link', $post_id)),
                'ctaDoctorImage' => $format_image(get_field('cta_doctor_image', $post_id)),
            ];
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_actions_archive_settings_in_graphql');

/**
 * Manual GraphQL Registration для Our Works Archive Settings Option Page
 *
 * Страница /our-works — описание, преимущества, CTA блок.
 */
function unident_register_our_works_archive_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_object_type('OurWorksArchiveAdvantageImage', [
        'description' => __('Изображение преимущества архива наших работ', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('OurWorksArchiveAdvantage', [
        'description' => __('Преимущество на странице наших работ', 'unident-acf-fields'),
        'fields' => [
            'headline' => ['type' => 'String'],
            'image' => ['type' => 'OurWorksArchiveAdvantageImage'],
        ],
    ]);

    register_graphql_object_type('OurWorksArchiveCtaImage', [
        'description' => __('Изображение CTA архива наших работ', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('OurWorksArchiveSettings', [
        'description' => __('Настройки архива наших работ (страница /our-works)', 'unident-acf-fields'),
        'fields' => [
            'actionPageDescription' => ['type' => 'String', 'description' => __('Описание страницы', 'unident-acf-fields')],
            'advantages' => ['type' => ['list_of' => 'OurWorksArchiveAdvantage'], 'description' => __('Преимущества', 'unident-acf-fields')],
            'ctaTitle' => ['type' => 'String', 'description' => __('Заголовок CTA', 'unident-acf-fields')],
            'ctaDescription' => ['type' => 'String', 'description' => __('Описание CTA', 'unident-acf-fields')],
            'ctaPhone' => ['type' => 'String', 'description' => __('Телефон CTA', 'unident-acf-fields')],
            'ctaPrivacyText' => ['type' => 'String', 'description' => __('Текст политики', 'unident-acf-fields')],
            'ctaPrivacyLink' => ['type' => 'String', 'description' => __('Ссылка на политику конфиденциальности', 'unident-acf-fields')],
            'ctaDoctorImage' => ['type' => 'OurWorksArchiveCtaImage', 'description' => __('Изображение врача CTA', 'unident-acf-fields')],
        ],
    ]);

    register_graphql_field('RootQuery', 'ourWorksArchiveSettings', [
        'type' => 'OurWorksArchiveSettings',
        'description' => __('Настройки архива наших работ', 'unident-acf-fields'),
        'resolve' => function() {
            $post_id = 'our_works_archive_options';

            $format_image = function($img) {
                if (!$img || !is_array($img)) {
                    return null;
                }
                return [
                    'url' => $img['url'] ?? null,
                    'width' => isset($img['width']) ? (int) $img['width'] : null,
                    'height' => isset($img['height']) ? (int) $img['height'] : null,
                    'alt' => $img['alt'] ?? null,
                ];
            };

            $advantages_raw = get_field('advantages', $post_id);
            $advantages = null;
            if ($advantages_raw && is_array($advantages_raw)) {
                $advantages = array_map(function($row) use ($format_image) {
                    return [
                        'headline' => $row['headline'] ?? null,
                        'image' => $format_image($row['image'] ?? null),
                    ];
                }, $advantages_raw);
            }

            return [
                'actionPageDescription' => get_field('action_page_description', $post_id) ?: null,
                'advantages' => $advantages,
                'ctaTitle' => get_field('cta_title', $post_id) ?: null,
                'ctaDescription' => get_field('cta_description', $post_id) ?: null,
                'ctaPhone' => get_field('cta_phone', $post_id) ?: null,
                'ctaPrivacyText' => get_field('cta_privacy_text', $post_id) ?: null,
                'ctaPrivacyLink' => unident_parse_cta_privacy_link(get_field('cta_privacy_link', $post_id)),
                'ctaDoctorImage' => $format_image(get_field('cta_doctor_image', $post_id)),
            ];
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_our_works_archive_settings_in_graphql');

/**
 * Manual GraphQL Registration для Reviews Archive Settings Option Page
 *
 * CTA блок страницы /reviews (Figma 440:4263).
 */
function unident_register_reviews_archive_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_object_type('ReviewsArchiveCtaImage', [
        'description' => __('Изображение для CTA архива отзывов', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('ReviewsArchiveSettings', [
        'description' => __('Настройки архива отзывов (CTA блок)', 'unident-acf-fields'),
        'fields' => [
            'ctaTitle' => ['type' => 'String', 'description' => __('Заголовок CTA', 'unident-acf-fields')],
            'ctaDescription' => ['type' => 'String', 'description' => __('Описание CTA', 'unident-acf-fields')],
            'ctaButtonText' => ['type' => 'String', 'description' => __('Текст кнопки', 'unident-acf-fields')],
            'ctaBackground' => ['type' => 'ReviewsArchiveCtaImage', 'description' => __('Фоновый декор', 'unident-acf-fields')],
            'ctaIcon' => ['type' => 'ReviewsArchiveCtaImage', 'description' => __('Иконка 75×75', 'unident-acf-fields')],
            'ctaContentImage' => ['type' => 'ReviewsArchiveCtaImage', 'description' => __('Фото людей', 'unident-acf-fields')],
            'ctaGiftImage' => ['type' => 'ReviewsArchiveCtaImage', 'description' => __('Изображение подарка', 'unident-acf-fields')],
            'clinicLogoReviewCard' => ['type' => 'ReviewsArchiveCtaImage', 'description' => __('Логотип клиники для карточки отзыва', 'unident-acf-fields')],
            'clinicLogoReviewCardBackgroundColor' => ['type' => 'String', 'description' => __('Цвет фона контейнера логотипа клиники', 'unident-acf-fields')],
        ],
    ]);

    register_graphql_field('RootQuery', 'reviewsArchiveSettings', [
        'type' => 'ReviewsArchiveSettings',
        'description' => __('Настройки архива отзывов', 'unident-acf-fields'),
        'resolve' => function() {
            $post_id = 'reviews_archive_options';
            $format_image = function($img) {
                if (!$img || !is_array($img)) {
                    return null;
                }
                return [
                    'url' => $img['url'] ?? null,
                    'width' => isset($img['width']) ? (int) $img['width'] : null,
                    'height' => isset($img['height']) ? (int) $img['height'] : null,
                    'alt' => $img['alt'] ?? null,
                ];
            };
            return [
                'ctaTitle' => get_field('cta_title', $post_id) ?: null,
                'ctaDescription' => get_field('cta_description', $post_id) ?: null,
                'ctaButtonText' => get_field('cta_button_text', $post_id) ?: null,
                'ctaBackground' => $format_image(get_field('cta_background', $post_id)),
                'ctaIcon' => $format_image(get_field('cta_icon', $post_id)),
                'ctaContentImage' => $format_image(get_field('cta_content_image', $post_id)),
                'ctaGiftImage' => $format_image(get_field('cta_gift_image', $post_id)),
                'clinicLogoReviewCard' => $format_image(get_field('clinic_logo_review_card', $post_id)),
                'clinicLogoReviewCardBackgroundColor' => get_field('clinic_logo_review_card_bg_color', $post_id) ?: null,
            ];
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_reviews_archive_settings_in_graphql');

/**
 * Manual GraphQL Registration для Footer Settings Option Page
 */
function unident_register_footer_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_object_type('FooterWorkingHours', [
        'description' => __('Часы работы в футере', 'unident-acf-fields'),
        'fields' => [
            'weekdays' => ['type' => 'String'],
            'weekend'  => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('FooterSettingsLogo', [
        'description' => __('Footer logo image', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'alt' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
        ],
    ]);

    register_graphql_object_type('FooterSettingsSocialLink', [
        'description' => __('Ссылка на соцсеть в футере (name, icon, url)', 'unident-acf-fields'),
        'fields' => [
            'name' => ['type' => 'String', 'description' => __('Название соцсети', 'unident-acf-fields')],
            'icon' => ['type' => 'String', 'description' => __('Ключ иконки: whatsapp, vk, telegram', 'unident-acf-fields')],
            'url'  => ['type' => 'String', 'description' => __('URL страницы', 'unident-acf-fields')],
        ],
    ]);

    register_graphql_object_type('FooterSettings', [
        'description' => __('Настройки футера из ACF Option Page', 'unident-acf-fields'),
        'fields' => [
            'logoMode'       => ['type' => 'String', 'description' => __('Logo display mode: image or icon', 'unident-acf-fields')],
            'logo'           => ['type' => 'FooterSettingsLogo', 'description' => __('Logo image', 'unident-acf-fields')],
            'logoIcon'       => ['type' => 'String', 'description' => __('Logo icon slug', 'unident-acf-fields')],
            'phoneCaption'   => ['type' => 'String', 'description' => __('Подпись под телефоном', 'unident-acf-fields')],
            'addressSchemeUrl' => ['type' => 'String', 'description' => __('URL блока Адрес/Схема проезда', 'unident-acf-fields')],
            'workingHours'    => [
                'type'        => 'FooterWorkingHours',
                'description' => __('Часы работы (если заданы в футере)', 'unident-acf-fields'),
            ],
            'copyrightLeft'   => ['type' => 'String', 'description' => __('Копирайт слева внизу', 'unident-acf-fields')],
            'disclaimerCenter' => ['type' => 'String', 'description' => __('Дисклеймер по центру внизу', 'unident-acf-fields')],
            'socialLinks'     => [
                'type'        => ['list_of' => 'FooterSettingsSocialLink'],
                'description' => __('Социальные сети футера (иконки 45×45)', 'unident-acf-fields'),
            ],
        ],
    ]);

    register_graphql_field('RootQuery', 'footerSettings', [
        'type'        => 'FooterSettings',
        'description' => __('Настройки футера', 'unident-acf-fields'),
        'resolve'     => function () {
            $logo_mode        = get_field('logo_mode', 'footer_options');
            $logo             = get_field('logo', 'footer_options');
            $logo_icon        = get_field('logo_icon', 'footer_options');
            $phone_caption    = get_field('phone_caption', 'footer_options');
            $address_scheme   = get_field('address_scheme_url', 'footer_options');
            $working_hours    = get_field('working_hours', 'footer_options');
            $copyright_left   = get_field('copyright_left', 'footer_options');
            $disclaimer_center = get_field('disclaimer_center', 'footer_options');
            $social_links     = get_field('social_links', 'footer_options');

            $logo_formatted = null;
            if ($logo && is_array($logo) && !empty($logo['url'])) {
                $logo_formatted = [
                    'url' => $logo['url'] ?? null,
                    'alt' => $logo['alt'] ?? null,
                    'width' => isset($logo['width']) ? (int) $logo['width'] : null,
                    'height' => isset($logo['height']) ? (int) $logo['height'] : null,
                ];
            }

            $formatted_social_links = null;
            if ($social_links && is_array($social_links)) {
                $formatted_social_links = array_map(function ($row) {
                    return [
                        'name' => $row['name'] ?? null,
                        'icon' => $row['icon'] ?? null,
                        'url'  => $row['url'] ?? null,
                    ];
                }, $social_links);
            }

            return [
                'logoMode'       => ($logo_mode === 'icon' || $logo_mode === 'image') ? $logo_mode : 'image',
                'logo'           => $logo_formatted,
                'logoIcon'       => $logo_icon ?: null,
                'phoneCaption'   => $phone_caption ?: null,
                'addressSchemeUrl' => $address_scheme ?: null,
                'workingHours'    => is_array($working_hours) && !empty(array_filter($working_hours))
                    ? [
                        'weekdays' => $working_hours['weekdays'] ?? null,
                        'weekend'  => $working_hours['weekend'] ?? null,
                    ]
                    : null,
                'copyrightLeft'   => $copyright_left ?: null,
                'disclaimerCenter' => $disclaimer_center ?: null,
                'socialLinks'     => $formatted_social_links,
            ];
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_footer_settings_in_graphql');

/**
 * Manual GraphQL Registration для Service Pages Settings Option Page
 */
function unident_register_service_pages_settings_in_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_object_type('ServicePagesSettingsStaImage', [
        'description' => __('Изображение STA блока страниц услуг', 'unident-acf-fields'),
        'fields' => [
            'url' => ['type' => 'String'],
            'width' => ['type' => 'Int'],
            'height' => ['type' => 'Int'],
            'alt' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('ServicePagesSettings', [
        'description' => __('Настройки страниц услуг', 'unident-acf-fields'),
        'fields' => [
            'doctorsSectionTitle' => ['type' => 'String'],
            'doctorsSectionDescription' => ['type' => 'String'],
            'selectedDoctors' => ['type' => ['list_of' => 'Doctor']],
            'showPriceBlock' => ['type' => 'Boolean'],
            'exactPriceBlockIcon' => ['type' => 'String'],
            'exactPriceBlockText' => ['type' => 'String'],
            'exactPriceBlockLink' => ['type' => 'String'],
            'staTitle' => ['type' => 'String'],
            'staDescription' => ['type' => 'String'],
            'staPhone' => ['type' => 'String'],
            'staPrivacyText' => ['type' => 'String'],
            'staPrivacyLink' => ['type' => 'String'],
            'staDoctorImage' => ['type' => 'ServicePagesSettingsStaImage'],
            'staBackgroundImage' => ['type' => 'ServicePagesSettingsStaImage'],
            'servicesBlockShow' => ['type' => 'Boolean'],
            'servicesBlockTitle' => ['type' => 'String'],
            'selectedServices' => ['type' => ['list_of' => 'Service']],
        ],
    ]);

    register_graphql_field('RootQuery', 'servicePagesSettings', [
        'type' => 'ServicePagesSettings',
        'description' => __('Настройки страниц услуг', 'unident-acf-fields'),
        'resolve' => function() {
            $post_id = 'service_pages_options';

            $format_image = function($img) {
                if (!$img || !is_array($img)) {
                    return null;
                }
                return [
                    'url' => $img['url'] ?? null,
                    'width' => isset($img['width']) ? (int) $img['width'] : null,
                    'height' => isset($img['height']) ? (int) $img['height'] : null,
                    'alt' => $img['alt'] ?? null,
                ];
            };

            $selected_raw = get_field('selected_services', $post_id);
            $selected_services = null;
            if ($selected_raw && is_array($selected_raw)) {
                $context = \WPGraphQL::get_app_context();
                $selected_services = array_filter(array_map(function($post) use ($context) {
                    if ($post instanceof \WP_Post) {
                        $resolved = \WPGraphQL\Data\DataSource::resolve_post_object($post->ID, $context);
                        return $resolved;
                    }
                    return null;
                }, $selected_raw));
                $selected_services = array_values($selected_services);
            }

            $doctors_raw = get_field('selected_doctors', $post_id);
            $selected_doctors = null;
            if ($doctors_raw && is_array($doctors_raw)) {
                $context = \WPGraphQL::get_app_context();
                $selected_doctors = array_filter(array_map(function($post) use ($context) {
                    if ($post instanceof \WP_Post) {
                        $resolved = \WPGraphQL\Data\DataSource::resolve_post_object($post->ID, $context);
                        return $resolved;
                    }
                    return null;
                }, $doctors_raw));
                $selected_doctors = array_values($selected_doctors);
            }

            return [
                'doctorsSectionTitle' => get_field('doctors_section_title', $post_id) ?: null,
                'doctorsSectionDescription' => get_field('doctors_section_description', $post_id) ?: null,
                'selectedDoctors' => $selected_doctors,
                'showPriceBlock' => ($v = get_field('show_price_block', $post_id)) === null ? null : (bool) $v,
                'exactPriceBlockIcon' => get_field('exact_price_block_icon', $post_id) ?: 'telegram',
                'exactPriceBlockText' => get_field('exact_price_block_text', $post_id) ?: 'Узнать точную стоимость в Телеграм',
                'exactPriceBlockLink' => get_field('exact_price_block_link', $post_id) ?: null,
                'staTitle' => get_field('sta_title', $post_id) ?: null,
                'staDescription' => get_field('sta_description', $post_id) ?: null,
                'staPhone' => get_field('sta_phone', $post_id) ?: null,
                'staPrivacyText' => get_field('sta_privacy_text', $post_id) ?: null,
                'staPrivacyLink' => unident_parse_cta_privacy_link(get_field('sta_privacy_link', $post_id)),
                'staDoctorImage' => $format_image(get_field('sta_doctor_image', $post_id)),
                'staBackgroundImage' => $format_image(get_field('sta_background_image', $post_id)),
                'servicesBlockShow' => ($v = get_field('show_services_block', $post_id)) === null ? null : (bool) $v,
                'servicesBlockTitle' => get_field('services_block_title', $post_id) ?: null,
                'selectedServices' => $selected_services,
            ];
        },
    ]);
}
add_action('graphql_register_types', 'unident_register_service_pages_settings_in_graphql');

/**
 * Ручная регистрация поля icon (inline SVG) для MenuItem
 * 
 * WPGraphQL ACF не поддерживает автоматическую регистрацию полей для nav_menu_item
 * Требуется ручная регистрация через register_graphql_field
 * 
 * PERFORMANCE-FIRST: Возвращает inline SVG код для zero HTTP requests
 */
function unident_register_menu_icon_field() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    register_graphql_field('MenuItem', 'icon', [
        'type' => 'String',
        'description' => __('SVG код иконки пункта меню (inline SVG для zero HTTP requests)', 'unident-acf-fields'),
        'resolve' => function($menu_item, $args, $context, $info) {
            $post_id = $menu_item->databaseId ?? null;
            
            if ($post_id) {
                // Получаем SVG код из ACF поля
                $icon_svg = get_post_meta($post_id, 'icon', true);
                return $icon_svg ?: null;
            }
            
            return null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_menu_icon_field');

/**
 * Register megaMenuCategories field в MenuItem
 * Возвращает массив категорий услуг для отображения в мега-меню
 */
function unident_register_menu_mega_categories_field() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    register_graphql_field('MenuItem', 'megaMenuCategories', [
        'type' => ['list_of' => 'ServiceCategory'],
        'description' => __('Категории услуг для мега-меню (если пусто - показываются все)', 'unident-acf-fields'),
        'resolve' => function($menu_item, $args, $context, $info) {
            $post_id = $menu_item->databaseId ?? null;
            
            if (!$post_id) return null;
            
            // Получаем ID категорий из ACF поля
            $category_ids = get_post_meta($post_id, 'mega_menu_categories', true);
            
            if (empty($category_ids)) {
                return null; // Если не выбрано - вернем null (на фронте будут показаны все)
            }
            
            // Преобразуем в массив если это не массив
            if (!is_array($category_ids)) {
                $category_ids = [$category_ids];
            }
            
            // Получаем объекты терминов
            $categories = [];
            foreach ($category_ids as $cat_id) {
                $term = get_term($cat_id, 'service_categories');
                if ($term && !is_wp_error($term)) {
                    $categories[] = $term;
                }
            }
            
            return !empty($categories) ? $categories : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_menu_mega_categories_field');

/**
 * УМНЫЙ resolver для badgeCount в MenuItem
 * 
 * Автоматически определяет CPT по URL пункта меню:
 * - Если URL содержит "review" или "otzyv" → wp_count_posts('reviews')
 * - Если URL содержит "promotion" или "akci" → wp_count_posts('promotions')
 * - Иначе → ACF значение badge_count (fallback)
 * 
 * PERFORMANCE-FIRST: Динамические счетчики автоматически синхронизируются с базой данных
 */
function unident_register_menu_badge_count_field() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    register_graphql_field('MenuItem', 'badgeCount', [
        'type' => 'Int',
        'description' => __('Динамический счетчик для бейджа (автоматически из CPT или ACF поле)', 'unident-acf-fields'),
        'resolve' => function($menu_item, $args, $context, $info) {
            $post_id = $menu_item->databaseId ?? null;
            $url = $menu_item->url ?? '';
            $label = $menu_item->label ?? '';
            
            if (!$post_id) return null;
            
            // Нормализуем URL и label для проверки
            $url_lower = mb_strtolower($url);
            $label_lower = mb_strtolower($label);
            $check_string = $url_lower . ' ' . $label_lower;
            
            // ДИНАМИЧЕСКИЙ СЧЕТЧИК: Отзывы
            if (
                strpos($check_string, 'review') !== false ||
                strpos($check_string, 'отзыв') !== false ||
                strpos($check_string, 'otzyv') !== false
            ) {
                $posts_count = wp_count_posts('reviews');
                return isset($posts_count->publish) ? (int) $posts_count->publish : 0;
            }
            
            // ДИНАМИЧЕСКИЙ СЧЕТЧИК: Акции
            if (
                strpos($check_string, 'promotion') !== false ||
                strpos($check_string, 'акци') !== false ||
                strpos($check_string, 'akci') !== false ||
                strpos($check_string, 'promo') !== false
            ) {
                $posts_count = wp_count_posts('promotions');
                return isset($posts_count->publish) ? (int) $posts_count->publish : 0;
            }
            
            // FALLBACK: ACF поле badge_count для других пунктов меню
            $badge_count = get_post_meta($post_id, 'badge_count', true);
            return $badge_count ? (int) $badge_count : null;
        }
    ]);
}
// Приоритет 99 - после автоматической регистрации WPGraphQL ACF (приоритет 10)
// Это позволяет перезаписать автоматически зарегистрированное поле badgeCount
add_action('graphql_register_types', 'unident_register_menu_badge_count_field', 99);

/**
 * КРИТИЧНО: Разрешить SVG теги для ACF textarea полей
 * 
 * FIX: ACF использует контексты 'post', 'safe_text' или пустую строку, а НЕ 'acf'!
 * Разрешаем SVG для всех контекстов, где может быть ACF textarea
 * 
 * Источники:
 * - https://www.advancedcustomfields.com/resources/html-escaping/
 * - https://developer.wordpress.org/reference/functions/wp_kses/
 */
add_filter('wp_kses_allowed_html', function($tags, $context) {
    // FIX: Проверяем несколько контекстов, которые использует ACF
    // 'post' - основной контекст для ACF textarea
    // '' (пустая строка) - используется в некоторых случаях
    // 'safe_text' - альтернативный контекст
    $acf_contexts = ['post', '', 'safe_text'];
    
    if (in_array($context, $acf_contexts, true)) {
        $svg_tags = array(
            'svg' => array(
                'xmlns' => true,
                'width' => true,
                'height' => true,
                'viewbox' => true, // lowercase
                'viewBox' => true, // camelCase
                'preserveAspectRatio' => true,
                'fill' => true,
                'stroke' => true,
                'stroke-width' => true,
                'role' => true,
                'aria-hidden' => true,
                'class' => true,
            ),
            'path' => array(
                'd' => true,
                'fill' => true,
                'stroke' => true,
                'stroke-width' => true,
                'stroke-linecap' => true,
                'stroke-linejoin' => true,
            ),
            'circle' => array(
                'cx' => true,
                'cy' => true,
                'r' => true,
                'fill' => true,
                'stroke' => true,
                'stroke-width' => true,
            ),
            'rect' => array(
                'x' => true,
                'y' => true,
                'width' => true,
                'height' => true,
                'rx' => true,
                'ry' => true,
                'fill' => true,
                'stroke' => true,
                'stroke-width' => true,
            ),
            'g' => array(
                'fill' => true,
                'stroke' => true,
                'transform' => true,
            ),
            'line' => array(
                'x1' => true,
                'y1' => true,
                'x2' => true,
                'y2' => true,
                'stroke' => true,
                'stroke-width' => true,
            ),
        );
        
        // Объединяем с существующими тегами
        $tags = array_merge($tags, $svg_tags);
    }
    
    return $tags;
}, 10, 2);

/**
 * =============================================================================
 * ICON SELECT APPROACH (2026-01-29)
 * =============================================================================
 * 
 * Иконки теперь выбираются из Select field (не SVG код в textarea).
 * Значение - имя иконки (например: 'telegram', 'tooth', 'percent').
 * Рендеринг на фронте через @/icons/icon-map.ts:
 * 
 * // Next.js usage:
 * import { getIcon } from '@/icons';
 * const Icon = getIcon(data.icon); // 'telegram' -> TelegramIcon component
 * if (Icon) <Icon className="w-6 h-6" />
 * 
 * Доступные иконки:
 * - Social: whatsapp, vk, telegram
 * - Dental: tooth, implant, orthodontics, surgery, hygiene, children, aesthetic, diagnostic  
 * - Finance: percent, ruble, installment
 * - Info: location, phone, clock
 * - UI: star, arrow-up-right, clinic-dot
 * 
 * При добавлении новых иконок:
 * 1. Создать SVG файл в nextjs/src/icons/
 * 2. Добавить в nextjs/src/icons/index.ts
 * 3. Добавить в nextjs/src/icons/icon-map.ts
 * 4. Добавить choice в ACF Select поле здесь
 */

/**
 * Manual GraphQL registration для Service Features repeater
 * 
 * WPGraphQL ACF v2 иногда не регистрирует repeater автоматически
 * Регистрируем вручную для надежности
 */
function unident_register_service_features_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    // Register Feature type
    register_graphql_object_type('ServiceFeature', [
        'description' => __('Особенность услуги (из repeater поля)', 'unident-acf-fields'),
        'fields' => [
            'text' => [
                'type' => 'String',
                'description' => __('Текст особенности', 'unident-acf-fields'),
            ],
        ],
    ]);
    
    // Register features field на Service
    register_graphql_field('Service', 'serviceFeatures', [
        'type' => ['list_of' => 'ServiceFeature'],
        'description' => __('Особенности услуги (repeater)', 'unident-acf-fields'),
        'resolve' => function($post, $args, $context, $info) {
            $post_id = $post->databaseId ?? null;
            
            if (!$post_id || !function_exists('get_field')) {
                return null;
            }
            
            // ACF get_field() для repeater поля
            $features_data = get_field('features', $post_id);
            
            if (empty($features_data) || !is_array($features_data)) {
                return null;
            }
            
            $features = [];
            foreach ($features_data as $feature) {
                // Проверяем разные форматы данных от ACF
                $text = null;
                if (is_array($feature)) {
                    // Формат: ['text' => '...']
                    $text = isset($feature['text']) ? $feature['text'] : null;
                } elseif (is_string($feature)) {
                    // Если это просто строка (старый формат)
                    $text = $feature;
                }
                
                if (!empty($text) && trim($text)) {
                    $features[] = [
                        'text' => sanitize_text_field($text),
                    ];
                }
            }
            
            return !empty($features) ? $features : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_service_features_graphql');

/**
 * Manual GraphQL registration для Promotion Futures repeater
 * 
 * Аналогично Service Features - регистрируем вручную
 */
function unident_register_promotion_futures_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    // Register PromotionFuture type
    register_graphql_object_type('PromotionFuture', [
        'description' => __('Преимущество акции (из repeater поля)', 'unident-acf-fields'),
        'fields' => [
            'text' => [
                'type' => 'String',
                'description' => __('Текст преимущества', 'unident-acf-fields'),
            ],
        ],
    ]);
    
    // Register futures field на Promotion
    register_graphql_field('Promotion', 'promotionFutures', [
        'type' => ['list_of' => 'PromotionFuture'],
        'description' => __('Преимущества акции (repeater)', 'unident-acf-fields'),
        'resolve' => function($post, $args, $context, $info) {
            $post_id = $post->databaseId ?? null;
            
            if (!$post_id || !function_exists('get_field')) {
                return null;
            }
            
            // ACF get_field() для repeater поля
            $futures_data = get_field('futures', $post_id);
            
            if (empty($futures_data) || !is_array($futures_data)) {
                return null;
            }
            
            $futures = [];
            foreach ($futures_data as $future) {
                // Проверяем разные форматы данных от ACF
                $text = null;
                if (is_array($future)) {
                    // Формат: ['text' => '...']
                    $text = isset($future['text']) ? $future['text'] : null;
                } elseif (is_string($future)) {
                    // Если это просто строка
                    $text = $future;
                }
                
                if (!empty($text) && trim($text)) {
                    $futures[] = [
                        'text' => sanitize_text_field($text),
                    ];
                }
            }
            
            return !empty($futures) ? $futures : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_promotion_futures_graphql');

/**
 * Миграция старых данных Features из текстового формата в Repeater
 * 
 * Если в базе есть старые данные в формате JSON строки,
 * мигрируем их в формат ACF Repeater
 */
function unident_migrate_service_features_to_repeater() {
    // Проверяем что мы в админке и пользователь имеет права
    if (!is_admin() || !current_user_can('manage_options')) {
        return;
    }
    
    // Получаем все услуги
    $services = get_posts([
        'post_type' => 'services',
        'posts_per_page' => -1,
        'post_status' => 'any',
    ]);
    
    foreach ($services as $service) {
        $post_id = $service->ID;
        
        // Проверяем есть ли старое текстовое поле
        $old_features = get_post_meta($post_id, 'features', true);
        
        // Если это строка (старый формат), пытаемся распарсить
        if (is_string($old_features) && !empty($old_features)) {
            // Пытаемся декодировать JSON (с поддержкой Unicode)
            $decoded = json_decode($old_features, true);
            
            if (is_array($decoded)) {
                // Мигрируем в формат ACF Repeater
                $repeater_data = [];
                foreach ($decoded as $item) {
                    if (is_array($item) && isset($item['text'])) {
                        $repeater_data[] = [
                            'text' => sanitize_text_field($item['text']),
                        ];
                    } elseif (is_string($item)) {
                        // Если просто строка, создаем объект
                        $repeater_data[] = [
                            'text' => sanitize_text_field($item),
                        ];
                    }
                }
                
                // Сохраняем в формате ACF Repeater
                if (!empty($repeater_data)) {
                    update_field('features', $repeater_data, $post_id);
                    error_log("[Features Migration] Migrated " . count($repeater_data) . " features for service ID: {$post_id}");
                }
            } elseif (is_string($decoded)) {
                // Если это просто строка, создаем один элемент
                update_field('features', [
                    ['text' => sanitize_text_field($decoded)]
                ], $post_id);
                error_log("[Features Migration] Migrated single feature for service ID: {$post_id}");
            } else {
                // Если JSON не распарсился, пытаемся обработать как обычный текст
                // Разбиваем по переносам строк или запятым
                $lines = preg_split('/[\r\n,]+/', $old_features);
                $repeater_data = [];
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (!empty($line)) {
                        $repeater_data[] = [
                            'text' => sanitize_text_field($line),
                        ];
                    }
                }
                
                if (!empty($repeater_data)) {
                    update_field('features', $repeater_data, $post_id);
                    error_log("[Features Migration] Migrated " . count($repeater_data) . " features from text for service ID: {$post_id}");
                }
            }
        }
    }
}

// Запускаем миграцию один раз при активации плагина
register_activation_hook(__FILE__, 'unident_migrate_service_features_to_repeater');

/**
 * Принудительное удаление старого текстового поля перед регистрацией repeater
 * Это необходимо если поле было создано как text и ACF не обновляет тип автоматически
 * 
 * ВАЖНО: Выполняется с приоритетом 1 - ДО того как ACF загрузит поля из базы
 */
add_action('acf/init', function() {
    global $wpdb;
    
    // Удаляем старое поле из базы данных напрямую если оно существует как text
    $field_key = 'field_service_features';
    
    // Проверяем есть ли поле в базе
    $field_post = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'acf-field'",
        $field_key
    ));
    
    if ($field_post) {
        // Проверяем тип поля через метаданные
        $field_type = get_post_meta($field_post->ID, 'type', true);
        
        error_log('[ACF Fields] Found field in database. Type: ' . $field_type);
        
        // Удаляем если это НЕ repeater (включая text и любые другие типы)
        if ($field_type !== 'repeater') {
            // Удаляем поле и все связанные метаданные
            wp_delete_post($field_post->ID, true);
            error_log('[ACF Fields] Deleted old field field_service_features (type: ' . $field_type . ') from database');
            
            // Также удаляем из field group если он существует в базе
            $field_group_post = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'acf-field-group'",
                'group_service_fields'
            ));
            
            if ($field_group_post) {
                // Удаляем поле из метаданных field group
                delete_post_meta($field_group_post->ID, 'fields');
                error_log('[ACF Fields] Cleared fields metadata from field group');
            }
            
            // Очищаем кэш ACF ПЕРЕД регистрацией нового поля
            if (function_exists('acf_get_store')) {
                acf_get_store('fields')->reset();
                error_log('[ACF Fields] ACF cache cleared');
            }
        } else {
            error_log('[ACF Fields] Field already is repeater, skipping deletion');
        }
    } else {
        error_log('[ACF Fields] Field not found in database, will be created from local registration');
    }
}, 1); // Приоритет 1 - выполняется ПЕРВЫМ, ДО регистрации полей (приоритет 10)

/**
 * =============================================================================
 * PROBLEMATICS ↔ SERVICE CATEGORIES (TAXONOMY TERM RELATIONSHIP)
 * =============================================================================
 *
 * Двусторонняя связь many-to-many между таксономиями problematics и service_categories.
 * - На термине Problematic: поле related_service_categories (multi-select из service_categories)
 * - На термине ServiceCategory: поле related_problematics (multi-select из problematics)
 */

/**
 * Register ACF field group for Problematic → Service Categories
 */
function unident_register_problematic_related_categories_field() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}
	acf_add_local_field_group(
		array(
			'key'                   => 'group_problematic_related_categories',
			'title'                 => 'Связанные категории услуг',
			'fields'                => array(
				array(
					'key'               => 'field_problematic_related_categories',
					'label'             => 'Связанные категории услуг',
					'name'              => 'related_service_categories',
					'type'              => 'taxonomy',
					'instructions'      => 'Выберите категории услуг, которые относятся к этой проблематике.',
					'required'          => 0,
					'taxonomy'          => 'service_categories',
					'field_type'        => 'multi_select',
					'allow_null'        => 1,
					'add_term'          => 0,
					'save_terms'        => 0,
					'load_terms'        => 0,
					'return_format'     => 'id',
					'multiple'          => 1,
					'show_in_graphql'   => 0,
					'graphql_field_name' => 'relatedServiceCategories',
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'taxonomy',
						'operator' => '==',
						'value'    => 'problematics',
					),
				),
			),
			'style'                 => 'default',
			'active'                => true,
			'show_in_graphql'       => 0,
		)
	);
}
add_action( 'acf/init', 'unident_register_problematic_related_categories_field' );

/**
 * Register ACF field group for Problematic Icon
 */
function unident_register_problematic_icon_field() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}
	acf_add_local_field_group(
		array(
			'key'                   => 'group_problematic_icon',
			'title'                 => 'Иконка проблематики',
			'fields'                => array(
				array(
					'key'               => 'field_problematic_icon',
					'label'             => 'Иконка',
					'name'              => 'problematic_icon',
					'type'              => 'select',
					'instructions'      => 'Выберите иконку для проблематики. Иконки рендерятся на фронте из библиотеки @/icons.',
					'required'          => 0,
					'choices'           => array(
						'tooth'         => 'Зуб (терапия)',
						'implant'       => 'Имплант',
						'orthodontics'  => 'Ортодонтия (брекеты)',
						'surgery'       => 'Хирургия',
						'hygiene'       => 'Гигиена',
						'children'      => 'Детская стоматология',
						'aesthetic'     => 'Эстетика',
						'diagnostic'    => 'Диагностика',
						'whitening'     => 'Отбеливание',
						'prosthetics'   => 'Протезирование',
						'periodontics'  => 'Пародонтология',
						'endodontics'   => 'Эндодонтия (каналы)',
						'star'          => 'Звезда (рейтинг)',
						'arrow-up-right' => 'Стрелка',
					),
					'default_value'     => '',
					'allow_null'        => 1,
					'return_format'     => 'value',
					'show_in_graphql'   => 0,
					'graphql_field_name' => 'icon',
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'taxonomy',
						'operator' => '==',
						'value'    => 'problematics',
					),
				),
			),
			'style'                 => 'default',
			'active'                => true,
			'show_in_graphql'       => 0,
		)
	);
}
add_action( 'acf/init', 'unident_register_problematic_icon_field' );

/**
 * Register ACF field group for Service Category → Problematics
 */
function unident_register_service_category_related_problematics_field() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}
	acf_add_local_field_group(
		array(
			'key'                   => 'group_service_category_related_problematics',
			'title'                 => 'Связанные проблематики',
			'fields'                => array(
				array(
					'key'               => 'field_service_category_related_problematics',
					'label'             => 'Связанные проблематики',
					'name'              => 'related_problematics',
					'type'              => 'taxonomy',
					'instructions'      => 'Выберите проблематики, которые относятся к этой категории услуг.',
					'required'          => 0,
					'taxonomy'          => 'problematics',
					'field_type'        => 'multi_select',
					'allow_null'        => 1,
					'add_term'          => 0,
					'save_terms'        => 0,
					'load_terms'        => 0,
					'return_format'     => 'id',
					'multiple'          => 1,
					'show_in_graphql'   => 0,
					'graphql_field_name' => 'relatedProblematics',
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'taxonomy',
						'operator' => '==',
						'value'    => 'service_categories',
					),
				),
			),
			'style'                 => 'default',
			'active'                => true,
			'show_in_graphql'       => 0,
		)
	);
}
add_action( 'acf/init', 'unident_register_service_category_related_problematics_field' );

/**
 * =============================================================================
 * SERVICE CATEGORY ICON (TAXONOMY TERM)
 * =============================================================================
 * 
 * ACF поле для выбора иконки категории услуги
 * - Select из предустановленного списка иконок
 * - Аналогично menu icon field
 * - Зарегистрировано в GraphQL для ServiceCategory
 */

/**
 * Register ACF field group for Service Category Icon
 */
function unident_register_service_category_icon_field() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_service_category_icon',
            'title' => 'Иконка категории услуги',
            'fields' => array(
                array(
                    'key' => 'field_service_category_icon',
                    'label' => 'Иконка категории',
                    'name' => 'category_icon',
                    'type' => 'select',
                    'instructions' => 'Выберите иконку для категории услуги. Иконки рендерятся на фронте из библиотеки @/icons.',
                    'required' => 0,
                    'choices' => array(
                        // Dental/Medical (для услуг)
                        'tooth' => 'Зуб (терапия)',
                        'implant' => 'Имплант',
                        'orthodontics' => 'Ортодонтия (брекеты)',
                        'surgery' => 'Хирургия',
                        'hygiene' => 'Гигиена',
                        'children' => 'Детская стоматология',
                        'aesthetic' => 'Эстетика',
                        'diagnostic' => 'Диагностика',
                        // Additional
                        'whitening' => 'Отбеливание',
                        'prosthetics' => 'Протезирование',
                        'periodontics' => 'Пародонтология',
                        'endodontics' => 'Эндодонтия (каналы)',
                        // UI
                        'star' => 'Звезда (рейтинг)',
                        'arrow-up-right' => 'Стрелка',
                    ),
                    'default_value' => '',
                    'allow_null' => 1,
                    'return_format' => 'value',
                    'show_in_graphql' => 0, // Отключаем автоматическую регистрацию, будем регистрировать вручную
                    'graphql_field_name' => 'icon',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'taxonomy',
                        'operator' => '==',
                        'value' => 'service_categories',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'serviceCategoryIconSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_service_category_icon_field');

/**
 * Register icon field в GraphQL для ServiceCategory
 * 
 * Возвращает название иконки (slug) для рендеринга на фронте
 * Иконки берутся из библиотеки @/icons (tooth, implant, orthodontics и т.д.)
 */
function unident_register_service_category_icon_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }
    
    register_graphql_field('ServiceCategory', 'icon', [
        'type' => 'String',
        'description' => __('Иконка категории услуги (slug для @/icons)', 'unident-acf-fields'),
        'resolve' => function($term, $args, $context, $info) {
            $term_id = $term->databaseId ?? null;
            
            if ($term_id) {
                // Получаем значение из ACF поля (term meta)
                $icon_slug = get_term_meta($term_id, 'category_icon', true);
                return $icon_slug ?: null;
            }
            
            return null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_service_category_icon_graphql');

/**
 * Register relatedServiceCategories для Problematic в GraphQL
 */
function unident_register_problematic_related_categories_graphql() {
	if ( ! function_exists( 'register_graphql_field' ) ) {
		return;
	}
	register_graphql_field(
		'Problematic',
		'relatedServiceCategories',
		array(
			'type'        => array( 'list_of' => 'ServiceCategory' ),
			'description' => __( 'Связанные категории услуг', 'unident-acf-fields' ),
			'resolve'     => function ( $term, $args, $context, $info ) {
				$term_id = $term->databaseId ?? null;
				if ( ! $term_id ) {
					return null;
				}
				$ids = get_term_meta( $term_id, 'related_service_categories', true );
				if ( ! $ids || ! is_array( $ids ) ) {
					return array();
				}
				$resolved = array();
				foreach ( $ids as $id ) {
					$id = (int) $id;
					if ( $id > 0 ) {
						$node = \WPGraphQL\Data\DataSource::resolve_term_object( $id, $context );
						if ( $node ) {
							$resolved[] = $node;
						}
					}
				}
				return $resolved;
			},
		)
	);
}
add_action( 'graphql_register_types', 'unident_register_problematic_related_categories_graphql' );

/**
 * Register icon field в GraphQL для Problematic
 */
function unident_register_problematic_icon_graphql() {
	if ( ! function_exists( 'register_graphql_field' ) ) {
		return;
	}
	register_graphql_field(
		'Problematic',
		'icon',
		array(
			'type'        => 'String',
			'description' => __( 'Иконка проблематики (slug для @/icons)', 'unident-acf-fields' ),
			'resolve'     => function ( $term, $args, $context, $info ) {
				$term_id = $term->databaseId ?? null;
				if ( $term_id ) {
					$icon_slug = get_term_meta( $term_id, 'problematic_icon', true );
					return $icon_slug ?: null;
				}
				return null;
			},
		)
	);
}
add_action( 'graphql_register_types', 'unident_register_problematic_icon_graphql' );

/**
 * Register relatedProblematics для ServiceCategory в GraphQL
 */
function unident_register_service_category_related_problematics_graphql() {
	if ( ! function_exists( 'register_graphql_field' ) ) {
		return;
	}
	register_graphql_field(
		'ServiceCategory',
		'relatedProblematics',
		array(
			'type'        => array( 'list_of' => 'Problematic' ),
			'description' => __( 'Связанные проблематики', 'unident-acf-fields' ),
			'resolve'     => function ( $term, $args, $context, $info ) {
				$term_id = $term->databaseId ?? null;
				if ( ! $term_id ) {
					return null;
				}
				$ids = get_term_meta( $term_id, 'related_problematics', true );
				if ( ! $ids || ! is_array( $ids ) ) {
					return array();
				}
				$resolved = array();
				foreach ( $ids as $id ) {
					$id = (int) $id;
					if ( $id > 0 ) {
						$node = \WPGraphQL\Data\DataSource::resolve_term_object( $id, $context );
						if ( $node ) {
							$resolved[] = $node;
						}
					}
				}
				return $resolved;
			},
		)
	);
}
add_action( 'graphql_register_types', 'unident_register_service_category_related_problematics_graphql' );

/**
 * =============================================================================
 * SERVICE ICON (CPT)
 * =============================================================================
 *
 * ACF поле для выбора иконки услуги (Service CPT)
 * - Select из предустановленного списка иконок (динамические choices через unident-svg-icons.php)
 * - Аналогично ServiceCategory icon
 * - Default: tooth
 */

/**
 * Register ACF field group for Service Icon
 */
function unident_register_service_icon_field() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_service_icon',
            'title' => 'Иконка услуги',
            'fields' => array(
                array(
                    'key' => 'field_service_icon',
                    'label' => 'Иконка услуги',
                    'name' => 'service_icon',
                    'type' => 'select',
                    'instructions' => 'Выберите иконку для услуги. Иконки рендерятся на фронте из библиотеки @/icons.',
                    'required' => 0,
                    'choices' => array(
                        'tooth' => 'Зуб (терапия)',
                        'implant' => 'Имплант',
                        'orthodontics' => 'Ортодонтия (брекеты)',
                        'surgery' => 'Хирургия',
                        'hygiene' => 'Гигиена',
                        'children' => 'Детская стоматология',
                        'aesthetic' => 'Эстетика',
                        'diagnostic' => 'Диагностика',
                        'whitening' => 'Отбеливание',
                        'prosthetics' => 'Протезирование',
                        'periodontics' => 'Пародонтология',
                        'endodontics' => 'Эндодонтия (каналы)',
                        'star' => 'Звезда (рейтинг)',
                        'arrow-up-right' => 'Стрелка',
                    ),
                    'default_value' => 'tooth',
                    'allow_null' => 1,
                    'return_format' => 'value',
                    'show_in_graphql' => 0,
                    'graphql_field_name' => 'icon',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'services',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'serviceIconSettings',
        ));
    }
}
add_action('acf/init', 'unident_register_service_icon_field');

/**
 * Register icon field в GraphQL для Service
 */
function unident_register_service_icon_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_field('Service', 'icon', [
        'type' => 'String',
        'description' => __('Иконка услуги (slug для @/icons)', 'unident-acf-fields'),
        'resolve' => function ($post) {
            $post_id = $post->databaseId ?? $post->ID ?? null;
            if ($post_id) {
                $icon_slug = get_post_meta($post_id, 'service_icon', true);
                return $icon_slug ?: null;
            }
            return null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_service_icon_graphql');

/**
 * Register ACF Fields для Reviews (Отзывы)
 * 
 * WPGraphQL ACF v2 автоматически экспонирует эти поля если:
 * - Field group имеет 'show_in_graphql' => 1
 * - Каждое поле имеет 'show_in_graphql' => 1
 */
function unident_register_review_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_review_fields',
            'title' => 'Настройки отзыва',
            'fields' => array(
                // Ответ клиники
                array(
                    'key' => 'field_review_answer',
                    'label' => 'Ответ клиники',
                    'name' => 'answer',
                    'type' => 'textarea',
                    'instructions' => 'Ответ клиники на отзыв',
                    'required' => 0,
                    'rows' => 5,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'answer',
                ),
                // Имя автора
                array(
                    'key' => 'field_review_author_name',
                    'label' => 'Имя автора',
                    'name' => 'author_name',
                    'type' => 'text',
                    'instructions' => 'Имя автора отзыва',
                    'required' => 0,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'authorName',
                ),
                // Рейтинг
                array(
                    'key' => 'field_review_rating',
                    'label' => 'Рейтинг',
                    'name' => 'rating',
                    'type' => 'number',
                    'instructions' => 'Рейтинг от 1 до 5 (может быть дробным: 4.5, 4.7)',
                    'required' => 0,
                    'min' => 1,
                    'max' => 5,
                    'step' => 0.1,
                    'default_value' => 5,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'rating',
                ),
                // Логотип платформы (show_in_graphql=0: ручная регистрация в register-reviews-graphql.php)
                array(
                    'key' => 'field_review_platform_logo',
                    'label' => 'Логотип платформы',
                    'name' => 'platform_logo',
                    'type' => 'image',
                    'instructions' => 'Логотип платформы отзывов (Doctu.ru, Prodoctorov и т.д.)',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'thumbnail',
                    'show_in_graphql' => 0,
                    'graphql_field_name' => 'platformLogo',
                ),
                // Связь с врачами
                array(
                    'key' => 'field_review_related_doctors',
                    'label' => 'Лечащие врачи',
                    'name' => 'related_doctors',
                    'type' => 'relationship',
                    'instructions' => 'Выберите врачей, упомянутых в отзыве',
                    'required' => 0,
                    'post_type' => array('doctors'),
                    'return_format' => 'object',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedDoctors',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'reviews',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'reviewFields',
        ));
    }
}
add_action('acf/init', 'unident_register_review_fields');

/**
 * Register ACF Fields для Our Works (Наши работы)
 * 
 * WPGraphQL ACF v2 автоматически экспонирует эти поля если:
 * - Field group имеет 'show_in_graphql' => 1
 * - Каждое поле имеет 'show_in_graphql' => 1
 */
function unident_register_our_works_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_our_works_fields',
            'title' => 'Настройки работы',
            'fields' => array(
                // Фото "До"
                array(
                    'key' => 'field_work_photo_before',
                    'label' => 'Photo Before',
                    'name' => 'photo_before',
                    'type' => 'image',
                    'instructions' => 'Фото до лечения',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'photoBefore',
                ),
                // Фото "После"
                array(
                    'key' => 'field_work_photo_after',
                    'label' => 'Photo After',
                    'name' => 'photo_after',
                    'type' => 'image',
                    'instructions' => 'Фото после лечения',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'photoAfter',
                ),
                // Общее фото
                array(
                    'key' => 'field_work_general_photo',
                    'label' => 'General Photo',
                    'name' => 'general_photo',
                    'type' => 'image',
                    'instructions' => 'Общее фото (до и после вместе)',
                    'required' => 0,
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'generalPhoto',
                ),
                // Переключатель использования общего фото
                array(
                    'key' => 'field_work_use_general_photo',
                    'label' => 'Использовать общее фото',
                    'name' => 'use_general_photo',
                    'type' => 'true_false',
                    'instructions' => 'Если включено, будет отображаться общее фото. Если выключено - фото до и после',
                    'required' => 0,
                    'default_value' => 0,
                    'ui' => 1,
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'useGeneralPhoto',
                ),
                // Связь с врачами
                array(
                    'key' => 'field_work_related_doctors',
                    'label' => 'Врачи',
                    'name' => 'related_doctors',
                    'type' => 'relationship',
                    'instructions' => 'Выберите врачей, которые выполнили эту работу',
                    'required' => 0,
                    'post_type' => array('doctors'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedDoctors',
                ),
                // Связь с клиниками
                array(
                    'key' => 'field_work_related_clinics',
                    'label' => 'Клиники',
                    'name' => 'related_clinics',
                    'type' => 'relationship',
                    'instructions' => 'Выберите клиники, где была выполнена эта работа',
                    'required' => 0,
                    'post_type' => array('clinics'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedClinics',
                ),
                // Связь с услугами
                array(
                    'key' => 'field_work_related_services',
                    'label' => 'Услуги',
                    'name' => 'related_services',
                    'type' => 'relationship',
                    'instructions' => 'Выберите услуги, оказанные в этой работе',
                    'required' => 0,
                    'post_type' => array('services'),
                    'return_format' => 'object',
                    'multiple' => 1,
                    'filters' => array('search'),
                    'show_in_graphql' => 1,
                    'graphql_field_name' => 'relatedServices',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'our-works',
                    ),
                ),
            ),
            'style' => 'default',
            'active' => true,
            'show_in_graphql' => 1,
            'graphql_field_name' => 'workFields',
        ));
    }
}
add_action('acf/init', 'unident_register_our_works_fields');

/**
 * Register ACF Fields для Post Sidebar (Share Buttons + CTA Override)
 */
function unident_register_post_sidebar_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    // Share Buttons repeater
    acf_add_local_field_group(array(
        'key' => 'group_post_share_buttons',
        'title' => 'Кнопки шеринга',
        'fields' => array(
            array(
                'key' => 'field_post_share_buttons',
                'label' => 'Кнопки «Поделиться»',
                'name' => 'share_buttons',
                'type' => 'repeater',
                'instructions' => 'SVG-иконка + URL шаблон ({post_url} заменяется на ссылку поста)',
                'layout' => 'table',
                'button_label' => 'Добавить кнопку',
                'sub_fields' => array(
                    array(
                        'key' => 'field_share_btn_icon',
                        'label' => 'SVG иконка',
                        'name' => 'icon',
                        'type' => 'textarea',
                        'instructions' => 'Полный SVG-код иконки',
                        'rows' => 3,
                        'required' => 1,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'icon',
                    ),
                    array(
                        'key' => 'field_share_btn_url',
                        'label' => 'URL шаблон',
                        'name' => 'url',
                        'type' => 'text',
                        'instructions' => 'Например: https://t.me/share/url?url={post_url}',
                        'required' => 1,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'url',
                    ),
                    array(
                        'key' => 'field_share_btn_label',
                        'label' => 'Название',
                        'name' => 'label',
                        'type' => 'text',
                        'instructions' => 'Для aria-label (Telegram, WhatsApp, VK и т.д.)',
                        'required' => 1,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'label',
                    ),
                ),
                'show_in_graphql' => 1,
                'graphql_field_name' => 'shareButtons',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'post',
                ),
            ),
        ),
        'style' => 'default',
        'active' => true,
        'show_in_graphql' => 1,
        'graphql_field_name' => 'postShareButtons',
    ));

    // CTA Override per post
    acf_add_local_field_group(array(
        'key' => 'group_post_cta_override',
        'title' => 'CTA Sidebar — Переопределение',
        'fields' => array(
            array(
                'key' => 'field_post_cta_title',
                'label' => 'Заголовок CTA',
                'name' => 'cta_title',
                'type' => 'text',
                'instructions' => 'Если пусто — используется дефолтный «Прикинуть стоимость лечения»',
                'required' => 0,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'ctaTitle',
            ),
            array(
                'key' => 'field_post_cta_description',
                'label' => 'Описание CTA',
                'name' => 'cta_description',
                'type' => 'textarea',
                'rows' => 3,
                'required' => 0,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'ctaDescription',
            ),
            array(
                'key' => 'field_post_cta_button_text',
                'label' => 'Текст кнопки',
                'name' => 'cta_button_text',
                'type' => 'text',
                'instructions' => 'Если пусто — «Получить расчёт»',
                'required' => 0,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'ctaButtonText',
            ),
            array(
                'key' => 'field_post_cta_image',
                'label' => 'Изображение CTA',
                'name' => 'cta_image',
                'type' => 'image',
                'return_format' => 'array',
                'preview_size' => 'medium',
                'required' => 0,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'ctaImage',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'post',
                ),
            ),
        ),
        'style' => 'default',
        'active' => true,
        'show_in_graphql' => 1,
        'graphql_field_name' => 'postCtaOverride',
    ));
}
add_action('acf/init', 'unident_register_post_sidebar_fields');