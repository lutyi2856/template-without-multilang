<?php
/**
 * Block: Таблица цен услуги (unident-service-prices)
 * Headless: рендер в Next.js. УниДент использует ACF related_prices и focus_prices.
 *
 * @param array  $block     Block settings.
 * @param string $content   Block inner HTML.
 * @param bool   $is_preview Preview mode.
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

$service_obj = get_field( 'unident_service_prices_service' );
$service_id  = 0;
if ( $service_obj ) {
	if ( is_array( $service_obj ) && ! empty( $service_obj[0] ) ) {
		$service_id = $service_obj[0] instanceof WP_Post ? $service_obj[0]->ID : (int) $service_obj[0];
	} elseif ( $service_obj instanceof WP_Post ) {
		$service_id = $service_obj->ID;
	} elseif ( is_numeric( $service_obj ) ) {
		$service_id = (int) $service_obj;
	}
}

$section_title = get_field( 'unident_service_prices_section_title' ) ?: 'Цены';
$headline      = get_field( 'unident_service_prices_headline_override' ) ?: ( $service_id ? get_the_title( $service_id ) : '' );
$url_paid      = get_field( 'unident_service_prices_url_paid' ) ?: '/zapis';
$url_oms       = get_field( 'unident_service_prices_url_oms' ) ?: '';
$show_paid     = get_field( 'unident_service_prices_show_paid' ) !== false;
$show_oms      = get_field( 'unident_service_prices_show_oms' ) === true || get_field( 'unident_service_prices_show_oms' ) === 1;

$has_content = $service_id || ! empty( $section_title ) || $show_paid || $show_oms;

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;"><p>Блок «Таблица цен услуги»</p><p style="font-size:12px;color:#999;">Выберите услугу в панели справа</p></div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-service-prices' );
$class_name = 'unident-block unident-service-prices';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>" data-service-id="<?php echo esc_attr( (string) $service_id ); ?>" data-section-title="<?php echo esc_attr( $section_title ); ?>" data-headline="<?php echo esc_attr( $headline ); ?>" data-url-paid="<?php echo esc_attr( $url_paid ); ?>" data-url-oms="<?php echo esc_attr( $url_oms ); ?>" data-show-paid="<?php echo $show_paid ? '1' : '0'; ?>" data-show-oms="<?php echo $show_oms ? '1' : '0'; ?>">
	<div class="unident-service-prices-inner">
		<p class="unident-headless-note">Контент блока рендерится в Next.js</p>
	</div>
</section>
