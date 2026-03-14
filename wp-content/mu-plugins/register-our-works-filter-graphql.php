<?php
/**
 * Register categorySlug in RootQueryToOurWorkConnectionWhereArgs
 * Filter our-works by service_categories taxonomy
 *
 * @package Unident
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register categorySlug in RootQueryToOurWorkConnectionWhereArgs
 */
function unident_register_our_work_connection_where_args() {
	if ( ! function_exists( 'register_graphql_field' ) ) {
		return;
	}

	register_graphql_field( 'RootQueryToOurWorkConnectionWhereArgs', 'categorySlug', [
		'type'        => 'String',
		'description' => 'Filter our-works by service_categories term slug',
	] );
}
add_action( 'graphql_register_types', 'unident_register_our_work_connection_where_args', 10 );

/**
 * Apply categorySlug filter via graphql_post_object_connection_query_args
 */
function unident_our_works_post_object_connection_query_args( $query_args, $source, $args, $context, $info ) {
	$post_type = $query_args['post_type'] ?? null;
	$is_our_works = ( is_string( $post_type ) && in_array( $post_type, array( 'our-works', 'our_works' ), true ) )
		|| ( is_array( $post_type ) && ! empty( array_intersect( array( 'our-works', 'our_works' ), $post_type ) ) );
	if ( ! $is_our_works ) {
		return $query_args;
	}

	// Сортировка: page order (menu_order ASC), при равном — свежие первыми (date DESC)
	$query_args['orderby'] = array(
		'menu_order' => 'ASC',
		'date'       => 'DESC',
	);

	$where = $args['where'] ?? array();
	if ( empty( $where['categorySlug'] ) ) {
		return $query_args;
	}

	$slug = sanitize_text_field( $where['categorySlug'] );
	$term = get_term_by( 'slug', $slug, 'service_categories' );
	if ( $term && ! is_wp_error( $term ) ) {
		$tax_query   = isset( $query_args['tax_query'] ) ? array_filter( (array) $query_args['tax_query'], 'is_array' ) : array();
		$tax_query[] = array(
			'taxonomy' => 'service_categories',
			'field'    => 'term_id',
			'terms'    => array( (int) $term->term_id ),
		);
		if ( count( $tax_query ) > 1 && empty( $tax_query['relation'] ) ) {
			$tax_query['relation'] = 'AND';
		}
		$query_args['tax_query'] = $tax_query;
	}

	return $query_args;
}
add_filter( 'graphql_post_object_connection_query_args', 'unident_our_works_post_object_connection_query_args', 10, 5 );
