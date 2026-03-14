<?php
/**
 * Helper functions for Unident ACF blocks
 *
 * @package Unident
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns block section ID for anchor links.
 *
 * @param array  $block  Block array from ACF render callback.
 * @param string $prefix Prefix for auto-generated ID.
 * @return string
 */
function unident_get_block_id( $block, $prefix ) {
	$anchor = $block['attrs']['anchor'] ?? $block['anchor'] ?? '';
	if ( ! empty( $anchor ) ) {
		return sanitize_title( $anchor );
	}
	return $prefix . '-' . ( $block['id'] ?? uniqid() );
}

/**
 * Returns inline style for block margin-bottom.
 *
 * @return string e.g. "margin-bottom:40px"
 */
function unident_get_block_margin() {
	$val = get_field( 'block_margin_bottom' );
	$mb  = ( $val === '' || $val === null || $val === false ) ? 40 : (int) $val;
	return 'margin-bottom:' . $mb . 'px';
}

/**
 * Returns block margin-bottom value in pixels (for GraphQL/JSON).
 *
 * @return int Margin in px, default 40.
 */
function unident_get_block_margin_bottom() {
	$val = get_field( 'block_margin_bottom' );
	return ( $val === '' || $val === null || $val === false ) ? 40 : (int) $val;
}
