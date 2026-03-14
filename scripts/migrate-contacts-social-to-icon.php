<?php
/**
 * Migrate social_contacts to Header structure (name, icon, url)
 *
 * Converts old structure (text + url) or (icon + url) to new (name + icon + url).
 * - text → name (and infer icon if missing)
 * - icon → keep
 * - url → keep
 *
 * Run: docker exec wp-new-wordpress php /var/www/html/scripts/migrate-contacts-social-to-icon.php
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

$pid = 'contacts_options';
$social_contacts = get_field('social_contacts', $pid);

if (!is_array($social_contacts) || empty($social_contacts)) {
    echo "No social_contacts found.\n";
    exit(0);
}

$icon_from_text = function (string $text): ?string {
    $t = strtolower($text);
    if (strpos($t, 'whatsapp') !== false) return 'whatsapp';
    if (strpos($t, 'telegram') !== false) return 'telegram';
    if (strpos($t, 'facebook') !== false) return 'facebook';
    if (strpos($t, 'vk') !== false || strpos($t, 'вконтакте') !== false) return 'vk';
    if (strpos($t, 'instagram') !== false) return 'instagram';
    return null;
};

$name_from_icon = [
    'whatsapp' => 'WhatsApp',
    'telegram' => 'Telegram',
    'vk' => 'VKontakte',
    'instagram' => 'Instagram',
    'facebook' => 'Facebook',
    'google' => 'Google Reviews',
    'yandex' => 'Yandex',
    'phone' => 'Телефон',
    'location' => 'Локация',
];

$updated = 0;
foreach ($social_contacts as $idx => $row) {
    $name = $row['name'] ?? null;
    $icon = $row['icon'] ?? null;
    $text = $row['text'] ?? null;
    $url = $row['url'] ?? null;

    $changed = false;

    if (empty($name) && !empty($text)) {
        $name = $text;
        $changed = true;
    }
    if (empty($icon) && !empty($text)) {
        $icon = $icon_from_text($text);
        if ($icon) $changed = true;
    }
    if (empty($name) && !empty($icon)) {
        $name = $name_from_icon[$icon] ?? ucfirst($icon);
        $changed = true;
    }

    $social_contacts[$idx] = [
        'name' => $name ?: '',
        'icon' => $icon ?: 'telegram',
        'url' => $url ?: '',
    ];
    if ($changed) $updated++;
}

update_field('social_contacts', $social_contacts, $pid);
echo "Migrated social_contacts to name+icon+url structure. Updated $updated row(s).\n";
