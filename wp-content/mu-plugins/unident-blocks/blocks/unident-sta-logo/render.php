<?php
/**
 * Block: STA с логотипом (unident-sta-logo)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 */

$title       = get_field( 'unident_sta_title' );
$description = get_field( 'unident_sta_description' );
$logotype    = get_field( 'unident_sta_logotype' );
$url_paid    = get_field( 'unident_sta_url_paid' ) ?: '/zapis';
$url_oms     = get_field( 'unident_sta_url_oms' ) ?: '';
$show_paid   = get_field( 'unident_sta_show_paid' ) !== false;
$show_oms    = get_field( 'unident_sta_show_oms' ) === true || get_field( 'unident_sta_show_oms' ) === 1;
$show_cb     = get_field( 'unident_sta_show_callback' ) === true || get_field( 'unident_sta_show_callback' ) === 1;

$has_logo = is_array( $logotype ) && ! empty( $logotype['ID'] );
$has_content = ! empty( $title ) || ! empty( $description ) || $has_logo || $show_paid || $show_oms || $show_cb;

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;"><p>Блок STA с логотипом</p></div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-sta-logo' );
$class_name = 'unident-block unident-sta-logo';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<div class="unident-sta-inner">
		<div class="unident-sta-content">
			<?php if ( ! empty( $title ) ) : ?>
				<h2 class="unident-sta-title"><?php echo esc_html( $title ); ?></h2>
			<?php endif; ?>
			<?php if ( ! empty( $description ) ) : ?>
				<p class="unident-sta-desc"><?php echo esc_html( $description ); ?></p>
			<?php endif; ?>
			<div class="unident-sta-buttons">
				<?php if ( $show_paid ) : ?>
					<a href="<?php echo esc_url( $url_paid ); ?>" class="unident-sta-btn unident-sta-btn-paid">Записаться платно</a>
				<?php endif; ?>
				<?php if ( $show_oms && ! empty( $url_oms ) ) : ?>
					<a href="<?php echo esc_url( $url_oms ); ?>" class="unident-sta-btn unident-sta-btn-oms">Записаться по ОМС</a>
				<?php endif; ?>
				<?php if ( $show_cb ) : ?>
					<a href="#callback" class="unident-sta-btn unident-sta-btn-callback">Заказать обратный звонок</a>
				<?php endif; ?>
			</div>
		</div>
		<?php if ( $has_logo ) : ?>
			<div class="unident-sta-logo-area">
				<?php echo wp_get_attachment_image( (int) $logotype['ID'], 'medium', false, array( 'class' => 'unident-sta-img', 'loading' => 'lazy' ) ); ?>
			</div>
		<?php endif; ?>
	</div>
</section>
