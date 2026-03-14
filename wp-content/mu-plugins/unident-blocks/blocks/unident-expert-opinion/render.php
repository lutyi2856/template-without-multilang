<?php
/**
 * Block: Мнение эксперта (unident-expert-opinion)
 * Preview для WordPress admin.
 */

$heading      = get_field( 'heading' );
$quote        = get_field( 'quote' );
$doctor_rel   = get_field( 'doctor' );
$custom_image = get_field( 'custom_image' );

if ( empty( $heading ) && empty( $quote ) ) {
	return;
}

$doctor = null;
if ( $doctor_rel && is_array( $doctor_rel ) && ! empty( $doctor_rel[0] ) ) {
	$d = $doctor_rel[0];
	$doctor = array(
		'name'       => get_the_title( $d ),
		'specialty'  => '',
		'experience' => '',
		'image'      => get_the_post_thumbnail_url( $d instanceof WP_Post ? $d->ID : $d, 'medium' ),
	);
	$specs = wp_get_object_terms( $d instanceof WP_Post ? $d->ID : $d, 'doctor_specializations' );
	if ( ! is_wp_error( $specs ) && ! empty( $specs ) ) {
		$doctor['specialty'] = implode( ', ', wp_list_pluck( $specs, 'name' ) );
	}
	$exp = get_field( 'experience', $d instanceof WP_Post ? $d->ID : $d );
	if ( $exp ) {
		$doctor['experience'] = $exp;
	}
}

$block_id = unident_get_block_id( $block, 'unident-expert-opinion' );
?>
<section id="<?php echo esc_attr( $block_id ); ?>" class="unident-block unident-expert-opinion" style="padding:24px; background:#F5F7F9; border-radius:25px; <?php echo esc_attr( unident_get_block_margin() ); ?>">
	<?php if ( ! empty( $heading ) ) : ?>
		<h2 style="margin-bottom:16px;"><?php echo esc_html( $heading ); ?></h2>
	<?php endif; ?>

	<div style="display:flex; gap:24px; flex-wrap:wrap;">
		<div style="flex:1; min-width:300px;">
			<?php if ( ! empty( $quote ) ) : ?>
				<blockquote style="font-style:italic; border-left:3px solid #526AC2; padding-left:16px; margin:0 0 16px;">
					<?php echo esc_html( $quote ); ?>
				</blockquote>
			<?php endif; ?>

			<?php if ( $doctor ) : ?>
				<div style="display:flex; gap:12px; align-items:center; padding:16px; background:#fff; border-radius:15px;">
					<?php if ( $doctor['image'] ) : ?>
						<img src="<?php echo esc_url( $doctor['image'] ); ?>" alt="<?php echo esc_attr( $doctor['name'] ); ?>" style="width:64px; height:64px; border-radius:50%; object-fit:cover;">
					<?php endif; ?>
					<div>
						<strong><?php echo esc_html( $doctor['name'] ); ?></strong>
						<?php if ( $doctor['specialty'] ) : ?>
							<div style="color:#8F8F8F; font-size:14px;"><?php echo esc_html( $doctor['specialty'] ); ?></div>
						<?php endif; ?>
						<?php if ( $doctor['experience'] ) : ?>
							<div style="color:#8F8F8F; font-size:14px;">Стаж: <?php echo esc_html( function_exists( 'unident_format_experience_years' ) ? unident_format_experience_years( $doctor['experience'] ) : $doctor['experience'] ); ?></div>
						<?php endif; ?>
					</div>
				</div>
			<?php endif; ?>
		</div>

		<?php
		$img_url = null;
		if ( $custom_image && is_array( $custom_image ) && ! empty( $custom_image['url'] ) ) {
			$img_url = $custom_image['url'];
		} elseif ( $doctor && $doctor['image'] ) {
			$img_url = $doctor['image'];
		}
		if ( $img_url ) : ?>
			<div style="flex:0 0 200px;">
				<img src="<?php echo esc_url( $img_url ); ?>" alt="" style="width:100%; border-radius:15px; object-fit:cover;">
			</div>
		<?php endif; ?>
	</div>
</section>
