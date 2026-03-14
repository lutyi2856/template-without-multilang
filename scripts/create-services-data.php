<?php
/**
 * Создание тестовых данных для Services Dropdown
 * 
 * Создает:
 * - 7 категорий услуг (terms в таксономии service_categories)
 * - Разное количество услуг в каждой категории (от 6 до 12)
 * 
 * Запуск: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-services-data.php
 */

// Категории услуг (7 категорий как в Figma)
$categories = [
    [
        'name' => 'Имплантация зубов',
        'slug' => 'implantation',
        'description' => 'Установка зубных имплантов',
        'services_count' => 10
    ],
    [
        'name' => 'Лечение зубов',
        'slug' => 'treatment',
        'description' => 'Терапевтическое лечение',
        'services_count' => 8
    ],
    [
        'name' => 'Протезирование',
        'slug' => 'prosthetics',
        'description' => 'Восстановление зубов протезами',
        'services_count' => 12
    ],
    [
        'name' => 'Отбеливание',
        'slug' => 'whitening',
        'description' => 'Профессиональное отбеливание зубов',
        'services_count' => 6
    ],
    [
        'name' => 'Брекеты и ортодонтия',
        'slug' => 'braces',
        'description' => 'Исправление прикуса',
        'services_count' => 9
    ],
    [
        'name' => 'Детская стоматология',
        'slug' => 'children',
        'description' => 'Стоматология для детей',
        'services_count' => 7
    ],
    [
        'name' => 'Хирургия',
        'slug' => 'surgery',
        'description' => 'Хирургические вмешательства',
        'services_count' => 11
    ],
];

// Шаблоны услуг для каждой категории
$service_templates = [
    'implantation' => [
        'Имплантация зубов под ключ',
        'Имплант OSSTEM',
        'Имплант Nobel Biocare',
        'Имплант Straumann',
        'Синус-лифтинг',
        'Костная пластика',
        'All-on-4',
        'All-on-6',
        'Имплантация за 1 день',
        'Имплантация без боли',
    ],
    'treatment' => [
        'Лечение кариеса',
        'Лечение пульпита',
        'Лечение периодонтита',
        'Эндодонтическое лечение',
        'Лечение под микроскопом',
        'Художественная реставрация',
        'Лечение зуба мудрости',
        'Перелечивание каналов',
    ],
    'prosthetics' => [
        'Коронки из циркония',
        'Керамические коронки',
        'Металлокерамические коронки',
        'Виниры',
        'Вкладки и накладки',
        'Мостовидные протезы',
        'Съемные протезы',
        'Бюгельные протезы',
        'Протезы на имплантах',
        'Временные коронки',
        'Протезирование на замках',
        'Протезирование при полном отсутствии зубов',
    ],
    'whitening' => [
        'Отбеливание ZOOM',
        'Лазерное отбеливание',
        'Домашнее отбеливание',
        'Отбеливание Opalescence',
        'Профессиональная чистка',
        'Air Flow',
    ],
    'braces' => [
        'Металлические брекеты',
        'Керамические брекеты',
        'Сапфировые брекеты',
        'Лингвальные брекеты',
        'Элайнеры Invisalign',
        'Исправление прикуса',
        'Ортодонтическое лечение взрослых',
        'Ретенция после брекетов',
        'Пластинки для детей',
    ],
    'children' => [
        'Детская профилактика',
        'Лечение молочных зубов',
        'Серебрение зубов',
        'Фторирование',
        'Герметизация фиссур',
        'Удаление молочных зубов',
        'Детская ортодонтия',
    ],
    'surgery' => [
        'Удаление зуба',
        'Удаление зуба мудрости',
        'Сложное удаление',
        'Резекция верхушки корня',
        'Удаление кисты',
        'Пластика уздечки',
        'Вестибулопластика',
        'Лоскутная операция',
        'Имплантация костной ткани',
        'Открытый синус-лифтинг',
        'Закрытый синус-лифтинг',
    ],
];

echo "=== Создание категорий услуг ===\n\n";

$created_terms = [];

foreach ($categories as $category) {
    // Проверяем, существует ли термин
    $existing_term = get_term_by('slug', $category['slug'], 'service_categories');
    
    if ($existing_term) {
        echo "✓ Категория '{$category['name']}' уже существует (ID: {$existing_term->term_id})\n";
        $term_id = $existing_term->term_id;
    } else {
        // Создаем новый термин
        $result = wp_insert_term(
            $category['name'],
            'service_categories',
            [
                'slug' => $category['slug'],
                'description' => $category['description'],
            ]
        );
        
        if (is_wp_error($result)) {
            echo "✗ Ошибка создания категории '{$category['name']}': " . $result->get_error_message() . "\n";
            continue;
        }
        
        $term_id = $result['term_id'];
        echo "✓ Создана категория '{$category['name']}' (ID: {$term_id})\n";
    }
    
    $created_terms[$category['slug']] = [
        'id' => $term_id,
        'name' => $category['name'],
        'services_count' => $category['services_count'],
    ];
}

echo "\n=== Создание услуг ===\n\n";

$total_services = 0;

foreach ($created_terms as $slug => $term_data) {
    $templates = $service_templates[$slug] ?? [];
    $count = min($term_data['services_count'], count($templates));
    
    echo "Категория: {$term_data['name']} (создаем {$count} услуг)\n";
    
    for ($i = 0; $i < $count; $i++) {
        $service_name = $templates[$i];
        
        // Проверяем, существует ли услуга
        $existing_posts = get_posts([
            'post_type' => 'services',
            'title' => $service_name,
            'post_status' => 'publish',
            'numberposts' => 1,
        ]);
        
        if (!empty($existing_posts)) {
            $post_id = $existing_posts[0]->ID;
            echo "  ✓ Услуга '{$service_name}' уже существует (ID: {$post_id})\n";
        } else {
            // Создаем новый пост
            $post_id = wp_insert_post([
                'post_title' => $service_name,
                'post_type' => 'services',
                'post_status' => 'publish',
                'post_content' => "<!-- wp:paragraph -->\n<p>Описание услуги: {$service_name}</p>\n<!-- /wp:paragraph -->",
                'post_excerpt' => "Профессиональная услуга: {$service_name}",
            ]);
            
            if (is_wp_error($post_id)) {
                echo "  ✗ Ошибка создания услуги '{$service_name}': " . $post_id->get_error_message() . "\n";
                continue;
            }
            
            echo "  ✓ Создана услуга '{$service_name}' (ID: {$post_id})\n";
        }
        
        // Привязываем к категории
        wp_set_object_terms($post_id, [$term_data['id']], 'service_categories');
        
        $total_services++;
    }
    
    echo "\n";
}

echo "=== Итого ===\n";
echo "Категорий: " . count($created_terms) . "\n";
echo "Услуг: {$total_services}\n";
echo "\n✓ Готово!\n";
