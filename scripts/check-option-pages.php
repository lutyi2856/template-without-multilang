<?php
/**
 * Check Option Pages data
 */

require_once('/var/www/html/wp-load.php');

echo "\n=== Checking Option Pages ===\n\n";

// 1. Block Prices Settings
echo "1. Block Prices Settings:\n";
$selected_promotion_id = get_field('selected_promotion', 'option');
echo "   selected_promotion field: " . ($selected_promotion_id ? "ID {$selected_promotion_id}" : "NULL") . "\n";

if ($selected_promotion_id) {
    $promotion = get_post($selected_promotion_id);
    if ($promotion) {
        echo "   ✓ Promotion found: {$promotion->post_title}\n";
    } else {
        echo "   ✗ Promotion not found\n";
    }
} else {
    echo "   ℹ No promotion selected\n";
}

// 2. Contacts Settings (contacts_options)
echo "\n2. Contacts Settings:\n";
$email = get_field('email', 'contacts_options');
$phone = get_field('phone', 'contacts_options');
$social_contacts = get_field('social_contacts', 'contacts_options');

echo "   email: " . ($email ?: "NULL") . "\n";
echo "   phone: " . ($phone ?: "NULL") . "\n";
echo "   social_contacts: " . (is_array($social_contacts) ? count($social_contacts) . " items" : "NULL") . "\n";

if ($social_contacts && is_array($social_contacts)) {
    foreach ($social_contacts as $idx => $social) {
        $name = $social['name'] ?? '';
        $icon = $social['icon'] ?? '';
        $url = $social['url'] ?? '';
        echo "      [{$idx}] {$name} ({$icon}): {$url}\n";
    }
}

echo "\n=== Check Complete ===\n\n";
