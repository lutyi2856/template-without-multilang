<?php
/**
 * Plugin Name: УниДент ACF Blocks
 * Description: ACF Gutenberg блоки для записей блога (headless — рендер в Next.js)
 * Version: 1.0.0
 * Author: УниДент
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'UNIDENT_BLOCKS_DIR', __DIR__ . '/unident-blocks/' );

require_once UNIDENT_BLOCKS_DIR . 'inc/block-helpers.php';
require_once UNIDENT_BLOCKS_DIR . 'fields.php';
require_once UNIDENT_BLOCKS_DIR . 'fields-kb-blocks.php';

/**
 * ACF Blocks V3 для всех блоков (нужно для кнопки "Open Expanded Editor").
 * Требуется ACF PRO 6.6+.
 */
add_filter( 'acf/blocks/default_block_version', function ( $version, $block ) {
	return 3;
}, 10, 2 );

/**
 * Уведомление в админке, если ACF < 6.6 (кнопка Expanded Editor не появится).
 */
add_action( 'admin_notices', function () {
	if ( ! defined( 'ACF_VERSION' ) || version_compare( ACF_VERSION, '6.6', '<' ) ) {
		echo '<div class="notice notice-warning"><p><strong>УниДент блоки:</strong> для кнопки "Open Expanded Editor" нужен <strong>ACF PRO 6.6+</strong>. Текущая версия: ' . ( defined( 'ACF_VERSION' ) ? ACF_VERSION : 'не определена' ) . '.</p></div>';
	}
} );

/**
 * Все типы полей открываются в расширенном редакторе (широкая панель).
 * Как в KB — при клике на поле открывается удобная широкая панель вместо узкого сайдбара.
 */
add_filter( 'acf/blocks/fields_to_open_in_expanded_editor', function ( $field_types ) {
	$all_types = array(
		'text',
		'textarea',
		'number',
		'range',
		'email',
		'url',
		'password',
		'wysiwyg',
		'image',
		'file',
		'gallery',
		'oembed',
		'select',
		'checkbox',
		'radio_button',
		'button_group',
		'true_false',
		'link',
		'post_object',
		'page_link',
		'relationship',
		'taxonomy',
		'user',
		'google_map',
		'date_picker',
		'date_time_picker',
		'time_picker',
		'color_picker',
		'group',
		'repeater',
		'flexible_content',
		'clone',
	);
	return array_unique( array_merge( (array) $field_types, $all_types ) );
} );

/**
 * Категория блоков «УниДент»
 */
add_filter( 'block_categories_all', function ( $categories ) {
	foreach ( $categories as $cat ) {
		if ( $cat['slug'] === 'unident-blocks' ) {
			return $categories;
		}
	}

	return array_merge(
		array( array(
			'slug'  => 'unident-blocks',
			'title' => 'УниДент Блоки',
			'icon'  => 'edit-large',
		) ),
		$categories
	);
}, 10, 1 );

/**
 * Регистрация всех ACF блоков.
 * На init, приоритет 20 — после загрузки ACF (acf/init = 5).
 */
add_action( 'init', function () {
	$blocks_dir = UNIDENT_BLOCKS_DIR . 'blocks/';

	$blocks = array(
		'unident-text',
		'unident-toc',
		'unident-universal',
		'unident-important',
		'unident-list',
		'unident-expert-opinion',
		// Phase 1: KB blocks
		'unident-title-text',
		'unident-numbered-list',
		'unident-readings',
		'unident-video',
		'unident-quote',
		'unident-table',
		// Phase 2
		'unident-image-text',
		'unident-advantages',
		// Phase 3
		'unident-faq',
		'unident-cta',
		'unident-cta-form',
		'unident-sta-logo',
		// Phase 4: sliders
		'unident-slider-image',
		'unident-licences',
		'unident-promotion',
		// Phase 5
		'unident-service-prices',
		'unident-anchor-nav',
		'unident-expert-kb',
	);

	foreach ( $blocks as $block ) {
		$path = $blocks_dir . $block;
		if ( file_exists( $path . '/block.json' ) ) {
			register_block_type( $path );
		}
	}
}, 20 );
