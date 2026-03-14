<?php
/**
 * Assign review_platform taxonomy terms to reviews from kan-data/reviews-table.json
 *
 * Matches reviews by _migrate_content_hash, maps platform (Google, 2GIS, Яндекс) to term slugs,
 * creates terms if missing, assigns via wp_set_object_terms.
 *
 * Run:
 *   docker cp kan-data wp-new-wordpress:/var/www/html/kan-data
 *   docker cp scripts/assign-review-platform-terms.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/assign-review-platform-terms.php --allow-root
 */

$json_path = getenv('KAN_JSON_PATH') ?: dirname(__DIR__) . '/kan-data/reviews-table.json';

if (!file_exists($json_path)) {
    echo "ERROR: JSON not found: {$json_path}\n";
    echo "Copy kan-data to container: docker cp kan-data wp-new-wordpress:/var/www/html/kan-data\n";
    exit(1);
}

if (!taxonomy_exists('review_platform')) {
    echo "ERROR: Taxonomy review_platform not registered. Add unident_register_review_platform_taxonomy() to unident-structure.php and restart WordPress.\n";
    exit(1);
}

$items = json_decode(file_get_contents($json_path), true);
if (!is_array($items)) {
    echo "ERROR: Invalid JSON\n";
    exit(1);
}

$platform_map = [
    'Google' => ['slug' => 'google', 'name' => 'Google'],
    '2GIS'   => ['slug' => '2gis', 'name' => '2GIS'],
    'Яндекс' => ['slug' => 'yandex-karta', 'name' => 'Яндекс.Карта'],
];

echo "=== Assign review_platform terms ===\n\n";

$assigned = 0;
$skipped = 0;
$not_found = 0;

foreach ($items as $item) {
    $title = $item['title'] ?? '';
    $content = $item['content'] ?? '';
    $platform = $item['platform'] ?? '';

    if (empty($platform) || !isset($platform_map[$platform])) {
        $skipped++;
        continue;
    }

    $hash = md5($title . '|' . $content);
    $reviews = get_posts([
        'post_type'   => 'reviews',
        'post_status' => ['publish', 'draft'],
        'numberposts' => 1,
        'meta_query'  => [['key' => '_migrate_content_hash', 'value' => $hash]],
    ]);

    if (empty($reviews)) {
        $not_found++;
        continue;
    }

    $review_id = $reviews[0]->ID;
    $term_data = $platform_map[$platform];
    $term_slug = $term_data['slug'];
    $term_name = $term_data['name'];

    $term = get_term_by('slug', $term_slug, 'review_platform');
    if (!$term || is_wp_error($term)) {
        $result = wp_insert_term($term_name, 'review_platform', ['slug' => $term_slug]);
        if (is_wp_error($result)) {
            echo "  ERROR creating term {$term_slug}: " . $result->get_error_message() . "\n";
            continue;
        }
        $term = get_term_by('id', $result['term_id'], 'review_platform');
    }

    if ($term && !is_wp_error($term)) {
        wp_set_object_terms($review_id, (int) $term->term_id, 'review_platform');
        $assigned++;
        echo "  ID {$review_id}: {$platform} -> {$term->name}\n";
    }
}

wp_cache_flush();

echo "\n=== Summary ===\n";
echo "Assigned: {$assigned}\n";
echo "Skipped (no platform): {$skipped}\n";
echo "Review not found: {$not_found}\n";
echo "\nDone!\n";
