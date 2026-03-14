<?php
/**
 * Fix doctor links for reviews created by migrate-reviews-from-json.php
 * Uses slug mapping to link reviews to correct doctors.
 *
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/fix-reviews-doctor-links.php --allow-root
 */

$json_path = dirname(__DIR__) . '/kan-data/reviews-table.json';
if (!file_exists($json_path)) {
    echo "ERROR: JSON not found\n";
    exit(1);
}

$items = json_decode(file_get_contents($json_path), true);
if (!is_array($items)) {
    echo "ERROR: Invalid JSON\n";
    exit(1);
}

$doctor_slug_map = [
    'abdalieva-uldaulet-parahatovna-2' => 'abdalieva-uldaulet-parahatovna-2-2',
    'abdalieva-uldaulet-parahatovna' => 'abdalieva-uldaulet-parahatovna-3',
    'askarov-mansur-anvarovich' => 'askarov-mansur-anvarovich-2',
    'kim-ekaterina-aleksandrovna' => 'kim-ekaterina-aleksandrovna-2',
    'kim-anastasiya-radikovna' => 'kim-anastasiya-radikovna-2',
    'tulegenova-asel-turahanovna' => 'tulegenova-asel-turahanovna-2',
    'kan-stanislav-aleksandrovich' => 'kan-stanislav-aleksandrovich-2',
    'abed-zuhra-zhalalovna' => 'abed-zuhra-zhalalovna-2',
];

$fixed = 0;
$not_found = 0;

foreach ($items as $item) {
    $title = $item['title'] ?? '';
    $content = $item['content'] ?? '';
    $hash = md5($title . '|' . $content);

    $reviews = get_posts([
        'post_type' => 'reviews',
        'post_status' => 'publish',
        'numberposts' => 1,
        'meta_query' => [['key' => '_migrate_content_hash', 'value' => $hash]],
    ]);

    if (empty($reviews)) {
        continue;
    }

    $review_id = $reviews[0]->ID;
    $doctor_slugs = $item['doctorSlugs'] ?? [];
    if (empty($doctor_slugs)) {
        continue;
    }

    $doctor_ids = [];
    foreach ($doctor_slugs as $slug) {
        $wp_slug = $doctor_slug_map[$slug] ?? $slug;
        $docs = get_posts([
            'post_type' => 'doctors',
            'name' => $wp_slug,
            'post_status' => 'publish',
            'numberposts' => 1,
        ]);
        if (!empty($docs)) {
            $doctor_ids[] = $docs[0]->ID;
        } else {
            $not_found++;
        }
    }

    if (!empty($doctor_ids) && function_exists('update_field')) {
        update_field('related_doctors', $doctor_ids, $review_id);
        foreach ($doctor_ids as $doc_id) {
            $doctor_reviews = get_field('related_reviews', $doc_id) ?: [];
            $existing_ids = array_map(function ($p) {
                return $p instanceof WP_Post ? $p->ID : (int) $p;
            }, is_array($doctor_reviews) ? $doctor_reviews : []);
            if (!in_array($review_id, $existing_ids, true)) {
                $existing_ids[] = $review_id;
                update_field('related_reviews', $existing_ids, $doc_id);
            }
        }
        $fixed++;
        echo "Fixed: ID {$review_id} -> " . count($doctor_ids) . " doctors\n";
    }
}

echo "\nFixed: {$fixed} reviews\n";
echo "Doctors not found: {$not_found}\n";
