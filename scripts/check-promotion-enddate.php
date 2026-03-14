<?php
/**
 * Проверка данных промоушена - endDate и futures
 * Запуск: docker exec wp-new-wordpress wp eval-file scripts/check-promotion-enddate.php --allow-root
 */

echo "=== Checking Promotion Data ===" . PHP_EOL . PHP_EOL;

// Получаем последнюю опубликованную акцию
$args = [
	'post_type' => 'promotions',
	'post_status' => 'publish',
	'posts_per_page' => 1,
	'orderby' => 'date',
	'order' => 'DESC',
];

$query = new WP_Query($args);

if (!$query->have_posts()) {
	echo "❌ No published promotions found!" . PHP_EOL;
	exit(1);
}

$post = $query->posts[0];
$post_id = $post->ID;

echo "✅ Found promotion: " . $post->post_title . " (ID: $post_id)" . PHP_EOL . PHP_EOL;

// Проверяем ACF поля
echo "--- ACF Fields (via get_field) ---" . PHP_EOL;
$end_date_field = get_field('end_date', $post_id);
$action_type = get_field('action_type', $post_id);
$price = get_field('price', $post_id);
$futures = get_field('futures', $post_id);

echo "end_date (get_field): " . ($end_date_field ? $end_date_field : 'NULL') . PHP_EOL;
echo "end_date type: " . gettype($end_date_field) . PHP_EOL;
echo "action_type: " . ($action_type ? $action_type : 'NULL') . PHP_EOL;
echo "price: " . ($price ? $price : 'NULL') . PHP_EOL;
echo "futures: " . ($futures ? print_r($futures, true) : 'NULL') . PHP_EOL;

echo PHP_EOL . "--- Post Meta (via get_post_meta) ---" . PHP_EOL;
$end_date_meta = get_post_meta($post_id, 'end_date', true);
$action_type_meta = get_post_meta($post_id, 'action_type', true);
$price_meta = get_post_meta($post_id, 'price', true);
$futures_meta = get_post_meta($post_id, 'futures', true);

echo "end_date (get_post_meta): " . ($end_date_meta ? $end_date_meta : 'NULL') . PHP_EOL;
echo "end_date type: " . gettype($end_date_meta) . PHP_EOL;
echo "action_type (meta): " . ($action_type_meta ? $action_type_meta : 'NULL') . PHP_EOL;
echo "price (meta): " . ($price_meta ? $price_meta : 'NULL') . PHP_EOL;
echo "futures (meta): " . ($futures_meta ? print_r($futures_meta, true) : 'NULL') . PHP_EOL;

// Проверяем все meta keys для этого поста
echo PHP_EOL . "--- All Post Meta Keys ---" . PHP_EOL;
$all_meta = get_post_meta($post_id);
foreach ($all_meta as $key => $value) {
	if (strpos($key, 'end') !== false || strpos($key, 'date') !== false || strpos($key, 'future') !== false) {
		echo "$key: " . print_r($value, true) . PHP_EOL;
	}
}

// Тест преобразования даты в ISO format
if ($end_date_field) {
	echo PHP_EOL . "--- Date Conversion Test ---" . PHP_EOL;
	echo "Original: $end_date_field" . PHP_EOL;
	
	// Пробуем разные форматы
	$formats = [
		'Y-m-d H:i:s',
		'Y-m-d H:i',
		'd/m/Y H:i',
		'YmdHis',
	];
	
	foreach ($formats as $format) {
		$date_obj = DateTime::createFromFormat($format, $end_date_field);
		if ($date_obj !== false) {
			echo "✅ Parsed with format '$format'" . PHP_EOL;
			echo "   ISO 8601: " . $date_obj->format('c') . PHP_EOL;
			echo "   Timestamp: " . $date_obj->getTimestamp() . PHP_EOL;
			break;
		}
	}
	
	// Пробуем strtotime
	$timestamp = strtotime($end_date_field);
	if ($timestamp !== false) {
		$date_obj = new DateTime();
		$date_obj->setTimestamp($timestamp);
		echo "✅ Parsed with strtotime" . PHP_EOL;
		echo "   ISO 8601: " . $date_obj->format('c') . PHP_EOL;
	}
}

echo PHP_EOL . "=== Check Complete ===" . PHP_EOL;
