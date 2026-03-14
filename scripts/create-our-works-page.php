<?php
/**
 * Create "Our Works" WordPress Page
 * 
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/create-our-works-page.php --allow-root
 * 
 * This script is IDEMPOTENT - safe to run multiple times
 */

// Check if page already exists
$existing_page = get_page_by_path('our-works');

if (!$existing_page) {
    // Create the page
    $page_id = wp_insert_post([
        'post_title' => 'Наши работы',
        'post_name' => 'our-works',
        'post_content' => '<p>Архив работ стоматологической клиники УниДент. Здесь представлены примеры наших работ по имплантации, протезированию, отбеливанию и другим стоматологическим услугам.</p>',
        'post_status' => 'publish',
        'post_type' => 'page',
        'post_author' => 1,
        'comment_status' => 'closed',
        'ping_status' => 'closed',
    ]);
    
    if (is_wp_error($page_id)) {
        echo "❌ Ошибка создания страницы: " . $page_id->get_error_message() . "\n";
    } else {
        echo "✅ Страница создана успешно!\n";
        echo "   ID: $page_id\n";
        echo "   URL: " . get_permalink($page_id) . "\n";
        echo "   Slug: our-works\n";
    }
} else {
    echo "✅ Страница уже существует!\n";
    echo "   ID: {$existing_page->ID}\n";
    echo "   URL: " . get_permalink($existing_page->ID) . "\n";
    echo "   Slug: {$existing_page->post_name}\n";
}
