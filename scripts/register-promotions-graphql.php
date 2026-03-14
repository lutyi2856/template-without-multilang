<?php
/**
 * Регистрация GraphQL полей для Promotions CPT
 * Файл нужно скопировать в wp-content/mu-plugins/
 * 
 * Plugin Name: Promotions GraphQL Fields
 * Description: Регистрация ACF полей для Promotions в GraphQL
 */

add_action('graphql_register_types', function() {
	
	// Регистрация типа для Features
	register_graphql_object_type('PromotionFeature', [
		'description' => 'Преимущество акции',
		'fields' => [
			'text' => [
				'type' => 'String',
				'description' => 'Текст преимущества',
			],
		],
	]);

	// Регистрация типа для Product Image
	register_graphql_object_type('PromotionProductImage', [
		'description' => 'Изображение товара',
		'fields' => [
			'sourceUrl' => [
				'type' => 'String',
				'description' => 'URL изображения',
			],
			'width' => [
				'type' => 'Int',
				'description' => 'Ширина изображения',
			],
			'height' => [
				'type' => 'Int',
				'description' => 'Высота изображения',
			],
		],
	]);

	// Регистрация типа для Promotion Fields
	register_graphql_object_type('PromotionFields', [
		'description' => 'Дополнительные поля акции',
		'fields' => [
			'actionIcon' => [
				'type' => 'String',
				'description' => 'SVG код иконки акции',
			],
			'actionType' => [
				'type' => 'String',
				'description' => 'Тип акции (promo, special, limited, sale)',
			],
			'endDate' => [
				'type' => 'String',
				'description' => 'Дата окончания акции (ISO 8601)',
			],
			'features' => [
				'type' => ['list_of' => 'PromotionFeature'],
				'description' => 'Список преимуществ',
			],
			'price' => [
				'type' => 'String',
				'description' => 'Цена',
			],
			'productImage' => [
				'type' => 'PromotionProductImage',
				'description' => 'Изображение товара',
			],
		],
	]);

	// Регистрация поля promotionFields на Promotion post type
	register_graphql_field('Promotion', 'promotionFields', [
		'type' => 'PromotionFields',
		'description' => 'Дополнительные поля акции',
		'resolve' => function($post) {
			$post_id = $post->ID;
			
			// Получаем features из repeater
			$features_raw = get_post_meta($post_id, 'features', true);
			$features = [];
			if (is_array($features_raw)) {
				foreach ($features_raw as $feature) {
					if (is_array($feature) && isset($feature['text'])) {
						$features[] = [
							'text' => $feature['text'],
						];
					}
				}
			}

			// Получаем product_image
			$product_image_id = get_post_meta($post_id, 'product_image', true);
			$product_image = null;
			if ($product_image_id) {
				$image_url = wp_get_attachment_url($product_image_id);
				$image_meta = wp_get_attachment_metadata($product_image_id);
				if ($image_url) {
					$product_image = [
						'sourceUrl' => $image_url,
						'width' => $image_meta['width'] ?? 0,
						'height' => $image_meta['height'] ?? 0,
					];
				}
			}

			return [
				'actionIcon' => get_post_meta($post_id, 'action_icon', true) ?: null,
				'actionType' => get_post_meta($post_id, 'action_type', true) ?: null,
				'endDate' => get_post_meta($post_id, 'end_date', true) ?: null,
				'features' => !empty($features) ? $features : null,
				'price' => get_post_meta($post_id, 'price', true) ?: null,
				'productImage' => $product_image,
			];
		},
	]);
});
