<?php
/**
 * Заполнение расширенных полей врачей: контент, образование, сертификаты
 *
 * - post_content: фейковая биография, если пусто
 * - education: 1–3 записи (год + место учёбы), если пусто
 * - certificates: 1–2 изображения-заглушки из медиатеки, если пусто
 *
 * Запуск (если scripts в контейнере):
 *   docker exec -it wp-new-wordpress wp eval-file /var/www/html/scripts/fill-doctor-extended-fields.php --allow-root
 * Иначе: docker cp scripts/. wp-new-wordpress:/var/www/html/scripts/
 */

$education_places = [
    'МГМСУ им. А.И. Евдокимова',
    'Первый МГМУ им. И.М. Сеченова',
    'СПбГМУ им. И.П. Павлова',
    'РНИМУ им. Н.И. Пирогова',
    'МГУ имени М.В. Ломоносова, стоматология',
];

$education_types = [
    'очные курсы',
    'семинар',
    'подготовительные курсы',
    'повышение квалификации',
    'ординатура',
];

$bio_templates = [
    'Опытный специалист, регулярно повышает квалификацию. Работает с пациентами любого возраста.',
    'Ведёт приём взрослых и детей. Уделяет внимание профилактике и комфорту пациента.',
    'Специализируется на современные методы лечения. Участник российских и международных конференций.',
];

$doctors = get_posts([
    'post_type'      => 'doctors',
    'post_status'    => 'publish',
    'numberposts'    => -1,
]);

echo "=== Заполнение расширенных полей врачей ===\n\n";
echo "Найдено врачей: " . count($doctors) . "\n\n";

$filled_content = 0;
$filled_education = 0;
$filled_education_type = 0;
$filled_certificates = 0;

// Один раз создаём изображения-заглушки для сертификатов (общие для всех)
$certificate_attachment_ids = [];
if (function_exists('imagecreatetruecolor')) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    for ($i = 1; $i <= 2; $i++) {
        $w = 400;
        $h = 300;
        $img = imagecreatetruecolor($w, $h);
        if (!$img) {
            continue;
        }
        $bg = imagecolorallocate($img, 245, 245, 245);
        $text_color = imagecolorallocate($img, 100, 100, 100);
        imagefill($img, 0, 0, $bg);
        imagestring($img, 5, (int) ($w / 2 - 40), (int) ($h / 2 - 10), 'Certificate ' . $i, $text_color);
        $tmp = wp_tempnam('cert');
        if ($tmp && imagepng($img, $tmp)) {
            imagedestroy($img);
            $file_array = [
                'name'     => 'certificate-placeholder-' . $i . '.png',
                'tmp_name' => $tmp,
            ];
            $aid = media_handle_sideload($file_array, 0, 'Certificate placeholder');
            if (!is_wp_error($aid)) {
                $certificate_attachment_ids[] = $aid;
            }
            @unlink($tmp);
        } else {
            imagedestroy($img);
        }
    }
}

foreach ($doctors as $doctor) {
    $id = $doctor->ID;
    $title = $doctor->post_title;

    // Контент (биография)
    $content = $doctor->post_content;
    if (empty(trim(strip_tags($content)))) {
        $bio = $bio_templates[array_rand($bio_templates)];
        wp_update_post([
            'ID'           => $id,
            'post_content' => '<!-- wp:paragraph --><p>' . esc_html($bio) . '</p><!-- /wp:paragraph -->',
        ]);
        $filled_content++;
        echo "  ✓ [{$id}] {$title}: заполнен контент\n";
    }

    // Образование
    $education = get_field('education', $id);
    if (empty($education) || !is_array($education)) {
        $count = rand(1, 3);
        $rows = [];
        for ($j = 0; $j < $count; $j++) {
            $year = (string) (1995 + rand(0, 25));
            $idx = array_rand($education_places);
            $place = $education_places[$idx];
            $type = $education_types[array_rand($education_types)];
            $rows[] = ['year' => $year, 'place' => $place, 'education_type' => $type];
        }
        update_field('education', $rows, $id);
        $filled_education++;
        echo "  ✓ [{$id}] {$title}: заполнено образование (" . count($rows) . " записей)\n";
    } else {
        $updated = false;
        foreach ($education as &$item) {
            if (empty($item['education_type']) || !isset($item['education_type'])) {
                $item['education_type'] = $education_types[array_rand($education_types)];
                $updated = true;
            }
        }
        unset($item);
        if ($updated) {
            update_field('education', $education, $id);
            $filled_education_type++;
            echo "  ✓ [{$id}] {$title}: добавлен тип обучения в существующие записи образования\n";
        }
    }

    // Сертификаты
    $certs = get_field('certificates', $id);
    if (empty($certs) || !is_array($certs)) {
        if (!empty($certificate_attachment_ids)) {
            $pick = array_slice($certificate_attachment_ids, 0, rand(1, 2));
            update_field('certificates', $pick, $id);
            $filled_certificates++;
            echo "  ✓ [{$id}] {$title}: добавлены сертификаты\n";
        }
    }
}

wp_cache_flush();

echo "\n=== Итого ===\n";
echo "Заполнено контент: {$filled_content}\n";
echo "Заполнено образование: {$filled_education}\n";
echo "Добавлен тип обучения (в существующие записи): {$filled_education_type}\n";
echo "Заполнено сертификаты: {$filled_certificates}\n";
echo "\n✓ Готово!\n";
