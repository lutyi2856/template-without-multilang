<?php
/**
 * Manual GraphQL Registration для Post ↔ Doctor и полей записей блога
 *
 * ACF Relationship и Image fields требуют ручной регистрации в WPGraphQL.
 */

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Register Post → Doctors (relatedDoctors), Doctor → Posts (relatedPosts),
 * Post image field (thankYouFunPostcards), Post card background (ACF).
 */
function unident_register_posts_doctors_graphql() {
	if (!function_exists('register_graphql_field')) {
		return;
	}

	// Post → Card style (ACF select: light | dark)
	register_graphql_field('Post', 'cardStyle', array(
		'type'        => 'String',
		'description' => 'Стиль карточки: light | dark',
		'resolve'     => function ( $post ) {
			return get_field('card_style', $post->ID) ?: 'light';
		},
	));

	// Post → Image field Thank you. Fun. Postcards. (MediaItem)
	register_graphql_field('Post', 'thankYouFunPostcards', array(
		'type'        => 'MediaItem',
		'description' => 'Изображение открыток / Thank you. Fun. Postcards.',
		'resolve'     => function ( $post, $args, $context, $info ) {
			$image = get_field('thank_you_fun_postcards', $post->ID);
			if ( ! $image || ! is_array( $image ) || empty( $image['ID'] ) ) {
				return null;
			}
			return \WPGraphQL\Data\DataSource::resolve_post_object( (int) $image['ID'], $context );
		},
	));

	// Post → Doctors (у записи блога может быть блок «Отвечает врач»)
	register_graphql_field('Post', 'relatedDoctors', array(
		'type'        => array('list_of' => 'Doctor'),
		'description' => 'Врачи, связанные с записью (Отвечает врач)',
		'resolve'     => function ( $post, $args, $context, $info ) {
			$doctors = get_field('related_doctors', $post->ID);

			if ( ! $doctors || ! is_array( $doctors ) ) {
				return null;
			}

			$resolved = array();
			foreach ( $doctors as $doctor_post ) {
				if ( $doctor_post instanceof \WP_Post ) {
					$resolved_doctor = \WPGraphQL\Data\DataSource::resolve_post_object(
						$doctor_post->ID,
						$context
					);
					if ( $resolved_doctor ) {
						$resolved[] = $resolved_doctor;
					}
				}
			}

			return ! empty( $resolved ) ? $resolved : null;
		},
	));

	// Doctor → Posts (записи блога, в которых участвует врач)
	register_graphql_field('Doctor', 'relatedPosts', array(
		'type'        => array('list_of' => 'Post'),
		'description' => 'Записи блога, в которых участвует врач',
		'resolve'     => function ( $doctor, $args, $context, $info ) {
			$posts = get_field('related_posts', $doctor->ID);

			if ( ! $posts || ! is_array( $posts ) ) {
				return null;
			}

			$resolved = array();
			foreach ( $posts as $post_obj ) {
				if ( $post_obj instanceof \WP_Post ) {
					$resolved_post = \WPGraphQL\Data\DataSource::resolve_post_object(
						$post_obj->ID,
						$context
					);
					if ( $resolved_post ) {
						$resolved[] = $resolved_post;
					}
				}
			}

			return ! empty( $resolved ) ? $resolved : null;
		},
	));
}
add_action('graphql_register_types', 'unident_register_posts_doctors_graphql', 10);
