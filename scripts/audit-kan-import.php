<?php
/**
 * Audit script: compare KAN JSON categories with WordPress service_categories
 *
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/audit-kan-import.php
 *
 * Note: WP-CLI loads WordPress; script runs in WP context.
 */

$json_path = dirname(__DIR__) . '/kan-data/services-prices.json';
if (!file_exists($json_path)) {
    echo "ERROR: kan-data/services-prices.json not found.\n";
    exit(1);
}

$data = json_decode(file_get_contents($json_path), true);
if (!$data || !isset($data['categories'])) {
    echo "ERROR: Invalid JSON or missing categories.\n";
    exit(1);
}

$json_categories = array_column($data['categories'], 'name');
$total_items = 0;
foreach ($data['categories'] as $cat) {
    foreach ($cat['subcategories'] ?? [] as $sub) {
        $total_items += count($sub['items'] ?? []);
    }
}

echo "=== KAN Import Audit ===\n\n";

echo "--- JSON (kan-data/services-prices.json) ---\n";
echo "Categories: " . count($json_categories) . "\n";
echo "Total items: {$total_items}\n";
foreach ($json_categories as $i => $name) {
    echo "  " . ($i + 1) . ". {$name}\n";
}

echo "\n--- WordPress service_categories ---\n";
$terms = get_terms([
    'taxonomy'   => 'service_categories',
    'hide_empty' => false,
]);
echo "Terms: " . count($terms) . "\n";
foreach ($terms as $t) {
    echo "  - {$t->name} (slug: {$t->slug}, ID: {$t->term_id})\n";
}

echo "\n--- Comparison ---\n";
$slug_map = [
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

foreach ($json_categories as $name) {
    $slug = $slug_map[$name] ?? sanitize_title($name);
    $exists = get_term_by('slug', $slug, 'service_categories');
    $status = $exists ? "EXISTS (ID: {$exists->term_id})" : "MISSING";
    echo "  {$name}\n    → slug: {$slug} | {$status}\n";
}

echo "\n--- CPT counts ---\n";
$prices_count = wp_count_posts('prices');
$services_count = wp_count_posts('services');
echo "prices (publish): " . ($prices_count->publish ?? 0) . "\n";
echo "services (publish): " . ($services_count->publish ?? 0) . "\n";

echo "\n=== Audit complete ===\n";
