<?php
/**
 * Import KAN services and prices from kan-data/services-prices.json into WordPress
 *
 * Creates:
 * - 10 terms in service_categories (full names from JSON)
 * - 49 prices (regular_price, currency=UZS)
 * - 49 services (linked to prices via related_prices)
 * - wp_set_object_terms for both prices and services
 *
 * Run:
 *   docker cp kan-data wp-new-wordpress:/var/www/html/kan-data
 *   docker cp scripts/import-kan-services-prices.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/import-kan-services-prices.php --allow-root
 */

$json_path = getenv('KAN_JSON_PATH') ?: dirname(__DIR__) . '/kan-data/services-prices.json';

if (!file_exists($json_path)) {
    echo "ERROR: JSON not found: {$json_path}\n";
    echo "Copy kan-data to container: docker cp kan-data wp-new-wordpress:/var/www/html/kan-data\n";
    exit(1);
}

$data = json_decode(file_get_contents($json_path), true);
if (!$data || !isset($data['categories'])) {
    echo "ERROR: Invalid JSON\n";
    exit(1);
}

$currency = $data['currency'] ?? 'UZS';

// Slug map: full category name → slug
$category_slugs = [
    'Исправление прикуса' => 'ispravlenie-prikusa',
    'Отбеливание зубов' => 'otbelivanie-zubov',
    'Диагностика' => 'diagnostika',
    'Ортопедия - коронки' => 'ortopediya-koronki',
    'Ортопедия - виниры' => 'ortopediya-viniry',
    'Терапевтическое и эндодонтическое лечение' => 'terapevticheskoe-i-endodonticheskoe-lechenie',
    'Проф. гигиена' => 'prof-gigiena',
    'Хирургия и имплантация' => 'hirurgiya-i-implantaciya',
    'Детское лечение' => 'detskoe-lechenie',
    'Седация ЗАКС' => 'sedaciya-zaks',
];

/**
 * Resolve Service title from item and category
 */
function resolve_service_title($item_name, $category_name) {
    // Седация ЗАКС: items like "15 минут", "30 минут", "1 час 30 минут", "2 часа"
    if ($category_name === 'Седация ЗАКС') {
        $short = 'Седация';
        // Match longest first: "1 час 30 минут" before "30 минут"
        $duration_patterns = ['1 час 30 минут', '2 часа', '1 час', '30 минут', '15 минут'];
        foreach ($duration_patterns as $d) {
            if (strpos($item_name, $d) !== false || trim($item_name) === $d) {
                return $short . ' ' . $d;
            }
        }
        // Fallback: extract duration from text
        if (preg_match('/(\d+\s*час[а-я]*\s*(?:\d+\s*минут)?|\d+\s*минут)/u', $item_name, $m)) {
            return $short . ' ' . trim($m[1]);
        }
    }

    // Short duration-only names (e.g. "30 минут" in Седация)
    if (preg_match('/^(\d+\s*(?:час|минут)[^\s]*)$/u', trim($item_name))) {
        return ($category_name === 'Седация ЗАКС' ? 'Седация ' : '') . $item_name;
    }

    // Проф. гигиена: ".... ---CAT--- Проф. гигиена 1 степени – удаление..."
    if (strpos($item_name, '---CAT---') !== false) {
        $parts = explode('---CAT---', $item_name, 2);
        return trim($parts[1] ?? $item_name);
    }

    // Ортопедия - коронки: prefix "Реставрация зуба", Е.Мах → Emax, remove trailing colon
    if ($category_name === 'Ортопедия - коронки') {
        $name = trim(rtrim(trim($item_name), ':'));
        if (strpos($name, 'Реставрация зуба') === 0) {
            return $name;
        }
        $name = str_replace(['(Е.Мах)', 'Е.Мах'], 'Emax', $name);
        return 'Реставрация зуба ' . $name;
    }

    return $item_name;
}

/**
 * Build Gutenberg content from description
 */
function build_gutenberg_content($description) {
    if (empty(trim($description))) {
        return '';
    }
    $text = trim($description);
    if (!empty($text)) {
        return "<!-- wp:paragraph -->\n<p>" . esc_html($text) . "</p>\n<!-- /wp:paragraph -->";
    }
    return '';
}

$terms_created = 0;
$prices_created = 0;
$services_created = 0;

echo "=== KAN Import: services & prices ===\n\n";

