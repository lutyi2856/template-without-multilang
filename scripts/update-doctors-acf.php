<?php
/**
 * Обновление ACF полей для созданных врачей
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

$doctors_data = [
    140 => ['exp' => 15, 'rating' => 4.8, 'spec' => 'Стоматолог-терапевт, ортопед', 'city' => 'moscow', 'clinic' => 76],
    141 => ['exp' => 12, 'rating' => 4.9, 'spec' => 'Стоматолог-хирург, имплантолог', 'city' => 'moscow', 'clinic' => 76],
    142 => ['exp' => 8, 'rating' => 4.7, 'spec' => 'Ортодонт', 'city' => 'moscow', 'clinic' => 76],
    143 => ['exp' => 20, 'rating' => 4.9, 'spec' => 'Стоматолог-терапевт, эндодонтист', 'city' => 'spb', 'clinic' => 77],
    144 => ['exp' => 10, 'rating' => 4.6, 'spec' => 'Стоматолог-хирург', 'city' => 'spb', 'clinic' => 77],
    145 => ['exp' => 7, 'rating' => 4.8, 'spec' => 'Детский стоматолог', 'city' => 'spb', 'clinic' => 77],
    146 => ['exp' => 18, 'rating' => 4.9, 'spec' => 'Стоматолог-ортопед, протезист', 'city' => 'ekb', 'clinic' => 78],
    147 => ['exp' => 14, 'rating' => 4.7, 'spec' => 'Стоматолог-терапевт, пародонтолог', 'city' => 'ekb', 'clinic' => 78],
    148 => ['exp' => 22, 'rating' => 5.0, 'spec' => 'Имплантолог, челюстно-лицевой хирург', 'city' => 'ekb', 'clinic' => 78],
];

$city_slugs = ['moscow' => 28, 'spb' => 29, 'ekb' => 30];

foreach ($doctors_data as $post_id => $data) {
    if (function_exists('update_field')) {
        update_field('experience', $data['exp'], $post_id);
        update_field('rating', $data['rating'], $post_id);
        update_field('rating_source', 'Doctu.ru', $post_id);
        update_field('specialization', $data['spec'], $post_id);
        update_field('clinic', $data['clinic'], $post_id);
    }
    
    wp_set_post_terms($post_id, [$city_slugs[$data['city']]], 'cities');
    
    echo "Updated doctor ID {$post_id}\n";
}

echo "Done!\n";
