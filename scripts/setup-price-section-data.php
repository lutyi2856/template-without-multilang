<?php
/**
 * Setup Price Section Data
 * 
 * Создает полные тестовые данные для блока цен:
 * 1. Создает цены для всех услуг с average_price_city
 * 2. Связывает услуги с ценами (bidirectional)
 * 3. Создает акции и связывает их с услугами
 * 4. Настраивает Option Pages (Block Prices и Contacts)
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo '=== Setting up Price Section Data ===' . PHP_EOL . PHP_EOL;

// 1. Получаем все услуги
echo '1. Getting all Services...' . PHP_EOL;
$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => -1,
    'post_status' => 'publish'
]);

if (empty($services)) {
    echo '   ERROR: No services found! Please create services first.' . PHP_EOL;
    exit(1);
}

echo '   Found ' . count($services) . ' services' . PHP_EOL;

// 2. Создаем цены для каждой услуги
echo PHP_EOL . '2. Creating Prices for Services...' . PHP_EOL;
$price_ids = [];

foreach ($services as $service) {
    // Проверяем, есть ли уже цена для этой услуги
    $existing_prices = get_posts([
        'post_type' => 'prices',
        'meta_query' => [
            [
                'key' => 'related_service',
                'value' => $service->ID,
                'compare' => '='
            ]
        ],
        'posts_per_page' => 1
    ]);

    if (!empty($existing_prices)) {
        $price_id = $existing_prices[0]->ID;
        echo "   ✓ Price already exists for '{$service->post_title}' (ID: {$price_id})" . PHP_EOL;
    } else {
        // Создаем цену
        $base_price = rand(10000, 100000); // Случайная цена от 10k до 100k
        $average_city_price = $base_price + rand(5000, 20000); // Средняя цена выше на 5-20k
        
        $price_id = wp_insert_post([
            'post_title' => 'Цена: ' . $service->post_title,
            'post_content' => 'Цена на услугу ' . $service->post_title,
            'post_status' => 'publish',
            'post_type' => 'prices'
        ]);

        if (is_wp_error($price_id)) {
            echo "   ✗ ERROR creating price for '{$service->post_title}': " . $price_id->get_error_message() . PHP_EOL;
            continue;
        }

        // Устанавливаем ACF поля
        update_field('regular_price', $base_price, $price_id);
        update_field('promo_price', $base_price * 0.85, $price_id); // Скидка 15%
        update_field('average_price_city', $average_city_price, $price_id);
        update_field('currency', '₽', $price_id);
        update_field('period', 'процедура', $price_id);
        update_field('price_type', 'regular', $price_id);
        
        // Связываем цену с услугой (bidirectional)
        // Связь 1: Price → Service
        update_field('related_service', $service->ID, $price_id);
        
        // Связь 2: Service → Price (bidirectional)
        // ACF relationship field ожидает массив ID или массив WP_Post объектов
        $service_prices = get_field('related_prices', $service->ID);
        if (!is_array($service_prices)) {
            $service_prices = [];
        }
        
        // Проверяем, есть ли уже эта цена в массиве (по ID)
        $price_exists = false;
        foreach ($service_prices as $existing_price) {
            $existing_id = is_object($existing_price) ? $existing_price->ID : $existing_price;
            if ($existing_id == $price_id) {
                $price_exists = true;
                break;
            }
        }
        
        if (!$price_exists) {
            $service_prices[] = $price_id; // Добавляем ID
            update_field('related_prices', $service_prices, $service->ID);
        }

        echo "   ✓ Created price for '{$service->post_title}' (ID: {$price_id}, Price: {$base_price}₽, City Avg: {$average_city_price}₽)" . PHP_EOL;
    }

    $price_ids[] = $price_id;
}

// 3. Создаем акции
echo PHP_EOL . '3. Creating Promotions...' . PHP_EOL;

// Акция 1: Выгодная цена на имплантацию OSSTEM
$promotion_titles = [
    'Выгодная цена на имплантацию OSSTEM',
    'Специальное предложение на протезирование',
    'Акция на лечение кариеса'
];

$promotion_ids = [];

foreach ($promotion_titles as $index => $title) {
    // Проверяем, существует ли уже такая акция
    $existing_promotions = get_posts([
        'post_type' => 'promotions',
        'title' => $title,
        'posts_per_page' => 1
    ]);

    if (!empty($existing_promotions)) {
        $promotion_id = $existing_promotions[0]->ID;
        echo "   ✓ Promotion already exists: '{$title}' (ID: {$promotion_id})" . PHP_EOL;
    } else {
        // Берем услугу для акции (по кругу)
        $service_for_promo = $services[$index % count($services)];
        
        $promotion_id = wp_insert_post([
            'post_title' => $title,
            'post_content' => 'Пока удерживаем «старую» цену на складские запасы. Хватит ненадолго.',
            'post_excerpt' => 'Пока удерживаем «старую» цену на складские запасы. Хватит ненадолго.',
            'post_status' => 'publish',
            'post_type' => 'promotions'
        ]);

        if (is_wp_error($promotion_id)) {
            echo "   ✗ ERROR creating promotion '{$title}': " . $promotion_id->get_error_message() . PHP_EOL;
            continue;
        }

        // Связываем акцию с услугой
        update_field('related_services', [$service_for_promo->ID], $promotion_id);
        
        // Обновляем связь на стороне услуги
        $service_promotions = get_field('related_promotions', $service_for_promo->ID);
        if (!is_array($service_promotions)) {
            $service_promotions = [];
        }
        if (!in_array($promotion_id, $service_promotions)) {
            $service_promotions[] = $promotion_id;
            update_field('related_promotions', $service_promotions, $service_for_promo->ID);
        }

        echo "   ✓ Created promotion: '{$title}' (ID: {$promotion_id}, Service: {$service_for_promo->post_title})" . PHP_EOL;
    }

    $promotion_ids[] = $promotion_id;
}

// 4. Настраиваем Option Page "Block Prices"
echo PHP_EOL . '4. Setting up Block Prices Option Page...' . PHP_EOL;
if (!empty($promotion_ids)) {
    $selected_promotion_id = $promotion_ids[0]; // Первая акция
    update_field('selected_promotion', $selected_promotion_id, 'block_prices_options');
    echo "   ✓ Set selected promotion: {$selected_promotion_id} ('{$promotion_titles[0]}')" . PHP_EOL;
} else {
    echo "   ✗ No promotions to select" . PHP_EOL;
}

// 5. Настраиваем Option Page "Contacts"
echo PHP_EOL . '5. Setting up Contacts Option Page...' . PHP_EOL;
update_field('email', 'info@unident.ru', 'contacts_options');
update_field('phone', '+7 (495) 123-45-67', 'contacts_options');

// Создаем социальные сети (name + icon + url — как в header/footer)
$social_contacts = [
    [ 'name' => 'Telegram', 'icon' => 'telegram', 'url' => 'https://t.me/unident' ],
    [ 'name' => 'WhatsApp', 'icon' => 'whatsapp', 'url' => 'https://wa.me/79999999999' ]
];
update_field('social_contacts', $social_contacts, 'contacts_options');
// ACF default_value может перезаписать icon — явно фиксируем
$saved = get_field('social_contacts', 'contacts_options');
if (is_array($saved) && count($saved) >= 2 && ($saved[1]['icon'] ?? '') !== 'whatsapp') {
    $saved[1]['icon'] = 'whatsapp';
    update_field('social_contacts', $saved, 'contacts_options');
}
echo "   ✓ Set contacts:" . PHP_EOL;
echo "     - Email: info@unident.ru" . PHP_EOL;
echo "     - Phone: +7 (495) 123-45-67" . PHP_EOL;
echo "     - Social contacts: " . count($social_contacts) . " items" . PHP_EOL;

// 6. Проверяем категории услуг
echo PHP_EOL . '6. Checking Service Categories...' . PHP_EOL;
$categories = get_terms([
    'taxonomy' => 'service_categories',
    'hide_empty' => false
]);

if (empty($categories)) {
    echo "   ⚠ No categories found. Creating default categories..." . PHP_EOL;
    
    $default_categories = [
        'Имплантация зубов',
        'Протезирование',
        'Лечение',
        'Отбеливание'
    ];

    foreach ($default_categories as $cat_name) {
        $term = wp_insert_term($cat_name, 'service_categories');
        if (!is_wp_error($term)) {
            echo "   ✓ Created category: {$cat_name}" . PHP_EOL;
            
            // Присваиваем категорию первой услуге
            if (!empty($services)) {
                wp_set_post_terms($services[0]->ID, [$term['term_id']], 'service_categories');
            }
        }
    }
} else {
    echo "   ✓ Found " . count($categories) . " categories" . PHP_EOL;
    
    // Убеждаемся, что у каждой услуги есть категория
    foreach ($services as $service) {
        $service_categories = wp_get_post_terms($service->ID, 'service_categories');
        if (empty($service_categories)) {
            // Присваиваем первую категорию
            wp_set_post_terms($service->ID, [$categories[0]->term_id], 'service_categories');
            echo "   ✓ Assigned category '{$categories[0]->name}' to '{$service->post_title}'" . PHP_EOL;
        }
    }
}

// 7. Финальная проверка
echo PHP_EOL . '7. Final Verification...' . PHP_EOL;

$total_services = count($services);
$total_prices = count($price_ids);
$total_promotions = count($promotion_ids);

echo "   Services: {$total_services}" . PHP_EOL;
echo "   Prices: {$total_prices}" . PHP_EOL;
echo "   Promotions: {$total_promotions}" . PHP_EOL;

// Проверяем связи
$services_with_prices = 0;
foreach ($services as $service) {
    $prices = get_field('related_prices', $service->ID);
    if (is_array($prices) && !empty($prices)) {
        $services_with_prices++;
    }
}

echo "   Services with prices: {$services_with_prices}/{$total_services}" . PHP_EOL;

// Проверяем Option Pages
$block_prices_promo = get_field('selected_promotion', 'contacts_options');
$contacts_phone = get_field('phone', 'contacts_options');

echo PHP_EOL . '=== Setup Complete! ===' . PHP_EOL;
echo PHP_EOL . 'Summary:' . PHP_EOL;
echo "  ✓ Created/updated {$total_prices} prices" . PHP_EOL;
echo "  ✓ Created/updated {$total_promotions} promotions" . PHP_EOL;
echo "  ✓ Configured Block Prices Option Page" . PHP_EOL;
echo "  ✓ Configured Contacts Option Page" . PHP_EOL;
echo PHP_EOL . 'Next steps:' . PHP_EOL;
echo '  1. Check frontend: http://localhost:3000' . PHP_EOL;
echo '  2. Check prices page: http://localhost:3000/prices' . PHP_EOL;
echo '  3. Verify in WordPress admin:' . PHP_EOL;
echo '     - Prices: http://localhost:8002/wp-admin/edit.php?post_type=prices' . PHP_EOL;
echo '     - Services: http://localhost:8002/wp-admin/edit.php?post_type=services' . PHP_EOL;
echo '     - Promotions: http://localhost:8002/wp-admin/edit.php?post_type=promotions' . PHP_EOL;
echo '     - Block Prices: http://localhost:8002/wp-admin/admin.php?page=block-prices-settings' . PHP_EOL;
echo '     - Contacts: http://localhost:8002/wp-admin/admin.php?page=contacts-settings' . PHP_EOL;
