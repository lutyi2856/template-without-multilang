<?php
/**
 * Plugin Name: УниДент Reviews Filter GraphQL
 * Description: Rating filter for Reviews CPT — ratingMin, ratingMax in RootQueryToReviewConnectionWhereArgs
 * Version: 1.0
 * Author: УниДент
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register ratingMin, ratingMax and platformSlug in RootQueryToReviewConnectionWhereArgs
 */
function unident_register_review_connection_where_args() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_field('RootQueryToReviewConnectionWhereArgs', 'ratingMin', [
        'type'        => 'Float',
        'description' => 'Filter reviews with rating >= value (e.g. 4.9 for "above 4.9")',
    ]);

    register_graphql_field('RootQueryToReviewConnectionWhereArgs', 'ratingMax', [
        'type'        => 'Float',
        'description' => 'Filter reviews with rating < value (e.g. 4 for "below 4")',
    ]);

    register_graphql_field('RootQueryToReviewConnectionWhereArgs', 'platformSlug', [
        'type'        => 'String',
        'description' => 'Filter reviews by review_platform taxonomy term slug',
    ]);
}
add_action('graphql_register_types', 'unident_register_review_connection_where_args', 10);

/**
 * Map ratingMin/ratingMax and platformSlug from GraphQL where to WP_Query meta_query and tax_query
 * ACF field rating: meta_key = 'rating'
 * Taxonomy: review_platform
 */
function unident_reviews_post_object_connection_query_args($query_args, $source, $args, $context, $info) {
    $post_type = $query_args['post_type'] ?? null;
    $is_reviews = (is_string($post_type) && in_array($post_type, ['reviews', 'review'], true))
        || (is_array($post_type) && !empty(array_intersect(['reviews', 'review'], $post_type)));
    if (!$is_reviews) {
        return $query_args;
    }

    $where = $args['where'] ?? [];
    $has_rating = !empty($where['ratingMin']) || !empty($where['ratingMax']);
    $has_platform = !empty($where['platformSlug']);

    if (!$has_rating && !$has_platform) {
        return $query_args;
    }

    if ($has_rating) {
        $meta_query = isset($query_args['meta_query']) ? array_filter((array) $query_args['meta_query'], 'is_array') : [];

        if (!empty($where['ratingMin'])) {
            $min = (float) $where['ratingMin'];
            $meta_query[] = [
                'key'     => 'rating',
                'value'   => (string) $min,
                'compare' => '>=',
                'type'    => 'DECIMAL',
            ];
        }

        if (!empty($where['ratingMax'])) {
            $max = (float) $where['ratingMax'];
            $meta_query[] = [
                'key'     => 'rating',
                'value'   => (string) $max,
                'compare' => '<',
                'type'    => 'DECIMAL',
            ];
        }

        if (!empty($meta_query)) {
            if (count($meta_query) > 1 && empty($meta_query['relation'])) {
                $meta_query['relation'] = 'AND';
            }
            $query_args['meta_query'] = $meta_query;
        }
    }

    if ($has_platform && taxonomy_exists('review_platform')) {
        $term = get_term_by('slug', sanitize_text_field($where['platformSlug']), 'review_platform');
        if ($term && !is_wp_error($term)) {
            $tax_query = isset($query_args['tax_query']) ? array_filter((array) $query_args['tax_query'], 'is_array') : [];
            $tax_query[] = [
                'taxonomy' => 'review_platform',
                'field'    => 'term_id',
                'terms'    => [(int) $term->term_id],
            ];
            if (count($tax_query) > 1 && empty($tax_query['relation'])) {
                $tax_query['relation'] = 'AND';
            }
            $query_args['tax_query'] = $tax_query;
        }
    }

    return $query_args;
}
add_filter('graphql_post_object_connection_query_args', 'unident_reviews_post_object_connection_query_args', 10, 5);
