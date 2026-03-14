<?php
/**
 * JetFormBuilder: программное создание форм из JSON/массива
 *
 * Использование через Cursor:
 * 1. Опиши форму в чате
 * 2. AI сгенерирует $config и добавит вызов unident_create_jetform()
 * 3. Выполни: wp eval-file wp-content/mu-plugins/jetform-create-from-json.php
 *    или добавь вызов в этот файл и открой в браузере (с проверкой прав)
 *
 * @package Unident
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Создаёт JetFormBuilder форму из конфига.
 *
 * @param array $config {
 *     @type string   $title   Заголовок формы
 *     @type string   $slug    Slug (опционально, из title)
 *     @type array[]  $fields  Массив полей
 * }
 * @return int|false ID созданного поста или false при ошибке
 */
function unident_create_jetform( array $config ) {
	$post_type = 'jet-form-builder';
	if ( ! post_type_exists( $post_type ) ) {
		return false;
	}

	$title  = $config['title'] ?? 'New Form';
	$slug   = $config['slug'] ?? sanitize_title( $title );
	$fields = $config['fields'] ?? [];

	$blocks = [];
	foreach ( $fields as $field ) {
		$block = unident_jetform_build_block( $field );
		if ( $block ) {
			$blocks[] = $block;
		}
	}

	$content = implode( "\n\n", $blocks );

	$post_data = array(
		'post_type'    => $post_type,
		'post_title'   => $title,
		'post_name'    => $slug,
		'post_content' => $content,
		'post_status'  => 'publish',
		'post_author'  => 1,
	);

	$post_id = wp_insert_post( $post_data, true );
	if ( is_wp_error( $post_id ) ) {
		return false;
	}

	return $post_id;
}

/**
 * Формирует Gutenberg-блок поля JetFormBuilder.
 *
 * @param array $field Конфиг поля
 * @return string HTML-блок или пустая строка
 */
function unident_jetform_build_block( array $field ): string {
	$type = $field['type'] ?? 'text';
	$name = $field['name'] ?? ( 'field_' . uniqid() );
	$id   = 'jet-sm-gb-' . ( function_exists( 'wp_generate_uuid4' ) ? str_replace( '-', '', wp_generate_uuid4() ) : bin2hex( random_bytes( 8 ) ) );

	$attrs = array(
		'label'     => $field['label'] ?? ucfirst( $name ),
		'name'      => sanitize_title( $name ),
		'required'  => ! empty( $field['required'] ),
		'className' => ' jet-sm-gb-wrapper ' . $id,
		'blockID'   => $id,
	);

	switch ( $type ) {
		case 'text':
			$block = 'jet-forms/text-field';
			$attrs['field_type'] = 'text';
			break;
		case 'email':
			$block = 'jet-forms/text-field';
			$attrs['field_type'] = 'email';
			break;
		case 'tel':
			$block = 'jet-forms/text-field';
			$attrs['field_type']           = 'tel';
			$attrs['enable_input_mask']    = true;
			$attrs['input_mask']           = $field['input_mask'] ?? '+99(999)999-99-99';
			break;
		case 'password':
			$block = 'jet-forms/text-field';
			$attrs['field_type'] = 'password';
			break;
		case 'textarea':
			$block = 'jet-forms/textarea-field';
			unset( $attrs['field_type'] );
			if ( ! empty( $field['placeholder'] ) ) {
				$attrs['placeholder'] = $field['placeholder'];
			}
			break;
		case 'submit':
			$block = 'jet-forms/submit-field';
			$attrs = array(
				'label'     => $field['label'] ?? 'Отправить',
				'className' => ' jet-sm-gb-wrapper ' . $id,
				'blockID'   => $id,
			);
			break;
		case 'select':
			$block = 'jet-forms/select-field';
			$opts  = $field['options'] ?? array();
			$attrs['field_options'] = unident_jetform_field_options( $opts );
			unset( $attrs['field_type'] );
			break;
		case 'checkbox':
			$block = 'jet-forms/checkbox-field';
			$opts  = $field['options'] ?? array();
			$attrs['field_options'] = unident_jetform_field_options( $opts );
			unset( $attrs['field_type'] );
			break;
		case 'radio':
			$block = 'jet-forms/radio-field';
			$opts  = $field['options'] ?? array();
			$attrs['field_options'] = unident_jetform_field_options( $opts );
			unset( $attrs['field_type'] );
			break;
		case 'number':
			$block = 'jet-forms/number-field';
			unset( $attrs['field_type'] );
			break;
		case 'hidden':
			$block  = 'jet-forms/hidden-field';
			$attrs  = array( 'name' => $field['name'] ?? 'hidden' );
			break;
		default:
			return '';
	}

	$json = wp_json_encode( $attrs );
	return '<!-- wp:' . $block . ' ' . $json . ' /-->';
}

/**
 * Преобразует options в формат JetFormBuilder field_options.
 *
 * @param array $opts Ассоциативный массив value=>label или массив [ ['value'=>x,'label'=>y], ... ]
 * @return array
 */
function unident_jetform_field_options( array $opts ) {
	$result = array();
	foreach ( $opts as $k => $v ) {
		if ( is_array( $v ) && isset( $v['value'], $v['label'] ) ) {
			$result[] = array(
				'label'     => $v['label'],
				'value'     => $v['value'],
				'calculate' => $v['calculate'] ?? '',
			);
		} else {
			$result[] = array(
				'label'     => (string) $v,
				'value'     => is_string( $k ) ? $k : sanitize_title( (string) $v ),
				'calculate' => '',
			);
		}
	}
	return $result;
}

// Форма создаётся через: wp eval-file wp-content/mu-plugins/cli/create-callback-form.php
