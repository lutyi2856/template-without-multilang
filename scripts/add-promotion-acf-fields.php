<?php
/**
 * Добавление ACF полей для Promotions CPT
 * Согласно Figma node 10:191 (Action Card)
 * 
 * Поля:
 * - features (repeater) - список преимуществ
 * - price (text) - цена
 * - product_image (image) - изображение товара
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

if (!function_exists('acf_add_local_field_group')) {
	die('ACF not installed');
}

// Получаем существующую field group для promotions
$field_group_key = 'group_promotions';

// Добавляем новые поля в field group
acf_add_local_field_group([
	'key' => $field_group_key,
	'title' => 'Promotion Fields',
	'fields' => [
		[
			'key' => 'field_action_icon',
			'label' => 'Action Icon',
			'name' => 'action_icon',
			'type' => 'textarea',
			'instructions' => 'SVG код иконки акции',
			'required' => 0,
		],
		[
			'key' => 'field_action_type',
			'label' => 'Action Type',
			'name' => 'action_type',
			'type' => 'select',
			'choices' => [
				'promo' => 'Промо',
				'special' => 'Специальное',
				'limited' => 'Ограниченное',
				'sale' => 'Распродажа',
			],
			'default_value' => 'promo',
			'required' => 0,
		],
		[
			'key' => 'field_end_date',
			'label' => 'End Date',
			'name' => 'end_date',
			'type' => 'date_time_picker',
			'instructions' => 'Дата окончания акции (для countdown)',
			'required' => 0,
			'display_format' => 'd/m/Y g:i a',
			'return_format' => 'c', // ISO 8601
		],
		[
			'key' => 'field_features',
			'label' => 'Преимущества',
			'name' => 'features',
			'type' => 'repeater',
			'instructions' => 'Список преимуществ (3 пункта)',
			'required' => 0,
			'layout' => 'table',
			'button_label' => 'Добавить преимущество',
			'sub_fields' => [
				[
					'key' => 'field_feature_text',
					'label' => 'Текст',
					'name' => 'text',
					'type' => 'text',
					'required' => 1,
				],
			],
		],
		[
			'key' => 'field_price',
			'label' => 'Цена',
			'name' => 'price',
			'type' => 'text',
			'instructions' => 'Цена товара/услуги (например: 17 900₽)',
			'required' => 0,
		],
		[
			'key' => 'field_product_image',
			'label' => 'Изображение товара',
			'name' => 'product_image',
			'type' => 'image',
			'instructions' => 'Изображение товара для карточки (249x266px)',
			'required' => 0,
			'return_format' => 'array',
			'preview_size' => 'medium',
		],
	],
	'location' => [
		[
			[
				'param' => 'post_type',
				'operator' => '==',
				'value' => 'promotions',
			],
		],
	],
]);

echo "ACF field group registered successfully!\n";
echo "Now sync fields in WordPress Admin -> Custom Fields -> Sync\n";
