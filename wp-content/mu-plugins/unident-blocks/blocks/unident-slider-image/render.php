<?php
/**
 * Block: Слайдер изображений (unident-slider-image)
 * Headless: рендер в Next.js с Embla Carousel.
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 */

$title = get_field( 'unident_slider_image_title' );
$text  = get_field( 'unident_slider_image_text' );
$images = get_field( 'unident_slider_image_images' );

$has_valid_images = is_array( $images ) && ! empty( $images );
$has_valid_title = ! empty( $title ) && is_string( $title );
$has_valid_text  = ! empty( $text ) && is_string( $text );
$has_content     = $has_valid_title || $has_valid_text || $has_valid_images;

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;">';
		echo '<p style="margin:0;color:#666;">Блок «Слайдер изображений»</p>';
		echo '<p style="margin:5px 0 0;color:#999;font-size:12px;">Добавьте изображения в галерею справа</p>';
		echo '</div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-slider-image' );
$class_name = 'unident-block unident-slider-image';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . esc_attr( $block['align'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( $has_valid_title ) : ?>
		<h2 class="unident-title"><?php echo esc_html( $title ); ?></h2>
	<?php endif; ?>

	<?php if ( $has_valid_text ) : ?>
		<p class="unident-description"><?php echo nl2br( esc_html( $text ) ); ?></p>
	<?php endif; ?>

	<?php if ( $has_valid_images ) : ?>
		<div class="unident-slider-container">
			<?php foreach ( $images as $image ) : ?>
				<?php if ( is_array( $image ) && ! empty( $image['ID'] ) ) : ?>
					<div class="unident-slide">
						<?php echo wp_get_attachment_image( $image['ID'], 'large', false, array(
							'class'   => 'unident-slide-img',
							'loading' => 'lazy',
						) ); ?>
					</div>
				<?php endif; ?>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</section>
