<?php
/**
 * Create 6 blog posts (standard WordPress post) for "Самое интересное в блоге"
 * Based on Figma design: titles, categories (1-3 per post), featured images from media, Post ↔ Doctor ACF.
 *
 * Run: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/create-blog-posts-data.php
 *
 * Idempotent: checks by title and skips existing posts.
 */

echo "=== Creating Blog Posts Data ===\n\n";

// 1. Get or create standard categories (taxonomy: category)
$category_slugs = array(
	'implantation' => 'Имплантация зубов',
	'sedation'     => 'Седация',
	'therapy'      => 'Терапия',
	'surgery'      => 'Хирургия',
);

$category_ids = array();
foreach ( $category_slugs as $slug => $name ) {
	$term = get_term_by( 'slug', $slug, 'category' );
	if ( $term ) {
		$category_ids[ $slug ] = $term->term_id;
		echo "✓ Category exists: {$name} (ID: {$term->term_id})\n";
	} else {
		$result = wp_insert_term( $name, 'category', array( 'slug' => $slug ) );
		if ( is_wp_error( $result ) ) {
			echo "✗ Error category {$name}: " . $result->get_error_message() . "\n";
			continue;
		}
		$category_ids[ $slug ] = $result['term_id'];
		echo "✓ Created category: {$name} (ID: {$result['term_id']})\n";
	}
}

// Use existing "Без рубрики" or implantation as fallback
if ( empty( $category_ids ) ) {
	$default_cat = get_term_by( 'id', 1, 'category' ) ?: get_term_by( 'slug', 'implantation', 'category' );
	if ( $default_cat ) {
		$category_ids['default'] = $default_cat->term_id;
	}
}

echo "\n";

// 2. Get media IDs (existing attachments for featured image)
$attachments = get_posts( array(
	'post_type'      => 'attachment',
	'post_status'    => 'inherit',
	'post_mime_type' => 'image',
	'posts_per_page' => 10,
	'orderby'        => 'date',
	'order'          => 'DESC',
) );

$media_ids = array_map( function ( $p ) {
	return $p->ID;
}, $attachments );

if ( empty( $media_ids ) ) {
	echo "⚠ No images in media library. Posts will be created without featured image.\n";
} else {
	echo "✓ Found " . count( $media_ids ) . " image(s) in media library.\n";
}
echo "\n";

// 3. Get doctors for "Отвечает врач"
$doctors = get_posts( array(
	'post_type'      => 'doctors',
	'posts_per_page' => 10,
	'post_status'    => 'publish',
) );

if ( empty( $doctors ) ) {
	echo "⚠ No doctors found. Posts will be created without related doctors.\n";
} else {
	echo "✓ Found " . count( $doctors ) . " doctor(s).\n";
}
echo "\n";

// 4. Define 6 posts (Figma-style: titles, content, 1-3 categories each)
$posts_data = array(
	array(
		'title'       => 'Виды имплантации зубов - трактат об имплантации',
		'content'     => 'Имплантация зубов — современный способ восстановления утраченных зубов. В статье разбираем основные виды: классическая двухэтапная, одномоментная, All-on-4 и All-on-6. Когда какой метод выбрать и чего ожидать от процедуры.',
		'excerpt'     => 'Разбираем виды имплантации: классическая, одномоментная, All-on-4 и All-on-6.',
		'date'        => '2025-05-25 10:00:00',
		'categories'  => array( 'implantation', 'sedation' ),
		'media_index' => 0,
		'doctor_index' => 0,
	),
	array(
		'title'       => 'Седация в стоматологии: комфорт без страха',
		'content'     => 'Седация позволяет проводить лечение в расслабленном состоянии. Рассказываем о видах седации (вдыхаемая, внутривенная), показаниях и противопоказаниях, как подготовиться к приему.',
		'excerpt'     => 'Что такое седация, когда она нужна и как проходит прием под седацией.',
		'date'        => '2025-05-20 12:00:00',
		'categories'  => array( 'sedation', 'therapy' ),
		'media_index' => 1,
		'doctor_index' => 0,
	),
	array(
		'title'       => 'Лечение кариеса: от диагностики до пломбы',
		'content'     => 'Как вовремя обнаружить кариес, какие методы лечения существуют и как сохранить пломбу надолго. Советы стоматолога-терапевта.',
		'excerpt'     => 'Этапы лечения кариеса и современные материалы для пломбирования.',
		'date'        => '2025-05-15 09:00:00',
		'categories'  => array( 'therapy' ),
		'media_index' => 0,
		'doctor_index' => 1,
	),
	array(
		'title'       => 'Удаление зуба мудрости: когда необходимо',
		'content'     => 'Зубы мудрости часто вызывают проблемы. В статье — показания к удалению, как проходит операция, рекомендации после удаления и когда можно обойтись без удаления.',
		'excerpt'     => 'Показания к удалению зуба мудрости и особенности реабилитации.',
		'date'        => '2025-05-10 14:00:00',
		'categories'  => array( 'surgery', 'implantation' ),
		'media_index' => 2,
		'doctor_index' => 0,
	),
	array(
		'title'       => 'Импланты или мост: что выбрать',
		'content'     => 'Сравниваем два способа восстановления отсутствующих зубов: имплантацию и мостовидное протезирование. Плюсы, минусы, срок службы и стоимость.',
		'excerpt'     => 'Сравнение имплантации и мостовидного протеза для принятия решения.',
		'date'        => '2025-05-05 11:00:00',
		'categories'  => array( 'implantation', 'therapy', 'sedation' ),
		'media_index' => 0,
		'doctor_index' => 1,
	),
	array(
		'title'       => 'Гигиена после имплантации: как ухаживать',
		'content'     => 'Правильный уход за имплантами продлевает их службу. Рекомендации по чистке, ирригаторам, профессиональной гигиене и частоте визитов к врачу.',
		'excerpt'     => 'Уход за имплантами в домашних условиях и у стоматолога.',
		'date'        => '2025-05-01 16:00:00',
		'categories'  => array( 'implantation', 'therapy' ),
		'media_index' => 1,
		'doctor_index' => 0,
	),
);

