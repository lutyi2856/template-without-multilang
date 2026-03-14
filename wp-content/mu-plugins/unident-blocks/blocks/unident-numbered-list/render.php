<?php
/**
 * Block: Нумерованный список (unident-numbered-list)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$title       = get_field( 'unident_numbered_list_title' );
$h3          = get_field( 'unident_numbered_list_h3' );
$h4          = get_field( 'unident_numbered_list_h4' );
$description = get_field( 'unident_numbered_list_description' );
$list_items  = get_field( 'unident_numbered_list_items' );
$is_numbered = get_field( 'unident_numbered_list_type' );
$marker_type = get_field( 'unident_numbered_list_marker' );

if ( $is_numbered === null || $is_numbered === '' ) {
	$is_numbered = true;
}
$is_numbered = (bool) $is_numbered;

$checkmark_svg = '<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="25" height="25" rx="12.5" fill="#526AC2"/><path d="M6.3252 12.1988L10.6426 16.5161L18.6748 8.48389" stroke="white" stroke-width="2"/></svg>';
$dot_svg       = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" rx="5" fill="#526AC2"/></svg>';
$marker_svg    = ( empty( $marker_type ) || $marker_type === 'checkmark' ) ? $checkmark_svg : $dot_svg;

$has_content = ! empty( $title ) || ! empty( $h3 ) || ! empty( $h4 ) || ! empty( $description ) || ! empty( $list_items );
if ( ! $has_content ) {
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-numbered-list' );
$class_name = 'unident-block unident-numbered-list';
if ( ! $is_numbered ) {
	$class_name .= ' unident-numbered-list--marked';
	if ( $marker_type === 'dot' ) {
		$class_name .= ' unident-numbered-list--marker-dot';
	}
}
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

	<?php if ( ! empty( $h3 ) ) : ?>
		<h3 class="unident-subtitle"><?php echo esc_html( $h3 ); ?></h3>
	<?php endif; ?>

	<?php if ( ! empty( $h4 ) ) : ?>
		<h4 class="unident-subtitle-small"><?php echo esc_html( $h4 ); ?></h4>
	<?php endif; ?>

	<?php if ( ! empty( $description ) ) : ?>
		<div class="unident-description"><?php echo wp_kses_post( $description ); ?></div>
	<?php endif; ?>

	<?php if ( ! empty( $list_items ) ) : ?>
		<?php if ( $is_numbered ) : ?>
			<ol class="unident-list">
				<?php foreach ( $list_items as $item ) : ?>
					<?php if ( ! empty( $item['repeater_num'] ) || ! empty( $item['repeater_text'] ) ) : ?>
						<li class="unident-list-item">
							<?php if ( ! empty( $item['repeater_num'] ) ) : ?>
								<span class="unident-num"><?php echo esc_html( $item['repeater_num'] ); ?></span>
							<?php endif; ?>
							<?php if ( ! empty( $item['repeater_text'] ) ) : ?>
								<span class="unident-text"><?php echo esc_html( $item['repeater_text'] ); ?></span>
							<?php endif; ?>
						</li>
					<?php endif; ?>
				<?php endforeach; ?>
			</ol>
		<?php else : ?>
			<ul class="unident-list">
				<?php foreach ( $list_items as $item ) : ?>
					<?php if ( ! empty( $item['repeater_text'] ) ) : ?>
						<li class="unident-list-item">
							<span class="unident-icon"><?php echo $marker_svg; ?></span>
							<span class="unident-text"><?php echo esc_html( $item['repeater_text'] ); ?></span>
						</li>
					<?php endif; ?>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	<?php endif; ?>
</section>
