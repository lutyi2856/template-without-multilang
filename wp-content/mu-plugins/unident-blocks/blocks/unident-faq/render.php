<?php
/**
 * Block: FAQ (unident-faq)
 * Headless: рендер в Next.js с Accordion.
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 */

$title = get_field( 'unident_faq_title' );
$items = get_field( 'unident_faq_items' );

$has_content = ( ! empty( $title ) && is_string( $title ) ) || ( is_array( $items ) && ! empty( $items ) );

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;"><p>Блок FAQ</p></div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-faq' );
$class_name = 'unident-block unident-faq';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $title ) ) : ?>
		<h2 class="unident-title"><?php echo esc_html( $title ); ?></h2>
	<?php endif; ?>

	<?php if ( is_array( $items ) && ! empty( $items ) ) : ?>
		<div class="unident-faq-list">
			<?php foreach ( $items as $i => $item ) : ?>
				<?php
				$q = $item['question'] ?? '';
				$a = $item['answer'] ?? '';
				if ( empty( $q ) && empty( $a ) ) {
					continue;
				}
				$item_id = $block_id . '-item-' . $i;
				?>
				<div class="unident-faq-item">
					<?php if ( ! empty( $q ) ) : ?>
						<button type="button" class="unident-faq-question" aria-expanded="false" aria-controls="<?php echo esc_attr( $item_id ); ?>">
							<span><?php echo esc_html( $q ); ?></span>
							<span class="unident-faq-icon" aria-hidden="true">▼</span>
						</button>
					<?php endif; ?>
					<?php if ( ! empty( $a ) ) : ?>
						<div id="<?php echo esc_attr( $item_id ); ?>" class="unident-faq-answer" aria-hidden="true">
							<div class="unident-faq-answer-content"><?php echo wp_kses_post( $a ); ?></div>
						</div>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</section>
