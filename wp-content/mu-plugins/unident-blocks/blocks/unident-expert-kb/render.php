<?php
/**
 * Block: Мнение эксперта KB (unident-expert-kb)
 * Headless: рендер в Next.js. Полная версия с data_source, manual, кнопками.
 *
 * @param array  $block     Block settings.
 * @param string $content   Block inner HTML.
 * @param bool   $is_preview Preview mode.
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-expert-kb' );
$class_name = 'unident-block unident-expert-kb';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<div class="unident-expert-kb-inner">
		<p class="unident-headless-note">Контент блока рендерится в Next.js</p>
	</div>
</section>
