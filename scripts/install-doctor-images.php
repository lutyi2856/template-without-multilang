<?php
/**
 * Install featured images for all doctors
 * Downloads images from free sources and sets as featured image
 * 
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/install-doctor-images.php --allow-root
 * 
 * The script will:
 * 1. Find all doctors without featured images
 * 2. Try to download images from free sources (Picsum Photos, placeholder services)
 * 3. If download fails, create placeholder images using GD library
 * 4. Upload images to WordPress media library
 * 5. Set as featured image for each doctor
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

// Include WordPress media functions
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

/**
 * Get image URL for doctor from free sources
 * 
 * @param int $doctor_id Doctor post ID
 * @param int $attempt Attempt number (for retry with different source)
 * @return string Image URL
 */
function get_doctor_image_url($doctor_id, $attempt = 0) {
    // List of free medical/doctor PNG image URLs from Unsplash
    // Using direct links to medical professional photos (PNG format, transparent background where possible)
    // These are free-to-use images from Unsplash
    $image_urls = [
        // Medical professionals from Unsplash (direct download links with PNG format)
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1594824476968-48df8a1e7866?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1607990281513-1c0325c4f4ea?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1576091160550-2173dba999e8?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&fm=png',
        // Additional medical professional images
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&fm=png',
        'https://images.unsplash.com/photo-1580489944761-15a19d654d0b?w=400&h=400&fit=crop&fm=png',
    ];
    
    // Use doctor ID and attempt to get consistent but varied image
    $index = ($doctor_id + $attempt) % count($image_urls);
    return $image_urls[$index];
}

/**
 * Create a simple placeholder image using GD library
 * 
 * @param int $post_id Post ID
 * @param string $text Text to display on image
 * @return string|false Temporary file path on success, false on failure
 */
function create_placeholder_image($post_id, $text = 'Doctor') {
    if (!function_exists('imagecreatetruecolor')) {
        return false;
    }
    
    $width = 400;
    $height = 400;
    
    // Create image
    $img = imagecreatetruecolor($width, $height);
    
    // Colors
    $bg_color = imagecolorallocate($img, 74, 144, 226); // Blue background
    $text_color = imagecolorallocate($img, 255, 255, 255); // White text
    
    // Fill background
    imagefill($img, 0, 0, $bg_color);
    
    // Add text
    $font_size = 24;
    $font = 5; // Built-in font
    $text_width = imagefontwidth($font) * strlen($text);
    $text_height = imagefontheight($font);
    $x = ($width - $text_width) / 2;
    $y = ($height - $text_height) / 2;
    
    imagestring($img, $font, $x, $y, $text, $text_color);
    
    // Save to temp file
    $tmp = wp_tempnam('doctor-image');
    if (!$tmp) {
        imagedestroy($img);
        return false;
    }
    
    imagepng($img, $tmp);
    imagedestroy($img);
    
    return $tmp;
}

/**
 * Download image from URL and attach to WordPress post
 * 
 * @param string $url Image URL
 * @param int $post_id Post ID to attach image to
 * @param int $attempt Attempt number for retry
 * @return int|false Attachment ID on success, false on failure
 */
function download_and_attach_image($url, $post_id, $attempt = 0) {
    // Set timeout for download
    $timeout = 30;
    
    // Use wp_remote_get with User-Agent to avoid blocking
    $response = wp_remote_get($url, [
        'timeout' => $timeout,
        'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'sslverify' => false, // Some free services have SSL issues
    ]);
    
    if (is_wp_error($response)) {
        $error_msg = $response->get_error_message();
        if ($attempt === 0) {
            echo "  ⚠ Error downloading: {$error_msg}\n";
        }
        return false;
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    if ($response_code !== 200) {
        if ($attempt === 0) {
            echo "  ⚠ HTTP Error: {$response_code}\n";
        }
        return false;
    }
    
    $body = wp_remote_retrieve_body($response);
    if (empty($body)) {
        return false;
    }
    
    // Create temporary file
    $tmp = wp_tempnam('doctor-image');
    if (!$tmp) {
        return false;
    }
    
    // Write downloaded content to temp file
    file_put_contents($tmp, $body);
    
    // Check if file was written successfully
    if (!file_exists($tmp) || filesize($tmp) === 0) {
        @unlink($tmp);
        return false;
    }
    
    // Get file extension from URL or content
    $file_info = wp_check_filetype(basename(parse_url($url, PHP_URL_PATH)));
    if (!$file_info['ext']) {
        // Try to detect from content
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $tmp);
        finfo_close($finfo);
        
        $mime_to_ext = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];
        $ext = $mime_to_ext[$mime_type] ?? 'jpg';
    } else {
        $ext = $file_info['ext'];
    }
    
    $file_array = [
        'name' => 'doctor-' . $post_id . '-' . time() . '.' . $ext,
        'tmp_name' => $tmp
    ];
    
    // Upload to media library
    $attachment_id = media_handle_sideload($file_array, $post_id, 'Doctor image for ' . get_the_title($post_id));
    
    // Clean up temp file
    @unlink($tmp);
    
    if (is_wp_error($attachment_id)) {
        $error_msg = $attachment_id->get_error_message();
        if ($attempt === 0) {
            echo "  ⚠ Error uploading: {$error_msg}\n";
        }
        return false;
    }
    
    return $attachment_id;
}

