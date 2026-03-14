<?php
/**
 * Migrate reviews from kan-data/reviews-table.json to WordPress
 *
 * 1. Converts all existing published reviews to draft
 * 2. Creates new reviews from JSON with ACF fields, doctor relationships, platform logos
 *
 * Run:
 *   docker cp kan-data wp-new-wordpress:/var/www/html/kan-data
 *   docker cp kan-data/reviews-table.json wp-new-wordpress:/var/www/html/kan-data/
 *   docker cp scripts/migrate-reviews-from-json.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/migrate-reviews-from-json.php --allow-root
 *
 * Idempotent: skips reviews that already exist (by title + content hash)
 * Skills: wordpress-test-data-creation, acf-relationships
 *
 * ВАЖНО: WPGraphQL не возвращает MediaItem для вложений с post_parent = черновик.
 * Если platform_logo не отображается — проверить post_parent вложения (должен быть 0 или опубликованный пост).
 */

$json_path = getenv('KAN_JSON_PATH') ?: dirname(__DIR__) . '/kan-data/reviews-table.json';

if (!file_exists($json_path)) {
    echo "ERROR: JSON not found: {$json_path}\n";
    echo "Copy kan-data to container: docker cp kan-data wp-new-wordpress:/var/www/html/kan-data\n";
    exit(1);
}

$items = json_decode(file_get_contents($json_path), true);
if (!is_array($items)) {
    echo "ERROR: Invalid JSON\n";
    exit(1);
}

// Slug mapping: JSON slug => WordPress slug (when different)
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

echo "=== Step 1: Convert existing reviews to draft ===\n\n";

$existing_reviews = get_posts([
    'post_type' => 'reviews',
    'post_status' => 'publish',
    'numberposts' => -1,
    'fields' => 'ids',
]);

$draft_count = 0;
foreach ($existing_reviews as $post_id) {
    wp_update_post([
        'ID' => $post_id,
        'post_status' => 'draft',
    ]);
    $draft_count++;
    echo "  Draft: ID {$post_id}\n";
}

echo "Converted {$draft_count} reviews to draft.\n\n";

echo "=== Step 2: Create reviews from JSON ===\n\n";

$created_count = 0;
$skipped_count = 0;
$error_count = 0;
$doctor_not_found = [];

foreach ($items as $index => $item) {
    $title = $item['title'] ?? '';
    $content = $item['content'] ?? '';

    if (empty($title) && empty($content)) {
        echo "  Skip [{$index}]: empty title and content\n";
        $skipped_count++;
        continue;
    }

    // Idempotent: check if exists (by content hash from previous run)
    $content_hash = md5($title . '|' . $content);
    $existing = get_posts([
        'post_type' => 'reviews',
        'post_status' => ['publish', 'draft'],
        'numberposts' => 1,
        'meta_query' => [
            [
                'key' => '_migrate_content_hash',
                'value' => $content_hash,
                'compare' => '=',
            ],
        ],
    ]);

    if (!empty($existing)) {
        echo "  Skip: " . mb_substr($title, 0, 50) . "... (already exists)\n";
        $skipped_count++;
        continue;
    }

    // post_date from dateIso
    $post_date = !empty($item['dateIso'])
        ? $item['dateIso'] . ' 12:00:00'
        : current_time('mysql');
    $post_date_gmt = get_gmt_from_date($post_date);

    $review_id = wp_insert_post([
        'post_title' => $title,
        'post_content' => $content,
        'post_type' => 'reviews',
        'post_status' => 'publish',
        'post_author' => 1,
        'post_date' => $post_date,
        'post_date_gmt' => $post_date_gmt,
    ]);

    if (is_wp_error($review_id)) {
        echo "  Error: {$title} - " . $review_id->get_error_message() . "\n";
        $error_count++;
        continue;
    }

    // Store content hash for idempotency
    update_post_meta($review_id, '_migrate_content_hash', $content_hash);

    // ACF fields
    if (function_exists('update_field')) {
        update_field('author_name', $item['authorName'] ?? 'Аноним', $review_id);
        update_field('rating', (float) ($item['rating'] ?? 5), $review_id);
        update_field('answer', $item['answer'] ?? '', $review_id);

        // Platform logo: resolve attachment ID from URL
        $platform_logo_url = $item['platformLogoUrl'] ?? '';
        if (!empty($platform_logo_url)) {
            $attachment_id = attachment_url_to_postid($platform_logo_url);
            if ($attachment_id) {
                update_field('platform_logo', $attachment_id, $review_id);
            }
        }

        // Doctors by slug (with mapping for JSON vs WP slug differences)
        $doctor_ids = [];
        $doctor_slugs = $item['doctorSlugs'] ?? [];
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
                $doctor_not_found[$slug] = ($doctor_not_found[$slug] ?? 0) + 1;
            }
        }

        update_field('related_doctors', $doctor_ids, $review_id);

        // Bidirectional: add review to each doctor
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

        // Platform taxonomy: assign review_platform term from JSON platform
        $platform = $item['platform'] ?? '';
        $term_slug_map = ['Google' => 'google', '2GIS' => '2gis', 'Яндекс' => 'yandex-karta'];
        $term_slug = $term_slug_map[$platform] ?? null;
        if ($term_slug && taxonomy_exists('review_platform')) {
            $term = get_term_by('slug', $term_slug, 'review_platform');
            if (!$term || is_wp_error($term)) {
                $term_name = $term_slug === 'yandex-karta' ? 'Яндекс.Карта' : $platform;
                $result = wp_insert_term($term_name, 'review_platform', ['slug' => $term_slug]);
                $term = !is_wp_error($result) ? get_term_by('id', $result['term_id'], 'review_platform') : null;
            }
            if ($term && !is_wp_error($term)) {
                wp_set_object_terms($review_id, (int) $term->term_id, 'review_platform');
            }
        }
    }

    $doctors_info = !empty($doctor_ids) ? ' (doctors: ' . count($doctor_ids) . ')' : '';
    echo "  Created: {$title} (ID: {$review_id}){$doctors_info}\n";
    $created_count++;
}

echo "\n=== Summary ===\n";
echo "Drafted: {$draft_count}\n";
echo "Created: {$created_count}\n";
echo "Skipped: {$skipped_count}\n";
echo "Errors: {$error_count}\n";

if (!empty($doctor_not_found)) {
    echo "\nDoctor slugs not found:\n";
    foreach ($doctor_not_found as $slug => $count) {
        echo "  - {$slug}: {$count} reviews\n";
    }
}

echo "\nDone!\n";
echo "\nNext steps:\n";
echo "1. wp cache flush && wp graphql clear-schema-cache\n";
echo "2. Verify at http://localhost:8002/wp-admin/edit.php?post_type=reviews\n";
echo "3. Test GraphQL at http://localhost:8002/graphql-ide\n";
