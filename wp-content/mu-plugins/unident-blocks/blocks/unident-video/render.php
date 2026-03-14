<?php
/**
 * Block: Видео (unident-video)
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 * @param array  $context   Block context.
 */

$title         = get_field( 'unident_video_title' );
$text          = get_field( 'unident_video_text' );
$text_position = get_field( 'unident_video_text_position' ) ?: 'under_title';
$items         = get_field( 'unident_video_items' );

$width_map = array(
	'1-3' => 1 / 3,
	'2-3' => 2 / 3,
	'1-2' => 1 / 2,
	'1'   => 1.0,
);

$valid_items = array();
if ( is_array( $items ) ) {
	foreach ( $items as $item ) {
		if ( ! is_array( $item ) ) {
			continue;
		}
		$mt        = $item['media_type'] ?? 'video';
		$has_video = $mt === 'video' && is_array( $item['video'] ?? null ) && ! empty( ( $item['video']['url'] ?? '' ) );
		$has_image = $mt === 'image' && is_array( $item['image'] ?? null ) && ! empty( ( $item['image']['ID'] ?? 0 ) );
		if ( $has_video || $has_image ) {
			$w           = $item['width'] ?? '1-2';
			$valid_items[] = array_merge( $item, array( 'width_val' => $width_map[ $w ] ?? 0.5 ) );
		}
	}
}

$rows   = array();
$row    = array();
$sum    = 0.0;
$tolerance = 0.02;
foreach ( $valid_items as $item ) {
	$w    = $item['width_val'];
	$row[] = $item;
	$sum += $w;
	if ( $sum >= 1 - $tolerance || count( $row ) >= 3 ) {
		$rows[] = $row;
		$row   = array();
		$sum   = 0.0;
	}
}
if ( ! empty( $row ) ) {
	$rows[] = $row;
}

$has_content = ( ! empty( $title ) && is_string( $title ) )
	|| ( ! empty( $text ) && is_string( $text ) )
	|| ! empty( $valid_items );

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;"><p style="margin:0;color:#666;">Блок "Видео"</p></div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-video' );
$class_name = 'unident-block unident-video';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . esc_attr( $block['align'] );
}
?>

<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $title ) && is_string( $title ) ) : ?>
		<h2 class="unident-title"><?php echo esc_html( $title ); ?></h2>
	<?php endif; ?>

	<?php if ( $text_position === 'under_title' && ! empty( $text ) && is_string( $text ) ) : ?>
		<p class="unident-description"><?php echo nl2br( esc_html( $text ) ); ?></p>
	<?php endif; ?>

	<?php if ( ! empty( $rows ) ) : ?>
		<div class="unident-media-rows">
			<?php foreach ( $rows as $row_items ) : ?>
				<?php
				$cols = array();
				foreach ( $row_items as $i ) {
					$w = $i['width'] ?? '1-2';
					$v = $width_map[ $w ] ?? 0.5;
					$cols[] = abs( $v - 1 / 3 ) < 0.01 ? '1fr' : ( abs( $v - 2 / 3 ) < 0.01 ? '2fr' : '1fr' );
				}
				$grid_cols = implode( ' ', $cols );
				?>
				<div class="unident-media-row" style="grid-template-columns: <?php echo esc_attr( $grid_cols ); ?>">
					<?php foreach ( $row_items as $item ) : ?>
						<?php
						$mt        = $item['media_type'] ?? 'video';
						$is_video  = $mt === 'video';
						$media_cls = $is_video ? 'unident-media-item--video' : 'unident-media-item--image';
						$has_headline = ! empty( $item['headline'] ) && is_string( $item['headline'] );
						$has_desc    = ! empty( $item['description'] ) && is_string( $item['description'] );
						?>
						<div class="unident-media-item <?php echo esc_attr( $media_cls ); ?>">
							<?php if ( $is_video && is_array( $item['video'] ?? null ) && ! empty( $item['video']['url'] ) ) : ?>
								<div class="unident-media-wrap">
									<video controls preload="metadata" playsinline>
										<source src="<?php echo esc_url( $item['video']['url'] ); ?>" type="<?php echo esc_attr( $item['video']['mime_type'] ?? 'video/mp4' ); ?>">
									</video>
								</div>
							<?php elseif ( ! $is_video && is_array( $item['image'] ?? null ) && ! empty( $item['image']['ID'] ?? 0 ) ) : ?>
								<div class="unident-media-wrap">
									<?php echo wp_get_attachment_image( $item['image']['ID'], 'large', false, array( 'class' => 'unident-media-img', 'loading' => 'lazy' ) ); ?>
								</div>
							<?php endif; ?>

							<?php if ( $has_headline ) : ?>
								<h3 class="unident-item-headline"><?php echo esc_html( $item['headline'] ); ?></h3>
							<?php endif; ?>
							<?php if ( $has_desc ) : ?>
								<p class="unident-item-description"><?php echo nl2br( esc_html( $item['description'] ) ); ?></p>
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<?php if ( $text_position === 'under_video' && ! empty( $text ) && is_string( $text ) ) : ?>
		<p class="unident-description"><?php echo nl2br( esc_html( $text ) ); ?></p>
	<?php endif; ?>
</section>
