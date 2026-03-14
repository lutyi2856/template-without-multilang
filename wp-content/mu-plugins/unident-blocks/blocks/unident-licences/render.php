<?php
/**
 * Block: Наши лицензии (unident-licences)
 * Headless: рендер в Next.js с Embla Carousel.
 * Карусель карточек лицензий: 4 в ряд, стрелки, счётчик.
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 */

$title = get_field( 'unident_licences_title' );
$items = get_field( 'unident_licences_items' );

$display_title   = ( is_string( $title ) && trim( $title ) !== '' ) ? trim( $title ) : 'Наши лицензии';
$has_valid_items = is_array( $items ) && ! empty( $items );
$has_content     = $has_valid_items || ( is_string( $title ) && trim( $title ) !== '' );

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;">';
		echo '<p style="margin:0;color:#666;">Блок «Наши лицензии»</p>';
		echo '<p style="margin:5px 0 0;color:#999;font-size:12px;">Заполните заголовок и добавьте карточки в панели справа</p>';
		echo '</div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-licences' );
$class_name = 'unident-block unident-licences';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . esc_attr( $block['align'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<h2 class="unident-licences-title"><?php echo esc_html( $display_title ); ?></h2>

	<?php if ( $has_valid_items ) : ?>
		<div class="unident-licences-slider">
			<?php foreach ( $items as $item ) : ?>
				<?php
				$img = $item['item_image'] ?? null;
				$tit = isset( $item['item_title'] ) ? trim( (string) $item['item_title'] ) : '';
				$desc = isset( $item['item_description'] ) ? trim( (string) $item['item_description'] ) : '';
				?>
				<div class="unident-licence-card">
					<div class="unident-licence-card-image">
						<?php if ( ! empty( $img ) && is_array( $img ) && ! empty( $img['ID'] ) ) : ?>
							<?php echo wp_get_attachment_image( $img['ID'], 'medium_large', false, array( 'class' => 'unident-licence-img', 'loading' => 'lazy' ) ); ?>
						<?php else : ?>
							<div class="unident-licence-placeholder" role="img" aria-label=""></div>
						<?php endif; ?>
					</div>
					<?php if ( $tit !== '' ) : ?>
						<p class="unident-licence-title"><?php echo esc_html( $tit ); ?></p>
					<?php endif; ?>
					<?php if ( $desc !== '' ) : ?>
						<p class="unident-licence-description"><?php echo nl2br( esc_html( $desc ) ); ?></p>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</section>
