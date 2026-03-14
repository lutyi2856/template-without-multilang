<?php
/**
 * Обновление тестовых данных для акции (согласно Figma)
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

$post_id = 42; // "Акция на имплантацию зубов"

// Обновляем заголовок
wp_update_post([
	'ID' => $post_id,
	'post_title' => 'Имплант OSSTEM с установкой',
]);

// Обновляем ACF поля
if (function_exists('update_field')) {
	// Features - repeater
	$features = [
		['text' => 'высокая биосовместимость с костной тканью'],
		['text' => 'индивидуальный подбор модели импланта'],
		['text' => 'надежный южнокорейский бренд'],
	];
	update_field('features', $features, $post_id);

	// Price
	update_field('price', '17 900₽', $post_id);

	// End Date (6 дней от сегодня)
	$end_date = date('Y-m-d H:i:s', strtotime('+6 days'));
	update_field('end_date', $end_date, $post_id);

	// Action Type
	update_field('action_type', 'promo', $post_id);

	echo "Promotion ID {$post_id} updated successfully!\n";
	echo "Title: Имплант OSSTEM с установкой\n";
	echo "Features: 3 items\n";
	echo "Price: 17 900₽\n";
	echo "End Date: {$end_date}\n";
} else {
	echo "Error: ACF not available\n";
}
