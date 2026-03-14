<?php
/**
 * Фильтр для преобразования ACF date_time_picker в ISO 8601 формат
 * 
 * Plugin Name: Promotions GraphQL Date Filter
 * Description: Преобразует endDate в ISO 8601 формат для GraphQL
 */

// Фильтр для преобразования endDate в ISO 8601
add_filter('graphql_resolve_field', function($result, $source, $args, $context, $info) {
	// Применяем только для promotionFields.endDate (разные варианты названия parent type)
	$parent_names = ['Promotion_Promotionfields', 'Promotion_PromotionFields', 'PromotionFields'];
	
	// Debug: логируем все поля promotionFields
	if (in_array($info->parentType->name, $parent_names)) {
		error_log("[GraphQL Filter] Parent: {$info->parentType->name}, Field: {$info->fieldName}, Value: " . print_r($result, true));
	}
	
	if (in_array($info->parentType->name, $parent_names) && $info->fieldName === 'endDate') {
		if (empty($result)) {
			error_log("[GraphQL Filter] endDate is empty!");
			return null;
		}
		
		error_log("[GraphQL Filter] Converting endDate: $result");
		
		// Преобразуем дату в ISO 8601
		$formats = [
			'Y-m-d H:i:s',
			'Y-m-d H:i',
			'd/m/Y H:i',
			'YmdHis',
		];
		
		$date_obj = null;
		foreach ($formats as $format) {
			$date_obj = DateTime::createFromFormat($format, $result);
			if ($date_obj !== false) {
				break;
			}
		}
		
		// Fallback to strtotime
		if ($date_obj === false || $date_obj === null) {
			$timestamp = strtotime($result);
			if ($timestamp !== false) {
				$date_obj = new DateTime();
				$date_obj->setTimestamp($timestamp);
			}
		}
		
		if ($date_obj) {
			return $date_obj->format('c'); // ISO 8601
		}
		
		return $result;
	}
	
	return $result;
}, 10, 5);

// Удаляем старую manual registration - теперь используем только ACF автоматическую регистрацию + фильтр для endDate
// add_action('graphql_register_types', function() {
	
/*	// Регистрация типа для Features
	register_graphql_object_type('PromotionFeature', [
		'description' => 'Преимущество акции',
		'fields' => [
			'text' => [
				'type' => 'String',
				'description' => 'Текст преимущества',
			],
		],
	]);

	// Регистрация типа для Futures (для типа "free")
	register_graphql_object_type('PromotionFuture', [
		'description' => 'Преимущество для бесплатной акции (из repeater поля)',
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
				'description' => 'Тип акции (promo, special, limited, sale, free)',
			],
			'endDate' => [
				'type' => 'String',
				'description' => 'Дата окончания акции (ISO 8601)',
			],
			'features' => [
				'type' => ['list_of' => 'PromotionFeature'],
				'description' => 'Список преимуществ',
			],
			'futures' => [
				'type' => ['list_of' => 'PromotionFuture'],
				'description' => 'Преимущества для бесплатной акции (repeater)',
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

			// Получаем futures из repeater (для типа "free")
			$futures_raw = get_field('futures', $post_id);
			$futures = [];
			if (is_array($futures_raw)) {
				foreach ($futures_raw as $future) {
					if (is_array($future) && isset($future['text'])) {
						$futures[] = [
							'text' => $future['text'],
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

			// Получаем endDate через get_field() для правильной обработки ACF date_time_picker
			$end_date_raw = get_field('end_date', $post_id);
			$end_date = null;
			if ($end_date_raw) {
				// ACF date_time_picker возвращает значение согласно return_format
				// Проверяем разные форматы и преобразуем в ISO 8601
				if (is_string($end_date_raw)) {
					// Пробуем разные форматы даты
					$formats = [
						'Y-m-d H:i:s',  // Стандартный формат ACF
						'Y-m-d H:i',    // Без секунд
						'd/m/Y H:i',    // Формат из админки (display_format)
						'YmdHis',       // Компактный формат
					];
					
					$date_obj = null;
					foreach ($formats as $format) {
						$date_obj = DateTime::createFromFormat($format, $end_date_raw);
						if ($date_obj !== false) {
							break;
						}
					}
					
					// Если не удалось распарсить, пробуем strtotime как fallback
					if ($date_obj === false || $date_obj === null) {
						$timestamp = strtotime($end_date_raw);
						if ($timestamp !== false) {
							$date_obj = new DateTime();
							$date_obj->setTimestamp($timestamp);
						}
					}
					
					if ($date_obj) {
						$end_date = $date_obj->format('c'); // ISO 8601 format
					} else {
						// Если не удалось распарсить, возвращаем как есть
						$end_date = $end_date_raw;
					}
				} elseif (is_numeric($end_date_raw)) {
					// Если это timestamp
					$date_obj = new DateTime();
					$date_obj->setTimestamp($end_date_raw);
					$end_date = $date_obj->format('c');
				}
			}

			return [
				'actionIcon' => get_field('action_icon', $post_id) ?: get_post_meta($post_id, 'action_icon', true) ?: null,
				'actionType' => get_field('action_type', $post_id) ?: get_post_meta($post_id, 'action_type', true) ?: null,
				'endDate' => $end_date,
				'features' => !empty($features) ? $features : null,
				'futures' => !empty($futures) ? $futures : null,
				'price' => get_field('price', $post_id) ?: get_post_meta($post_id, 'price', true) ?: null,
				'productImage' => $product_image,
			];
		},
	]);
*/
// });
