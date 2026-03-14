<?php
/**
 * Manual GraphQL Registration for Post Sidebar fields
 *
 * Share Buttons (ACF repeater) and CTA Override (ACF fields)
 * require manual GraphQL registration for proper type resolution.
 */

if (!defined('ABSPATH')) {
	exit;
}

function unident_register_post_sidebar_graphql() {
	if (!function_exists('register_graphql_field') || !function_exists('register_graphql_object_type')) {
		return;
	}

	// PostShareButton type
	register_graphql_object_type('PostShareButton', array(
		'description' => 'Кнопка шеринга поста (SVG + URL)',
		'fields'      => array(
			'icon'  => array('type' => 'String', 'description' => 'SVG-код иконки'),
			'url'   => array('type' => 'String', 'description' => 'URL шаблон с {post_url}'),
			'label' => array('type' => 'String', 'description' => 'Название соцсети (aria-label)'),
		),
	));

	// PostCtaOverride type
	register_graphql_object_type('PostCtaOverride', array(
		'description' => 'Переопределение CTA блока для конкретного поста',
		'fields'      => array(
			'ctaTitle'      => array('type' => 'String', 'description' => 'Заголовок CTA'),
			'ctaDescription' => array('type' => 'String', 'description' => 'Описание CTA'),
			'ctaButtonText' => array('type' => 'String', 'description' => 'Текст кнопки'),
			'ctaImage'      => array(
				'type'        => 'MediaItem',
				'description' => 'Изображение CTA',
			),
		),
	));

	// Post → shareButtons
	register_graphql_field('Post', 'shareButtons', array(
		'type'        => array('list_of' => 'PostShareButton'),
		'description' => 'Кнопки «Поделиться» (SVG + URL)',
		'resolve'     => function ( $post ) {
			$buttons = get_field('share_buttons', $post->ID);
			if ( ! $buttons || ! is_array( $buttons ) ) {
				return null;
			}
			$result = array();
			foreach ( $buttons as $btn ) {
				$result[] = array(
					'icon'  => $btn['icon'] ?? '',
					'url'   => $btn['url'] ?? '',
					'label' => $btn['label'] ?? '',
				);
			}
			return $result;
		},
	));

	// Post → ctaOverride
	register_graphql_field('Post', 'ctaOverride', array(
		'type'        => 'PostCtaOverride',
		'description' => 'Переопределение CTA sidebar для этого поста',
		'resolve'     => function ( $post, $args, $context ) {
			$title       = get_field('cta_title', $post->ID);
			$description = get_field('cta_description', $post->ID);
			$button_text = get_field('cta_button_text', $post->ID);
			$image       = get_field('cta_image', $post->ID);

			$has_data = $title || $description || $button_text || $image;
			if ( ! $has_data ) {
				return null;
			}

			$resolved_image = null;
			if ( $image && is_array( $image ) && ! empty( $image['ID'] ) ) {
				$resolved_image = \WPGraphQL\Data\DataSource::resolve_post_object(
					(int) $image['ID'],
					$context
				);
			}

			return array(
				'ctaTitle'       => $title ?: null,
				'ctaDescription' => $description ?: null,
				'ctaButtonText'  => $button_text ?: null,
				'ctaImage'       => $resolved_image,
			);
		},
	));
}
add_action('graphql_register_types', 'unident_register_post_sidebar_graphql', 10);
