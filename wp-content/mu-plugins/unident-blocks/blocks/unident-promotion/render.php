<?php
/**
 * Block: Промо-слайдер акций (unident-promotion)
 * Headless: рендер в Next.js с Embla Carousel.
 * Один слайд виден, только точки пагинации. Ссылка из поста или вручную.
 * Два изображения: desktop+tablet и mobile.
 *
 * @param array  $block     Block settings and attributes.
 * @param string $content   Block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id   Post ID.
 */

$slides_raw = get_field( 'unident_promotion_slides' );
$slides     = array();

if ( is_array( $slides_raw ) && ! empty( $slides_raw ) ) {
	foreach ( $slides_raw as $row ) {
		$desktop = isset( $row['image_desktop'] ) && is_array( $row['image_desktop'] ) && ! empty( $row['image_desktop']['ID'] )
			? (int) $row['image_desktop']['ID']
			: 0;
		$mobile  = isset( $row['image_mobile'] ) && is_array( $row['image_mobile'] ) && ! empty( $row['image_mobile']['ID'] )
			? (int) $row['image_mobile']['ID']
			: 0;
		if ( $desktop === 0 && $mobile === 0 ) {
			continue;
		}
		$use_dynamic = ! empty( $row['use_dynamic_data'] );
		$link        = '';
		if ( $use_dynamic && ! empty( $row['post_select'] ) ) {
			$post_obj = $row['post_select'];
			if ( is_object( $post_obj ) && isset( $post_obj->ID ) ) {
				$link = get_permalink( $post_obj->ID );
			} elseif ( is_numeric( $post_obj ) ) {
				$link = get_permalink( (int) $post_obj );
			}
		} else {
			$link = isset( $row['manual_link'] ) && is_string( $row['manual_link'] ) ? trim( $row['manual_link'] ) : '';
		}
		$slides[] = array(
			'link'             => $link,
			'image_desktop_id' => $desktop,
			'image_mobile_id'  => $mobile ?: $desktop,
		);
	}
}

$has_content = ! empty( $slides );

if ( ! $has_content ) {
	if ( ! empty( $is_preview ) ) {
		echo '<div class="unident-block-placeholder" style="padding:40px;background:#f0f0f0;text-align:center;border:2px dashed #ccc;">';
		echo '<p style="margin:0;color:#666;">Блок «Промо-слайдер акций»</p>';
		echo '<p style="margin:5px 0 0;color:#999;font-size:12px;">Добавьте слайды в панели справа</p>';
		echo '</div>';
	}
	return;
}

$block_id   = unident_get_block_id( $block, 'unident-promotion' );
$class_name = 'unident-block unident-promotion';
if ( ! empty( $block['className'] ) ) {
	$class_name .= ' ' . esc_attr( $block['className'] );
}
if ( ! empty( $block['align'] ) ) {
	$class_name .= ' align' . esc_attr( $block['align'] );
}
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="<?php echo esc_attr( $class_name ); ?>" style="<?php echo esc_attr( unident_get_block_margin() ); ?>">
	<div class="unident-promotion-container">
		<?php foreach ( $slides as $slide ) : ?>
			<?php
			$href        = $slide['link'] !== '' ? $slide['link'] : '';
			$desktop_id  = $slide['image_desktop_id'];
			$mobile_id   = $slide['image_mobile_id'];
			$desktop_src = $desktop_id ? wp_get_attachment_image_url( $desktop_id, 'large' ) : '';
			$mobile_src  = $mobile_id ? wp_get_attachment_image_url( $mobile_id, 'medium_large' ) : $desktop_src;
			$img_src     = $desktop_src !== '' ? $desktop_src : $mobile_src;
			if ( $img_src === '' ) {
				continue;
			}
			$show_mobile_source = $mobile_src !== '' && $mobile_id !== $desktop_id;
			?>
			<div class="unident-promotion-slide">
				<?php if ( $href !== '' ) : ?>
					<a href="<?php echo esc_url( $href ); ?>" class="unident-promotion-slide-link">
				<?php endif; ?>
				<div class="unident-promotion-slide-media">
					<picture>
						<?php if ( $show_mobile_source ) : ?>
							<source media="(max-width: 768px)" srcset="<?php echo esc_url( $mobile_src ); ?>">
						<?php endif; ?>
						<img src="<?php echo esc_url( $img_src ); ?>" alt="" class="unident-promotion-slide-img" width="1220" height="177" loading="lazy">
					</picture>
				</div>
				<?php if ( $href !== '' ) : ?>
					</a>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>
</section>
