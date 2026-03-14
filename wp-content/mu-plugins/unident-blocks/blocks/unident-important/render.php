<?php
/**
 * Block: Важное! (unident-important)
 * Preview для WordPress admin.
 */

$heading     = get_field( 'heading' );
$small_image = get_field( 'small_image' );
$content     = get_field( 'content' );

if ( empty( $heading ) && empty( $content ) ) {
	return;
}

$block_id = unident_get_block_id( $block, 'unident-important' );
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="unident-block unident-important" style="padding:24px; background:#FFF3CD; border-left:4px solid #FFC107; border-radius:15px; <?php echo esc_attr( unident_get_block_margin() ); ?>">
	<div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
		<?php if ( ! empty( $heading ) ) : ?>
			<h3 style="margin:0;"><?php echo esc_html( $heading ); ?></h3>
		<?php endif; ?>
		<?php if ( $small_image && is_array( $small_image ) && ! empty( $small_image['url'] ) ) : ?>
			<img src="<?php echo esc_url( $small_image['url'] ); ?>" alt="" style="width:40px; height:40px; object-fit:contain;">
		<?php endif; ?>
	</div>
	<?php if ( ! empty( $content ) ) : ?>
		<div><?php echo wp_kses_post( $content ); ?></div>
	<?php endif; ?>
</section>
