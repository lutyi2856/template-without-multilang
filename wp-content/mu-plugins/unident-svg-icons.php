<?php
/**
 * Plugin Name: УниДент SVG Icons
 * Description: SVG upload support, dynamic icon choices from Media Library, and GraphQL iconSvg fields
 * Version: 1.0
 * Author: УниДент
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ============================================================
 * 1. SVG Upload Support
 * ============================================================
 */

/**
 * Allow SVG uploads for administrators only
 */
add_filter( 'upload_mimes', function ( $mimes ) {
	if ( current_user_can( 'administrator' ) ) {
		$mimes['svg']  = 'image/svg+xml';
		$mimes['svgz'] = 'image/svg+xml';
	}
	return $mimes;
} );

/**
 * Fix SVG MIME type check (WordPress sometimes rejects valid SVGs)
 */
add_filter( 'wp_check_filetype_and_ext', function ( $data, $file, $filename, $mimes ) {
	$ext = pathinfo( $filename, PATHINFO_EXTENSION );
	if ( 'svg' === strtolower( $ext ) ) {
		$data['type'] = 'image/svg+xml';
		$data['ext']  = 'svg';
	}
	return $data;
}, 10, 4 );

/**
 * Sanitize SVG on upload — strip dangerous tags and attributes
 */
add_filter( 'wp_handle_upload_prefilter', function ( $file ) {
	if ( 'image/svg+xml' !== $file['type'] ) {
		return $file;
	}

	$content = file_get_contents( $file['tmp_name'] );
	if ( false === $content ) {
		return $file;
	}

	$sanitized = unident_sanitize_svg( $content );
	if ( false === $sanitized ) {
		$file['error'] = __( 'SVG файл содержит недопустимый контент и не может быть загружен.', 'unident' );
		return $file;
	}

	file_put_contents( $file['tmp_name'], $sanitized );
	return $file;
} );

/**
 * Sanitize SVG content — remove scripts, event handlers, and external references
 *
 * @param string $svg Raw SVG content.
 * @return string|false Sanitized SVG or false on failure.
 */
