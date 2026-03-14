<?php
/**
 * Block: Таблица (unident-table)
 * Заголовок + shortcode TablePress.
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$table_title       = get_field( 'unident_table_title' );
$table_description = get_field( 'unident_table_description' );
$table_shortcode   = get_field( 'unident_table_shortcode' );

$has_title       = ! empty( $table_title ) && is_string( $table_title );
$has_description = ! empty( $table_description ) && is_string( $table_description );
$has_shortcode   = ! empty( $table_shortcode ) && is_string( $table_shortcode );

if ( ! $has_title && ! $has_description && ! $has_shortcode ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;">';
		echo '<p>Блок "Таблица"</p>';
		echo '<p>Заполните заголовок и вставьте shortcode TablePress</p>';
		echo '</div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-table' );
$class_name = 'unident-block unident-table';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
?>

<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( $has_title ) : ?>
		<h2 class="unident-table-title"><?php echo esc_html( $table_title ); ?></h2>
	<?php endif; ?>

	<?php if ( $has_description ) : ?>
		<p class="unident-description"><?php echo nl2br( esc_html( $table_description ) ); ?></p>
	<?php endif; ?>

	<?php if ( $has_shortcode ) : ?>
		<div class="unident-table-content">
			<?php echo do_shortcode( $table_shortcode ); ?>
		</div>
	<?php elseif ( ! empty( $is_preview ) ) : ?>
		<div class="unident-block-placeholder" style="padding:20px;background:#f9f9f9;border:1px dashed #ccc;">
			Добавьте shortcode TablePress в поле блока
		</div>
	<?php endif; ?>
</section>
