<?php
/**
 * Create Services Categories and Posts
 * UTF-8 encoding
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo "=== Creating Service Categories ===\n\n";

$categories = [
    ['name' => 'Implantation', 'slug' => 'implantation', 'description' => 'Dental implants installation', 'count' => 10],
    ['name' => 'Treatment', 'slug' => 'treatment', 'description' => 'Therapeutic treatment', 'count' => 8],
    ['name' => 'Prosthetics', 'slug' => 'prosthetics', 'description' => 'Dental prosthetics', 'count' => 12],
    ['name' => 'Whitening', 'slug' => 'whitening', 'description' => 'Professional teeth whitening', 'count' => 6],
    ['name' => 'Braces', 'slug' => 'braces', 'description' => 'Orthodontics and braces', 'count' => 9],
    ['name' => 'Children', 'slug' => 'children', 'description' => 'Pediatric dentistry', 'count' => 7],
    ['name' => 'Surgery', 'slug' => 'surgery', 'description' => 'Dental surgery', 'count' => 11],
];

$services = [
    'implantation' => [
        'Implant OSSTEM', 'Implant Nobel Biocare', 'Implant Straumann', 'Sinus lift',
        'Bone grafting', 'All-on-4', 'All-on-6', 'One day implantation',
        'Turnkey implantation', 'Painless implantation'
    ],
    'treatment' => [
        'Caries treatment', 'Pulpitis treatment', 'Periodontitis treatment', 'Endodontic treatment',
        'Microscope treatment', 'Artistic restoration', 'Wisdom tooth treatment', 'Root canal retreatment'
    ],
    'prosthetics' => [
        'Zirconia crowns', 'Ceramic crowns', 'Metal-ceramic crowns', 'Veneers',
        'Inlays and onlays', 'Bridge prosthetics', 'Removable dentures', 'Partial dentures',
        'Implant prosthetics', 'Temporary crowns', 'Lock prosthetics', 'Full dentures'
    ],
    'whitening' => [
        'ZOOM whitening', 'Laser whitening', 'Home whitening', 'Opalescence whitening',
        'Professional cleaning', 'Air Flow'
    ],
    'braces' => [
        'Metal braces', 'Ceramic braces', 'Sapphire braces', 'Lingual braces',
        'Invisalign aligners', 'Bite correction', 'Adult orthodontics', 'Retention after braces',
        'Children plates'
    ],
    'children' => [
        'Children prevention', 'Baby teeth treatment', 'Silver coating', 'Fluoridation',
        'Fissure sealing', 'Baby teeth extraction', 'Children orthodontics'
    ],
    'surgery' => [
        'Tooth extraction', 'Wisdom tooth extraction', 'Complex extraction', 'Root resection',
        'Cyst removal', 'Frenulum surgery', 'Vestibuloplasty', 'Flap surgery',
        'Bone grafting', 'Open sinus lift', 'Closed sinus lift'
    ],
];

$created_terms = [];

foreach ($categories as $cat) {
    $existing = get_term_by('slug', $cat['slug'], 'service_categories');
    
    if ($existing) {
        echo "✓ Category '{$cat['name']}' exists (ID: {$existing->term_id})\n";
        $term_id = $existing->term_id;
    } else {
        $result = wp_insert_term($cat['name'], 'service_categories', [
            'slug' => $cat['slug'],
            'description' => $cat['description'],
        ]);
        
        if (is_wp_error($result)) {
            echo "✗ Error: {$cat['name']} - " . $result->get_error_message() . "\n";
            continue;
        }
        
        $term_id = $result['term_id'];
        echo "✓ Created category '{$cat['name']}' (ID: {$term_id})\n";
    }
    
    $created_terms[$cat['slug']] = ['id' => $term_id, 'count' => $cat['count']];
}

echo "\n=== Creating Services ===\n\n";

$total = 0;

foreach ($created_terms as $slug => $term_data) {
    $templates = $services[$slug] ?? [];
    $count = min($term_data['count'], count($templates));
    
    echo "Category: {$slug} (creating {$count} services)\n";
    
    for ($i = 0; $i < $count; $i++) {
        $service_name = $templates[$i];
        
        $existing = get_posts([
            'post_type' => 'services',
            'title' => $service_name,
            'post_status' => 'publish',
            'numberposts' => 1,
        ]);
        
        if (!empty($existing)) {
            $post_id = $existing[0]->ID;
            echo "  ✓ Service '{$service_name}' exists (ID: {$post_id})\n";
        } else {
            $post_id = wp_insert_post([
                'post_title' => $service_name,
                'post_type' => 'services',
                'post_status' => 'publish',
                'post_content' => "<!-- wp:paragraph -->\n<p>Service description: {$service_name}</p>\n<!-- /wp:paragraph -->",
                'post_excerpt' => "Professional service: {$service_name}",
            ]);
            
            if (is_wp_error($post_id)) {
                echo "  ✗ Error: {$service_name} - " . $post_id->get_error_message() . "\n";
                continue;
            }
            
            echo "  ✓ Created service '{$service_name}' (ID: {$post_id})\n";
        }
        
        wp_set_object_terms($post_id, [$term_data['id']], 'service_categories');
        $total++;
    }
    
    echo "\n";
}

echo "=== Summary ===\n";
echo "Categories: " . count($created_terms) . "\n";
echo "Services: {$total}\n";
echo "\n✓ Done!\n";
