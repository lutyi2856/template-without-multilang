<?php
/**
 * Rename Our Works post titles from "Doctor Name — Кейс N" to meaningful titles
 * from donor site (kan.uz) case descriptions.
 *
 * Run: docker cp scripts/rename-our-works.php wp-new-wordpress:/var/www/html/scripts/
 *      docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/rename-our-works.php --allow-root
 *
 * @see kan-data/created-our-works.json
 */

$titles = [
    862 => 'Ортодонтическая коррекция и дизайн улыбки',
    865 => 'Создание эстетичной улыбки',
    868 => 'Коррекция выступающих клыков и глубокого прикуса',
    871 => 'Новый взгляд на улыбку',
    874 => 'Путь к новой улыбке',
    877 => 'Скрытый кариес под пломбой',
    880 => 'Своевременное обращение к стоматологу',
    883 => 'Профессиональная гигиена полости рта',
    886 => 'Профгигиена зубов для детей',
    889 => 'Сюрпризы под старыми пломбами',
    892 => 'Восстановление природного вида зуба',
    895 => 'Проблема старых пломб',
    898 => 'Лечение кариеса с восстановлением эстетики',
    901 => 'Имплантация зуба без костной пластики',
    904 => 'Восстановление улыбки в короткие сроки',
    907 => 'Скрытый кариес под здоровой эмалью',
    910 => 'Невидимый кариес глубоко внутри зуба',
    913 => 'Новый взгляд на улыбку',
    916 => 'Путь к новой улыбке',
    919 => 'Эстетическая реставрация зубов',
    922 => 'Создание эстетичной улыбки',
    925 => 'Коррекция выступающих клыков и глубокого прикуса',
    928 => 'Лечение пульпита молочного зуба',
    931 => 'Восстановление зуба после травмы',
];

echo "=== Rename Our Works titles ===\n\n";

$updated = 0;
$skipped = 0;
$errors = 0;

foreach ($titles as $post_id => $new_title) {
    $post = get_post($post_id);

    if (!$post) {
        echo "✗ Post {$post_id} not found\n";
        $errors++;
        continue;
    }

    if ($post->post_type !== 'our-works') {
        echo "✗ Post {$post_id} is not our-works (type: {$post->post_type})\n";
        $errors++;
        continue;
    }

    if ($post->post_title === $new_title) {
        echo "✓ {$post_id}: already OK\n";
        $skipped++;
        continue;
    }

    $result = wp_update_post([
        'ID'         => (int) $post_id,
        'post_title' => $new_title,
    ], true);

    if (is_wp_error($result)) {
        echo "✗ {$post_id}: " . $result->get_error_message() . "\n";
        $errors++;
        continue;
    }

    echo "✓ {$post_id}: \"{$post->post_title}\" → \"{$new_title}\"\n";
    $updated++;
}

echo "\n=== Summary ===\n";
echo "Updated: {$updated}\n";
echo "Skipped (already OK): {$skipped}\n";
echo "Errors: {$errors}\n";
echo "\n✓ Done!\n";
