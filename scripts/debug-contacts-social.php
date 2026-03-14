<?php
define('WP_USE_THEMES', false);
require '/var/www/html/wp-load.php';

$sc = get_field('social_contacts', 'contacts_options');
echo "social_contacts:\n";
print_r($sc);
