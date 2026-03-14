<?php
/**
 * Check menu item data in detail
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

global $wpdb;

echo "=== MENU ITEM DATA ===\n\n";

// Get menu items
$menu_items = $wpdb->get_results("
    SELECT p.ID, p.post_title, p.post_name, p.post_content, pm.meta_key, pm.meta_value
    FROM {$wpdb->posts} p
    LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
    WHERE p.post_type = 'nav_menu_item'
    AND p.ID IN (33, 34)
    ORDER BY p.ID, pm.meta_key
");

$current_id = 0;
foreach ($menu_items as $item) {
    if ($current_id !== $item->ID) {
        if ($current_id !== 0) echo "\n";
        echo "=== Menu Item ID: {$item->ID} ===\n";
        echo "post_title: {$item->post_title}\n";
        echo "post_name: {$item->post_name}\n";
        echo "post_content: {$item->post_content}\n";
        echo "Meta:\n";
        $current_id = $item->ID;
    }
    if ($item->meta_key) {
        echo "  - {$item->meta_key}: {$item->meta_value}\n";
    }
}

// Check term name
echo "\n\n=== MENU TERM ===\n\n";
$term = $wpdb->get_row("SELECT * FROM {$wpdb->terms} WHERE term_id = 19");
echo "term_id: {$term->term_id}\n";
echo "name: {$term->name}\n";
echo "slug: {$term->slug}\n";

// Check what field WPGraphQL uses for menu item label
echo "\n\n=== GRAPHQL DEBUG ===\n";
echo "WPGraphQL uses _menu_item_title or post_title for menu item label.\n";
echo "Let's check _menu_item_title meta:\n\n";

$titles = $wpdb->get_results("
    SELECT post_id, meta_value 
    FROM {$wpdb->postmeta} 
    WHERE meta_key = '_menu_item_title'
    AND post_id IN (33, 34)
");

foreach ($titles as $t) {
    echo "Post ID {$t->post_id}: _menu_item_title = '{$t->meta_value}'\n";
}

echo "\n\nDone!\n";
