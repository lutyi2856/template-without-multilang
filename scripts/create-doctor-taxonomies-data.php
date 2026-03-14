<?php
/**
 * Создание терминов таксономий «Тип врача» и «Должность» и назначение врачам
 *
 * - doctor_type: Детский врач, Взрослый врач
 * - doctor_position: Главный врач, Заместитель главного врача, Врач и др.
 * - Назначает каждому опубликованному врачу по одному термину из каждой таксономии
 *
 * Запуск (если scripts смонтированы в контейнер):
 *   docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/create-doctor-taxonomies-data.php --allow-root
 * Иначе сначала: docker cp scripts/. wp-new-wordpress:/var/www/html/scripts/
 */

$doctor_type_terms = [
    ['name' => 'Детский врач', 'slug' => 'detskiy-vrach'],
    ['name' => 'Взрослый врач', 'slug' => 'vzroslyy-vrach'],
];

$doctor_position_terms = [
    ['name' => 'Главный врач', 'slug' => 'glavnyy-vrach'],
    ['name' => 'Заместитель главного врача', 'slug' => 'zamestitel-glavnogo-vracha'],
    ['name' => 'Врач', 'slug' => 'vrach'],
    ['name' => 'Старший врач', 'slug' => 'starshiy-vrach'],
    ['name' => 'Врач-ординатор', 'slug' => 'vrach-ordinator'],
    ['name' => 'Руководитель отделения', 'slug' => 'rukovoditel-otdeleniya'],
    ['name' => 'Заведующий отделением', 'slug' => 'zaveduyushchiy-otdeleniem'],
];

echo "=== Creating doctor_type terms ===\n\n";

$type_ids = [];
foreach ($doctor_type_terms as $term) {
    $existing = get_term_by('slug', $term['slug'], 'doctor_type');
    if ($existing) {
        echo "✓ Type '{$term['name']}' exists (ID: {$existing->term_id})\n";
        $type_ids[] = $existing->term_id;
    } else {
        $result = wp_insert_term($term['name'], 'doctor_type', ['slug' => $term['slug']]);
        if (is_wp_error($result)) {
            echo "✗ Error: {$term['name']} - " . $result->get_error_message() . "\n";
            continue;
        }
        $type_ids[] = $result['term_id'];
        echo "✓ Created type '{$term['name']}' (ID: {$result['term_id']})\n";
    }
}

echo "\n=== Creating doctor_position terms ===\n\n";

$position_ids = [];
foreach ($doctor_position_terms as $term) {
    $existing = get_term_by('slug', $term['slug'], 'doctor_position');
    if ($existing) {
        echo "✓ Position '{$term['name']}' exists (ID: {$existing->term_id})\n";
        $position_ids[] = $existing->term_id;
    } else {
        $result = wp_insert_term($term['name'], 'doctor_position', ['slug' => $term['slug']]);
        if (is_wp_error($result)) {
            echo "✗ Error: {$term['name']} - " . $result->get_error_message() . "\n";
            continue;
        }
        $position_ids[] = $result['term_id'];
        echo "✓ Created position '{$term['name']}' (ID: {$result['term_id']})\n";
    }
}

if (empty($type_ids) || empty($position_ids)) {
    echo "\nMissing terms. Aborting.\n";
    exit(1);
}

echo "\n=== Assigning to doctors ===\n\n";

$doctors = get_posts([
    'post_type'   => 'doctors',
    'post_status' => 'publish',
    'numberposts' => -1,
    'fields'      => 'ids',
]);

$assigned = 0;
foreach ($doctors as $post_id) {
    $type_term_id     = $type_ids[array_rand($type_ids)];
    $position_term_id = $position_ids[array_rand($position_ids)];

    wp_set_object_terms($post_id, [$type_term_id], 'doctor_type');
    wp_set_object_terms($post_id, [$position_term_id], 'doctor_position');

    $title = get_the_title($post_id);
    echo "  ✓ Doctor ID {$post_id} ({$title}): type + position set\n";
    $assigned++;
}

echo "\n=== Summary ===\n";
echo "doctor_type terms: " . count($type_ids) . "\n";
echo "doctor_position terms: " . count($position_ids) . "\n";
echo "Doctors updated: {$assigned}\n";
echo "\n✓ Done!\n";