foreach ($data['categories'] as $category) {
    $cat_name = $category['name'];
    $slug = $category_slugs[$cat_name] ?? sanitize_title($cat_name);

    // 1. Create or get term
    $term = get_term_by('slug', $slug, 'service_categories');
    if (!$term) {
        $result = wp_insert_term($cat_name, 'service_categories', ['slug' => $slug]);
        if (is_wp_error($result)) {
            echo "ERROR category '{$cat_name}': " . $result->get_error_message() . "\n";
            continue;
        }
        $term_id = $result['term_id'];
        $terms_created++;
        echo "✓ Created term: {$cat_name} (ID: {$term_id})\n";
    } else {
        $term_id = $term->term_id;
    }

    // 2. Process items
    foreach ($category['subcategories'] ?? [] as $sub) {
        foreach ($sub['items'] ?? [] as $item) {
            $item_name = $item['name'] ?? '';
            $price_val = (int) ($item['price'] ?? 0);
            $from_prefix = !empty($item['fromPrefix']);
            $description = $item['description'] ?? '';

            $service_title = resolve_service_title($item_name, $cat_name);
            $price_title = ($cat_name === 'Ортопедия - коронки') ? $service_title : $item_name;

            if (empty($service_title) || $price_val <= 0) {
                continue;
            }

            // Check existing price by title + term (same item in same category)
            $candidate_prices = get_posts([
                'post_type' => 'prices',
                'post_status' => 'any',
                'posts_per_page' => -1,
                'tax_query' => [[
                    'taxonomy' => 'service_categories',
                    'field' => 'term_id',
                    'terms' => $term_id,
                ]],
            ]);
            $existing_prices = array_filter($candidate_prices, fn($p) => $p->post_title === $price_title);

            if (!empty($existing_prices)) {
                $price_id = array_values($existing_prices)[0]->ID;
                echo "  - Price exists: {$price_title} (ID: {$price_id})\n";
            } else {
                $price_id = wp_insert_post([
                    'post_title' => $price_title,
                    'post_type' => 'prices',
                    'post_status' => 'publish',
                    'post_content' => '',
                ]);
                if (is_wp_error($price_id)) {
                    echo "  ✗ Price error '{$price_title}': " . $price_id->get_error_message() . "\n";
                    continue;
                }

                update_field('regular_price', $price_val, $price_id);
                update_field('currency', $currency, $price_id);
                update_field('price_type', 'regular', $price_id);
                wp_set_object_terms($price_id, [$term_id], 'service_categories');
                $prices_created++;
                echo "  ✓ Price: {$price_title} = {$price_val} {$currency}\n";
            }

            // Check existing service (by title + category)
            $candidate_services = get_posts([
                'post_type' => 'services',
                'post_status' => 'any',
                'posts_per_page' => -1,
                'tax_query' => [[
                    'taxonomy' => 'service_categories',
                    'field' => 'term_id',
                    'terms' => $term_id,
                ]],
            ]);
            $existing_services = array_filter($candidate_services, fn($p) => $p->post_title === $service_title);

            if (!empty($existing_services)) {
                $service_id = array_values($existing_services)[0]->ID;
                $current_prices = get_field('related_prices', $service_id);
                if (!is_array($current_prices)) {
                    $current_prices = [];
                }
                $ids = array_map(fn($p) => is_object($p) ? $p->ID : $p, $current_prices);
                if (!in_array($price_id, $ids)) {
                    $current_prices[] = $price_id;
                    update_field('related_prices', $current_prices, $service_id);
                }
                wp_set_object_terms($service_id, [$term_id], 'service_categories');
                if (!empty(trim($description ?? ''))) {
                    $clean_desc = trim($description);
                    if ($clean_desc !== trim(get_post_field('post_excerpt', $service_id) ?? '')) {
                        wp_update_post([
                            'ID' => $service_id,
                            'post_excerpt' => $clean_desc,
                        ]);
                        echo "  - Updated excerpt for: {$service_title}\n";
                    }
                }
                echo "  - Service exists: {$service_title} (ID: {$service_id}), linked price\n";
            } else {
                $content = build_gutenberg_content($description);
                $service_id = wp_insert_post([
                    'post_title' => $service_title,
                    'post_type' => 'services',
                    'post_status' => 'publish',
                    'post_content' => $content,
                    'post_excerpt' => !empty(trim($description ?? '')) ? trim($description) : '',
                ]);
                if (is_wp_error($service_id)) {
                    echo "  ✗ Service error '{$service_title}': " . $service_id->get_error_message() . "\n";
                    continue;
                }

                update_field('related_prices', [$price_id], $service_id);
                wp_set_object_terms($service_id, [$term_id], 'service_categories');
                $services_created++;
                echo "  ✓ Service: {$service_title} (ID: {$service_id})\n";
            }
        }
    }
    echo "\n";
}

echo "=== Summary ===\n";
echo "Terms created: {$terms_created}\n";
echo "Prices created: {$prices_created}\n";
echo "Services created: {$services_created}\n";
echo "\n✓ Done. Clear caches: wp cache flush && wp graphql clear-schema-cache\n";
