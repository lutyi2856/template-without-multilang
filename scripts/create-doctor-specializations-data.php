<?php
/**
 * Создание таксономии специализаций для врачей и назначение терминов
 *
 * - Создает ~15 терминов в таксономии doctor_specializations
 * - Назначает каждому опубликованному врачу от 1 до 3 случайных терминов
 *
 * Запуск: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-doctor-specializations-data.php
 */

$taxonomy = 'doctor_specializations';

$specializations = [
    ['name' => 'Стоматология', 'slug' => 'stomatologiya'],
    ['name' => 'Терапия', 'slug' => 'terapiya'],
    ['name' => 'Имплантология', 'slug' => 'implantologiya'],
    ['name' => 'Ортодонтия', 'slug' => 'ortodontiya'],
    ['name' => 'Хирургия', 'slug' => 'hirurgiya'],
    ['name' => 'Ортопедия', 'slug' => 'ortopediya'],
    ['name' => 'Пародонтология', 'slug' => 'parodontologiya'],
    ['name' => 'Эндодонтия', 'slug' => 'endodontiya'],
    ['name' => 'Отбеливание', 'slug' => 'otbelivanie'],
    ['name' => 'Протезирование', 'slug' => 'protezirovanie'],
    ['name' => 'Челюстно-лицевая хирургия', 'slug' => 'chelyustno-licevaya-hirurgiya'],
    ['name' => 'Имплантация', 'slug' => 'implantaciya'],
    ['name' => 'Гигиена', 'slug' => 'gigiena'],
    ['name' => 'Косметическая стоматология', 'slug' => 'kosmeticheskaya-stomatologiya'],
];

echo "=== Creating specializations ===\n\n";

$term_ids = [];

foreach ($specializations as $spec) {
    $existing = get_term_by('slug', $spec['slug'], $taxonomy);

    if ($existing) {
        echo "✓ Specialization '{$spec['name']}' exists (ID: {$existing->term_id})\n";
        $term_ids[] = $existing->term_id;
    } else {
        $result = wp_insert_term(
            $spec['name'],
            $taxonomy,
            ['slug' => $spec['slug']]
        );

        if (is_wp_error($result)) {
            echo "✗ Error: {$spec['name']} - " . $result->get_error_message() . "\n";
            continue;
        }

        $term_ids[] = $result['term_id'];
        echo "✓ Created specialization '{$spec['name']}' (ID: {$result['term_id']})\n";
    }
}

if (empty($term_ids)) {
    echo "\nNo terms available. Aborting.\n";
    exit(1);
}

echo "\n=== Assigning to doctors ===\n\n";

$doctors = get_posts([
    'post_type'      => 'doctors',
    'post_status'    => 'publish',
    'numberposts'    => -1,
    'fields'         => 'ids',
]);

$assigned = 0;

foreach ($doctors as $post_id) {
    $count = rand(1, min(3, count($term_ids)));
    $indices = array_rand($term_ids, $count);
    if (!is_array($indices)) {
        $indices = [$indices];
    }
    $selected = array_map(function ($i) use ($term_ids) {
        return $term_ids[$i];
    }, $indices);

    wp_set_object_terms($post_id, $selected, $taxonomy);
    $title = get_the_title($post_id);
    echo "  ✓ Doctor ID {$post_id} ({$title}): " . count($selected) . " specialization(s)\n";
    $assigned++;
}

echo "\n=== Summary ===\n";
echo "Terms: " . count($term_ids) . "\n";
echo "Doctors updated: {$assigned}\n";
echo "\n✓ Done!\n";
