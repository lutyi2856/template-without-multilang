<?php
/**
 * Fill Footer Option Page — repeater social_links (WhatsApp, VK, Telegram).
 * Run from WordPress container or after loading WordPress (e.g. php scripts/fill-footer-social-links.php).
 */

require_once __DIR__ . '/../wp-load.php';

if (!function_exists('update_field')) {
    echo "ACF update_field not available.\n";
    exit(1);
}

$social_links = [
    [
        'name' => 'WhatsApp',
        'icon' => 'whatsapp',
        'url'  => 'https://wa.me/79999999999',
    ],
    [
        'name' => 'VK',
        'icon' => 'vk',
        'url'  => 'https://vk.com/unident',
    ],
    [
        'name' => 'Telegram',
        'icon' => 'telegram',
        'url'  => 'https://t.me/unident',
    ],
];

update_field('social_links', $social_links, 'footer_options');

echo "Footer social_links updated: " . count($social_links) . " items (WhatsApp, VK, Telegram).\n";

// Verify
$check = get_field('social_links', 'footer_options');
echo "Verify: " . (is_array($check) ? count($check) . " rows" : "empty") . "\n";
