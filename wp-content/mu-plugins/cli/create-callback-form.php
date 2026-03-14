<?php
/**
 * Создание формы «Телефон + Отправить».
 * Запуск: wp eval-file wp-content/mu-plugins/cli/create-callback-form.php --allow-root
 */
if ( ! defined( 'ABSPATH' ) ) {
	require_once dirname( dirname( dirname( dirname( __FILE__ ) ) ) ) . '/wp-load.php';
}

if ( ! function_exists( 'unident_create_jetform' ) ) {
	die( "unident_create_jetform not found.\n" );
}

$config = array(
	'title'  => 'Форма обратного звонка',
	'slug'   => 'callback-form',
	'fields' => array(
		array( 'type' => 'tel', 'name' => 'phone', 'label' => 'Телефон', 'required' => true ),
		array( 'type' => 'submit', 'label' => 'Отправить' ),
	),
);

$id = unident_create_jetform( $config );
if ( $id ) {
	echo "Form created: ID {$id}\nEdit: " . admin_url( "post.php?post={$id}&action=edit" ) . "\n";
} else {
	echo "Failed to create form. Is JetForm Builder active?\n";
	exit( 1 );
}
