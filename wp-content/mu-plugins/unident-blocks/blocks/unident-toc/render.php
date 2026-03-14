<?php
/**
 * Block: Содержание (unident-toc)
 * Preview для WordPress admin.
 */

$heading = get_field( 'heading' ) ?: 'Содержание';
$items   = get_field( 'items' );

$block_id = 'unident-toc-' . ( $block['id'] ?? uniqid() );
?>
<nav id="<?php echo esc_attr( $block_id ); ?>" class="unident-block unident-toc" style="padding:20px; background:#F5F7F9; border-radius:15px; <?php echo esc_attr( unident_get_block_margin() ); ?>">
	<h3 style="margin-bottom:12px;"><?php echo esc_html( $heading ); ?></h3>
	<?php if ( $items && is_array( $items ) ) : ?>
		<ol style="padding-left:20px;">
			<?php foreach ( $items as $i => $item ) : ?>
				<li style="margin-bottom:6px;">
					<a href="#<?php echo esc_attr( $item['anchor_id'] ?? '' ); ?>">
						<?php echo esc_html( $item['label'] ?? '' ); ?>
					</a>
				</li>
			<?php endforeach; ?>
		</ol>
	<?php endif; ?>
</nav>
