<?php
/**
 * Fix Services menu item URL
 * 
 * This script updates the menu item URL to /services
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo "Checking menu item #34 (Services)...\n\n";

// Get current URL
$current_url = get_post_meta(34, '_menu_item_url', true);
$menu_item_type = get_post_meta(34, '_menu_item_type', true);
$menu_item_object_id = get_post_meta(34, '_menu_item_object_id', true);

echo "Current values:\n";
echo "  URL: {$current_url}\n";
echo "  Type: {$menu_item_type}\n";
echo "  Object ID: {$menu_item_object_id}\n\n";

// Update to correct URL
update_post_meta(34, '_menu_item_url', '/services');
update_post_meta(34, '_menu_item_type', 'custom');
update_post_meta(34, '_menu_item_object', 'custom');

// Clear cache
wp_cache_flush();

echo "✓ Updated menu item to:\n";
echo "  URL: /services\n";
echo "  Type: custom\n\n";

echo "Menu item fixed! Clearing all caches...\n";
