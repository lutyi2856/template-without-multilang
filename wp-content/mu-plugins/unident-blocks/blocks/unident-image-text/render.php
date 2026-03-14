<?php
/**
 * Block: Картинка с текстом (unident-image-text)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$title         = get_field( 'unident_image_text_title' );
$image         = get_field( 'unident_image_text_image' );
$description   = get_field( 'unident_image_text_description' );
$layout        = get_field( 'unident_image_text_layout' ) ?: 'left';
$desc_position = get_field( 'unident_image_text_description_position' ) ?: 'under_image';

$has_valid_image = is_array( $image ) && ! empty( $image['ID'] );
$has_content    = ! empty( $title ) || $has_valid_image || ! empty( $description );

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;"><p style="margin:0;color:#666;">Блок "Картинка с текстом"</p></div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-image-text' );
$layout_cls = in_array( $layout, array( 'left', 'right' ), true ) ? 'unident-layout-' . $layout : 'unident-layout-left';
$class_name = 'unident-block unident-image-text ' . $layout_cls;
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . esc_attr( $block['align'] );
}
?>

<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $title ) && is_string( $title ) ) : ?>
		<h2 class="unident-title"><?php echo esc_html( $title ); ?></h2>
	<?php endif; ?>

	<?php if ( $desc_position === 'under_title' && ! empty( $description ) && is_string( $description ) ) : ?>
		<div class="unident-text unident-text--under-title">
			<p><?php echo nl2br( esc_html( $description ) ); ?></p>
		</div>
	<?php endif; ?>

	<div class="unident-content">
		<?php if ( $has_valid_image ) : ?>
			<div class="unident-image">
				<?php echo wp_get_attachment_image( $image['ID'], 'large', false, array( 'class' => 'unident-img', 'loading' => 'lazy' ) ); ?>
			</div>
		<?php endif; ?>

		<?php if ( $desc_position === 'under_image' && ! empty( $description ) && is_string( $description ) ) : ?>
			<div class="unident-text">
				<p><?php echo nl2br( esc_html( $description ) ); ?></p>
			</div>
		<?php endif; ?>
	</div>
</section>
