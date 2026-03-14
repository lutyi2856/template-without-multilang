<?php
/**
 * Plugin Name: Fix SSL Connection
 * Description: Исправляет проблемы с SSL соединением для WordPress.org (только для разработки!)
 * Version: 1.0
 * 
 * ВНИМАНИЕ: Этот плагин отключает проверку SSL сертификатов.
 * Используйте ТОЛЬКО для локальной разработки!
 */

// Отключение проверки SSL для WordPress.org API
add_filter('https_ssl_verify', '__return_false');
add_filter('https_local_ssl_verify', '__return_false');

// Отключение проверки SSL для обновлений
add_filter('http_request_args', function($args) {
    $args['sslverify'] = false;
    return $args;
}, 10, 1);

