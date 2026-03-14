<?php
/**
 * Создание терминов таксономии «Проблематика»
 *
 * - Создает 10 терминов в таксономии problematics
 *
 * Запуск: docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/create-problematics-terms.php
 */

$taxonomy = 'problematics';

$terms = [
    ['name' => 'Вылечить зубы', 'slug' => 'vylechit-zuby'],
    ['name' => 'Исправить прикус', 'slug' => 'ispravit-prikus'],
    ['name' => 'Поставить импланты', 'slug' => 'postavit-implanty'],
    ['name' => 'Восстановить зубы', 'slug' => 'vosstanovit-zuby'],
    ['name' => 'Лечение во сне', 'slug' => 'lechenie-vo-sne'],
    ['name' => 'Детская стоматология', 'slug' => 'detskaya-stomatologiya'],
    ['name' => 'Удалить зуб', 'slug' => 'udalit-zub'],
    ['name' => 'Профессиональная чистка', 'slug' => 'professionalnaya-chistka'],
    ['name' => 'Отбелить зубы', 'slug' => 'otbelit-zuby'],
    ['name' => 'Лечить десны', 'slug' => 'lechit-desny'],
];

echo "=== Creating problematics terms ===\n\n";

$created = 0;

foreach ($terms as $term) {
    $existing = get_term_by('slug', $term['slug'], $taxonomy);

    if ($existing) {
        echo "✓ Term '{$term['name']}' exists (ID: {$existing->term_id})\n";
    } else {
        $result = wp_insert_term(
            $term['name'],
            $taxonomy,
            ['slug' => $term['slug']]
        );

        if (is_wp_error($result)) {
            echo "✗ Error: {$term['name']} - " . $result->get_error_message() . "\n";
            continue;
        }

        $created++;
        echo "✓ Created term '{$term['name']}' (ID: {$result['term_id']})\n";
    }
}

echo "\n=== Summary ===\n";
echo "Terms: " . count($terms) . "\n";
echo "Created: {$created}\n";
echo "\n✓ Done!\n";
