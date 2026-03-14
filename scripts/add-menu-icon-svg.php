<?php
/**
 * Добавить inline SVG иконку для пункта меню "Услуги"
 * Performance-first approach: inline SVG для zero HTTP requests
 */

// SVG иконка "бургер меню" (простая иконка для теста)
$icon_svg = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="20" height="2" rx="1" fill="currentColor"/>
  <rect y="6" width="20" height="2" rx="1" fill="currentColor"/>
  <rect y="12" width="20" height="2" rx="1" fill="currentColor"/>
</svg>';

// ID пункта меню "Услуги"
$menu_item_id = 34;

// Обновляем поле
update_post_meta($menu_item_id, 'icon', $icon_svg);

echo "✅ Inline SVG добавлен для пункта меню ID: {$menu_item_id}\n";
echo "SVG код: " . $icon_svg . "\n";
