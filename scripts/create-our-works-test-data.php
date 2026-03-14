<?php
/**
 * Create test data for Our Works CPT
 * 
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-our-works-test-data.php
 */

echo "=== Creating Our Works Test Data ===\n\n";

// Get existing doctors and clinics
$doctors = get_posts(array(
    'post_type' => 'doctors',
    'post_status' => 'publish',
    'numberposts' => -1,
    'orderby' => 'rand',
));

$clinics = get_posts(array(
    'post_type' => 'clinics',
    'post_status' => 'publish',
    'numberposts' => -1,
    'orderby' => 'rand',
));

if (empty($doctors)) {
    echo "⚠ Warning: No doctors found. Please create doctors first.\n";
}

if (empty($clinics)) {
    echo "⚠ Warning: No clinics found. Please create clinics first.\n";
}

// Test data for works
$works_data = array(
    // Fully filled posts (2)
    array(
        'title' => 'Имплантация зубов - полное восстановление',
        'content' => 'Пример работы по имплантации зубов с полным восстановлением зубного ряда.',
        'filled' => true,
    ),
    array(
        'title' => 'Отбеливание зубов - профессиональная чистка',
        'content' => 'Результат профессионального отбеливания зубов с использованием современных технологий.',
        'filled' => true,
    ),
    // Partially filled posts (3)
    array(
        'title' => 'Протезирование зубов',
        'content' => '',
        'filled' => false,
    ),
    array(
        'title' => 'Исправление прикуса',
        'content' => '',
        'filled' => false,
    ),
    array(
        'title' => 'Лечение кариеса',
        'content' => '',
        'filled' => false,
    ),
);

$created_count = 0;
$filled_count = 0;

foreach ($works_data as $index => $work_data) {
    // Check if post already exists
    $existing = get_posts(array(
        'post_type' => 'our-works',
        'title' => $work_data['title'],
        'post_status' => 'any',
        'numberposts' => 1,
    ));

    if (!empty($existing)) {
        echo "✓ Work '{$work_data['title']}' already exists (ID: {$existing[0]->ID})\n";
        $post_id = $existing[0]->ID;
    } else {
        // Create post
        $post_id = wp_insert_post(array(
            'post_title' => $work_data['title'],
            'post_content' => $work_data['content'],
            'post_type' => 'our-works',
            'post_status' => 'publish',
        ));

        if (is_wp_error($post_id)) {
            echo "✗ Error creating '{$work_data['title']}': " . $post_id->get_error_message() . "\n";
            continue;
        }

        echo "✓ Created work '{$work_data['title']}' (ID: {$post_id})\n";
        $created_count++;
    }

    // Fill ACF fields for fully filled posts
    if ($work_data['filled'] && function_exists('update_field')) {
        // Set use_general_photo switch (randomly true or false)
        $use_general = ($index % 2 === 0) ? 1 : 0;
        update_field('use_general_photo', $use_general, $post_id);

        // For now, we'll set image IDs to 0 (placeholder)
        // In production, you would upload actual images here
        // update_field('photo_before', $image_id_before, $post_id);
        // update_field('photo_after', $image_id_after, $post_id);
        // update_field('general_photo', $image_id_general, $post_id);

        echo "  → Set use_general_photo: " . ($use_general ? 'Yes' : 'No') . "\n";

        // Link random doctors (1-2 doctors)
        if (!empty($doctors)) {
            $num_doctors = min(rand(1, 2), count($doctors));
            $selected_doctors = array_slice($doctors, 0, $num_doctors);
            $doctor_ids = array_map(function($d) { return $d->ID; }, $selected_doctors);
            update_field('related_doctors', $doctor_ids, $post_id);
            echo "  → Linked " . count($doctor_ids) . " doctor(s)\n";
        }

        // Link random clinic (1 clinic)
        if (!empty($clinics)) {
            $selected_clinic = $clinics[array_rand($clinics)];
            update_field('related_clinics', array($selected_clinic->ID), $post_id);
            echo "  → Linked 1 clinic\n";
        }

        $filled_count++;
    }
}

echo "\n=== Summary ===\n";
echo "Created: {$created_count} new works\n";
echo "Filled: {$filled_count} works with ACF data\n";
echo "Total: " . count($works_data) . " works\n";
echo "\n✓ Done!\n";
echo "\n📸 To upload images for works, run:\n";
echo "   docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/install-our-works-images.php\n";
echo "\nThis will download and set photo_before, photo_after, and general_photo for all works.\n";
