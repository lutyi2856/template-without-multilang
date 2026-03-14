<?php
/**
 * Fix: Седация 30 минут was wrongly linked to price "1 час 30 минут"
 * Run once after import.
 */
$candidates = get_posts([
    'post_type' => 'services',
    'post_status' => 'any',
    'posts_per_page' => -1,
    'tax_query' => [['taxonomy' => 'service_categories', 'field' => 'slug', 'terms' => 'sedaciya-zaks']],
]);
$sedatia_30 = null;
foreach ($candidates as $p) {
    if ($p->post_title === 'Седация 30 минут') {
        $sedatia_30 = $p;
        break;
    }
}
$price_1h30 = null;
$prices = get_posts([
    'post_type' => 'prices',
    'post_status' => 'any',
    'posts_per_page' => -1,
    'tax_query' => [['taxonomy' => 'service_categories', 'field' => 'slug', 'terms' => 'sedaciya-zaks']],
]);
foreach ($prices as $p) {
    if ($p->post_title === '1 час 30 минут') {
        $price_1h30 = $p;
        break;
    }
}
if (!$sedatia_30 || !$price_1h30) {
    echo "Skip: no data to fix\n";
    exit(0);
}
$current = get_field('related_prices', $sedatia_30->ID) ?: [];
$filtered = [];
foreach ($current as $p) {
    $id = is_object($p) ? $p->ID : $p;
    if ($id != $price_1h30->ID) {
        $filtered[] = $p;
    }
}
update_field('related_prices', $filtered, $sedatia_30->ID);
echo "Removed wrong price from Седация 30 минут\n";

$need = get_posts([
    'post_type' => 'services',
    'post_status' => 'any',
    'posts_per_page' => -1,
    'tax_query' => [['taxonomy' => 'service_categories', 'field' => 'slug', 'terms' => 'sedaciya-zaks']],
]);
$need_service = null;
foreach ($need as $p) {
    if ($p->post_title === 'Седация 1 час 30 минут') {
        $need_service = $p;
        break;
    }
}
if (!$need_service) {
    $service_id = wp_insert_post([
        'post_title' => 'Седация 1 час 30 минут',
        'post_type' => 'services',
        'post_status' => 'publish',
    ]);
    $term = get_term_by('slug', 'sedaciya-zaks', 'service_categories');
    if ($term) {
        wp_set_object_terms($service_id, [$term->term_id], 'service_categories');
    }
    update_field('related_prices', [$price_1h30->ID], $service_id);
    echo "Created service Седация 1 час 30 минут (ID: {$service_id})\n";
}
echo "Done.\n";
