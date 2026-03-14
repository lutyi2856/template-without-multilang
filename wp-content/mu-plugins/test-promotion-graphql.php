<?php
/**
 * Test Promotion GraphQL data
 * 
 * Добавляет debug endpoint для проверки данных промоушена
 */

add_action('init', function() {
	if (isset($_GET['test_promotion_graphql'])) {
		header('Content-Type: application/json');
		
		// Получаем последнюю акцию
		$args = [
			'post_type' => 'promotions',
			'post_status' => 'publish',
			'posts_per_page' => 1,
			'orderby' => 'date',
			'order' => 'DESC',
		];
		
		$query = new WP_Query($args);
		
		if (!$query->have_posts()) {
			echo json_encode(['error' => 'No promotions found']);
			exit;
		}
		
		$post = $query->posts[0];
		$post_id = $post->ID;
		
		// Получаем ACF поля
		$end_date = get_field('end_date', $post_id);
		$action_type = get_field('action_type', $post_id);
		$price = get_field('price', $post_id);
		$futures = get_field('futures', $post_id);
		
		// Преобразуем дату в ISO
		$end_date_iso = null;
		if ($end_date) {
			$date_obj = DateTime::createFromFormat('Y-m-d H:i:s', $end_date);
			if ($date_obj) {
				$end_date_iso = $date_obj->format('c');
			}
		}
		
		$result = [
			'post_id' => $post_id,
			'title' => $post->post_title,
			'raw_data' => [
				'end_date' => $end_date,
				'action_type' => $action_type,
				'price' => $price,
				'futures' => $futures,
			],
			'formatted' => [
				'endDate' => $end_date_iso,
			],
		];
		
		echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
		exit;
	}
});
