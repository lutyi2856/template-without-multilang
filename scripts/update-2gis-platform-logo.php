<?php
/**
 * Обновить platform_logo для всех 2GIS-отзывов на новое изображение
 *
 * Новый URL: http://localhost:8002/wp-content/uploads/2026/03/default-share-2-1-1.webp
 *
 * Run:
 *   docker cp scripts/update-2gis-platform-logo.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/update-2gis-platform-logo.php --allow-root
 */

$new_filename = '2026/03/default-share-2-1-1.webp';
$new_attachment_id = attachment_url_to_postid(site_url('/wp-content/uploads/' . $new_filename));

if (!$new_attachment_id) {
    $new_attachment_id = attachment_url_to_postid('http://localhost:8002/wp-content/uploads/' . $new_filename);
}
if (!$new_attachment_id) {
    $attachments = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'numberposts' => 1,
        'meta_query' => [['key' => '_wp_attached_file', 'value' => $new_filename, 'compare' => 'LIKE']],
    ]);
    $new_attachment_id = $attachments ? (int) $attachments[0]->ID : 0;
}
if (!$new_attachment_id) {
    echo "ERROR: Attachment not found for {$new_filename}\n";
    echo "Ensure the image is uploaded to WordPress Media Library.\n";
    exit(1);
}

echo "New 2GIS logo attachment ID: {$new_attachment_id}\n\n";

// Find old 2GIS logo attachment (default-share-1.webp)
$old_filename = '2026/03/default-share-1.webp';
$old_attachment_id = attachment_url_to_postid(site_url('/wp-content/uploads/' . $old_filename)) ?: 0;
if (!$old_attachment_id) {
    $old_att = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'numberposts' => 1,
        'meta_query' => [['key' => '_wp_attached_file', 'value' => $old_filename, 'compare' => 'LIKE']]]);
    $old_attachment_id = $old_att ? (int) $old_att[0]->ID : 1680;
}
echo "Old 2GIS logo attachment ID: {$old_attachment_id}\n\n";

// Find reviews: by platform_logo = old logo, or by taxonomy 2gis (if exists)
$reviews_with_old_logo = get_posts([
    'post_type' => 'reviews',
    'post_status' => 'any',
    'numberposts' => -1,
    'fields' => 'ids',
    'meta_query' => [
        [
            'key' => 'platform_logo',
            'value' => (string) $old_attachment_id,
            'compare' => '=',
        ],
    ],
]);

if (taxonomy_exists('review_platform')) {
    $term = get_term_by('slug', '2gis', 'review_platform');
    if ($term) {
        $by_tax = get_posts([
            'post_type' => 'reviews',
            'post_status' => 'any',
            'numberposts' => -1,
            'fields' => 'ids',
            'tax_query' => [['taxonomy' => 'review_platform', 'field' => 'term_id', 'terms' => $term->term_id]],
        ]);
        $reviews_with_old_logo = array_unique(array_merge($reviews_with_old_logo, $by_tax));
    }
}

$updated = 0;
foreach ($reviews_with_old_logo as $post_id) {
    update_field('platform_logo', $new_attachment_id, $post_id);
    $updated++;
    echo "  Updated: ID {$post_id}\n";
}

echo "\nUpdated {$updated} reviews with new 2GIS logo.\n";
echo "Done!\n";
