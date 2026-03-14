<?php
/**
 * Fix image for doctor ID 148 (Соколов Павел Владимирович)
 * 
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/fix-doctor-148-image.php --allow-root
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$doctor_id = 148;
$doctor_name = get_the_title($doctor_id);

echo "=== Fixing image for doctor: {$doctor_name} (ID: {$doctor_id}) ===\n\n";

// Проверяем есть ли уже featured image
$existing_featured = get_post_thumbnail_id($doctor_id);
if ($existing_featured) {
    echo "✓ Already has featured image (ID: {$existing_featured})\n";
    exit;
}

// Используем альтернативный URL из списка
$image_urls = [
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=400&fit=crop&fm=png',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&fm=png',
    'https://images.unsplash.com/photo-1580489944761-15a19d654d0b?w=400&h=400&fit=crop&fm=png',
];

foreach ($image_urls as $index => $url) {
    echo "Attempt " . ($index + 1) . ": Downloading from {$url}...\n";
    
    $response = wp_remote_get($url, [
        'timeout' => 30,
        'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'sslverify' => false,
    ]);
    
    if (is_wp_error($response)) {
        echo "  ✗ Error: " . $response->get_error_message() . "\n";
        continue;
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    if ($response_code !== 200) {
        echo "  ✗ HTTP Error: {$response_code}\n";
        continue;
    }
    
    $body = wp_remote_retrieve_body($response);
    if (empty($body)) {
        echo "  ✗ Empty response body\n";
        continue;
    }
    
    // Create temporary file
    $tmp = wp_tempnam('doctor-image');
    if (!$tmp) {
        echo "  ✗ Failed to create temp file\n";
        continue;
    }
    
    file_put_contents($tmp, $body);
    
    if (!file_exists($tmp) || filesize($tmp) === 0) {
        @unlink($tmp);
        echo "  ✗ Failed to write temp file\n";
        continue;
    }
    
    $file_array = [
        'name' => 'doctor-' . $doctor_id . '-' . time() . '.png',
        'tmp_name' => $tmp
    ];
    
    $attachment_id = media_handle_sideload($file_array, $doctor_id);
    @unlink($tmp);
    
    if (is_wp_error($attachment_id)) {
        echo "  ✗ Upload error: " . $attachment_id->get_error_message() . "\n";
        continue;
    }
    
    // Set metadata
    update_post_meta($attachment_id, '_wp_attachment_image_alt', 'Фото врача ' . $doctor_name);
    wp_update_post([
        'ID' => $attachment_id,
        'post_title' => 'Фото врача ' . $doctor_name,
    ]);
    
    // Set as featured image
    $result = set_post_thumbnail($doctor_id, $attachment_id);
    
    if ($result) {
        $image_url = wp_get_attachment_image_url($attachment_id, 'full');
        echo "  ✓ Success! Image uploaded and set (Attachment ID: {$attachment_id})\n";
        echo "    Image URL: {$image_url}\n";
        exit;
    } else {
        echo "  ✗ Failed to set as featured image\n";
        wp_delete_attachment($attachment_id, true);
    }
}

echo "\n✗ All attempts failed\n";
