<?php
/**
 * Обновить поле phone_schedule в Header Settings
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

// Обновляем телефон и расписание
$phone = '+7 (495) 123-45-67';
$phone_schedule = 'Ежедневно с 8:00 до 10:00';

update_field('phone', $phone, 'options');
update_field('phone_schedule', $phone_schedule, 'options');

echo "✓ Phone: $phone\n";
echo "✓ Phone Schedule: $phone_schedule\n";
echo "\n";
echo "✓ Данные успешно добавлены!\n";
echo "\n";
echo "Проверить в WordPress Admin:\n";
echo "http://localhost:8002/wp-admin/admin.php?page=header-settings\n";
