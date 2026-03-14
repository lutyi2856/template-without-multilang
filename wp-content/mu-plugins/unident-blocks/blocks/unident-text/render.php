<?php
/**
 * Block: Текстовый блок (unident-text)
 * Preview для WordPress admin. Реальный рендер — Next.js.
 */

$heading     = get_field( 'heading' );
$heading_tag = get_field( 'heading_tag' ) ?: 'h2';
$content     = get_field( 'content' );

if ( empty( $heading ) && empty( $content ) ) {
	return;
}

$allowed = array( 'h2', 'h3', 'h4' );
$tag     = in_array( $heading_tag, $allowed, true ) ? $heading_tag : 'h2';
$block_id = unident_get_block_id( $block, 'unident-text' );
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="unident-block unident-text" style="padding:20px; <?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $heading ) ) : ?>
		<<?php echo esc_attr( $tag ); ?> style="margin-bottom:12px;"><?php echo esc_html( $heading ); ?></<?php echo esc_attr( $tag ); ?>>
	<?php endif; ?>
	<?php if ( ! empty( $content ) ) : ?>
		<div><?php echo wp_kses_post( $content ); ?></div>
	<?php endif; ?>
</section>
