<?php
/**
 * Check database charset and encoding settings
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

global $wpdb;

echo "=== DATABASE CHARSET CHECK ===\n\n";

// 1. MySQL/MariaDB variables
echo "1. MySQL Variables:\n";
$vars = $wpdb->get_results("SHOW VARIABLES LIKE 'character%'");
foreach ($vars as $var) {
    echo "   {$var->Variable_name}: {$var->Value}\n";
}

echo "\n2. Collation Variables:\n";
$vars = $wpdb->get_results("SHOW VARIABLES LIKE 'collation%'");
foreach ($vars as $var) {
    echo "   {$var->Variable_name}: {$var->Value}\n";
}

// 2. WordPress DB charset
echo "\n3. WordPress DB Settings:\n";
echo "   DB_CHARSET: " . (defined('DB_CHARSET') ? DB_CHARSET : 'not defined') . "\n";
echo "   DB_COLLATE: " . (defined('DB_COLLATE') ? DB_COLLATE : 'not defined') . "\n";
echo "   \$wpdb->charset: " . $wpdb->charset . "\n";
echo "   \$wpdb->collate: " . $wpdb->collate . "\n";

// 3. Table charset
echo "\n4. Tables Charset:\n";
$tables = ['wp_posts', 'wp_terms', 'wp_options', 'wp_postmeta'];
foreach ($tables as $table) {
    $result = $wpdb->get_row("SHOW TABLE STATUS LIKE '$table'");
    if ($result) {
        echo "   $table: {$result->Collation}\n";
    }
}

// 4. Test actual data
echo "\n5. Raw Data Test:\n";
$post_33 = $wpdb->get_row("SELECT post_title, HEX(post_title) as hex_title FROM {$wpdb->posts} WHERE ID = 33");
echo "   Post 33 title: {$post_33->post_title}\n";
echo "   Post 33 hex: {$post_33->hex_title}\n";

$post_34 = $wpdb->get_row("SELECT post_title, HEX(post_title) as hex_title FROM {$wpdb->posts} WHERE ID = 34");
echo "   Post 34 title: {$post_34->post_title}\n";
echo "   Post 34 hex: {$post_34->hex_title}\n";

// 5. Check for BOM
echo "\n6. BOM Check:\n";
$title_33 = $post_33->post_title;
$first_bytes = bin2hex(substr($title_33, 0, 4));
echo "   First 4 bytes of post 33: $first_bytes\n";

// Check if starts with UTF-8 BOM (EF BB BF)
if (substr($first_bytes, 0, 6) === 'efbbbf') {
    echo "   WARNING: UTF-8 BOM detected!\n";
}

// 6. PHP mbstring
echo "\n7. PHP mbstring:\n";
echo "   mb_internal_encoding: " . mb_internal_encoding() . "\n";
echo "   default_charset: " . ini_get('default_charset') . "\n";

echo "\nDone!\n";
