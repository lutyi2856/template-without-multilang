<?php
/**
 * Fill Actions Archive (Option Page «Архив акций») with default data
 *
 * Usage: docker cp scripts/fill-actions-archive-data.php wp-new-wordpress:/var/www/html/scripts/
 *        docker exec wp-new-wordpress php /var/www/html/scripts/fill-actions-archive-data.php
 *
 * Изображение cta_doctor_image и repeater advantages загружаются вручную в WordPress: Настройки → Архив акций.
 */

require_once('/var/www/html/wp-load.php');

$post_id = 'actions_archive_options';

echo "\n=== Filling Actions Archive (Архив акций) ===\n\n";

update_field('action_page_description', 'Актуальные акции клиники УниДент. Скидки на имплантацию, профессиональную гигиену, отбеливание и другие стоматологические услуги.', $post_id);
echo "✓ action_page_description\n";

update_field('cta_title', 'Консультация, снимок и план лечения бесплатно', $post_id);
echo "✓ cta_title\n";

update_field('cta_description', 'Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 555-55-55', $post_id);
echo "✓ cta_description\n";

update_field('cta_phone', '+7 499 555-55-55', $post_id);
echo "✓ cta_phone\n";

update_field('cta_privacy_text', 'Отправляя заявку, вы соглашаетесь с политикой конфиденциальности', $post_id);
echo "✓ cta_privacy_text\n";

echo "\nИзображение cta_doctor_image и repeater advantages загрузите вручную в админке: Настройки → Архив акций.\n\n";

// Verify
$desc = get_field('action_page_description', $post_id);
$title = get_field('cta_title', $post_id);
$phone = get_field('cta_phone', $post_id);
echo "Verification:\n  action_page_description: " . (strlen($desc ?? '') ? 'set' : 'NULL') . "\n  cta_title: " . ($title ?: 'NULL') . "\n  cta_phone: " . ($phone ?: 'NULL') . "\n\n";
echo "=== Done ===\n\n";
