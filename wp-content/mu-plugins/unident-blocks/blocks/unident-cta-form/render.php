<?php
/**
 * Block: CTA с формой (unident-cta-form)
 * Headless: форма рендерится в Next.js (CallbackForm).
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 */

$title       = get_field( 'unident_cta_form_title' );
$description = get_field( 'unident_cta_form_description' );
$bg_image    = get_field( 'unident_cta_form_bg_image' );

$has_content = ! empty( $title ) || ! empty( $description );

if ( ! $has_content && empty( $is_preview ) ) {
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-cta-form' );
$class_name = 'unident-block unident-cta-form';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}

$bg_style = '';
if ( is_array( $bg_image ) && ! empty( $bg_image['url'] ) ) {
	$bg_style = 'background-image: url(' . esc_url( $bg_image['url'] ) . ');';
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<div class="unident-cta-form-inner"<?php echo $bg_style ? ' style="' . $bg_style . '"' : ''; ?>>
		<div class="unident-cta-form-content">
			<?php if ( ! empty( $title ) ) : ?>
				<h2 class="unident-cta-form-title"><?php echo esc_html( $title ); ?></h2>
			<?php endif; ?>
			<?php if ( ! empty( $description ) ) : ?>
				<p class="unident-cta-form-desc"><?php echo esc_html( $description ); ?></p>
			<?php endif; ?>
			<?php if ( ! empty( $is_preview ) ) : ?>
				<div class="unident-cta-form-placeholder">[Форма обратного звонка — в headless рендерится CallbackForm]</div>
			<?php endif; ?>
		</div>
	</div>
</section>
