<?php
/**
 * Create test promotions with ACF fields
 * 
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-promotions-data.php
 */

$promotions = [
    [
        'title' => 'Скидка 30% на имплантацию',
        'slug' => 'implantation-30-discount',
        'excerpt' => 'Акция действует на установку имплантов всех систем',
        'content' => '<!-- wp:paragraph --><p>Получите скидку 30% на имплантацию зубов. Акция действует на все системы имплантов: OSSTEM, Nobel Biocare, Straumann. Консультация имплантолога бесплатно.</p><!-- /wp:paragraph -->',
        'acf_fields' => [
            'description' => 'Установка имплантов всех систем со скидкой 30%. Консультация имплантолога бесплатно.',
            'old_price' => 45000,
            'new_price' => 31500,
            'currency' => '₽',
            'discount' => 30,
            'valid_until' => '2026-03-31',
            'badge' => '-30%'
        ]
    ],
    [
        'title' => 'Профессиональная гигиена + отбеливание',
        'slug' => 'hygiene-whitening-combo',
        'excerpt' => 'Комплекс: чистка + отбеливание со скидкой 20%',
        'content' => '<!-- wp:paragraph --><p>Профессиональная гигиена полости рта + отбеливание системой ZOOM 4 за одно посещение. Экономьте 20% при покупке комплекса.</p><!-- /wp:paragraph -->',
        'acf_fields' => [
            'description' => 'Комплексная процедура: профессиональная чистка зубов и отбеливание ZOOM 4.',
            'old_price' => 25000,
            'new_price' => 20000,
            'currency' => '₽',
            'discount' => 20,
            'valid_until' => '2026-02-28',
            'badge' => '-20%'
        ]
    ],
    [
        'title' => 'Лечение кариеса от 2 500 ₽',
        'slug' => 'caries-treatment-special',
        'excerpt' => 'Специальная цена на лечение кариеса с пломбой',
        'content' => '<!-- wp:paragraph --><p>Лечение кариеса с установкой фотополимерной пломбы. Акционная цена действует при лечении от 3 зубов.</p><!-- /wp:paragraph -->',
        'acf_fields' => [
            'description' => 'Качественное лечение кариеса с пломбой из композитного материала.',
            'old_price' => 4500,
            'new_price' => 2500,
            'currency' => '₽',
            'discount' => 44,
            'valid_until' => '2026-03-15',
            'badge' => 'от 2500₽'
        ]
    ],
    [
        'title' => 'Брекеты: установка в подарок',
        'slug' => 'braces-free-installation',
        'excerpt' => 'Бесплатная установка брекет-системы',
        'content' => '<!-- wp:paragraph --><p>При покупке брекет-системы - установка бесплатно. Действует на металлические, керамические и сапфировые брекеты.</p><!-- /wp:paragraph -->',
        'acf_fields' => [
            'description' => 'Экономьте 15 000 ₽ на установке брекет-системы.',
            'old_price' => 85000,
            'new_price' => 70000,
            'currency' => '₽',
            'discount' => 18,
            'valid_until' => '2026-04-30',
            'badge' => 'Установка в подарок'
        ]
    ],
    [
        'title' => 'Виниры E-max: скидка 25%',
        'slug' => 'veneers-emax-discount',
        'excerpt' => 'Керамические виниры E-max со скидкой',
        'content' => '<!-- wp:paragraph --><p>Установка керамических виниров E-max со скидкой 25%. Идеальная улыбка за 2 посещения.</p><!-- /wp:paragraph -->',
        'acf_fields' => [
            'description' => 'Керамические виниры E-max - золотой стандарт эстетической стоматологии.',
            'old_price' => 32000,
            'new_price' => 24000,
            'currency' => '₽',
            'discount' => 25,
            'valid_until' => '2026-03-31',
            'badge' => '-25%'
        ]
    ],
    [
        'title' => 'Детская стоматология: первичный прием бесплатно',
        'slug' => 'kids-free-consultation',
        'excerpt' => 'Бесплатная консультация детского стоматолога',
        'content' => '<!-- wp:paragraph --><p>Первый прием у детского стоматолога бесплатно. Осмотр, консультация, рекомендации по уходу.</p><!-- /wp:paragraph -->',
        'acf_fields' => [
            'description' => 'Бесплатный первичный осмотр для детей до 14 лет.',
            'old_price' => 2000,
            'new_price' => 0,
            'currency' => '₽',
            'discount' => 100,
            'valid_until' => '2026-12-31',
            'badge' => 'Бесплатно'
        ]
    ],
];

echo "=== Creating Promotions ===\n\n";

$total_created = 0;
$total_existing = 0;

foreach ($promotions as $promotion) {
    // Check if promotion exists by slug
    $existing = get_posts([
        'post_type' => 'promotions',
        'name' => $promotion['slug'],
        'post_status' => 'publish',
        'numberposts' => 1,
    ]);
    
    if (!empty($existing)) {
        $post_id = $existing[0]->ID;
        echo "✓ Promotion '{$promotion['title']}' exists (ID: {$post_id})\n";
        $total_existing++;
    } else {
        // Create new promotion
        $post_id = wp_insert_post([
            'post_title' => $promotion['title'],
            'post_name' => $promotion['slug'],
            'post_type' => 'promotions',
            'post_status' => 'publish',
            'post_content' => $promotion['content'],
            'post_excerpt' => $promotion['excerpt'],
        ]);
        
        if (is_wp_error($post_id)) {
            echo "✗ Error creating '{$promotion['title']}': " . $post_id->get_error_message() . "\n";
            continue;
        }
        
        echo "✓ Created promotion '{$promotion['title']}' (ID: {$post_id})\n";
        $total_created++;
    }
    
    // Add ACF fields
    if (function_exists('update_field') && isset($promotion['acf_fields'])) {
        foreach ($promotion['acf_fields'] as $field_key => $field_value) {
            update_field($field_key, $field_value, $post_id);
        }
        echo "  ✓ Added ACF fields\n";
    }
    
    echo "\n";
}

echo "=== Summary ===\n";
echo "Created: {$total_created}\n";
echo "Already existed: {$total_existing}\n";
echo "Total promotions: " . ($total_created + $total_existing) . "\n";
echo "\n✓ Done!\n";