echo "=== Creating 6 Blog Posts ===\n\n";

$created = 0;
$existing = 0;

foreach ( $posts_data as $index => $data ) {
	$existing_posts = get_posts( array(
		'post_type'      => 'post',
		'title'          => $data['title'],
		'post_status'    => 'publish',
		'numberposts'    => 1,
	) );

	if ( ! empty( $existing_posts ) ) {
		$post_id = $existing_posts[0]->ID;
		echo "✓ Post exists: {$data['title']} (ID: {$post_id})\n";
		$existing++;
		continue;
	}

	$post_id = wp_insert_post( array(
		'post_title'   => $data['title'],
		'post_content' => $data['content'],
		'post_excerpt' => $data['excerpt'],
		'post_type'    => 'post',
		'post_status'  => 'publish',
		'post_author'  => 1,
		'post_date'    => $data['date'],
	) );

	if ( is_wp_error( $post_id ) ) {
		echo "✗ Error: {$data['title']} - " . $post_id->get_error_message() . "\n";
		continue;
	}

	// Assign categories (1-3 per post)
	$term_ids = array();
	foreach ( $data['categories'] as $cat_slug ) {
		if ( isset( $category_ids[ $cat_slug ] ) ) {
			$term_ids[] = $category_ids[ $cat_slug ];
		}
	}
	if ( ! empty( $term_ids ) ) {
		wp_set_object_terms( $post_id, $term_ids, 'category' );
	}

	// Featured image from existing media
	if ( ! empty( $media_ids ) && isset( $media_ids[ $data['media_index'] % count( $media_ids ) ] ) ) {
		$thumb_id = $media_ids[ $data['media_index'] % count( $media_ids ) ];
		set_post_thumbnail( $post_id, $thumb_id );
	}

	// ACF: related_doctors (and bidirectional related_posts on doctor)
	if ( ! empty( $doctors ) && function_exists( 'update_field' ) ) {
		$doctor_index = $data['doctor_index'] % count( $doctors );
		$doctor       = $doctors[ $doctor_index ];
		$doctor_id    = $doctor->ID;

		update_field( 'related_doctors', array( $doctor_id ), $post_id );

		// Bidirectional: add this post to doctor's related_posts
		$current_posts = get_field( 'related_posts', $doctor_id );
		if ( ! is_array( $current_posts ) ) {
			$current_posts = array();
		}
		$current_ids = array_map( function ( $p ) {
			return $p instanceof \WP_Post ? $p->ID : (int) $p;
		}, $current_posts );
		if ( ! in_array( $post_id, $current_ids, true ) ) {
			$current_ids[] = $post_id;
			update_field( 'related_posts', $current_ids, $doctor_id );
		}
		echo "✓ Created: {$data['title']} (ID: {$post_id}), doctor: {$doctor->post_title}\n";
	} else {
		echo "✓ Created: {$data['title']} (ID: {$post_id})\n";
	}

	$created++;
}

echo "\n=== Summary ===\n";
echo "Created: {$created}, Already existed: {$existing}\n";
echo "Done.\n";
