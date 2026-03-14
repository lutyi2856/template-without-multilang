<?php
/**
 * Block: Заголовок + текст (unident-title-text)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$title       = get_field( 'unident_title_text_title' );
$title_tag   = get_field( 'unident_title_text_tag' );
$description = get_field( 'unident_title_text_description' );

$allowed_tags = array( 'h1', 'h2', 'h3', 'p', 'div' );
$tag          = in_array( $title_tag, $allowed_tags, true ) ? $title_tag : 'h2';

if ( empty( $title ) && empty( $description ) ) {
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-title-text' );
$class_name = 'unident-block unident-title-text';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . $block['className'];
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . $block['align'];
}
?>

<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $title ) ) : ?>
		<<?php echo esc_attr( $tag ); ?> class="unident-title"><?php echo esc_html( $title ); ?></<?php echo esc_attr( $tag ); ?>>
	<?php endif; ?>

	<?php if ( ! empty( $description ) ) : ?>
		<p class="unident-description"><?php echo esc_html( $description ); ?></p>
	<?php endif; ?>
</section>
