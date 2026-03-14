<?php
/**
 * Analyze price duplicates in WordPress.
 *
 * Outputs JSON to stdout. Run:
 *   docker cp scripts/analyze-price-duplicates-wp.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/analyze-price-duplicates-wp.php --allow-root > kan-data/price-analysis-wp.json
 *
 * WP-CLI loads WordPress; script runs in WP context.
 */

$prices = get_posts([
    'post_type' => 'prices',
    'post_status' => 'any',
    'posts_per_page' => -1,
]);

$items = [];
foreach ($prices as $post) {
    $regular_price = get_field('regular_price', $post->ID);
    $regular_price = is_numeric($regular_price) ? (int) $regular_price : null;

    $terms = wp_get_post_terms($post->ID, 'service_categories');
    $categories = array_map(fn($t) => $t->name, $terms ?: []);

    $items[] = [
        'id' => $post->ID,
        'title' => $post->post_title,
        'regularPrice' => $regular_price,
        'categories' => $categories,
    ];
}

$byKey = [];
foreach ($items as $item) {
    $key = $item['title'] . '|' . ($item['regularPrice'] ?? '');
    if (!isset($byKey[$key])) {
        $byKey[$key] = [];
    }
    $byKey[$key][] = $item;
}

$exactDuplicates = [];
foreach ($byKey as $key => $entries) {
    if (count($entries) > 1) {
        $parts = explode('|', $key, 2);
        $exactDuplicates[] = [
            'title' => $parts[0],
            'regularPrice' => $parts[1] !== '' ? (int) $parts[1] : null,
            'ids' => array_column($entries, 'id'),
            'categories' => array_unique(array_merge(...array_map(fn($e) => $e['categories'], $entries))),
            'count' => count($entries),
        ];
    }
}

$byTitle = [];
foreach ($items as $item) {
    $t = $item['title'];
    if (!isset($byTitle[$t])) {
        $byTitle[$t] = [];
    }
    $byTitle[$t][] = $item;
}

$sameTitleDifferentPrice = [];
foreach ($byTitle as $title => $entries) {
    $prices = array_unique(array_filter(array_column($entries, 'regularPrice')));
    if (count($prices) > 1) {
        $sameTitleDifferentPrice[] = [
            'title' => $title,
            'prices' => array_values($prices),
            'ids' => array_column($entries, 'id'),
        ];
    }
}

$result = [
    'generatedAt' => date('c'),
    'items' => $items,
    'exactDuplicates' => $exactDuplicates,
    'sameTitleDifferentPrice' => $sameTitleDifferentPrice,
    'summary' => [
        'totalPrices' => count($items),
        'duplicateGroups' => count($exactDuplicates),
        'sameTitleDifferentPriceCount' => count($sameTitleDifferentPrice),
    ],
];

$out_path = getenv('PRICE_ANALYSIS_OUT') ?: dirname(__DIR__) . '/kan-data/price-analysis-wp.json';
$out_dir = dirname($out_path);
if (!is_dir($out_dir)) {
    @mkdir($out_dir, 0755, true);
}
file_put_contents($out_path, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
echo "Written: {$out_path}\n";
