<?php
/**
 * Update post titles for services and prices in "Ортопедия - коронки" category.
 * Applies: prefix "Реставрация зуба", Е.Мах → Emax, remove trailing colon.
 *
 * Run:
 *   docker cp scripts/update-ortopediya-koronki-titles.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/update-ortopediya-koronki-titles.php --allow-root
 */

$term = get_term_by('slug', 'ortopediya-koronki', 'service_categories');
if (!$term) {
    echo "ERROR: Term ortopediya-koronki not found in service_categories\n";
    exit(1);
}

$term_id = $term->term_id;
echo "=== Update titles: Ортопедия - коронки (term_id: {$term_id}) ===\n\n";

// Old title => New title (only crown-related items, not consultation)
$title_map = [
    'металлокерамической коронкой' => 'Реставрация зуба металлокерамической коронкой',
    'оксид циркониевой коронкой (жевательная группа зубов)' => 'Реставрация зуба оксид циркониевой коронкой (жевательная группа зубов)',
    'оксид циркониевой коронкой с нанесением керамической массы (фронтальная группа зубов)' => 'Реставрация зуба оксид циркониевой коронкой с нанесением керамической массы (фронтальная группа зубов)',
    'керамической коронкой (Е.Мах) (жевательная группа зубов)' => 'Реставрация зуба керамической коронкой Emax (жевательная группа зубов)',
    'керамической коронкой с нанесением керамической массы (Е.Мах) (фронтальная группа зубов):' => 'Реставрация зуба керамической коронкой с нанесением керамической массы Emax (фронтальная группа зубов)',
];

function update_posts_in_category($post_type, $term_id, $title_map) {
    $posts = get_posts([
        'post_type' => $post_type,
        'post_status' => 'any',
        'posts_per_page' => -1,
        'tax_query' => [[
            'taxonomy' => 'service_categories',
            'field' => 'term_id',
            'terms' => $term_id,
        ]],
    ]);

    $updated = 0;
    foreach ($posts as $post) {
        $old = $post->post_title;
        if (isset($title_map[$old])) {
            $new = $title_map[$old];
            wp_update_post([
                'ID' => $post->ID,
                'post_title' => $new,
            ]);
            echo "  ✓ {$post_type} ID {$post->ID}: \"{$old}\" → \"{$new}\"\n";
            $updated++;
        }
    }
    return $updated;
}

$prices_updated = update_posts_in_category('prices', $term_id, $title_map);
echo "\nPrices updated: {$prices_updated}\n";

$services_updated = update_posts_in_category('services', $term_id, $title_map);
echo "Services updated: {$services_updated}\n";

echo "\n✓ Done. Clear caches: wp cache flush && wp graphql clear-schema-cache\n";
