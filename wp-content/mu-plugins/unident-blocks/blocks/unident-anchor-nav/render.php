<?php
/**
 * Block: Навигация по якорям (unident-anchor-nav)
 * Headless: рендер в Next.js.
 *
 * @param array  $block     Block settings.
 * @param string $content   Block inner HTML.
 * @param bool   $is_preview Preview mode.
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

$items = get_field( 'unident_anchor_nav_items' );

if ( empty( $items ) || ! is_array( $items ) ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:24px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;"><p>Блок «Навигация по якорям»</p><p style="font-size:12px;color:#999;">Добавьте пункты навигации</p></div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-anchor-nav' );
$class_name = 'unident-block unident-anchor-nav';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
?>
<nav id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>" aria-label="Навигация по странице">
	<div class="unident-anchor-nav-inner">
		<?php foreach ( $items as $item ) :
			$text   = $item['nav_item_text'] ?? '';
			$anchor = $item['nav_item_anchor'] ?? '';
			if ( empty( $text ) || empty( $anchor ) ) {
				continue;
			}
			$anchor = sanitize_title( $anchor );
		?>
			<a href="#<?php echo esc_attr( $anchor ); ?>" class="unident-anchor-link"><?php echo esc_html( $text ); ?></a>
		<?php endforeach; ?>
	</div>
</nav>
