<?php
/**
 * Download and upload doctor photos from free sources
 * 
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/download-doctor-photos.php
 */

// Список прямых URL PNG изображений врачей (бесплатные источники)
// Используем разнообразные изображения для разных врачей
$doctorImageUrls = [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&fm=png',  // Doctor 1
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&fm=png',  // Doctor 2
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&fm=png',  // Doctor 3
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&fm=png',  // Doctor 4
    'https://images.unsplash.com/photo-1594824476968-48df8a1e7866?w=400&h=400&fit=crop&fm=png',  // Doctor 5
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&fm=png',  // Doctor 6
    'https://images.unsplash.com/photo-1607990281513-1c0325c4f4ea?w=400&h=400&fit=crop&fm=png',  // Doctor 7
    'https://images.unsplash.com/photo-1576091160550-2173dba999e8?w=400&h=400&fit=crop&fm=png',  // Doctor 8
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&fm=png'   // Doctor 9
];

echo "=== Downloading and Uploading Doctor Photos ===\n\n";

// Получаем всех врачей
$doctors = get_posts([
    'post_type' => 'doctors',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'orderby' => 'ID',
    'order' => 'ASC'
]);

if (empty($doctors)) {
    echo "✗ No doctors found!\n";
    exit;
}

echo "Found " . count($doctors) . " doctors\n\n";

$processed = 0;
$skipped = 0;
$errors = 0;

foreach ($doctors as $index => $doctor) {
    $doctor_id = $doctor->ID;
    $doctor_name = $doctor->post_title;
    
    echo "Processing: {$doctor_name} (ID: {$doctor_id})\n";
    
    // Проверяем есть ли уже featured image
    $existing_featured = get_post_thumbnail_id($doctor_id);
    if ($existing_featured) {
        echo "  ⚠ Already has featured image (ID: {$existing_featured}), skipping...\n";
        $skipped++;
        echo "\n";
        continue;
    }
    
    // Выбираем URL изображения (циклически если врачей больше чем URL)
    $imageUrl = $doctorImageUrls[$index % count($doctorImageUrls)];
    
    echo "  📥 Downloading image from: {$imageUrl}\n";
    
    // Скачиваем изображение
    $image_data = @file_get_contents($imageUrl);
    
    if ($image_data === false) {
        echo "  ✗ Failed to download image\n";
        $errors++;
        echo "\n";
        continue;
    }
    
    // Создаем временный файл
    $upload_dir = wp_upload_dir();
    $temp_file = $upload_dir['path'] . '/doctor-' . $doctor_id . '-' . time() . '.png';
    
    if (file_put_contents($temp_file, $image_data) === false) {
        echo "  ✗ Failed to save temporary file\n";
        $errors++;
        echo "\n";
        continue;
    }
    
    // Подготавливаем данные для загрузки
    $file_array = [
        'name' => 'doctor-' . sanitize_file_name($doctor_name) . '.png',
        'tmp_name' => $temp_file
    ];
    
    // Загружаем в медиатеку WordPress
    $attachment_id = media_handle_sideload($file_array, 0);
    
    // Удаляем временный файл
    @unlink($temp_file);
    
    if (is_wp_error($attachment_id)) {
        echo "  ✗ Failed to upload: " . $attachment_id->get_error_message() . "\n";
        $errors++;
        echo "\n";
        continue;
    }
    
    // Устанавливаем метаданные
    update_post_meta($attachment_id, '_wp_attachment_image_alt', 'Фото врача ' . $doctor_name);
    wp_update_post([
        'ID' => $attachment_id,
        'post_title' => 'Фото врача ' . $doctor_name,
        'post_excerpt' => 'Фотография врача ' . $doctor_name
    ]);
    
    // Устанавливаем как featured image
    $result = set_post_thumbnail($doctor_id, $attachment_id);
    
    if ($result) {
        echo "  ✓ Successfully uploaded and set as featured image (Media ID: {$attachment_id})\n";
        $processed++;
    } else {
        echo "  ✗ Failed to set as featured image\n";
        $errors++;
    }
    
    echo "\n";
    
    // Небольшая задержка чтобы не перегружать сервер
    usleep(500000); // 0.5 секунды
}

echo "=== Summary ===\n";
echo "Processed: {$processed}\n";
echo "Skipped (already have photo): {$skipped}\n";
echo "Errors: {$errors}\n";
echo "\n✓ Done!\n";