function unident_sanitize_svg( $svg ) {
	$disallowed_tags = array(
		'script',
		'use',
		'foreignObject',
		'set',
		'animate',
		'animateTransform',
		'animateMotion',
	);

	foreach ( $disallowed_tags as $tag ) {
		$svg = preg_replace( '#<' . $tag . '\b[^>]*>.*?</' . $tag . '>#si', '', $svg );
		$svg = preg_replace( '#<' . $tag . '\b[^>]*/>#si', '', $svg );
	}

	$svg = preg_replace( '/\bon\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $svg );
	$svg = preg_replace( '/xlink:href\s*=\s*"(?!#)[^"]*"/i', '', $svg );
	$svg = preg_replace( '/href\s*=\s*"(?!#)[^"]*"/i', '', $svg );

	if ( false === stripos( $svg, '<svg' ) ) {
		return false;
	}

	return $svg;
}

/**
 * Show SVG thumbnails in Media Library
 */
add_filter( 'wp_prepare_attachment_for_js', function ( $response, $attachment ) {
	if ( 'image/svg+xml' === $response['mime'] ) {
		$svg_url = $response['url'];
		$response['sizes'] = array(
			'full'      => array(
				'url'    => $svg_url,
				'width'  => 100,
				'height' => 100,
			),
			'thumbnail' => array(
				'url'    => $svg_url,
				'width'  => 150,
				'height' => 150,
			),
			'medium'    => array(
				'url'    => $svg_url,
				'width'  => 300,
				'height' => 300,
			),
		);
	}
	return $response;
}, 10, 2 );


/**
 * ============================================================
 * 2. Dynamic ACF Icon Choices from Media Library
 * ============================================================
 */

/**
 * Built-in icon choices — backward compatible with existing iconMap in Next.js
 */
function unident_get_builtin_icon_choices() {
	return array(
		'percent'        => '% Процент (скидка)',
		'ruble'          => '₽ Рубль',
		'installment'    => 'Рассрочка',
		'whatsapp'       => 'WhatsApp',
		'vk'             => 'VKontakte',
		'telegram'       => 'Telegram',
		'instagram'      => 'Instagram',
		'facebook'       => 'Facebook',
		'google'         => 'Google Reviews',
		'yandex'         => 'Yandex',
		'star'           => '★ Звезда (рейтинг)',
		'clinic-dot'     => 'Точка (клиника)',
		'arrow-up-right' => '↗ Стрелка',
		'menu'           => 'Меню (гамбургер)',
		'menu-lines'     => 'Меню (три линии)',
		'location'       => '📍 Локация (адрес)',
		'phone'          => '📞 Телефон',
		'clock'          => '🕐 Часы (время работы)',
		'tooth'          => '🦷 Зуб (терапия)',
		'implant'        => 'Имплант',
		'orthodontics'   => 'Ортодонтия (брекеты)',
		'surgery'        => 'Хирургия',
		'hygiene'        => 'Гигиена',
		'children'       => 'Детская стоматология',
		'aesthetic'      => 'Эстетика',
		'diagnostic'     => 'Диагностика',
		'whitening'      => 'Отбеливание',
		'prosthetics'    => 'Протезирование',
		'periodontics'   => 'Пародонтология',
		'endodontics'    => 'Эндодонтия (каналы)',
		'kan-logo'       => 'KAN Logo',
	);
}

/**
 * Get SVG attachments from Media Library as choices for ACF Select
 *
 * @return array Slug => Label pairs.
 */
function unident_get_media_svg_choices() {
	$cache_key = 'unident_svg_icon_choices';
	$cached    = wp_cache_get( $cache_key );
	if ( false !== $cached ) {
		return $cached;
	}

	$svgs = get_posts( array(
		'post_type'      => 'attachment',
		'post_mime_type' => 'image/svg+xml',
		'posts_per_page' => 200,
		'post_status'    => 'inherit',
		'orderby'        => 'title',
		'order'          => 'ASC',
	) );

	$choices = array();
	foreach ( $svgs as $svg ) {
		$slug = 'media-' . $svg->ID;
		$title = $svg->post_title ?: pathinfo( get_attached_file( $svg->ID ), PATHINFO_FILENAME );
		$choices[ $slug ] = '📎 ' . $title;
	}

	wp_cache_set( $cache_key, $choices, '', 300 );
	return $choices;
}

/**
 * Merge built-in + media library choices into a grouped list
 */
function unident_get_all_icon_choices() {
	$builtin = unident_get_builtin_icon_choices();
	$media   = unident_get_media_svg_choices();

	if ( empty( $media ) ) {
		return $builtin;
	}

	return array(
		'Встроенные иконки'                   => $builtin,
		'Пользовательские (из Media Library)' => $media,
	);
}

/**
 * Invalidate SVG choices cache when attachments change
 */
add_action( 'add_attachment', function () {
	wp_cache_delete( 'unident_svg_icon_choices' );
} );
add_action( 'delete_attachment', function () {
	wp_cache_delete( 'unident_svg_icon_choices' );
} );
add_action( 'edit_attachment', function () {
	wp_cache_delete( 'unident_svg_icon_choices' );
} );

/**
 * ACF field keys for all icon Select fields
 */
function unident_get_icon_field_keys() {
	return array(
		'field_header_logo_icon',
		'field_footer_logo_icon',
		'field_social_icon',
		'field_footer_social_icon',
		'field_social_contact_icon',  // Contacts option page — social networks
		'field_contacts_adv_item_icon',
		'field_menu_icon',
		'field_promotion_action_icon',
		'field_service_category_icon',
		'field_service_icon',       // Service CPT — иконка услуги
		'field_mainpage_pref_icon',  // Preferences block (StatsBlock) — Главная → Преимущества
	);
}

/**
 * Inject dynamic choices into all icon Select fields
 */
add_filter( 'acf/load_field', function ( $field ) {
	if ( ! in_array( $field['key'], unident_get_icon_field_keys(), true ) ) {
		return $field;
	}

	$all_choices = unident_get_all_icon_choices();
	if ( 'field_header_logo_icon' === $field['key'] || 'field_footer_logo_icon' === $field['key'] ) {
		$field['choices'] = array_merge( array( '' => '— Не выбрано —' ), $all_choices );
	} else {
		$field['choices'] = $all_choices;
	}
	return $field;
} );


/**
 * ============================================================
 * 3. GraphQL: iconSvg companion fields
 * ============================================================
 */

/**
 * Resolve SVG content by icon slug.
 * - Built-in icons: return null (frontend renders from iconMap).
 * - Media icons (media-{ID}): read file and return SVG markup.
 *
 * @param string|null $icon_slug The icon value stored in ACF.
 * @return string|null SVG markup or null.
 */
function unident_resolve_icon_svg( $icon_slug ) {
	if ( empty( $icon_slug ) ) {
		return null;
	}

	if ( 0 !== strpos( $icon_slug, 'media-' ) ) {
		return null;
	}

	$attachment_id = (int) str_replace( 'media-', '', $icon_slug );
	if ( $attachment_id <= 0 ) {
		return null;
	}

	$file = get_attached_file( $attachment_id );
	if ( ! $file || ! file_exists( $file ) ) {
		return null;
	}

	$mime = get_post_mime_type( $attachment_id );
	if ( 'image/svg+xml' !== $mime ) {
		return null;
	}

	$svg = file_get_contents( $file );
	return $svg ?: null;
}

/**
 * Register iconSvg fields in GraphQL for Option Page types
 */
add_action( 'graphql_register_types', function () {
	if ( ! function_exists( 'register_graphql_field' ) ) {
		return;
	}

	// --- Header Settings: logoIconSvg ---
	register_graphql_field( 'HeaderSettings', 'logoIconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for logo icon from Media Library',
		'resolve'     => function ( $source ) {
			$icon = $source['logoIcon'] ?? $source['logo_icon'] ?? null;
			if ( empty( $icon ) && function_exists( 'get_field' ) ) {
				$icon = get_field( 'logo_icon', 'options' );
			}
			return unident_resolve_icon_svg( $icon );
		},
	) );

	// --- Header Settings: socialLinks[].iconSvg ---
	register_graphql_field( 'HeaderSettingsSocialLink', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for custom icons from Media Library',
		'resolve'     => function ( $source ) {
			$icon = $source['icon'] ?? null;
			return unident_resolve_icon_svg( $icon );
		},
	) );

	// --- Footer Settings: logoIconSvg ---
	register_graphql_field( 'FooterSettings', 'logoIconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for footer logo icon from Media Library',
		'resolve'     => function ( $source ) {
			$icon = $source['logoIcon'] ?? $source['logo_icon'] ?? null;
			if ( empty( $icon ) && function_exists( 'get_field' ) ) {
				$icon = get_field( 'logo_icon', 'footer_options' );
			}
			return unident_resolve_icon_svg( $icon );
		},
	) );

	// --- Footer Settings: socialLinks[].iconSvg ---
	register_graphql_field( 'FooterSettingsSocialLink', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for custom icons from Media Library',
		'resolve'     => function ( $source ) {
			$icon = $source['icon'] ?? null;
			return unident_resolve_icon_svg( $icon );
		},
	) );

	// --- Contacts Settings: socialContacts[].iconSvg ---
	register_graphql_field( 'ContactsSocialContact', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for custom icons from Media Library',
		'resolve'     => function ( $source ) {
			$icon = $source['icon'] ?? null;
			return unident_resolve_icon_svg( $icon );
		},
	) );

	// --- Contacts Settings: advItems[].iconSvg ---
	register_graphql_field( 'ContactsAdvantageItem', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for custom icons from Media Library',
		'resolve'     => function ( $source ) {
			$icon = $source['icon'] ?? null;
			return unident_resolve_icon_svg( $icon );
		},
	) );

	// --- MenuItem: iconSvg ---
	register_graphql_field( 'MenuItem', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for custom icons from Media Library',
		'resolve'     => function ( $menu_item ) {
			$post_id = $menu_item->databaseId ?? null;
			if ( ! $post_id ) {
				return null;
			}
			$icon_slug = get_post_meta( $post_id, 'icon', true );
			return unident_resolve_icon_svg( $icon_slug );
		},
	) );

	// --- Promotion: actionIconSvg ---
	register_graphql_field( 'Promotion', 'actionIconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for promotion action icon from Media Library',
		'resolve'     => function ( $post ) {
			$post_id = $post->databaseId ?? $post->ID ?? null;
			if ( ! $post_id ) {
				return null;
			}
			$icon_slug = get_post_meta( $post_id, 'action_icon', true );
			return unident_resolve_icon_svg( $icon_slug );
		},
	) );

	// --- ServiceCategory: iconSvg ---
	register_graphql_field( 'ServiceCategory', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for service category icon from Media Library',
		'resolve'     => function ( $term ) {
			$term_id = $term->databaseId ?? null;
			if ( ! $term_id ) {
				return null;
			}
			$icon_slug = get_term_meta( $term_id, 'category_icon', true );
			return unident_resolve_icon_svg( $icon_slug );
		},
	) );

	// --- Service: iconSvg ---
	register_graphql_field( 'Service', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for service icon from Media Library',
		'resolve'     => function ( $post ) {
			$post_id = $post->databaseId ?? $post->ID ?? null;
			if ( ! $post_id ) {
				return null;
			}
			$icon_slug = get_post_meta( $post_id, 'service_icon', true );
			return unident_resolve_icon_svg( $icon_slug );
		},
	) );

	// --- MainPagePreferenceItem: iconSvg (Preferences block / StatsBlock) ---
	register_graphql_field( 'MainPagePreferenceItem', 'iconSvg', array(
		'type'        => 'String',
		'description' => 'Inline SVG markup for custom icons from Media Library',
		'resolve'     => function ( $source ) {
			$icon = $source['icon'] ?? null;
			return unident_resolve_icon_svg( $icon );
		},
	) );
} );
