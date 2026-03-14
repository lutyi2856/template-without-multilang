<?php
/**
 * Block: Универсальный блок (unident-universal)
 * Preview для WordPress admin.
 */

$heading    = get_field( 'heading' );
$components = get_field( 'components' );

if ( empty( $heading ) && empty( $components ) ) {
	return;
}

$block_id = unident_get_block_id( $block, 'unident-universal' );
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="unident-block unident-universal" style="padding:20px; <?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $heading ) ) : ?>
		<h2 style="margin-bottom:16px;"><?php echo esc_html( $heading ); ?></h2>
	<?php endif; ?>

	<?php if ( $components && is_array( $components ) ) :
		usort( $components, function( $a, $b ) {
			return ( (int) ( $a['sort_order'] ?? 0 ) ) - ( (int) ( $b['sort_order'] ?? 0 ) );
		} );
		foreach ( $components as $comp ) :
			$type = $comp['type'] ?? '';
			?>
			<div style="margin-bottom:12px;">
				<?php if ( $type === 'text_regular' || $type === 'text_highlight' ) : ?>
					<div <?php echo $type === 'text_highlight' ? 'style="background:#F5F7F9;padding:12px;border-radius:10px;"' : ''; ?>>
						<?php echo wp_kses_post( $comp['text_content'] ?? '' ); ?>
					</div>
				<?php elseif ( $type === 'bullet_list' && ! empty( $comp['list_items'] ) ) :
					$list_marker = $comp['list_marker'] ?? 'dot';
					$marker_char = $list_marker === 'checkmark' ? '✓' : '•';
					?>
					<ul style="padding-left:20px; list-style:none;">
						<?php foreach ( $comp['list_items'] as $li ) : ?>
							<li style="margin-bottom:4px;"><span style="color:#526AC2; margin-right:8px;"><?php echo esc_html( $marker_char ); ?></span><?php echo esc_html( $li['item_text'] ?? '' ); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php elseif ( $type === 'image' && ! empty( $comp['image'] ) ) :
					$img = $comp['image']; ?>
					<img src="<?php echo esc_url( is_array( $img ) ? $img['url'] : $img ); ?>" alt="" style="max-width:100%; border-radius:15px;">
				<?php endif; ?>
			</div>
		<?php endforeach;
	endif; ?>
</section>
