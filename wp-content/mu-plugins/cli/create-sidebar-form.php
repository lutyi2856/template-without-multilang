<?php
/**
 * CLI: Create JetFormBuilder form "Расчёт стоимости" for blog sidebar
 *
 * Usage: docker exec -it template-wordpress-1 wp eval-file /var/www/html/wp-content/mu-plugins/cli/create-sidebar-form.php
 *
 * Fields: problem (textarea), phone (tel)
 * Endpoint: jet-fb/v1/sidebar-calc
 * Action: Save Form Record
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$form_title = 'Расчёт стоимости (sidebar)';

$existing = get_page_by_title( $form_title, OBJECT, 'jet-fb-form' );
if ( $existing ) {
	echo "Form already exists (ID: {$existing->ID}). Skipping.\n";
	return;
}

$form_content = array(
	array(
		'blockName' => 'jet-forms/textarea-field',
		'attrs'     => array(
			'name'        => 'problem',
			'label'       => 'Какая у вас проблема?',
			'placeholder' => 'Опишите вашу проблему...',
			'required'    => false,
		),
	),
	array(
		'blockName' => 'jet-forms/text-field',
		'attrs'     => array(
			'name'        => 'phone',
			'label'       => 'Телефон',
			'field_type'  => 'tel',
			'placeholder' => '+7 (___) ___-__-__',
			'required'    => true,
		),
	),
	array(
		'blockName' => 'jet-forms/submit-field',
		'attrs'     => array(
			'label' => 'Получить расчёт',
		),
	),
);

$blocks_markup = '';
foreach ( $form_content as $block ) {
	$attrs_json    = wp_json_encode( $block['attrs'] );
	$blocks_markup .= "<!-- wp:{$block['blockName']} {$attrs_json} /-->\n";
}

$form_id = wp_insert_post( array(
	'post_title'   => $form_title,
	'post_content' => $blocks_markup,
	'post_status'  => 'publish',
	'post_type'    => 'jet-fb-form',
) );

if ( is_wp_error( $form_id ) ) {
	echo "Error creating form: " . $form_id->get_error_message() . "\n";
	return;
}

// Set actions meta — Save Form Record
$actions = array(
	array(
		'type'     => 'save_record',
		'settings' => array(),
	),
);
update_post_meta( $form_id, '_jf_actions', $actions );

// Set form args — Formless endpoint slug
update_post_meta( $form_id, '_jf_args', array(
	'submit_type' => 'reload',
) );

// Formless REST endpoint
update_post_meta( $form_id, '_jf_recaptcha', '' );

echo "Form created successfully! ID: {$form_id}\n";
echo "Endpoint: /wp-json/jet-fb/v1/sidebar-calc\n";
echo "Note: Go to WP Admin > JetFormBuilder > edit form > add 'Save Form Record' action if not set.\n";
echo "Then set Formless REST API endpoint slug to 'sidebar-calc'.\n";
