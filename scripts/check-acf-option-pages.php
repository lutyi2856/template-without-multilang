<?php
/**
 * Check if ACF Option Pages are registered
 */

require_once('/var/www/html/wp-load.php');

echo "\n=== Checking ACF Option Pages ===\n\n";

if (function_exists('acf_get_options_pages')) {
    $pages = acf_get_options_pages();
    
    if ($pages && count($pages) > 0) {
        echo "Registered option pages:\n";
        foreach ($pages as $page_slug => $page) {
            echo "  - {$page_slug}: {$page['page_title']}\n";
        }
    } else {
        echo "✗ No option pages registered\n";
    }
} else {
    echo "✗ ACF function acf_get_options_pages() not found\n";
}

// Check fields
echo "\n Checking ACF fields for options:\n";
$all_field_groups = acf_get_field_groups();

$option_field_groups = array_filter($all_field_groups, function($group) {
    $locations = $group['location'] ?? [];
    foreach ($locations as $location_rule) {
        foreach ($location_rule as $rule) {
            if ($rule['param'] === 'options_page') {
                return true;
            }
        }
    }
    return false;
});

if (count($option_field_groups) > 0) {
    echo "  Field groups for option pages:\n";
    foreach ($option_field_groups as $group) {
        echo "    - {$group['title']} (key: {$group['key']})\n";
        
        // Get location
        $locations = $group['location'] ?? [];
        foreach ($locations as $location_rule) {
            foreach ($location_rule as $rule) {
                if ($rule['param'] === 'options_page') {
                    echo "      Location: {$rule['value']}\n";
                }
            }
        }
    }
} else {
    echo "  ✗ No field groups for option pages\n";
}

echo "\n=== Check Complete ===\n\n";
