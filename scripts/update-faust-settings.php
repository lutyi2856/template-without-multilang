<?php
/**
 * Скрипт для обновления настроек FaustWP
 * Использование: docker-compose exec wordpress-new php /path/to/update-faust-settings.php
 */

// Загружаем WordPress
require_once('/var/www/html/wp-load.php');

// Получаем текущие настройки
$current_settings = get_option('faustwp_settings', array());

// Обновляем frontend_uri
$current_settings['frontend_uri'] = 'http://localhost:3000';

// Сохраняем настройки
update_option('faustwp_settings', $current_settings);

echo "✅ Front-end site URL установлен: http://localhost:3000\n";

// Обновляем WPGraphQL настройки
$graphql_settings = get_option('graphql_general_settings', '');
if (is_string($graphql_settings)) {
    $graphql_settings = maybe_unserialize($graphql_settings);
}
if (!is_array($graphql_settings)) {
    $graphql_settings = array();
}
$graphql_settings['public_introspection_enabled'] = 'on';
update_option('graphql_general_settings', $graphql_settings);

echo "✅ WPGraphQL Public Introspection включен\n";

