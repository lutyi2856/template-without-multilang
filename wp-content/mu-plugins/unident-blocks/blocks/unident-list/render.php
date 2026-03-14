<?php
/**
 * Block: Нумерованный / Маркированный список (unident-list)
 * Preview для WordPress admin.
 */

$heading     = get_field( 'heading' );
$description = get_field( 'description' );
$list_type   = get_field( 'list_type' );
$list_marker = get_field( 'list_marker' ) ?: 'dot';
$items       = get_field( 'items' );
$is_numbered = (bool) $list_type;

if ( empty( $heading ) && empty( $items ) ) {
	return;
}

$block_id = unident_get_block_id( $block, 'unident-list' );
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="unident-block unident-list" style="padding:20px; <?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $heading ) ) : ?>
		<h2 style="margin-bottom:8px;"><?php echo esc_html( $heading ); ?></h2>
	<?php endif; ?>
	<?php if ( ! empty( $description ) ) : ?>
		<p style="margin-bottom:16px; color:#8F8F8F;"><?php echo esc_html( $description ); ?></p>
	<?php endif; ?>

	<?php if ( $items && is_array( $items ) ) : ?>
		<div style="display:flex; flex-direction:column; gap:16px;">
			<?php foreach ( $items as $item ) : ?>
				<div style="display:flex; gap:12px; padding:16px; background:#F5F7F9; border-radius:15px;">
					<?php if ( $is_numbered && ! empty( $item['number'] ) ) : ?>
						<span style="font-size:24px; font-weight:bold; color:#526AC2;"><?php echo esc_html( $item['number'] ); ?></span>
					<?php elseif ( ! $is_numbered ) : ?>
						<span style="color:#526AC2;"><?php echo $list_marker === 'checkmark' ? '✓' : '•'; ?></span>
					<?php endif; ?>
					<div>
						<?php if ( ! empty( $item['item_heading'] ) ) : ?>
							<strong><?php echo esc_html( $item['item_heading'] ); ?></strong>
						<?php endif; ?>
						<?php if ( ! empty( $item['item_description'] ) ) : ?>
							<div><?php echo wp_kses_post( $item['item_description'] ); ?></div>
						<?php endif; ?>
						<?php
						$service = $item['service_link'] ?? null;
						if ( $service && is_array( $service ) && ! empty( $service[0] ) ) :
							$svc = $service[0];
							?>
							<a href="<?php echo esc_url( get_permalink( $svc ) ); ?>" style="color:#526AC2;">
								→ <?php echo esc_html( get_the_title( $svc ) ); ?>
							</a>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</section>
