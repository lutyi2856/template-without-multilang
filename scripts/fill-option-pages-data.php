<?php
/**
 * Fill Option Pages with test data
 */

require_once('/var/www/html/wp-load.php');

echo "\n=== Filling Option Pages ===\n\n";

// 1. Block Prices Settings - выбираем первую акцию
echo "1. Block Prices Settings:\n";
$promotions = get_posts([
    'post_type' => 'promotions',
    'posts_per_page' => 1,
    'post_status' => 'publish',
    'orderby' => 'rand',
]);

if (count($promotions) > 0) {
    $promotion = $promotions[0];
    update_field('selected_promotion', $promotion->ID, 'option');
    echo "   ✓ Selected promotion: {$promotion->post_title} (ID: {$promotion->ID})\n";
} else {
    echo "   ✗ No promotions found\n";
}

// 2. Contacts Settings (contacts_options — Option Page «Контакты»)
echo "\n2. Contacts Settings:\n";

$contacts_id = 'contacts_options';

// Email
update_field('email', 'info@unident.ru', $contacts_id);
echo "   ✓ Set email: info@unident.ru\n";

// Phone
update_field('phone', '+7 (495) 123-45-67', $contacts_id);
echo "   ✓ Set phone: +7 (495) 123-45-67\n";

// Social contacts (repeater: name + icon + url — как в header/footer)
$social_contacts = [
    [ 'name' => 'Telegram', 'icon' => 'telegram', 'url' => 'https://t.me/unident' ],
    [ 'name' => 'WhatsApp', 'icon' => 'whatsapp', 'url' => 'https://wa.me/74951234567' ],
];

update_field('social_contacts', $social_contacts, $contacts_id);
echo "   ✓ Set social contacts: 2 items\n";

// 3. Actions Archive — заполняем если пусто
echo "\n3. Actions Archive:\n";
$act_id = 'actions_archive_options';
if (!get_field('action_page_description', $act_id)) {
    update_field('action_page_description', 'Актуальные акции клиники УниДент. Скидки на имплантацию, профессиональную гигиену, отбеливание и другие стоматологические услуги.', $act_id);
    update_field('cta_title', 'Консультация, снимок и план лечения бесплатно', $act_id);
    update_field('cta_description', 'Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 555-55-55', $act_id);
    update_field('cta_phone', '+7 499 555-55-55', $act_id);
    update_field('cta_privacy_text', 'Отправляя заявку, вы соглашаетесь с политикой конфиденциальности', $act_id);
    echo "   ✓ Filled Actions Archive\n";
} else {
    echo "   ✓ Actions Archive already has data\n";
}

// 4. Our Works Archive — копируем данные из Архива акций
echo "\n4. Our Works Archive (copy from Actions Archive):\n";
$src = 'actions_archive_options';
$tgt = 'our_works_archive_options';
$defaults = [
    'action_page_description' => 'Актуальные акции клиники УниДент. Скидки на имплантацию, профессиональную гигиену, отбеливание и другие стоматологические услуги.',
    'cta_title' => 'Консультация, снимок и план лечения бесплатно',
    'cta_description' => 'Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 555-55-55',
    'cta_phone' => '+7 499 555-55-55',
    'cta_privacy_text' => 'Отправляя заявку, вы соглашаетесь с политикой конфиденциальности',
];
foreach (['action_page_description', 'cta_title', 'cta_description', 'cta_phone', 'cta_privacy_text'] as $f) {
    $v = get_field($f, $src) ?: $defaults[$f];
    update_field($f, $v, $tgt);
}
$adv = get_field('advantages', $src);
if ($adv && is_array($adv)) {
    update_field('advantages', $adv, $tgt);
    echo "   ✓ Copied advantages (" . count($adv) . " items)\n";
}
$img = get_field('cta_doctor_image', $src);
if ($img) {
    update_field('cta_doctor_image', $img, $tgt);
    echo "   ✓ Copied cta_doctor_image\n";
}
echo "   ✓ Our Works Archive filled\n";

echo "\n=== Fill Complete ===\n\n";

// Verify
echo "Verifying...\n";
$selected_promotion_check = get_field('selected_promotion', 'option');
$email_check = get_field('email', 'contacts_options');
$phone_check = get_field('phone', 'contacts_options');
$social_check = get_field('social_contacts', 'contacts_options');

echo "  selected_promotion: " . ($selected_promotion_check ?: "NULL") . "\n";
echo "  contacts email: " . ($email_check ?: "NULL") . "\n";
echo "  contacts phone: " . ($phone_check ?: "NULL") . "\n";
echo "  social_contacts: " . (is_array($social_check) ? count($social_check) . " items" : "NULL") . "\n";

echo "\n✓ Done!\n\n";
