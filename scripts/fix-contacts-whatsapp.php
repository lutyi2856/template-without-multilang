<?php
define('WP_USE_THEMES', false);
require '/var/www/html/wp-load.php';

$social_contacts = get_field('social_contacts', 'contacts_options');
if (is_array($social_contacts) && count($social_contacts) >= 2) {
    $social_contacts[1]['icon'] = 'whatsapp';
    update_field('social_contacts', $social_contacts, 'contacts_options');
    echo "Fixed row 1: icon=whatsapp\n";
} else {
    echo "Could not fix - unexpected structure\n";
}
