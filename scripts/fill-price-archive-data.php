<?php
/**
 * Fill Price Archive (Option Page «Архив цен») with default CTA text
 *
 * Usage: docker cp scripts/fill-price-archive-data.php wp-new-wordpress:/var/www/html/scripts/
 *        docker exec wp-new-wordpress php /var/www/html/scripts/fill-price-archive-data.php
 *
 * Изображение cta_doctor_image, advantages, price_list_pdf загружаются вручную в WordPress: Настройки → Архив цен.
 * selected_promotions — выбираются вручную в админке.
 */

require_once('/var/www/html/wp-load.php');

$post_id = 'price_archive_options';

echo "\n=== Filling Price Archive (Архив цен) ===\n\n";

update_field('price_page_description', 'Актуальные цены на стоматологические услуги клиники УниДент. Прозрачное ценообразование без скрытых платежей.', $post_id);
echo "✓ price_page_description\n";

update_field('cta_title', 'Консультация, снимок и план лечения бесплатно', $post_id);
echo "✓ cta_title\n";

update_field('cta_description', 'Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 555-55-55', $post_id);
echo "✓ cta_description\n";

update_field('cta_phone', '+7 499 555-55-55', $post_id);
echo "✓ cta_phone\n";

update_field('cta_privacy_text', 'Отправляя заявку, вы соглашаетесь с политикой конфиденциальности', $post_id);
echo "✓ cta_privacy_text\n";

echo "\nИзображение cta_doctor_image, repeater advantages, price_list_pdf загрузите вручную в админке: Настройки → Архив цен.\n";
echo "selected_promotions — выберите акции для блока (будут показаны первыми).\n\n";

// Verify
$title = get_field('cta_title', $post_id);
$desc = get_field('cta_description', $post_id);
$phone = get_field('cta_phone', $post_id);
echo "Verification:\n  cta_title: " . ($title ?: 'NULL') . "\n  cta_description: " . (strlen($desc ?? '') ? 'set' : 'NULL') . "\n  cta_phone: " . ($phone ?: 'NULL') . "\n\n";
echo "=== Done ===\n\n";
