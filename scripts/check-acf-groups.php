<?php
/**
 * Check ACF Field Groups for duplicates
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

// Get all ACF Field Groups
$field_groups = acf_get_field_groups();

echo "=== ACF FIELD GROUPS ===\n\n";
echo "Found " . count($field_groups) . " field groups:\n\n";

$titles = [];
$duplicates = [];

foreach ($field_groups as $group) {
    $title = $group['title'];
    $key = $group['key'];
    
    // Track duplicates by title
    if (isset($titles[$title])) {
        $duplicates[$title][] = $key;
        if (count($duplicates[$title]) == 1) {
            $duplicates[$title][] = $titles[$title];
        }
    } else {
        $titles[$title] = $key;
    }
    
    echo "Key: " . $key . "\n";
    echo "Title: " . $title . "\n";
    echo "Active: " . ($group['active'] ? "Yes" : "No") . "\n";
    echo "Local: " . (isset($group['local']) ? $group['local'] : "database") . "\n";
    echo "---\n";
}

if (!empty($duplicates)) {
    echo "\n=== DUPLICATES FOUND ===\n\n";
    foreach ($duplicates as $title => $keys) {
        echo "Title: " . $title . "\n";
        echo "Keys: " . implode(", ", $keys) . "\n";
        echo "---\n";
    }
}
