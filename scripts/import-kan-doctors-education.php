<?php
/**
 * Импорт education врачей KAN из kan-data (источник истины)
 *
 * Запуск: npm run import-kan-doctors-education
 * Или: docker cp kan-data wp-new-wordpress:/var/www/html/kan-data
 *      docker cp scripts/. wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/import-kan-doctors-education.php --allow-root
 */

$argv = $GLOBALS['argv'] ?? $_SERVER['argv'] ?? [];
$dry_run = in_array('--dry-run', $argv, true);

$base = defined('ABSPATH') ? rtrim(ABSPATH, '/') : dirname(dirname(__DIR__));
$kan_data_path = $base . '/kan-data/all-doctors-data-v2.json';
$created_path = $base . '/kan-data/created-doctors.json';

require_once __DIR__ . '/lib/doctor-education-parser.php';

if (!file_exists($kan_data_path)) {
    echo "Ошибка: не найден {$kan_data_path}\n";
    echo "Скопируйте kan-data в контейнер: docker cp kan-data wp-new-wordpress:/var/www/html/kan-data\n";
    exit(1);
}
if (!file_exists($created_path)) {
    echo "Ошибка: не найден {$created_path}\n";
    exit(1);
}

$kan_doctors = json_decode(file_get_contents($kan_data_path), true);
$created = json_decode(file_get_contents($created_path), true);

if (!is_array($kan_doctors) || !is_array($created)) {
    echo "Ошибка: некорректный JSON\n";
    exit(1);
}

$by_number = [];
foreach ($created as $c) {
    $n = isset($c['number']) ? (int) $c['number'] : 0;
    if ($n > 0) {
        $by_number[$n] = (int) $c['postId'];
    }
}

echo "=== Импорт education из kan-data ===\n";
echo "Режим: " . ($dry_run ? "DRY-RUN (без записи)" : "ЗАПИСЬ") . "\n";
echo "Врачей в kan-data: " . count($kan_doctors) . "\n";
echo "Записей в created-doctors: " . count($created) . "\n\n";

$imported = 0;
$skipped = 0;

foreach ($kan_doctors as $kan) {
    $number = isset($kan['number']) ? (int) $kan['number'] : 0;
    $post_id = $by_number[$number] ?? null;
    if (!$post_id) {
        $skipped++;
        continue;
    }

    $education_raw = $kan['education'] ?? [];
    if (!is_array($education_raw)) {
        $education_raw = [];
    }

    $rows = [];
    foreach ($education_raw as $text) {
        if (empty($text) || !is_string($text)) {
            continue;
        }
        if (doctor_education_is_employment($text)) {
            continue;
        }
        $parsed = doctor_education_parse_item($text);
        if (empty(trim($parsed['place']))) {
            continue;
        }
        $rows[] = [
            'year' => $parsed['year'],
            'place' => $parsed['place'],
            'education_type' => $parsed['education_type'],
        ];
    }

    if (empty($rows)) {
        $skipped++;
        continue;
    }

    usort($rows, function ($a, $b) {
        $yA = preg_match('/^(\d{4})/', (string)($a['year'] ?? ''), $mA) ? (int)$mA[1] : PHP_INT_MAX;
        $yB = preg_match('/^(\d{4})/', (string)($b['year'] ?? ''), $mB) ? (int)$mB[1] : PHP_INT_MAX;
        return $yA <=> $yB;
    });

    if (!$dry_run && function_exists('update_field')) {
        update_field('education', $rows, $post_id);
    }
    $imported++;
    $name = $kan['name'] ?? "ID {$post_id}";
    echo "  ✓ [{$post_id}] {$name}: импортировано " . count($rows) . " записей\n";
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Импортировано: {$imported}\n";
echo "Пропущено: {$skipped}\n";
echo ($dry_run ? "\n(DRY-RUN: изменения не сохранены.)\n" : "\n✓ Готово!\n");
