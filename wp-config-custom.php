<?php
/**
 * Дополнительные настройки WordPress для правильной работы с utf8mb4
 * Этот файл подключается к основному wp-config.php
 */

// Разрешить пароли приложений на localhost без HTTPS (для MCP JetEngine и REST API)
// WordPress требует именно 'local', не 'development' — см. wp_is_application_passwords_supported()
if ( ! defined( 'WP_ENVIRONMENT_TYPE' ) ) {
	$host = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( (string) $_SERVER['HTTP_HOST'] ) : '';
	if ( strpos( $host, 'localhost' ) !== false || strpos( $host, '127.0.0.1' ) !== false ) {
		define( 'WP_ENVIRONMENT_TYPE', 'local' );
	}
}

// Убеждаемся, что WordPress использует правильную кодировку
if (!defined('DB_CHARSET')) {
    define('DB_CHARSET', 'utf8mb4');
}

if (!defined('DB_COLLATE')) {
    define('DB_COLLATE', 'utf8mb4_unicode_ci');
}

// Настройка кодировки для подключения к БД
// Это гарантирует, что все запросы используют utf8mb4
if (function_exists('mysqli_set_charset')) {
    global $wpdb;
    if (isset($wpdb->dbh) && is_object($wpdb->dbh)) {
        mysqli_set_charset($wpdb->dbh, 'utf8mb4');
    }
}

