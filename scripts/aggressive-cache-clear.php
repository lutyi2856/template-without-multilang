<?php
/**
 * Агрессивная очистка всех кэшей WPGraphQL
 */

require_once __DIR__ . '/../wp-config.php';

echo "=== АГРЕССИВНАЯ ОЧИСТКА КЭШЕЙ ===\n\n";

// 1. WordPress object cache
echo "1. Очистка object cache:\n";
wp_cache_flush();
echo "   ✓ wp_cache_flush() выполнен\n\n";

// 2. Transients (включая GraphQL transients)
echo "2. Удаление transients:\n";
global $wpdb;
$deleted = $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");
echo "   ✓ Удалено transients: {$deleted}\n\n";

// 3. WPGraphQL schema cache (если есть)
echo "3. Удаление WPGraphQL schema cache:\n";
$graphql_deleted = $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '%graphql%'");
echo "   ✓ Удалено graphql options: {$graphql_deleted}\n\n";

// 4. ACF field groups cache
echo "4. Очистка ACF cache:\n";
if (function_exists('acf_get_store')) {
    acf_get_store('field-groups')->reset();
    echo "   ✓ ACF field groups cache cleared\n";
} else {
    echo "   - ACF cache функция недоступна\n";
}
echo "\n";

// 5. Очистка menu cache
echo "5. Очистка menu cache:\n";
wp_cache_delete('get_nav_menu_items', 'nav_menu_item');
wp_cache_delete('19', 'nav_menu');
echo "   ✓ Menu cache cleared\n\n";

// 6. Opcache reset (если доступен)
echo "6. Очистка OPcache:\n";
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "   ✓ OPcache cleared\n";
} else {
    echo "   - OPcache недоступен\n";
}
echo "\n";

echo "✓ Все кэши очищены!\n";
echo "⚠️ ОБЯЗАТЕЛЬНО перезапустите WordPress контейнер!\n";
echo "   docker restart wp-new-wordpress\n";
