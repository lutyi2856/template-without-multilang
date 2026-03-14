<?php
/**
 * Import ACF Field Groups from JSON files into WordPress database
 * This makes them editable in WordPress Admin UI
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

if (!function_exists('acf_import_field_group')) {
    die('ACF not found!' . PHP_EOL);
}

$json_dir = WP_CONTENT_DIR . '/acf-json';

if (!is_dir($json_dir)) {
    die('ACF JSON directory not found: ' . $json_dir . PHP_EOL);
}

$files = glob($json_dir . '/*.json');

if (empty($files)) {
    die('No JSON files found in ' . $json_dir . PHP_EOL);
}

echo 'Found ' . count($files) . ' JSON files' . PHP_EOL . PHP_EOL;

foreach ($files as $file) {
    $basename = basename($file);
    echo 'Processing: ' . $basename . '...' . PHP_EOL;
    
    $json = file_get_contents($file);
    $field_group = json_decode($json, true);
    
    if (!$field_group) {
        echo '  ERROR: Failed to decode JSON' . PHP_EOL;
        continue;
    }
    
    // Check if field group already exists
    $existing = acf_get_field_group($field_group['key']);
    
    if ($existing) {
        echo '  Field group already exists: ' . $field_group['title'] . PHP_EOL;
        echo '  Updating...' . PHP_EOL;
        $field_group['ID'] = $existing['ID'];
    } else {
        echo '  Creating new field group: ' . $field_group['title'] . PHP_EOL;
    }
    
    // Import field group
    $result = acf_import_field_group($field_group);
    
    if ($result) {
        echo '  SUCCESS: Field group imported!' . PHP_EOL;
    } else {
        echo '  ERROR: Failed to import field group' . PHP_EOL;
    }
    
    echo PHP_EOL;
}

echo 'Import completed!' . PHP_EOL;
