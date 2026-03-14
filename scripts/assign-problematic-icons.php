<?php
/**
 * Назначение иконок терминам проблематики по смыслу
 *
 * Запуск: docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/assign-problematic-icons.php --allow-root
 */

$taxonomy = 'problematics';

// Problematics slug => icon slug (из @/icons)
$mapping = array(
	'vylechit-zuby'            => 'tooth',        // Вылечить зубы (кариес, пульпит) — терапия
	'ispravit-prikus'          => 'orthodontics', // Исправить прикус (брекеты, элайнеры)
	'postavit-implanty'        => 'implant',      // Поставить импланты
	'vosstanovit-zuby'         => 'prosthetics',  // Восстановить зубы — протезирование
	'lechenie-vo-sne'          => 'aesthetic',    // Лечение во сне (седация) — эстетика/комфорт
	'detskaya-stomatologiya'   => 'children',     // Детская стоматология
	'udalit-zub'               => 'surgery',      // Удалить зуб — хирургия
	'professionalnaya-chistka' => 'hygiene',      // Профессиональная чистка — гигиена
	'otbelit-zuby'             => 'whitening',    // Отбеливание зубов
	'lechit-desny'             => 'periodontics', // Лечение десен — пародонтология
);

echo "=== Assigning icons to Problematics ===\n\n";

foreach ( $mapping as $prob_slug => $icon_slug ) {
	$term = get_term_by( 'slug', $prob_slug, $taxonomy );
	if ( ! $term || is_wp_error( $term ) ) {
		echo "⚠ Term not found: {$prob_slug}\n";
		continue;
	}
	update_term_meta( $term->term_id, 'problematic_icon', $icon_slug );
	echo "✓ {$term->name} → {$icon_slug}\n";
}

echo "\n=== Done ===\n";
