<?php
/**
 * ACF Field Groups for KB-migrated blocks (Phase 1)
 *
 * @package Unident
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'acf/include_fields', function () {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	$margin_field = array(
		'key'           => 'field_unident_block_margin',
		'label'         => 'Отступ снизу (px)',
		'name'          => 'block_margin_bottom',
		'type'          => 'number',
		'default_value' => 40,
		'min'           => 0,
		'placeholder'   => '40',
	);

	/* ─── 1. unident-title-text ───────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_title_text',
		'title'  => 'Блок: Заголовок + текст (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_title_text_title',
				'label' => 'Заголовок',
				'name'  => 'unident_title_text_title',
				'type'  => 'text',
			),
			array(
				'key'           => 'field_unident_title_text_tag',
				'label'         => 'Тег заголовка',
				'name'          => 'unident_title_text_tag',
				'type'          => 'select',
				'choices'       => array(
					'h1' => 'H1',
					'h2' => 'H2',
					'h3' => 'H3',
					'p'  => 'P',
					'div' => 'Div',
				),
				'default_value' => 'h2',
			),
			array(
				'key'   => 'field_unident_title_text_desc',
				'label' => 'Описание',
				'name'  => 'unident_title_text_description',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-title-text',
				),
			),
		),
	) );

	/* ─── 2. unident-numbered-list ──────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_numbered_list',
		'title'  => 'Блок: Нумерованный список (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_numlist_title',
				'label' => 'Заголовок',
				'name'  => 'unident_numbered_list_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_numlist_h3',
				'label' => 'H3',
				'name'  => 'unident_numbered_list_h3',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_numlist_h4',
				'label' => 'H4',
				'name'  => 'unident_numbered_list_h4',
				'type'  => 'text',
			),
			array(
				'key'          => 'field_unident_numlist_desc',
				'label'        => 'Описание',
				'name'         => 'unident_numbered_list_description',
				'type'         => 'wysiwyg',
				'toolbar'      => 'basic',
				'media_upload' => 0,
			),
			array(
				'key'           => 'field_unident_numlist_type',
				'label'         => 'Тип списка',
				'name'          => 'unident_numbered_list_type',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
				'ui_on_text'    => 'Нумерованный',
				'ui_off_text'   => 'Маркированный',
			),
			array(
				'key'           => 'field_unident_numlist_marker',
				'label'         => 'Маркер',
				'name'          => 'unident_numbered_list_marker',
				'type'          => 'select',
				'choices'       => array(
					'checkmark' => 'Галочка',
					'dot'       => 'Точка',
				),
				'default_value' => 'checkmark',
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_numlist_type',
							'operator' => '==',
							'value'    => '0',
						),
					),
				),
			),
			array(
				'key'          => 'field_unident_numlist_repeater',
				'label'        => 'Элементы списка',
				'name'         => 'unident_numbered_list_items',
				'type'         => 'repeater',
				'layout'       => 'block',
				'button_label' => 'Добавить',
				'sub_fields'   => array(
					array(
						'key'   => 'field_unident_numlist_num',
						'label' => 'Номер',
						'name'  => 'repeater_num',
						'type'  => 'text',
						'wrapper' => array( 'width' => '20' ),
					),
					array(
						'key'     => 'field_unident_numlist_text',
						'label'   => 'Текст',
						'name'    => 'repeater_text',
						'type'    => 'text',
						'wrapper' => array( 'width' => '80' ),
					),
				),
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-numbered-list',
				),
			),
		),
	) );

	/* ─── 3. unident-readings ──────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_readings',
		'title'  => 'Блок: Показания (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_readings_title',
				'label' => 'Заголовок',
				'name'  => 'unident_readings_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_readings_desc',
				'label' => 'Описание',
				'name'  => 'unident_readings_description',
				'type'  => 'textarea',
			),
			array(
				'key'          => 'field_unident_readings_repeater',
				'label'        => 'Пункты списка',
				'name'         => 'unident_readings_items',
				'type'         => 'repeater',
				'layout'       => 'table',
				'button_label' => 'Добавить',
				'sub_fields'   => array(
					array(
						'key'   => 'field_unident_readings_item_text',
						'label' => 'Текст',
						'name'  => 'item_text',
						'type'  => 'text',
					),
				),
			),
			array(
				'key'           => 'field_unident_readings_icon',
				'label'         => 'Иконка',
				'name'          => 'unident_readings_icon',
				'type'          => 'select',
				'choices'       => array(
					'dot'       => 'Точка',
					'checkmark' => 'Галочка',
				),
				'default_value' => 'dot',
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-readings',
				),
			),
		),
	) );

	/* ─── 4. unident-video ─────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_video',
		'title'  => 'Блок: Видео (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_video_title',
				'label' => 'Заголовок',
				'name'  => 'unident_video_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_video_text',
				'label' => 'Текст',
				'name'  => 'unident_video_text',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'           => 'field_unident_video_text_pos',
				'label'         => 'Позиция текста',
				'name'          => 'unident_video_text_position',
				'type'          => 'select',
				'choices'       => array(
					'under_title' => 'Под заголовком',
					'under_video'  => 'Под видео',
				),
				'default_value' => 'under_title',
			),
			array(
				'key'          => 'field_unident_video_items',
				'label'        => 'Элементы медиа',
				'name'         => 'unident_video_items',
				'type'         => 'repeater',
				'layout'       => 'block',
				'button_label' => 'Добавить элемент',
				'sub_fields'   => array(
					array(
						'key'           => 'field_unident_video_item_type',
						'label'         => 'Тип',
						'name'          => 'media_type',
						'type'          => 'select',
						'choices'       => array(
							'video' => 'Видео',
							'image' => 'Изображение',
						),
						'default_value' => 'video',
					),
					array(
						'key'               => 'field_unident_video_item_video',
						'label'             => 'Видео',
						'name'              => 'video',
						'type'              => 'file',
						'return_format'     => 'array',
						'mime_types'        => 'mp4,webm,mov,avi',
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_video_item_type',
									'operator' => '==',
									'value'    => 'video',
								),
							),
						),
					),
					array(
						'key'               => 'field_unident_video_item_image',
						'label'             => 'Изображение',
						'name'              => 'image',
						'type'              => 'image',
						'return_format'     => 'array',
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_video_item_type',
									'operator' => '==',
									'value'    => 'image',
								),
							),
						),
					),
					array(
						'key'   => 'field_unident_video_item_headline',
						'label' => 'Подзаголовок',
						'name'  => 'headline',
						'type'  => 'text',
					),
					array(
						'key'   => 'field_unident_video_item_desc',
						'label' => 'Описание',
						'name'  => 'description',
						'type'  => 'textarea',
						'rows'  => 3,
					),
					array(
						'key'           => 'field_unident_video_item_width',
						'label'         => 'Ширина',
						'name'          => 'width',
						'type'          => 'select',
						'choices'       => array(
							'1-3' => '1/3',
							'2-3' => '2/3',
							'1-2' => '1/2',
							'1'   => '100%',
						),
						'default_value' => '1-2',
					),
				),
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-video',
				),
			),
		),
	) );

	/* ─── 5. unident-quote ──────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_quote',
		'title'  => 'Блок: Цитата (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_quote_title',
				'label' => 'Заголовок',
				'name'  => 'unident_quote_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_quote_text',
				'label' => 'Текст',
				'name'  => 'unident_quote_text',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-quote',
				),
			),
		),
	) );

	/* ─── 6. unident-table ──────────────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_table',
		'title'  => 'Блок: Таблица (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_table_title',
				'label' => 'Заголовок',
				'name'  => 'unident_table_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_table_desc',
				'label' => 'Описание',
				'name'  => 'unident_table_description',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'         => 'field_unident_table_shortcode',
				'label'       => 'Shortcode TablePress',
				'name'        => 'unident_table_shortcode',
				'type'        => 'text',
				'placeholder' => '[table id=1 /]',
				'instructions' => 'Вставьте shortcode TablePress. Headless: таблица рендерится как HTML из shortcode.',
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-table',
				),
			),
		),
	) );

	/* ─── 7. unident-image-text (Phase 2) ─────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_image_text',
		'title'  => 'Блок: Картинка с текстом (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_img_title',
				'label' => 'Заголовок',
				'name'  => 'unident_image_text_title',
				'type'  => 'text',
			),
			array(
				'key'               => 'field_unident_img_image',
				'label'             => 'Изображение',
				'name'              => 'unident_image_text_image',
				'type'              => 'image',
				'return_format'     => 'array',
			),
			array(
				'key'   => 'field_unident_img_desc',
				'label' => 'Текст',
				'name'  => 'unident_image_text_description',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'           => 'field_unident_img_layout',
				'label'         => 'Макет',
				'name'          => 'unident_image_text_layout',
				'type'          => 'select',
				'choices'       => array(
					'left'  => 'Картинка слева',
					'right' => 'Картинка справа',
				),
				'default_value' => 'left',
			),
			array(
				'key'           => 'field_unident_img_desc_pos',
				'label'         => 'Позиция текста',
				'name'          => 'unident_image_text_description_position',
				'type'          => 'select',
				'choices'       => array(
					'under_image' => 'Под изображением',
					'under_title' => 'Под заголовком',
				),
				'default_value' => 'under_image',
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-image-text',
				),
			),
		),
	) );

	/* ─── 8. unident-advantages (Phase 2) ──────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_advantages',
		'title'  => 'Блок: Преимущества (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_adv_title',
				'label' => 'Заголовок',
				'name'  => 'unident_advantages_title',
				'type'  => 'text',
			),
			array(
				'key'          => 'field_unident_adv_desc',
				'label'        => 'Описание',
				'name'         => 'unident_advantages_description',
				'type'         => 'wysiwyg',
				'toolbar'      => 'basic',
				'media_upload' => 0,
			),
			array(
				'key'          => 'field_unident_adv_repeater',
				'label'        => 'Преимущества',
				'name'         => 'unident_advantages_items',
				'type'         => 'repeater',
				'layout'       => 'block',
				'button_label' => 'Добавить',
				'sub_fields'   => array(
					array(
						'key'   => 'field_unident_adv_num',
						'label' => 'Номер',
						'name'  => 'item_num',
						'type'  => 'text',
					),
					array(
						'key'   => 'field_unident_adv_item_title',
						'label' => 'Заголовок',
						'name'  => 'item_title',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_unident_adv_item_text',
						'label'        => 'Текст',
						'name'         => 'item_text',
						'type'         => 'wysiwyg',
						'toolbar'      => 'basic',
						'media_upload' => 0,
					),
				),
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-advantages',
				),
			),
		),
	) );

	/* ─── 9. unident-faq (Phase 3) ───────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_faq',
		'title'  => 'Блок: FAQ (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_faq_title',
				'label' => 'Заголовок',
				'name'  => 'unident_faq_title',
				'type'  => 'text',
			),
			array(
				'key'          => 'field_unident_faq_items',
				'label'        => 'Вопросы и ответы',
				'name'         => 'unident_faq_items',
				'type'         => 'repeater',
				'layout'       => 'block',
				'button_label' => 'Добавить',
				'sub_fields'   => array(
					array(
						'key'   => 'field_unident_faq_question',
						'label' => 'Вопрос',
						'name'  => 'question',
						'type'  => 'text',
					),
					array(
						'key'   => 'field_unident_faq_answer',
						'label' => 'Ответ',
						'name'  => 'answer',
						'type'  => 'wysiwyg',
						'toolbar' => 'basic',
						'media_upload' => 0,
					),
				),
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-faq',
				),
			),
		),
	) );

	/* ─── 10. unident-cta (Phase 3) ───────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_cta',
		'title'  => 'Блок: CTA (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_cta_title',
				'label' => 'Заголовок',
				'name'  => 'unident_cta_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_cta_desc',
				'label' => 'Описание',
				'name'  => 'unident_cta_description',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'         => 'field_unident_cta_url_paid',
				'label'       => 'URL записи платно',
				'name'        => 'unident_cta_url_paid',
				'type'        => 'url',
				'placeholder' => '/zapis',
			),
			array(
				'key'         => 'field_unident_cta_url_oms',
				'label'       => 'URL записи по ОМС',
				'name'        => 'unident_cta_url_oms',
				'type'        => 'url',
			),
			array(
				'key'           => 'field_unident_cta_show_paid',
				'label'         => 'Показать кнопку «Записаться платно»',
				'name'          => 'unident_cta_show_paid',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_cta_show_oms',
				'label'         => 'Показать кнопку «Записаться по ОМС»',
				'name'          => 'unident_cta_show_oms',
				'type'          => 'true_false',
				'default_value' => 0,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_cta_show_callback',
				'label'         => 'Показать кнопку «Обратный звонок»',
				'name'          => 'unident_cta_show_callback',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-cta',
				),
			),
		),
	) );

	/* ─── 11. unident-cta-form (Phase 3) ───────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_cta_form',
		'title'  => 'Блок: CTA с формой (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_cta_form_title',
				'label' => 'Заголовок',
				'name'  => 'unident_cta_form_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_cta_form_desc',
				'label' => 'Описание',
				'name'  => 'unident_cta_form_description',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'               => 'field_unident_cta_form_bg',
				'label'             => 'Фоновое изображение',
				'name'              => 'unident_cta_form_bg_image',
				'type'              => 'image',
				'return_format'     => 'array',
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-cta-form',
				),
			),
		),
	) );

	/* ─── 12. unident-slider-image (Phase 4) ────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_slider_image',
		'title'  => 'Блок: Слайдер изображений (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_slider_img_title',
				'label' => 'Заголовок',
				'name'  => 'unident_slider_image_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_slider_img_text',
				'label' => 'Текст',
				'name'  => 'unident_slider_image_text',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'           => 'field_unident_slider_img_images',
				'label'         => 'Изображения',
				'name'          => 'unident_slider_image_images',
				'type'          => 'gallery',
				'return_format' => 'array',
				'library'       => 'all',
				'preview_size'  => 'medium',
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-slider-image',
				),
			),
		),
	) );

	/* ─── 13. unident-licences (Phase 4) ───────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_licences',
		'title'  => 'Блок: Наши лицензии (KB)',
		'fields' => array(
			array(
				'key'           => 'field_unident_licences_title',
				'label'         => 'Заголовок секции',
				'name'          => 'unident_licences_title',
				'type'          => 'text',
				'default_value' => 'Наши лицензии',
			),
			array(
				'key'          => 'field_unident_licences_items',
				'label'        => 'Карточки лицензий',
				'name'         => 'unident_licences_items',
				'type'         => 'repeater',
				'layout'       => 'block',
				'button_label' => 'Добавить карточку',
				'sub_fields'   => array(
					array(
						'key'           => 'field_unident_licences_item_image',
						'label'         => 'Изображение',
						'name'          => 'item_image',
						'type'          => 'image',
						'return_format' => 'array',
					),
					array(
						'key'           => 'field_unident_licences_item_title',
						'label'         => 'Заголовок карточки',
						'name'          => 'item_title',
						'type'          => 'text',
						'default_value' => 'Лицензия',
					),
					array(
						'key'   => 'field_unident_licences_item_desc',
						'label' => 'Описание',
						'name'  => 'item_description',
						'type'  => 'textarea',
						'rows'  => 3,
						'new_lines' => 'br',
					),
				),
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-licences',
				),
			),
		),
	) );

	/* ─── 14. unident-promotion (Phase 4) ───────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_promotion',
		'title'  => 'Блок: Промо-слайдер акций (KB)',
		'fields' => array(
			array(
				'key'          => 'field_unident_promotion_slides',
				'label'        => 'Слайды',
				'name'         => 'unident_promotion_slides',
				'type'         => 'repeater',
				'layout'       => 'block',
				'button_label' => 'Добавить слайд',
				'sub_fields'   => array(
					array(
						'key'           => 'field_unident_promotion_use_dynamic',
						'label'         => 'Источник ссылки',
						'name'          => 'use_dynamic_data',
						'type'          => 'true_false',
						'message'       => 'Связь с постом/акцией',
						'default_value' => 1,
						'ui'            => 1,
						'ui_on_text'    => 'Из поста',
						'ui_off_text'   => 'Вручную',
					),
					array(
						'key'               => 'field_unident_promotion_post_select',
						'label'             => 'Выбор поста/акции',
						'name'              => 'post_select',
						'type'              => 'post_object',
						'post_type'         => array( 'post', 'promotions' ),
						'return_format'     => 'object',
						'allow_null'        => 1,
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_promotion_use_dynamic',
									'operator' => '==',
									'value'    => '1',
								),
							),
						),
					),
					array(
						'key'               => 'field_unident_promotion_manual_link',
						'label'             => 'Ссылка (вручную)',
						'name'              => 'manual_link',
						'type'              => 'url',
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_unident_promotion_use_dynamic',
									'operator' => '==',
									'value'    => '0',
								),
							),
						),
					),
					array(
						'key'           => 'field_unident_promotion_image_desktop',
						'label'         => 'Изображение (desktop и tablet)',
						'name'          => 'image_desktop',
						'type'          => 'image',
						'return_format' => 'array',
					),
					array(
						'key'           => 'field_unident_promotion_image_mobile',
						'label'         => 'Изображение (mobile)',
						'name'          => 'image_mobile',
						'type'          => 'image',
						'return_format' => 'array',
					),
				),
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-promotion',
				),
			),
		),
	) );

	/* ─── 15. unident-sta-logo (Phase 3) ───────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_sta_logo',
		'title'  => 'Блок: STA с логотипом (KB)',
		'fields' => array(
			array(
				'key'   => 'field_unident_sta_title',
				'label' => 'Заголовок',
				'name'  => 'unident_sta_title',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_unident_sta_desc',
				'label' => 'Описание',
				'name'  => 'unident_sta_description',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'           => 'field_unident_sta_logo',
				'label'         => 'Логотип',
				'name'          => 'unident_sta_logotype',
				'type'          => 'image',
				'return_format' => 'array',
			),
			array(
				'key'         => 'field_unident_sta_url_paid',
				'label'       => 'URL записи платно',
				'name'        => 'unident_sta_url_paid',
				'type'        => 'url',
			),
			array(
				'key'         => 'field_unident_sta_url_oms',
				'label'       => 'URL записи по ОМС',
				'name'        => 'unident_sta_url_oms',
				'type'        => 'url',
			),
			array(
				'key'           => 'field_unident_sta_show_paid',
				'label'         => 'Кнопка «Записаться платно»',
				'name'          => 'unident_sta_show_paid',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_sta_show_oms',
				'label'         => 'Кнопка «Записаться по ОМС»',
				'name'          => 'unident_sta_show_oms',
				'type'          => 'true_false',
				'default_value' => 0,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_sta_show_callback',
				'label'         => 'Кнопка «Обратный звонок»',
				'name'          => 'unident_sta_show_callback',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-sta-logo',
				),
			),
		),
	) );

	/* ─── 16. unident-service-prices (Phase 5) ───────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_service_prices',
		'title'  => 'Блок: Таблица цен услуги (KB)',
		'fields' => array(
			array(
				'key'               => 'field_unident_service_prices_service',
				'label'             => 'Услуга',
				'name'              => 'unident_service_prices_service',
				'type'              => 'post_object',
				'post_type'         => array( 'services' ),
				'return_format'     => 'object',
				'allow_null'        => 1,
				'instructions'      => 'Выберите услугу, цены которой отображать. Обязательно для блока.',
			),
			array(
				'key'           => 'field_unident_service_prices_section_title',
				'label'         => 'Заголовок секции',
				'name'          => 'unident_service_prices_section_title',
				'type'          => 'text',
				'default_value' => 'Цены',
			),
			array(
				'key'   => 'field_unident_service_prices_headline',
				'label' => 'Заголовок блока (переопределение)',
				'name'  => 'unident_service_prices_headline_override',
				'type'  => 'text',
				'instructions' => 'По умолчанию — название выбранной услуги.',
			),
			array(
				'key'         => 'field_unident_service_prices_url_paid',
				'label'       => 'URL записи платно',
				'name'        => 'unident_service_prices_url_paid',
				'type'        => 'url',
				'default_value' => '/zapis',
			),
			array(
				'key'         => 'field_unident_service_prices_url_oms',
				'label'       => 'URL записи по ОМС',
				'name'        => 'unident_service_prices_url_oms',
				'type'        => 'url',
			),
			array(
				'key'           => 'field_unident_service_prices_show_paid',
				'label'         => 'Показать кнопку «Записаться платно»',
				'name'          => 'unident_service_prices_show_paid',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_service_prices_show_oms',
				'label'         => 'Показать кнопку «Записаться по ОМС»',
				'name'          => 'unident_service_prices_show_oms',
				'type'          => 'true_false',
				'default_value' => 0,
				'ui'            => 1,
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-service-prices',
				),
			),
		),
	) );

	/* ─── 17. unident-anchor-nav (Phase 5) ───────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_anchor_nav',
		'title'  => 'Блок: Навигация по якорям (KB)',
		'fields' => array(
			array(
				'key'          => 'field_unident_anchor_nav_items',
				'label'        => 'Пункты навигации',
				'name'         => 'unident_anchor_nav_items',
				'type'         => 'repeater',
				'layout'       => 'table',
				'button_label' => 'Добавить пункт',
				'sub_fields'   => array(
					array(
						'key'   => 'field_unident_anchor_nav_text',
						'label' => 'Текст ссылки',
						'name'  => 'nav_item_text',
						'type'  => 'text',
						'required' => 1,
					),
					array(
						'key'   => 'field_unident_anchor_nav_anchor',
						'label' => 'Якорь (ID)',
						'name'  => 'nav_item_anchor',
						'type'  => 'text',
						'required' => 1,
						'instructions' => 'Скопируйте значение из поля HTML-якорь (Блок → Дополнительно) соответствующего контент-блока. Без символа #.',
					),
				),
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-anchor-nav',
				),
			),
		),
	) );

	/* ─── 18. unident-expert-kb (Phase 5) ────────────────────────────────── */
	acf_add_local_field_group( array(
		'key'    => 'group_unident_expert_kb',
		'title'  => 'Блок: Мнение эксперта KB',
		'fields' => array(
			array(
				'key'   => 'field_unident_expert_kb_quote',
				'label' => 'Текст экспертного мнения',
				'name'  => 'unident_expert_kb_quote',
				'type'  => 'textarea',
				'rows'  => 4,
			),
			array(
				'key'           => 'field_unident_expert_kb_data_source',
				'label'         => 'Источник данных врача',
				'name'          => 'unident_expert_kb_data_source',
				'type'          => 'true_false',
				'message'       => 'Использовать связь с врачом',
				'default_value' => 1,
				'ui'            => 1,
				'ui_on_text'    => 'Связь',
				'ui_off_text'   => 'Вручную',
			),
			array(
				'key'               => 'field_unident_expert_kb_doctor',
				'label'             => 'Выбор врача',
				'name'              => 'unident_expert_kb_doctor',
				'type'              => 'relationship',
				'post_type'         => array( 'doctors' ),
				'return_format'     => 'object',
				'min'               => 0,
				'max'               => 1,
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_expert_kb_data_source',
							'operator' => '==',
							'value'    => '1',
						),
					),
				),
			),
			array(
				'key'   => 'field_unident_expert_kb_manual_name',
				'label' => 'Имя врача (вручную)',
				'name'  => 'unident_expert_kb_manual_name',
				'type'  => 'text',
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_expert_kb_data_source',
							'operator' => '==',
							'value'    => '0',
						),
					),
				),
			),
			array(
				'key'   => 'field_unident_expert_kb_manual_url',
				'label' => 'Ссылка на врача (вручную)',
				'name'  => 'unident_expert_kb_manual_doctor_url',
				'type'  => 'url',
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_expert_kb_data_source',
							'operator' => '==',
							'value'    => '0',
						),
					),
				),
			),
			array(
				'key'   => 'field_unident_expert_kb_manual_specialties',
				'label' => 'Специализации (вручную)',
				'name'  => 'unident_expert_kb_manual_specialties',
				'type'  => 'textarea',
				'rows'  => 2,
				'instructions' => 'Через запятую',
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_expert_kb_data_source',
							'operator' => '==',
							'value'    => '0',
						),
					),
				),
			),
			array(
				'key'   => 'field_unident_expert_kb_manual_experience',
				'label' => 'Стаж (вручную)',
				'name'  => 'unident_expert_kb_manual_experience',
				'type'  => 'text',
				'placeholder' => '19 лет',
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_expert_kb_data_source',
							'operator' => '==',
							'value'    => '0',
						),
					),
				),
			),
			array(
				'key'               => 'field_unident_expert_kb_manual_image',
				'label'             => 'Фото врача (вручную)',
				'name'              => 'unident_expert_kb_manual_image',
				'type'              => 'image',
				'return_format'     => 'array',
				'conditional_logic' => array(
					array(
						array(
							'field'    => 'field_unident_expert_kb_data_source',
							'operator' => '==',
							'value'    => '0',
						),
					),
				),
			),
			array(
				'key'           => 'field_unident_expert_kb_show_photo',
				'label'         => 'Показывать фото врача',
				'name'          => 'unident_expert_kb_show_photo',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_expert_kb_use_doctor_photo',
				'label'         => 'Использовать фото из карточки врача',
				'name'          => 'unident_expert_kb_use_doctor_photo',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'               => 'field_unident_expert_kb_custom_image',
				'label'             => 'Своё изображение (вместо фото врача)',
				'name'              => 'unident_expert_kb_custom_image',
				'type'              => 'image',
				'return_format'     => 'array',
			),
			array(
				'key'           => 'field_unident_expert_kb_show_name',
				'label'         => 'Показывать имя врача',
				'name'          => 'unident_expert_kb_show_name',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_expert_kb_show_specialties',
				'label'         => 'Показывать специализации',
				'name'          => 'unident_expert_kb_show_specialties',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_expert_kb_show_experience',
				'label'         => 'Показывать стаж',
				'name'          => 'unident_expert_kb_show_experience',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'         => 'field_unident_expert_kb_url_paid',
				'label'       => 'URL записи платно',
				'name'        => 'unident_expert_kb_url_paid',
				'type'        => 'url',
				'default_value' => '/zapis',
			),
			array(
				'key'         => 'field_unident_expert_kb_url_oms',
				'label'       => 'URL записи по ОМС',
				'name'        => 'unident_expert_kb_url_oms',
				'type'        => 'url',
			),
			array(
				'key'           => 'field_unident_expert_kb_show_paid',
				'label'         => 'Кнопка «Записаться платно»',
				'name'          => 'unident_expert_kb_show_paid',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'           => 'field_unident_expert_kb_show_oms',
				'label'         => 'Кнопка «Записаться по ОМС»',
				'name'          => 'unident_expert_kb_show_oms',
				'type'          => 'true_false',
				'default_value' => 0,
				'ui'            => 1,
			),
			$margin_field,
		),
		'location' => array(
			array(
				array(
					'param'    => 'block',
					'operator' => '==',
					'value'    => 'acf/unident-expert-kb',
				),
			),
		),
	) );
}, 5 );
