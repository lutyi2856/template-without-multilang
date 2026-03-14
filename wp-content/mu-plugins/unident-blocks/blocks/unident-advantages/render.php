<?php
/**
 * Block: Преимущества (unident-advantages)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$title       = get_field( 'unident_advantages_title' );
$description = get_field( 'unident_advantages_description' );
$items       = get_field( 'unident_advantages_items' );

$has_content = ! empty( $title ) || ! empty( $description ) || ! empty( $items );

if ( ! $has_content ) {
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-advantages' );
$class_name = 'unident-block unident-advantages';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . esc_attr( $block['align'] );
}
?>

<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<div class="unident-advantages-inner">
		<?php if ( ! empty( $title ) ) : ?>
			<h2 class="unident-title"><?php echo esc_html( $title ); ?></h2>
		<?php endif; ?>

		<?php if ( ! empty( $description ) && is_string( $description ) ) : ?>
			<div class="unident-description"><?php echo wp_kses_post( $description ); ?></div>
		<?php endif; ?>

		<?php if ( ! empty( $items ) ) : ?>
			<div class="unident-list">
				<?php foreach ( $items as $item ) : ?>
					<?php
					$has_item = ! empty( $item['item_num'] ) || ! empty( $item['item_title'] ) || ! empty( $item['item_text'] );
					if ( ! $has_item ) {
						continue;
					}
					?>
					<div class="unident-item">
						<?php if ( ! empty( $item['item_num'] ) ) : ?>
							<span class="unident-num"><?php echo esc_html( $item['item_num'] ); ?></span>
						<?php endif; ?>
						<div class="unident-content">
							<?php if ( ! empty( $item['item_title'] ) ) : ?>
								<h3 class="unident-item-title"><?php echo esc_html( $item['item_title'] ); ?></h3>
							<?php endif; ?>
							<?php if ( ! empty( $item['item_text'] ) ) : ?>
								<div class="unident-item-text"><?php echo wp_kses_post( $item['item_text'] ); ?></div>
							<?php endif; ?>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
</section>
