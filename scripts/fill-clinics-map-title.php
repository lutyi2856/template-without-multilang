<?php
/**
 * Fill Main Page clinics map title (секция «Клиники на карте»)
 *
 * Usage: docker cp scripts/fill-clinics-map-title.php wp-new-wordpress:/var/www/html/scripts/
 *        docker exec wp-new-wordpress php /var/www/html/scripts/fill-clinics-map-title.php
 */

require_once('/var/www/html/wp-load.php');

$post_id = 'mainpage_options';

echo "\n=== Filling Clinics Map Title ===\n\n";

$default_title = 'Наши клиники на карте Москвы';
update_field('clinics_map_title', $default_title, $post_id);
echo "✓ clinics_map_title: {$default_title}\n";

$verify = get_field('clinics_map_title', $post_id);
echo "\nVerification: " . ($verify ?: 'NULL') . "\n";
echo "\n=== Done ===\n\n";
