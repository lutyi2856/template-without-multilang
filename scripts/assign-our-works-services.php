<?php
/**
 * Привязка услуг (services) к работам (our-works) через ACF related_services
 *
 * Максимум 3 услуги на кейс. Критерии: явные ключевые слова в заголовке,
 * специализация врача.
 *
 * Запуск:
 *   docker cp scripts/assign-our-works-services.php wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/assign-our-works-services.php --allow-root
 *
 * @see plans/assign_services_to_our-works
 */

$assignments = [
	// Группа A: 3 кейса из nashi-raboty
	1670 => [ 1394, 1396, 1406 ], // chto-takoe-doverie
	1673 => [ 1412, 1394, 1402 ], // novyj-vzglyad-na-ulybku-nazimy
	1676 => [ 1396, 1350, 1362 ], // preobrazhenie-ulybki

	// Группа B: 22 кейса (заголовок + врач)
	862  => [ 1396, 1350, 1362 ],
	865  => [ 1396, 1350 ],
	868  => [ 1396, 1350, 1362 ],
	871  => [ 1394, 1392 ],
	874  => [ 1394, 1392 ],
	877  => [ 1398, 1402 ],
	880  => [ 1398, 1426 ],
	883  => [ 1406 ],
	886  => [ 1406, 1426 ],
	889  => [ 1398, 1402 ],
	892  => [ 1398, 1394 ],
	895  => [ 1398, 1402 ],
	898  => [ 1398, 1394 ],
	901  => [ 1410, 1412 ],
	904  => [ 1412, 1422 ],
	907  => [ 1398 ],
	910  => [ 1398, 1402 ],
	913  => [ 1396, 1350 ],
	916  => [ 1396, 1350 ],
	919  => [ 1398, 1394 ],
	922  => [ 1394, 1392 ],
	925  => [ 1394, 1396 ],
	928  => [ 1434, 1426 ],
	931  => [ 1430, 1398, 1426 ],
];

echo "=== Привязка услуг к работам (our-works) ===\n\n";

// Проверить существование услуг
$service_ids = array_unique( array_merge( ...array_values( $assignments ) ) );
$missing = [];
foreach ( $service_ids as $sid ) {
	$post = get_post( $sid );
	if ( ! $post || $post->post_type !== 'services' ) {
		$missing[] = $sid;
	}
}
if ( ! empty( $missing ) ) {
	echo "✗ Ошибка: услуги не найдены: " . implode( ', ', $missing ) . "\n";
	exit( 1 );
}
echo "Проверено услуг: " . count( $service_ids ) . "\n\n";

$updated = 0;
$skipped = 0;

foreach ( $assignments as $work_id => $service_ids ) {
	$work = get_post( $work_id );
	if ( ! $work || $work->post_type !== 'our-works' ) {
		echo "  ⚠ Работа ID {$work_id} не найдена, пропуск\n";
		$skipped++;
		continue;
	}

	// Ограничение: не более 3 услуг
	$ids = array_slice( array_map( 'intval', $service_ids ), 0, 3 );

	update_field( 'related_services', $ids, $work_id );
	echo "  ✓ ID {$work_id} ({$work->post_title}) → " . count( $ids ) . " услуг\n";
	$updated++;
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Обновлено: {$updated} работ\n";
if ( $skipped > 0 ) {
	echo "Пропущено: {$skipped}\n";
}
echo "\n✓ Готово!\n";
