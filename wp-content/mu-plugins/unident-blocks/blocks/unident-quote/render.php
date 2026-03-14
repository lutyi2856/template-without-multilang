<?php
/**
 * Block: Цитата (unident-quote)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$title = get_field( 'unident_quote_title' );
$text  = get_field( 'unident_quote_text' );

if ( empty( $title ) && empty( $text ) ) {
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-quote' );
$class_name = 'unident-block unident-quote';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . esc_attr( $block['align'] );
}
?>

<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<blockquote class="unident-blockquote">
		<?php if ( ! empty( $title ) ) : ?>
			<h2 class="unident-title"><?php echo esc_html( $title ); ?></h2>
		<?php endif; ?>

		<?php if ( ! empty( $text ) ) : ?>
			<p class="unident-text"><?php echo esc_html( $text ); ?></p>
		<?php endif; ?>
	</blockquote>
</section>
