<?php
/**
 * Миграция repeater education врачей: извлечение годов из place, очистка, определение education_type
 *
 * Запуск: npm run migrate-doctor-education
 * Или: docker cp scripts/. wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/migrate-doctor-education.php --allow-root
 */

$argv = $GLOBALS['argv'] ?? $_SERVER['argv'] ?? [];
$dry_run = in_array('--dry-run', $argv, true);

require_once __DIR__ . '/lib/doctor-education-parser.php';

$doctors = get_posts([
    'post_type' => 'doctors',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

echo "=== Миграция education врачей ===\n";
echo "Режим: " . ($dry_run ? "DRY-RUN (без записи)" : "ЗАПИСЬ") . "\n";
echo "Врачей: " . count($doctors) . "\n\n";

$migrated = 0;
$skipped = 0;
$errors = 0;

foreach ($doctors as $doctor) {
    $id = $doctor->ID;
    $title = $doctor->post_title;
    $education = get_field('education', $id);

    if (empty($education) || !is_array($education)) {
        $skipped++;
        continue;
    }

    $updated = false;
    $new_rows = [];

    foreach ($education as $item) {
        $place = isset($item['place']) ? $item['place'] : '';
        if (empty($place) || !is_string($place)) {
            continue;
        }

        $year = isset($item['year']) ? trim((string) $item['year']) : '';
        $type = isset($item['education_type']) ? trim((string) $item['education_type']) : '';

        $extracted_year = doctor_education_extract_year($place);
        $place_clean = doctor_education_clean_place($place);
        $detected_type = doctor_education_detect_type($place);

        if (empty($year) && $extracted_year) {
            $year = $extracted_year;
            $updated = true;
        } elseif (!$extracted_year && $year) {
            $year = $year;
        } else {
            $year = $extracted_year ?: $year;
        }

        if (empty($place_clean) && !empty($place)) {
            $place_clean = $place;
        }
        if ($place_clean !== $place) {
            $updated = true;
        }

        if (empty($type)) {
            $type = $detected_type;
            $updated = true;
        }

        $new_rows[] = [
            'year' => $year,
            'place' => $place_clean,
            'education_type' => $type,
        ];
    }

    if ($updated && !empty($new_rows)) {
        usort($new_rows, function ($a, $b) {
            $yA = preg_match('/^(\d{4})/', (string)($a['year'] ?? ''), $mA) ? (int)$mA[1] : PHP_INT_MAX;
            $yB = preg_match('/^(\d{4})/', (string)($b['year'] ?? ''), $mB) ? (int)$mB[1] : PHP_INT_MAX;
            return $yA <=> $yB;
        });
        if (!$dry_run && function_exists('update_field')) {
            update_field('education', $new_rows, $id);
        }
        $migrated++;
        echo "  ✓ [{$id}] {$title}: мигрировано " . count($new_rows) . " записей\n";
    } else {
        $skipped++;
    }
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Мигрировано: {$migrated}\n";
echo "Без изменений: {$skipped}\n";
echo ($dry_run ? "\n(DRY-RUN: изменения не сохранены. Запустите без --dry-run для применения.)\n" : "\n✓ Готово!\n");