echo "=== Installing Doctor Images ===\n\n";

// Get all doctors without featured images
$doctors = get_posts([
    'post_type' => 'doctors',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'meta_query' => [
        [
            'key' => '_thumbnail_id',
            'compare' => 'NOT EXISTS'
        ]
    ]
]);

if (empty($doctors)) {
    echo "No doctors found without featured images.\n";
    echo "All doctors already have images set.\n";
    exit;
}

echo "Found " . count($doctors) . " doctors without images.\n\n";

$success_count = 0;
$error_count = 0;

foreach ($doctors as $doctor) {
    echo "Processing: {$doctor->post_title} (ID: {$doctor->ID})...\n";
    
    // Check if already has thumbnail (double check)
    $thumbnail_id = get_post_thumbnail_id($doctor->ID);
    if ($thumbnail_id) {
        echo "  ⚠ Already has thumbnail (ID: {$thumbnail_id}), skipping...\n\n";
        continue;
    }
    
    $attachment_id = false;
    $max_attempts = 3; // Try multiple sources
    
    // Try downloading with retry logic
    for ($attempt = 0; $attempt < $max_attempts; $attempt++) {
        // Get image URL (different source on retry)
        $image_url = get_doctor_image_url($doctor->ID, $attempt);
        
        echo "  Attempt " . ($attempt + 1) . "/{$max_attempts}: Downloading image...\n";
        
        // Download and attach image
        $attachment_id = download_and_attach_image($image_url, $doctor->ID, $attempt);
        
        if ($attachment_id) {
            break; // Success, exit retry loop
        }
        
        // Wait before retry
        if ($attempt < $max_attempts - 1) {
            sleep(2);
        }
    }
    
    // If all external sources failed, create placeholder image
    if (!$attachment_id && function_exists('imagecreatetruecolor')) {
        echo "  Creating placeholder image...\n";
        $doctor_name = explode(' ', $doctor->post_title);
        $initials = '';
        foreach ($doctor_name as $name_part) {
            if (!empty($name_part)) {
                $initials .= mb_substr($name_part, 0, 1, 'UTF-8');
            }
        }
        $placeholder_text = !empty($initials) ? $initials : 'DR';
        
        $tmp_file = create_placeholder_image($doctor->ID, $placeholder_text);
        if ($tmp_file) {
            $file_array = [
                'name' => 'doctor-' . $doctor->ID . '-' . time() . '.png',
                'tmp_name' => $tmp_file
            ];
            
            $attachment_id = media_handle_sideload($file_array, $doctor->ID, 'Doctor placeholder image');
            @unlink($tmp_file);
        }
    }
    
    if (!$attachment_id) {
        $error_count++;
        echo "  ✗ Failed to download/create image after {$max_attempts} attempts\n\n";
        continue;
    }
    
    // Set as featured image
    $result = set_post_thumbnail($doctor->ID, $attachment_id);
    
    if ($result) {
        $success_count++;
        $image_url_final = wp_get_attachment_image_url($attachment_id, 'full');
        echo "  ✓ Image set successfully (Attachment ID: {$attachment_id})\n";
        echo "    Image URL: {$image_url_final}\n\n";
    } else {
        $error_count++;
        echo "  ✗ Failed to set as featured image (attachment exists but set_post_thumbnail failed)\n\n";
        // Clean up orphaned attachment
        wp_delete_attachment($attachment_id, true);
    }
    
    // Small delay to avoid rate limiting
    sleep(1);
}

echo "=== Summary ===\n";
echo "Total doctors processed: " . count($doctors) . "\n";
echo "Successfully set images: {$success_count}\n";
echo "Errors: {$error_count}\n";
echo "\nDone!\n";
