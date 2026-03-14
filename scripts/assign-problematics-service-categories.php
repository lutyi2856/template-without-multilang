<?php
/**
 * Назначение связей между таксономиями problematics и service_categories
 *
 * Записывает двустороннюю связь в term meta согласно утверждённой таблице.
 * Запуск: docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/assign-problematics-service-categories.php
 *
 * Таблица соответствий (Problematics → Service Categories):
 * 1. Вылечить зубы → Лечение зубов (treatment)
 * 2. Исправить прикус → Брекеты и ортодонтия (braces)
 * 3. Поставить импланты → Имплантация зубов (implantation)
 * 4. Восстановить зубы → Протезирование (prosthetics)
 * 5. Лечение во сне → Лечение зубов, Хирургия, Детская стоматология (treatment, surgery, children)
 * 6. Детская стоматология → Детская стоматология (children)
 * 7. Удалить зуб → Хирургия (surgery)
 * 8. Профессиональная чистка → Отбеливание (whitening)
 * 9. Отбеливание зубов → Отбеливание (whitening)
 * 10. Лечение десен → Лечение зубов (treatment)
 */

$tax_problematics    = 'problematics';
$tax_service_categories = 'service_categories';

// Problematics slug => Service Categories slugs (array), по утверждённому плану
$mapping = array(
	'vylechit-zuby'            => array( 'treatment' ),
	'ispravit-prikus'          => array( 'braces', 'orthodontics', 'ispravlenie-prikusa' ),
	'postavit-implanty'        => array( 'implantation' ),
	'vosstanovit-zuby'         => array( 'prosthetics' ),
	'lechenie-vo-sne'          => array( 'treatment', 'surgery', 'children', 'detskoe-lechenie' ),
	'detskaya-stomatologiya'   => array( 'children', 'detskoe-lechenie' ),
	'udalit-zub'               => array( 'surgery' ),
	'professionalnaya-chistka' => array( 'whitening', 'gigiena', 'prof-gigiena' ),
	'otbelit-zuby'             => array( 'whitening', 'otbelivanie-zubov' ),
	'lechit-desny'             => array( 'treatment', 'terapiya' ),
);

// Resolve slugs to term IDs (первый найденный slug из каждой группы; без дубликатов)
$resolve_cat_slugs = function ( $slugs ) use ( $tax_service_categories ) {
	$ids = array();
	foreach ( $slugs as $slug ) {
		$t = get_term_by( 'slug', $slug, $tax_service_categories );
		if ( $t && ! is_wp_error( $t ) && ! in_array( $t->term_id, $ids, true ) ) {
			$ids[] = $t->term_id;
		}
	}
	return $ids;
};

echo "=== Assigning Problematics ↔ Service Categories ===\n\n";

// 1. Build reverse mapping: service_category term_id => problematic term IDs
$reverse = array();

// 2. Write to Problematic terms: related_service_categories (array of service_category term IDs)
foreach ( $mapping as $prob_slug => $cat_slugs ) {
	$prob_term = get_term_by( 'slug', $prob_slug, $tax_problematics );
	if ( ! $prob_term || is_wp_error( $prob_term ) ) {
		echo "⚠ Problematics term not found: {$prob_slug}\n";
		continue;
	}
	$cat_term_ids = $resolve_cat_slugs( $cat_slugs );
	update_term_meta( $prob_term->term_id, 'related_service_categories', $cat_term_ids );
	echo "✓ {$prob_term->name} → " . count( $cat_term_ids ) . " categories\n";
	foreach ( $cat_term_ids as $cat_id ) {
		if ( ! isset( $reverse[ $cat_id ] ) ) {
			$reverse[ $cat_id ] = array();
		}
		$reverse[ $cat_id ][] = $prob_term->term_id;
	}
}

// 3. Write to ServiceCategory terms: related_problematics (array of problematic term IDs)
foreach ( $reverse as $cat_term_id => $prob_term_ids ) {
	$cat_term = get_term( $cat_term_id );
	if ( ! $cat_term || is_wp_error( $cat_term ) ) {
		continue;
	}
	$prob_term_ids = array_unique( $prob_term_ids );
	update_term_meta( $cat_term_id, 'related_problematics', array_values( $prob_term_ids ) );
	echo "✓ {$cat_term->name} ← " . count( $prob_term_ids ) . " problematics\n";
}

echo "\n=== Done ===\n";
