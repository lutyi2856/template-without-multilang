<?php
/**
 * Назначение иконок всем терминам таксономии service_categories
 *
 * Обновляет term meta category_icon для каждого термина по маппингу slug → icon.
 *
 * Запуск:
 *   docker cp scripts/assign-service-category-icons.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/assign-service-category-icons.php --allow-root
 */

// Run via: wp eval-file /var/www/html/scripts/assign-service-category-icons.php --allow-root

echo "=== Назначение иконок терминам service_categories ===\n\n";

$slug_to_icon = [
	'implantation' => 'implant',
	'treatment'    => 'tooth',
	'terapiya'     => 'tooth',
	'prosthetics'  => 'prosthetics',
	'ortopediya'   => 'prosthetics',
	'whitening'    => 'whitening',
	'braces'       => 'orthodontics',
	'orthodontics' => 'orthodontics',
	'children'     => 'children',
	'surgery'      => 'surgery',
	'gigiena'      => 'hygiene',
	'gnatologiya'  => 'diagnostic',
	'konsultacii'  => 'arrow-up-right',
	'endodontiya'  => 'endodontics',
];

$terms = get_terms( [
	'taxonomy'   => 'service_categories',
	'hide_empty' => false,
] );

if ( is_wp_error( $terms ) ) {
	echo "✗ Ошибка получения терминов: " . $terms->get_error_message() . "\n";
	exit( 1 );
}

if ( empty( $terms ) ) {
	echo "• Нет терминов в service_categories\n";
	exit( 0 );
}

$updated = 0;
foreach ( $terms as $term ) {
	$icon_slug = $slug_to_icon[ $term->slug ] ?? 'tooth';
	update_term_meta( $term->term_id, 'category_icon', $icon_slug );
	echo "✓ {$term->name} (slug: {$term->slug}) → {$icon_slug}\n";
	$updated++;
}

wp_cache_flush();
echo "\n✓ Назначено иконок: {$updated}\n";
