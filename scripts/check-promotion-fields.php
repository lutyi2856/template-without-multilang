<?php
/**
 * Check what field groups and fields exist for promotions
 */
require_once(__DIR__ . '/../wp-load.php');

global $wpdb;

echo "=== ALL FIELD GROUPS ===\n\n";

$groups = $wpdb->get_results("
    SELECT p.ID, p.post_title, p.post_excerpt 
    FROM {$wpdb->posts} p 
    WHERE p.post_type = 'acf-field-group' 
    AND p.post_status = 'publish' 
    ORDER BY p.ID
");

foreach ($groups as $g) {
    echo "Group ID: {$g->ID}\n";
    echo "  Title: {$g->post_title}\n";
    echo "  Key: {$g->post_excerpt}\n";
    
    // Get location
    $location = get_post_meta($g->ID, 'location', true);
    if ($location && isset($location[0][0]['value'])) {
        echo "  Location: {$location[0][0]['value']}\n";
    }
    
    // Get fields
    $fields = $wpdb->get_results($wpdb->prepare(
        "SELECT ID, post_title, post_excerpt, post_content 
         FROM {$wpdb->posts} 
         WHERE post_parent = %d 
         AND post_type = 'acf-field' 
         ORDER BY menu_order",
        $g->ID
    ));
    
    if ($fields) {
        echo "  Fields:\n";
        foreach ($fields as $f) {
            $config = unserialize($f->post_content);
            $type = $config['type'] ?? 'unknown';
            echo "    - {$f->post_title} ({$f->post_excerpt}) [type: {$type}]\n";
            
            // If repeater, show sub-fields
            if ($type === 'repeater') {
                $subs = $wpdb->get_results($wpdb->prepare(
                    "SELECT ID, post_title, post_excerpt FROM {$wpdb->posts} 
                     WHERE post_parent = %d AND post_type = 'acf-field'",
                    $f->ID
                ));
                foreach ($subs as $sub) {
                    echo "        ↳ {$sub->post_title} ({$sub->post_excerpt})\n";
                }
            }
        }
    } else {
        echo "  No fields\n";
    }
    
    echo "\n";
}

echo "\n=== CHECKING PROMOTIONS POST TYPE ===\n";
echo "Existing promotion posts:\n";
$promos = $wpdb->get_results("
    SELECT ID, post_title 
    FROM {$wpdb->posts} 
    WHERE post_type = 'promotions' 
    AND post_status != 'trash'
    LIMIT 5
");
foreach ($promos as $p) {
    echo "  - ID {$p->ID}: {$p->post_title}\n";
}
