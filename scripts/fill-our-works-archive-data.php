<?php
/**
 * Fill Our Works Archive (Option Page «Архив наших работ») with the SAME data as Actions Archive
 *
 * Копирует все поля из «Архив акций» в «Архив наших работ» (описание, преимущества, CTA).
 *
 * Usage: docker cp scripts/fill-our-works-archive-data.php wp-new-wordpress:/var/www/html/scripts/
 *        docker exec wp-new-wordpress php /var/www/html/scripts/fill-our-works-archive-data.php
 *
 * Сначала выполните fill-actions-archive-data.php если Архив акций ещё не заполнен.
 */

require_once('/var/www/html/wp-load.php');

$source_id = 'actions_archive_options';
$target_id = 'our_works_archive_options';

// Fallback: same default values as fill-actions-archive-data.php (if Actions empty)
$defaults = [
    'action_page_description' => 'Актуальные акции клиники УниДент. Скидки на имплантацию, профессиональную гигиену, отбеливание и другие стоматологические услуги.',
    'cta_title' => 'Консультация, снимок и план лечения бесплатно',
    'cta_description' => 'Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 555-55-55',
    'cta_phone' => '+7 499 555-55-55',
    'cta_privacy_text' => 'Отправляя заявку, вы соглашаетесь с политикой конфиденциальности',
];

echo "\n=== Filling Our Works Archive (copy from Архив акций) ===\n\n";

$desc = get_field('action_page_description', $source_id);
$cta_title = get_field('cta_title', $source_id);
$cta_desc = get_field('cta_description', $source_id);
$cta_phone = get_field('cta_phone', $source_id);
$cta_privacy = get_field('cta_privacy_text', $source_id);
$advantages = get_field('advantages', $source_id);
$cta_image = get_field('cta_doctor_image', $source_id);

$used_source = !empty($desc) || !empty($cta_title);
if ($used_source) {
    echo "Copying from Actions Archive...\n";
} else {
    echo "Actions Archive empty — using default values.\n";
}

update_field('action_page_description', $desc ?: $defaults['action_page_description'], $target_id);
echo "✓ action_page_description\n";

update_field('cta_title', $cta_title ?: $defaults['cta_title'], $target_id);
echo "✓ cta_title\n";

update_field('cta_description', $cta_desc ?: $defaults['cta_description'], $target_id);
echo "✓ cta_description\n";

update_field('cta_phone', $cta_phone ?: $defaults['cta_phone'], $target_id);
echo "✓ cta_phone\n";

update_field('cta_privacy_text', $cta_privacy ?: $defaults['cta_privacy_text'], $target_id);
echo "✓ cta_privacy_text\n";

if ($advantages && is_array($advantages)) {
    update_field('advantages', $advantages, $target_id);
    echo "✓ advantages (" . count($advantages) . " items, copied)\n";
} else {
    echo "✓ advantages (skipped — empty in source)\n";
}

if ($cta_image && (is_array($cta_image) ? !empty($cta_image['ID']) : !empty($cta_image))) {
    update_field('cta_doctor_image', $cta_image, $target_id);
    echo "✓ cta_doctor_image (copied)\n";
} else {
    echo "✓ cta_doctor_image (skipped — empty in source)\n";
}

// Verify
$v_desc = get_field('action_page_description', $target_id);
$v_title = get_field('cta_title', $target_id);
$v_phone = get_field('cta_phone', $target_id);
$v_adv = get_field('advantages', $target_id);
echo "\nVerification:\n  action_page_description: " . (strlen($v_desc ?? '') ? 'set' : 'NULL') . "\n  cta_title: " . ($v_title ?: 'NULL') . "\n  cta_phone: " . ($v_phone ?: 'NULL') . "\n  advantages: " . (is_array($v_adv) ? count($v_adv) . ' items' : 'NULL') . "\n\n";
echo "=== Done ===\n\n";
