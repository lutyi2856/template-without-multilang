<?php
/**
 * Block: Показания (unident-readings)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$title       = get_field( 'unident_readings_title' );
$description = get_field( 'unident_readings_description' );
$list_items  = get_field( 'unident_readings_items' );
$icon_type   = get_field( 'unident_readings_icon' ) ?: 'dot';
if ( $icon_type === 'checkmark' || strpos( (string) $icon_type, 'checkmark' ) !== false ) {
	$icon_type = 'checkmark';
} else {
	$icon_type = 'dot';
}

$checkmark_svg = '<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="25" height="25" rx="12.5" fill="#526AC2"/><path d="M6.3252 12.1988L10.6426 16.5161L18.6748 8.48389" stroke="white" stroke-width="2"/></svg>';
$dot_svg       = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" rx="5" fill="#526AC2"/></svg>';
$marker_svg    = $icon_type === 'checkmark' ? $checkmark_svg : $dot_svg;

$has_content = ! empty( $title ) || ! empty( $description ) || ! empty( $list_items );
if ( ! $has_content ) {
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-readings' );
$class_name = 'unident-block unident-readings unident-readings--' . $icon_type;
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . $block['className'];
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . $block['align'];
}
?>

<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $title ) ) : ?>
		<h2 class="unident-title"><?php echo esc_html( $title ); ?></h2>
	<?php endif; ?>

	<?php if ( ! empty( $description ) ) : ?>
		<p class="unident-description"><?php echo nl2br( esc_html( $description ) ); ?></p>
	<?php endif; ?>

	<?php if ( ! empty( $list_items ) ) : ?>
		<ul class="unident-list">
			<?php foreach ( $list_items as $item ) : ?>
				<?php if ( ! empty( $item['item_text'] ) ) : ?>
					<li class="unident-list-item">
						<span class="unident-icon"><?php echo $marker_svg; ?></span>
						<span class="unident-text"><?php echo esc_html( $item['item_text'] ); ?></span>
					</li>
				<?php endif; ?>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>
</section>
