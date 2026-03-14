<?php
/**
 * ACF Field Groups для блоков УниДент
 *
 * Программная регистрация всех групп полей для 6 ACF-блоков.
 * Каждая группа привязана к своему блоку через location rule.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'acf/include_fields', function () {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	/* ───────────────────────────────────────────
	 * 1. Текстовый блок (acf/unident-text)
	 * ─────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'      => 'group_unident_text',
		'title'    => 'Текстовый блок',
		'fields'   => array(
			array(
				'key'           => 'field_unident_text_heading',
				'label'         => 'Заголовок',
				'name'          => 'heading',
				'type'          => 'text',
				'placeholder'   => 'Введите заголовок',
			),
			array(
				'key'           => 'field_unident_text_heading_tag',
				'label'         => 'Тег заголовка',
				'name'          => 'heading_tag',
				'type'          => 'select',
				'choices'       => array(
					'h2' => 'H2',
					'h3' => 'H3',
					'h4' => 'H4',
				),
				'default_value' => 'h2',
				'return_format' => 'value',
			),
			array(
				'key'           => 'field_unident_text_content',
				'label'         => 'Содержание',
				'name'          => 'content',
				'type'          => 'wysiwyg',
				'tabs'          => 'all',
				'toolbar'       => 'full',
				'media_upload'  => 1,
			),
			array(
				'key'           => 'field_unident_text_block_margin',
				'label'         => 'Отступ снизу (px)',
				'name'          => 'block_margin_bottom',
				'type'          => 'number',
				'default_value' => 40,
				'min'           => 0,
				'placeholder'   => '40',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-text',
				),
			),
		),
	) );

	/* ───────────────────────────────────────────
	 * 2. Содержание (acf/unident-toc)
	 * ─────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'      => 'group_unident_toc',
		'title'    => 'Содержание',
		'fields'   => array(
			array(
				'key'           => 'field_unident_toc_heading',
				'label'         => 'Заголовок',
				'name'          => 'heading',
				'type'          => 'text',
				'default_value' => 'Содержание',
			),
			array(
				'key'          => 'field_unident_toc_items',
				'label'        => 'Пункты',
				'name'         => 'items',
				'type'         => 'repeater',
				'layout'       => 'table',
				'collapsed'    => 'field_unident_toc_label',
				'button_label' => 'Добавить пункт',
				'rows_per_page' => 20,
				'sub_fields' => array(
					array(
						'key'          => 'field_unident_toc_anchor',
						'label'        => 'Якорь (ID)',
						'name'         => 'anchor_id',
						'type'         => 'text',
						'placeholder'  => 'block-1',
						'wrapper'      => array( 'width' => '40' ),
						'instructions' => 'Скопируйте значение из поля HTML-якорь (Блок → Дополнительно) соответствующего контент-блока ниже. Порядок: block-1, block-2, block-3...',
					),
					array(
						'key'         => 'field_unident_toc_label',
						'label'       => 'Название пункта',
						'name'        => 'label',
						'type'        => 'text',
						'placeholder' => 'Раздел статьи',
						'wrapper'     => array( 'width' => '60' ),
					),
				),
			),
			array(
				'key'           => 'field_unident_toc_block_margin',
				'label'         => 'Отступ снизу (px)',
				'name'          => 'block_margin_bottom',
				'type'          => 'number',
				'default_value' => 40,
				'min'           => 0,
				'placeholder'   => '40',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-toc',
				),
			),
		),
	) );

	/* ───────────────────────────────────────────
	 * 3. Универсальный блок (acf/unident-universal)
	 * ─────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'      => 'group_unident_universal',
		'title'    => 'Универсальный блок',
		'fields'   => array(
			array(
				'key'         => 'field_unident_univ_heading',
				'label'       => 'Заголовок',
				'name'        => 'heading',
				'type'        => 'text',
				'placeholder' => 'Заголовок блока',
			),
			array(
				'key'           => 'field_unident_univ_components',
				'label'         => 'Компоненты',
				'name'          => 'components',
				'type'          => 'repeater',
				'layout'        => 'block',
				'collapsed'     => 'field_unident_univ_type',
				'button_label'  => 'Добавить компонент',
				'rows_per_page' => 20,
				'sub_fields'   => array(
					array(
						'key'           => 'field_unident_univ_type',
						'label'         => 'Тип компонента',
						'name'          => 'type',
						'type'          => 'select',
						'choices'       => array(
							'text_regular'   => 'Текст (обычный)',
							'text_highlight' => 'Текст (выделенный)',
							'bullet_list'    => 'Маркированный список',
							'image'          => 'Изображение',
						),
						'default_value' => 'text_regular',
						'wrapper'       => array( 'width' => '30' ),
					),
					array(
						'key'           => 'field_unident_univ_sort',
						'label'         => 'Порядок',
						'name'          => 'sort_order',
						'type'          => 'number',
						'default_value' => 0,
						'wrapper'       => array( 'width' => '15' ),
						'instructions'  => 'Чем меньше число, тем выше',
					),
					array(
						'key'               => 'field_unident_univ_text',
						'label'             => 'Текст',
						'name'              => 'text_content',
						'type'              => 'wysiwyg',
						'tabs'              => 'all',
						'toolbar'           => 'full',
						'media_upload'      => 0,
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_univ_type',
									'operator' => '==',
									'value'    => 'text_regular',
								),
							),
							array(
								array(
									'field'    => 'field_unident_univ_type',
									'operator' => '==',
									'value'    => 'text_highlight',
								),
							),
						),
					),
					array(
						'key'           => 'field_unident_univ_list',
						'label'         => 'Список',
						'name'          => 'list_items',
						'type'          => 'repeater',
						'layout'        => 'table',
						'collapsed'     => 'field_unident_univ_list_text',
						'button_label'  => 'Добавить пункт',
						'rows_per_page' => 20,
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_univ_type',
									'operator' => '==',
									'value'    => 'bullet_list',
								),
							),
						),
						'sub_fields'        => array(
							array(
								'key'   => 'field_unident_univ_list_text',
								'label' => 'Текст пункта',
								'name'  => 'item_text',
								'type'  => 'text',
							),
						),
					),
					array(
						'key'           => 'field_unident_univ_list_marker',
						'label'         => 'Маркер',
						'name'          => 'list_marker',
						'type'          => 'select',
						'choices'       => array(
							'dot'       => 'Точка',
							'checkmark' => 'Галочка',
						),
						'default_value' => 'dot',
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_univ_type',
									'operator' => '==',
									'value'    => 'bullet_list',
								),
							),
						),
					),
					array(
						'key'               => 'field_unident_univ_image',
						'label'             => 'Изображение',
						'name'              => 'image',
						'type'              => 'image',
						'return_format'     => 'array',
						'preview_size'      => 'medium',
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_univ_type',
									'operator' => '==',
									'value'    => 'image',
								),
							),
						),
					),
				),
			),
			array(
				'key'           => 'field_unident_univ_block_margin',
				'label'         => 'Отступ снизу (px)',
				'name'          => 'block_margin_bottom',
				'type'          => 'number',
				'default_value' => 40,
				'min'           => 0,
				'placeholder'   => '40',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-universal',
				),
			),
		),
	) );

	/* ───────────────────────────────────────────
	 * 4. Важное! (acf/unident-important)
	 * ─────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'      => 'group_unident_important',
		'title'    => 'Важное!',
		'fields'   => array(
			array(
				'key'           => 'field_unident_imp_heading',
				'label'         => 'Заголовок',
				'name'          => 'heading',
				'type'          => 'text',
				'default_value' => 'Важно!',
			),
			array(
				'key'           => 'field_unident_imp_image',
				'label'         => 'Маленькое изображение',
				'name'          => 'small_image',
				'type'          => 'image',
				'return_format' => 'array',
				'preview_size'  => 'thumbnail',
				'instructions'  => 'Опционально. Показывается рядом с заголовком.',
			),
			array(
				'key'          => 'field_unident_imp_content',
				'label'        => 'Содержание',
				'name'         => 'content',
				'type'         => 'wysiwyg',
				'tabs'         => 'all',
				'toolbar'      => 'basic',
				'media_upload' => 0,
			),
			array(
				'key'           => 'field_unident_imp_block_margin',
				'label'         => 'Отступ снизу (px)',
				'name'          => 'block_margin_bottom',
				'type'          => 'number',
				'default_value' => 40,
				'min'           => 0,
				'placeholder'   => '40',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-important',
				),
			),
		),
	) );

	/* ───────────────────────────────────────────
	 * 5. Нумерованный/Маркированный список (acf/unident-list)
	 * ─────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'      => 'group_unident_list',
		'title'    => 'Нумерованный / Маркированный список',
		'fields'   => array(
			array(
				'key'         => 'field_unident_list_heading',
				'label'       => 'Заголовок',
				'name'        => 'heading',
				'type'        => 'text',
			),
			array(
				'key'         => 'field_unident_list_desc',
				'label'       => 'Описание',
				'name'        => 'description',
				'type'        => 'textarea',
				'rows'        => 3,
			),
			array(
				'key'           => 'field_unident_list_type',
				'label'         => 'Тип списка',
				'name'          => 'list_type',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
				'ui_on_text'    => 'Нумерованный',
				'ui_off_text'   => 'Маркированный',
				'instructions'  => 'Включено = нумерованный, выключено = маркированный',
			),
			array(
				'key'           => 'field_unident_list_marker',
				'label'         => 'Маркер',
				'name'          => 'list_marker',
				'type'          => 'select',
				'choices'       => array(
					'dot'       => 'Точка',
					'checkmark' => 'Галочка',
				),
				'default_value' => 'dot',
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_list_type',
							'operator' => '==',
							'value'    => '0',
						),
					),
				),
			),
			array(
				'key'           => 'field_unident_list_items',
				'label'         => 'Элементы списка',
				'name'          => 'items',
				'type'          => 'repeater',
				'layout'        => 'block',
				'collapsed'     => 'field_unident_list_item_heading',
				'button_label'  => 'Добавить элемент',
				'rows_per_page' => 20,
				'sub_fields'   => array(
					array(
						'key'               => 'field_unident_list_num',
						'label'             => 'Номер',
						'name'              => 'number',
						'type'              => 'text',
						'placeholder'       => '01',
						'wrapper'           => array( 'width' => '15' ),
						'instructions'      => 'Номер пункта (01, 02 и т.п.)',
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_list_type',
									'operator' => '==',
									'value'    => '1',
								),
							),
						),
					),
					array(
						'key'     => 'field_unident_list_item_heading',
						'label'   => 'Заголовок',
						'name'    => 'item_heading',
						'type'    => 'text',
						'wrapper' => array( 'width' => '85' ),
					),
					array(
						'key'          => 'field_unident_list_item_desc',
						'label'        => 'Описание',
						'name'         => 'item_description',
						'type'         => 'wysiwyg',
						'tabs'         => 'all',
						'toolbar'      => 'basic',
						'media_upload' => 0,
					),
					array(
						'key'           => 'field_unident_list_service',
						'label'         => 'Ссылка на услугу',
						'name'          => 'service_link',
						'type'          => 'relationship',
						'post_type'     => array( 'services' ),
						'max'           => 1,
						'return_format' => 'object',
						'filters'       => array( 'search' ),
						'instructions'  => 'Опционально. Ссылка на услугу в конце описания.',
					),
				),
			),
			array(
				'key'           => 'field_unident_list_block_margin',
				'label'         => 'Отступ снизу (px)',
				'name'          => 'block_margin_bottom',
				'type'          => 'number',
				'default_value' => 40,
				'min'           => 0,
				'placeholder'   => '40',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-list',
				),
			),
		),
	) );

	/* ───────────────────────────────────────────
	 * 6. Мнение эксперта (acf/unident-expert-opinion)
	 * ─────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'      => 'group_unident_expert',
		'title'    => 'Мнение эксперта',
		'fields'   => array(
			array(
				'key'          => 'field_unident_expert_heading',
				'label'        => 'Заголовок',
				'name'         => 'heading',
				'type'         => 'text',
				'placeholder'  => 'Мнение эксперта',
				'instructions' => 'Первые 2 слова будут выделены другим цветом на фронте.',
			),
			array(
				'key'  => 'field_unident_expert_quote',
				'label' => 'Цитата',
				'name'  => 'quote',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'           => 'field_unident_expert_doctor',
				'label'         => 'Врач',
				'name'          => 'doctor',
				'type'          => 'relationship',
				'post_type'     => array( 'doctors' ),
				'max'           => 1,
				'return_format' => 'object',
				'filters'       => array( 'search' ),
				'instructions'  => 'Выберите врача. Фото, имя, специальность и стаж подтянутся автоматически.',
			),
			array(
				'key'           => 'field_unident_expert_custom_image',
				'label'         => 'Кастомное изображение',
				'name'          => 'custom_image',
				'type'          => 'image',
				'return_format' => 'array',
				'preview_size'  => 'medium',
				'instructions'  => 'Опционально. Если не задано, используется фото врача.',
			),
			array(
				'key'           => 'field_unident_expert_block_margin',
				'label'         => 'Отступ снизу (px)',
				'name'          => 'block_margin_bottom',
				'type'          => 'number',
				'default_value' => 40,
				'min'           => 0,
				'placeholder'   => '40',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-expert-opinion',
				),
			),
		),
	) );
} );
