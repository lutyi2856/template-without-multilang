<?php
/**
 * Plugin Name: Auto Alt Text on Upload
 * Description: Автоматически заполняет _wp_attachment_image_alt при загрузке изображения, если alt пустой. Fallback: заголовок родительского поста или имя файла.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wp_generate_attachment_metadata', 'unident_auto_alt_on_upload', 10, 2 );

/**
 * Заполняет alt при загрузке, если пустой.
 *
 * @param array $metadata    Метаданные вложения.
 * @param int   $attachment_id ID вложения.
 * @return array
 */
function unident_auto_alt_on_upload( $metadata, $attachment_id ) {
	$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
	if ( ! empty( trim( (string) $alt ) ) ) {
		return $metadata;
	}

	$parent_id = wp_get_post_parent_id( $attachment_id );
	if ( $parent_id ) {
		$title = get_the_title( $parent_id );
	} else {
		$file = get_attached_file( $attachment_id );
		$title = $file ? pathinfo( $file, PATHINFO_FILENAME ) : '';
	}

	if ( empty( $title ) ) {
		$title = get_the_title( $attachment_id );
	}
	if ( empty( $title ) ) {
		$title = sprintf( 'Изображение %d', $attachment_id );
	}

	update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $title ) );

	return $metadata;
}
