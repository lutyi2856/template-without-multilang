<?php
/**
 * Create 25 test services for Implantation category to test scrollbar
 * 
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-test-services-implantation.php
 */

// Service names for Implantation category
$services = [
    'Имплант OSSTEM с установкой',
    'Имплант Nobel Biocare Premium',
    'Имплант Straumann SLA Active',
    'Синус-лифтинг закрытый',
    'Синус-лифтинг открытый',
    'Костная пластика',
    'All-on-4 полный протокол',
    'All-on-6 расширенный протокол',
    'Имплантация за 1 день',
    'Имплантация под ключ',
    'Безболезненная имплантация',
    'Имплант Alpha Bio',
    'Имплант MIS Seven',
    'Имплант Dentium SuperLine',
    'Имплант Astra Tech',
    'Мембрана для костной пластики',
    'Направленная костная регенерация',
    'Имплантация с немедленной нагрузкой',
    'Базальная имплантация',
    'Скуловая имплантация',
    'Мини-импланты для протезов',
    'Удаление импланта и реимплантация',
    'Ревизия импланта',
    'Формирователь десны установка',
    'Абатмент на имплант установка',
    'Временная коронка на имплант',
    'Постоянная коронка на имплант',
];

echo "=== Creating Test Services for Implantation ===\n\n";

// Get or create Implantation category
$category_slug = 'implantation';
$category_name = 'Имплантация';

$term = get_term_by('slug', $category_slug, 'service_categories');

if (!$term) {
    echo "Creating category '{$category_name}'...\n";
    $result = wp_insert_term(
        $category_name,
        'service_categories',
        [
            'slug' => $category_slug,
            'description' => 'Установка зубных имплантов',
        ]
    );
    
    if (is_wp_error($result)) {
        echo "✗ Error creating category: " . $result->get_error_message() . "\n";
        exit(1);
    }
    
    $term_id = $result['term_id'];
    echo "✓ Created category '{$category_name}' (ID: {$term_id})\n\n";
} else {
    $term_id = $term->term_id;
    echo "✓ Category '{$category_name}' exists (ID: {$term_id})\n\n";
}

echo "Creating services...\n\n";

$created = 0;
$existing = 0;

foreach ($services as $index => $service_name) {
    // Check if service exists
    $existing_posts = get_posts([
        'post_type' => 'services',
        'title' => $service_name,
        'post_status' => 'any',
        'numberposts' => 1,
    ]);
    
    if (!empty($existing_posts)) {
        $post_id = $existing_posts[0]->ID;
        echo "  ✓ Service '{$service_name}' exists (ID: {$post_id})\n";
        $existing++;
    } else {
        // Create new post
        $post_id = wp_insert_post([
            'post_title' => $service_name,
            'post_type' => 'services',
            'post_status' => 'publish',
            'post_content' => "<!-- wp:paragraph -->\n<p>Профессиональная услуга: {$service_name}. Современное оборудование, опытные врачи, гарантия качества.</p>\n<!-- /wp:paragraph -->",
            'post_excerpt' => "Профессиональная услуга: {$service_name}",
        ]);
        
        if (is_wp_error($post_id)) {
            echo "  ✗ Error creating '{$service_name}': " . $post_id->get_error_message() . "\n";
            continue;
        }
        
        echo "  ✓ Created service '{$service_name}' (ID: {$post_id})\n";
        $created++;
    }
    
    // Assign to Implantation category
    wp_set_object_terms($post_id, [$term_id], 'service_categories');
}

echo "\n=== Summary ===\n";
echo "Category: {$category_name} (ID: {$term_id})\n";
echo "Services created: {$created}\n";
echo "Services existing: {$existing}\n";
echo "Total services: " . ($created + $existing) . "\n";
echo "\n✓ Done! Now you can test scrollbar in dropdown.\n";
