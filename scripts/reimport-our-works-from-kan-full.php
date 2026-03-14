<?php
/**
 * Reimport Our Works before/after images from kan.uz in full size
 *
 * Uses created-our-works.json (postId → doctorSlug, pairIndex) and all-doctors-data-v2.json
 * (doctor.beforeAfter[pairIndex].beforeFull, afterFull) for strict mapping — no mixing.
 *
 * Run:
 *   docker cp scripts/reimport-our-works-from-kan-full.php wp-new-wordpress:/var/www/html/scripts/
 *   docker cp kan-data/all-doctors-data-v2.json wp-new-wordpress:/var/www/html/scripts/
 *   docker cp kan-data/created-our-works.json wp-new-wordpress:/var/www/html/scripts/
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/reimport-our-works-from-kan-full.php --allow-root
 *
 * Dry-run (log only, no download):
 *   docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/reimport-our-works-from-kan-full.php --dry-run --allow-root
 */

define('WP_USE_THEMES', false);
require_once dirname(__DIR__) . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$script_dir = __DIR__;
$created_path = $script_dir . '/created-our-works.json';
$doctors_path = $script_dir . '/all-doctors-data-v2.json';

$dry_run = in_array('--dry-run', $argv ?? []);

if (!file_exists($created_path)) {
	echo "ERROR: created-our-works.json not found at {$created_path}\n";
	echo "Copy: docker cp kan-data/created-our-works.json wp-new-wordpress:/var/www/html/scripts/\n";
	exit(1);
}
if (!file_exists($doctors_path)) {
	echo "ERROR: all-doctors-data-v2.json not found at {$doctors_path}\n";
	echo "Copy: docker cp kan-data/all-doctors-data-v2.json wp-new-wordpress:/var/www/html/scripts/\n";
	exit(1);
}

$created_works = json_decode(file_get_contents($created_path), true);
$doctors_data = json_decode(file_get_contents($doctors_path), true);

if (!is_array($created_works) || !is_array($doctors_data)) {
	echo "ERROR: Invalid JSON\n";
	exit(1);
}

$doctor_map = [];
foreach ($doctors_data as $d) {
	if (!empty($d['slug'])) {
		$doctor_map[$d['slug']] = $d;
	}
}

/**
 * Download image from URL and attach to post
 */
function download_and_attach($url, $post_id, $title) {
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

echo "=== Reimport Our Works from kan.uz (full size) ===\n";
if ($dry_run) {
	echo "[DRY-RUN] No downloads, logging only\n";
}
echo "Created works: " . count($created_works) . "\n";
echo "Doctors in map: " . count($doctor_map) . "\n\n";

$ok = 0;
$skip = 0;
$fail = 0;

foreach ($created_works as $work) {
	$post_id = (int) ($work['postId'] ?? 0);
	$doctor_slug = $work['doctorSlug'] ?? '';
	$pair_index = (int) ($work['pairIndex'] ?? -1);

	if (!$post_id || !$doctor_slug || $pair_index < 0) {
		echo "SKIP post {$post_id}: missing doctorSlug or pairIndex\n";
		$skip++;
		continue;
	}

	$post = get_post($post_id);
	if (!$post || $post->post_type !== 'our-works') {
		echo "SKIP post {$post_id}: not found or not our-works\n";
		$skip++;
		continue;
	}

	$doctor = $doctor_map[$doctor_slug] ?? null;
	if (!$doctor || empty($doctor['beforeAfter'][$pair_index])) {
		echo "SKIP post {$post_id}: doctor {$doctor_slug} or pair {$pair_index} not found\n";
		$skip++;
		continue;
	}

	$pair = $doctor['beforeAfter'][$pair_index];
	$before_url = $pair['beforeFull'] ?? $pair['before'] ?? null;
	$after_url = $pair['afterFull'] ?? $pair['after'] ?? null;

	if (!$before_url || !$after_url) {
		echo "SKIP post {$post_id}: missing beforeFull/afterFull URLs\n";
		$skip++;
		continue;
	}

	echo "Post #{$post_id} ({$post->post_title}) | {$doctor_slug} pair {$pair_index}\n";
	echo "  Before: {$before_url}\n";
	echo "  After:  {$after_url}\n";

	if ($dry_run) {
		echo "  [DRY-RUN] Would download and update\n\n";
		$ok++;
		continue;
	}

	$before_id = download_and_attach($before_url, $post_id, $post->post_title . ' — До');
	if (!$before_id) {
		$fail++;
		echo "\n";
		continue;
	}
	update_field('photo_before', $before_id, $post_id);
	echo "  ✓ Before: attachment {$before_id}\n";

	$after_id = download_and_attach($after_url, $post_id, $post->post_title . ' — После');
	if (!$after_id) {
		$fail++;
		echo "\n";
		continue;
	}
	update_field('photo_after', $after_id, $post_id);
	echo "  ✓ After: attachment {$after_id}\n";

	$ok++;
	echo "\n";
}

echo "=== Summary ===\n";
echo "OK: {$ok}, Skip: {$skip}, Fail: {$fail}\n";
echo "Done.\n";
