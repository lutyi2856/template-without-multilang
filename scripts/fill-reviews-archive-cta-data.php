<?php
/**
 * Fill Reviews Archive CTA (Option Page «Архив отзывов») with default text
 *
 * Usage: docker exec wp-new-wordpress php /var/www/html/scripts/fill-reviews-archive-cta-data.php
 *
 * Изображения (cta_background, cta_icon, cta_content_image, cta_gift_image) загружаются
 * вручную в WordPress: Настройки → Архив отзывов.
 */

require_once('/var/www/html/wp-load.php');

$post_id = 'reviews_archive_options';

echo "\n=== Filling Reviews Archive CTA (Архив отзывов) ===\n\n";

update_field('cta_title', 'Оставьте отзыв и получите бонус при следующем посещении', $post_id);
echo "✓ cta_title\n";

update_field('cta_description', 'Ваши замечания и пожелания помогают нам улучшать качество и сервис. Напишите нам, и мы сделаем всё возможное, чтобы стать ещё лучше!', $post_id);
echo "✓ cta_description\n";

update_field('cta_button_text', 'Оставить отзыв', $post_id);
echo "✓ cta_button_text\n";

echo "\nИзображения (cta_background, cta_icon, cta_content_image, cta_gift_image) загрузите вручную в админке: Настройки → Архив отзывов.\n";
echo "Fallback: компонент использует статичные файлы из /images/figma/ если поля пусты.\n\n";

// Verify
$title = get_field('cta_title', $post_id);
$desc = get_field('cta_description', $post_id);
$btn = get_field('cta_button_text', $post_id);
echo "Verification:\n  cta_title: " . ($title ?: 'NULL') . "\n  cta_description: " . (strlen($desc ?? '') ? 'set' : 'NULL') . "\n  cta_button_text: " . ($btn ?: 'NULL') . "\n\n";
echo "=== Done ===\n\n";
