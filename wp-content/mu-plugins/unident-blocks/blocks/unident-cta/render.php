<?php
/**
 * Block: CTA (unident-cta)
 * Headless: кнопки рендерятся в Next.js, callback открывает CallbackForm.
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 */

$title       = get_field( 'unident_cta_title' );
$description = get_field( 'unident_cta_description' );
$url_paid    = get_field( 'unident_cta_url_paid' ) ?: '/zapis';
$url_oms     = get_field( 'unident_cta_url_oms' ) ?: '';
$show_paid   = get_field( 'unident_cta_show_paid' ) !== false;
$show_oms    = get_field( 'unident_cta_show_oms' ) === true || get_field( 'unident_cta_show_oms' ) === 1;
$show_cb     = get_field( 'unident_cta_show_callback' ) === true || get_field( 'unident_cta_show_callback' ) === 1;

$has_content = ! empty( $title ) || ! empty( $description ) || $show_paid || $show_oms || $show_cb;

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;"><p>Блок CTA</p></div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-cta' );
$class_name = 'unident-block unident-cta';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<div class="unident-cta-inner">
		<div class="unident-cta-content">
			<?php if ( ! empty( $title ) ) : ?>
				<h2 class="unident-cta-title"><?php echo esc_html( $title ); ?></h2>
			<?php endif; ?>
			<?php if ( ! empty( $description ) ) : ?>
				<p class="unident-cta-desc"><?php echo esc_html( $description ); ?></p>
			<?php endif; ?>
			<div class="unident-cta-buttons">
				<?php if ( $show_paid ) : ?>
					<a href="<?php echo esc_url( $url_paid ); ?>" class="unident-cta-btn unident-cta-btn-paid">Записаться платно</a>
				<?php endif; ?>
				<?php if ( $show_oms && ! empty( $url_oms ) ) : ?>
					<a href="<?php echo esc_url( $url_oms ); ?>" class="unident-cta-btn unident-cta-btn-oms">Записаться по ОМС</a>
				<?php endif; ?>
				<?php if ( $show_cb ) : ?>
					<a href="#callback" class="unident-cta-btn unident-cta-btn-callback">Заказать обратный звонок</a>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>
