<?php
/**
 * Create 5 Test Reviews with all fields filled
 * 
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-test-reviews.php
 * 
 * This script is IDEMPOTENT - safe to run multiple times
 * Согласно skill wordpress-test-data-creation
 */

// Fake review data
$reviews_data = [
    [
        'title' => 'Бабушке сделали протезирование на 4 имплантах, все прошло быстро',
        'content' => 'Мне все понравилось: на консультации все было понятно рассказано. Мне показали, какие результаты будут, меня это поразило. Я не думал, что возможно сделать операцию без болевых ощущений вообще. Уехал из клиники сам, за рулем. Все прошло для меня незаметно, врачи грамотно и профессионально сделали свою работу.',
        'author_name' => 'Виктория Н.',
        'rating' => 4.7,
        'answer' => 'Здравствуйте, Виктория! Спасибо за вашу обратную связь. Мы стараемся сочетать высокое качество услуг с индивидуальным подходом к клиенту. Если у вас появятся вопросы – будем рады помочь.',
    ],
    [
        'title' => 'Профессиональное лечение кариеса без боли',
        'content' => 'Обратилась с острой болью. Врач принял быстро, провел качественное лечение. Современное оборудование, внимательное отношение. Боль прошла сразу после процедуры. Очень довольна результатом.',
        'author_name' => 'Мария С.',
        'rating' => 5.0,
        'answer' => 'Спасибо за теплые слова! Рады, что смогли помочь вам быстро и качественно.',
    ],
    [
        'title' => 'Имплантация под ключ - отличный результат',
        'content' => 'Делал имплантацию двух зубов. Весь процесс занял несколько месяцев, но результат того стоил. Врач подробно объяснял каждый этап, контролировал процесс заживления. Сейчас зубы как родные, никакого дискомфорта.',
        'author_name' => 'Владимир К.',
        'rating' => 4.9,
        'answer' => 'Владимир, благодарим за доверие! Имплантация - это серьезная процедура, и мы рады, что все прошло успешно.',
    ],
    [
        'title' => 'Отбеливание зубов - результат превзошел ожидания',
        'content' => 'Долго решалась на отбеливание. В УниДенте предложили безопасный метод, все подробно рассказали. Результат заметен сразу! Зубы стали белее на несколько тонов, при этом никакой чувствительности.',
        'author_name' => 'Анна П.',
        'rating' => 4.8,
        'answer' => 'Анна, спасибо за отзыв! Мы используем только проверенные методы отбеливания, которые безопасны для эмали.',
    ],
    [
        'title' => 'Установка брекетов - качественно и без переплат',
        'content' => 'Сравнивала цены в разных клиниках, в УниДенте оказалось оптимальное соотношение цена-качество. Врач составил план лечения, все прозрачно. Ношу брекеты уже полгода, зубы заметно выравниваются. Довольна выбором клиники.',
        'author_name' => 'Елена Т.',
        'rating' => 4.6,
        'answer' => 'Елена, благодарим за доверие! Ортодонтическое лечение требует времени, но результат будет отличным.',
    ],
];

// Get existing doctors for relationships
$doctors = get_posts([
    'post_type' => 'doctors',
    'posts_per_page' => 5,
    'post_status' => 'publish',
]);

if (empty($doctors)) {
    echo "Error: No doctors found. Create doctors first.\n";
    exit(1);
}

echo "=== Creating Test Reviews ===\n\n";

$created_count = 0;
$existing_count = 0;

foreach ($reviews_data as $index => $data) {
    // Check if review already exists (IDEMPOTENT)
    $existing_posts = get_posts([
        'post_type' => 'reviews',
        'title' => $data['title'],
        'post_status' => 'publish',
        'numberposts' => 1,
    ]);
    
    if (!empty($existing_posts)) {
        $review_id = $existing_posts[0]->ID;
        echo "✓ Review exists: {$data['title']} (ID: {$review_id})\n";
        $existing_count++;
        continue;
    }
    
    // Create review post
    $review_id = wp_insert_post([
        'post_title' => $data['title'],
        'post_content' => $data['content'],
        'post_type' => 'reviews',
        'post_status' => 'publish',
        'post_author' => 1,
    ]);
    
    if (is_wp_error($review_id)) {
        echo "✗ Error: {$data['title']} - " . $review_id->get_error_message() . "\n";
        continue;
    }
    
    // Update ACF fields
    if (function_exists('update_field')) {
        update_field('author_name', $data['author_name'], $review_id);
        update_field('rating', $data['rating'], $review_id);
        update_field('answer', $data['answer'], $review_id);
    }
    
    // Link to random doctor
    $random_doctor = $doctors[array_rand($doctors)];
    update_field('related_doctors', [$random_doctor->ID], $review_id);
    
    // Bidirectional: add review to doctor
    $doctor_reviews = get_field('related_reviews', $random_doctor->ID) ?: [];
    if (!in_array($review_id, $doctor_reviews)) {
        $doctor_reviews[] = $review_id;
        update_field('related_reviews', $doctor_reviews, $random_doctor->ID);
    }
    
    echo "✓ Created: {$data['title']} (ID: {$review_id})\n";
    echo "  Author: {$data['author_name']}, Rating: {$data['rating']}\n";
    echo "  Linked to: {$random_doctor->post_title}\n\n";
    
    $created_count++;
}

echo "\n=== Summary ===\n";
echo "Created: {$created_count}\n";
echo "Already existed: {$existing_count}\n";
echo "Total: " . count($reviews_data) . "\n";

echo "\n✓ Done!\n";
echo "\nNext steps:\n";
echo "1. Clear caches: wp cache flush && wp graphql clear-schema-cache\n";
echo "2. Upload author images and platform logos in WordPress Admin\n";
echo "3. Test GraphQL query at http://localhost:8002/graphql-ide\n";
