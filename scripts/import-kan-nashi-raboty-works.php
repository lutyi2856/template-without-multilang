<?php
/**
 * Import 3 "our works" from kan.uz/nashi-raboty/ into WordPress.
 *
 * Creates our-works posts with:
 * - photo_before, photo_after (downloaded from donor URLs)
 * - related_doctors (ACF relationship)
 * - service_categories (taxonomy, existing terms only)
 * - Bidirectional: doctor.related_works
 *
 * Run:
 *   docker cp scripts/import-kan-nashi-raboty-works.php wp-new-wordpress:/var/www/html/scripts/
 *   docker cp kan-data/nashi-raboty-works.json wp-new-wordpress:/var/www/html/scripts/
 *   docker cp kan-data/created-doctors.json wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/import-kan-nashi-raboty-works.php --allow-root
 */

define('WP_USE_THEMES', false);
require_once dirname(__DIR__) . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$script_dir = __DIR__;
$works_path = $script_dir . '/nashi-raboty-works.json';
$doctors_path = $script_dir . '/created-doctors.json';

if (!file_exists($works_path)) {
	echo "ERROR: nashi-raboty-works.json not found at {$works_path}\n";
	echo "Copy: docker cp kan-data/nashi-raboty-works.json wp-new-wordpress:/var/www/html/scripts/\n";
	exit(1);
}
if (!file_exists($doctors_path)) {
	echo "ERROR: created-doctors.json not found at {$doctors_path}\n";
	echo "Copy: docker cp kan-data/created-doctors.json wp-new-wordpress:/var/www/html/scripts/\n";
	exit(1);
}

$works_data = json_decode(file_get_contents($works_path), true);
$created_doctors = json_decode(file_get_contents($doctors_path), true);

if (!is_array($works_data) || !is_array($created_doctors)) {
	echo "ERROR: Invalid JSON\n";
	exit(1);
}

$doctor_slug_to_id = [];
foreach ($created_doctors as $cd) {
	if (!empty($cd['slug'])) {
		$doctor_slug_to_id[$cd['slug']] = (int) $cd['postId'];
	}
}

/**
 * Download image from URL and attach to post
 */
function download_and_attach($url, $post_id, $title) {
	if (empty($url)) {
		return false;
	}
	$tmp = download_url($url, 30);
	if (is_wp_error($tmp)) {
		echo "    ✗ Download error: " . $tmp->get_error_message() . "\n";
		return false;
	}
	$path = parse_url($url, PHP_URL_PATH);
	$name = basename($path) ?: 'image.jpg';
	$file_array = [
		'name'     => $name,
		'tmp_name' => $tmp,
	];
	$attachment_id = media_handle_sideload($file_array, $post_id, $title);
	@unlink($tmp);
	if (is_wp_error($attachment_id)) {
		echo "    ✗ Sideload error: " . $attachment_id->get_error_message() . "\n";
		return false;
	}
	return $attachment_id;
}

echo "=== Import KAN nashi-raboty works ===\n";
echo "Works: " . count($works_data) . "\n";
echo "Doctors in map: " . count($doctor_slug_to_id) . "\n\n";

$created_works = [];

foreach ($works_data as $work) {
	$title = $work['title'] ?? '';
	$slug = $work['slug'] ?? sanitize_title($title);
	$doctor_slugs = $work['doctorSlugs'] ?? [];
	$category_slugs = $work['serviceCategorySlugs'] ?? [];
	$before_url = $work['beforeUrl'] ?? '';
	$after_url = $work['afterUrl'] ?? '';

	if (empty($title)) {
		echo "SKIP: empty title\n";
		continue;
	}

	$doctor_ids = [];
	foreach ($doctor_slugs as $ds) {
		$id = $doctor_slug_to_id[$ds] ?? $doctor_slug_to_id[$ds . '-2'] ?? null;
		if ($id) {
			$doctor_ids[] = $id;
		} else {
			echo "  WARN: no doctor found for slug {$ds}\n";
		}
	}

	echo "Creating: {$title} ({$slug})\n";

	$post_id = wp_insert_post([
		'post_type'   => 'our-works',
		'post_title'  => $title,
		'post_name'   => $slug,
		'post_status' => 'publish',
		'post_author' => 1,
	], true);

	if (is_wp_error($post_id)) {
		echo "  ✗ Failed to create post: " . $post_id->get_error_message() . "\n";
		continue;
	}
	echo "  Post ID: {$post_id}\n";

	if ($before_url) {
		$before_id = download_and_attach($before_url, $post_id, $title . ' — До');
		if ($before_id) {
			update_field('photo_before', $before_id, $post_id);
			echo "  ✓ Before: attachment {$before_id}\n";
		}
	}
	if ($after_url) {
		$after_id = download_and_attach($after_url, $post_id, $title . ' — После');
		if ($after_id) {
			update_field('photo_after', $after_id, $post_id);
			update_post_meta($post_id, '_thumbnail_id', $after_id);
			echo "  ✓ After: attachment {$after_id}\n";
		}
	}

	update_field('use_general_photo', 0, $post_id);

	if (!empty($doctor_ids)) {
		update_field('related_doctors', $doctor_ids, $post_id);
		echo "  ✓ Doctors: " . implode(', ', $doctor_ids) . "\n";
	}

	$term_ids = [];
	foreach ($category_slugs as $cs) {
		$term = get_term_by('slug', $cs, 'service_categories');
		if ($term && !is_wp_error($term)) {
			$term_ids[] = (int) $term->term_id;
		}
	}
	if (!empty($term_ids)) {
		wp_set_object_terms($post_id, $term_ids, 'service_categories');
		$names = array_map(function ($id) {
			$t = get_term($id, 'service_categories');
			return $t && !is_wp_error($t) ? $t->name : '';
		}, $term_ids);
		echo "  ✓ Categories: " . implode(', ', $names) . "\n";
	}

	$created_works[] = [
		'postId'       => $post_id,
		'slug'         => $slug,
		'title'        => $title,
		'doctorPostIds' => $doctor_ids,
	];

	foreach ($doctor_ids as $did) {
		$existing = get_field('related_works', $did) ?: [];
		$existing = is_array($existing) ? $existing : [];
		$existing_ids = array_map(function ($x) {
			return is_object($x) ? (int) $x->ID : (int) $x;
		}, $existing);
		if (!in_array($post_id, $existing_ids)) {
			$existing_ids[] = $post_id;
			update_field('related_works', $existing_ids, $did);
		}
	}

	echo "\n";
}

$out_json = $script_dir . '/created-nashi-raboty-works.json';
file_put_contents($out_json, json_encode($created_works, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "=== Summary ===\n";
echo "Created: " . count($created_works) . " works\n";
echo "Output: {$out_json}\n";
echo "\nDone.\n";
