<?php
/**
 * Plugin Name: УниДент — Content Blocks GraphQL
 * Description: Expose parsed Gutenberg blocks as structured GraphQL field on Post type
 * Version: 1.0.0
 *
 * Adds `contentBlocks` field to the Post and Service GraphQL types.
 * Each block returns { name, attributes } where attributes is a JSON string
 * with fully resolved ACF field values (images → URLs, relationships → objects).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'graphql_register_types', 'unident_register_content_blocks_graphql' );

function unident_register_content_blocks_graphql() {
	if ( ! function_exists( 'register_graphql_object_type' ) ) {
		return;
	}

	register_graphql_object_type( 'ContentBlock', array(
		'description' => 'Parsed Gutenberg block with resolved ACF attributes',
		'fields'      => array(
			'name'       => array(
				'type'        => 'String',
				'description' => 'Block name (e.g. acf/unident-text)',
			),
			'attributes' => array(
				'type'        => 'String',
				'description' => 'JSON string with block attributes / ACF field values',
			),
		),
	) );

	register_graphql_field( 'Post', 'contentBlocks', array(
		'type'        => array( 'list_of' => 'ContentBlock' ),
		'description' => 'Parsed Gutenberg content blocks with resolved ACF data',
		'resolve'     => function ( $post ) {
			$post_id = $post->databaseId ?? $post->ID ?? null;
			return $post_id ? unident_resolve_content_blocks_for_post( $post_id ) : array();
		},
	) );

	register_graphql_field( 'Service', 'contentBlocks', array(
		'type'        => array( 'list_of' => 'ContentBlock' ),
		'description' => 'Parsed Gutenberg content blocks with resolved ACF data',
		'resolve'     => function ( $service ) {
			$post_id = $service->databaseId ?? $service->ID ?? null;
			return $post_id ? unident_resolve_content_blocks_for_post( $post_id ) : array();
		},
	) );
}

/**
 * Resolve content blocks for any post type (Post, Service, etc.).
 *
 * @param int $post_id Post ID (databaseId).
 * @return array List of { name, attributes }.
 */
function unident_resolve_content_blocks_for_post( $post_id ) {
	$raw = get_post( $post_id );
	if ( ! $post_id || ! $raw || empty( $raw->post_content ) ) {
		return array();
	}

	$parsed = parse_blocks( $raw->post_content );
	$result = array();

	foreach ( $parsed as $block ) {
		if ( empty( $block['blockName'] ) ) {
			continue;
		}

		$attrs = unident_resolve_block_attributes( $block, $raw->ID );

		$result[] = array(
			'name'       => $block['blockName'],
			'attributes' => wp_json_encode( $attrs, JSON_UNESCAPED_UNICODE ),
		);
	}

	return $result;
}

/**
 * Resolve block attributes, enriching ACF data with full objects.
 */
function unident_resolve_block_attributes( $block, $post_id ) {
	$name = $block['blockName'];

	if ( strpos( $name, 'acf/' ) !== 0 ) {
		return array(
			'innerHTML' => trim( $block['innerHTML'] ?? '' ),
		);
	}

	$data = $block['attrs']['data'] ?? array();

	if ( empty( $data ) ) {
		return array();
	}

	acf_setup_meta( $data, $block['attrs']['id'] ?? uniqid( 'block_' ), true );

	$resolved = array();

	switch ( $name ) {
		case 'acf/unident-text':
			$resolved = unident_resolve_text_block();
			$resolved['anchorId'] = ! empty( $block['attrs']['anchor'] ) ? sanitize_title( $block['attrs']['anchor'] ) : ( get_field( 'anchor_id' ) ?: '' );
			break;

		case 'acf/unident-toc':
			$resolved = unident_resolve_toc_block();
			break;

		case 'acf/unident-universal':
			$resolved = unident_resolve_universal_block();
			$resolved['anchorId'] = ! empty( $block['attrs']['anchor'] ) ? sanitize_title( $block['attrs']['anchor'] ) : ( get_field( 'anchor_id' ) ?: '' );
			break;

		case 'acf/unident-important':
			$resolved = unident_resolve_important_block();
			$resolved['anchorId'] = ! empty( $block['attrs']['anchor'] ) ? sanitize_title( $block['attrs']['anchor'] ) : ( get_field( 'anchor_id' ) ?: '' );
			break;

		case 'acf/unident-list':
			$resolved = unident_resolve_list_block();
			$resolved['anchorId'] = ! empty( $block['attrs']['anchor'] ) ? sanitize_title( $block['attrs']['anchor'] ) : ( get_field( 'anchor_id' ) ?: '' );
			break;

		case 'acf/unident-expert-opinion':
			$resolved = unident_resolve_expert_block();
			$resolved['anchorId'] = ! empty( $block['attrs']['anchor'] ) ? sanitize_title( $block['attrs']['anchor'] ) : ( get_field( 'anchor_id' ) ?: '' );
			break;

		case 'acf/unident-title-text':
			$resolved = unident_resolve_title_text_block();
			break;

		case 'acf/unident-numbered-list':
			$resolved = unident_resolve_numbered_list_block();
			break;

		case 'acf/unident-readings':
			$resolved = unident_resolve_readings_block();
			break;

		case 'acf/unident-video':
			$resolved = unident_resolve_video_block();
			break;

		case 'acf/unident-quote':
			$resolved = unident_resolve_quote_block();
			break;

		case 'acf/unident-table':
			$resolved = unident_resolve_table_block();
			break;

		case 'acf/unident-image-text':
			$resolved = unident_resolve_image_text_block();
			break;

		case 'acf/unident-advantages':
			$resolved = unident_resolve_advantages_block();
			break;

		case 'acf/unident-faq':
			$resolved = unident_resolve_faq_block();
			break;

		case 'acf/unident-cta':
			$resolved = unident_resolve_cta_block();
			break;

		case 'acf/unident-cta-form':
			$resolved = unident_resolve_cta_form_block();
			break;

		case 'acf/unident-sta-logo':
			$resolved = unident_resolve_sta_logo_block();
			break;

		case 'acf/unident-slider-image':
			$resolved = unident_resolve_slider_image_block();
			break;

		case 'acf/unident-licences':
			$resolved = unident_resolve_licences_block();
			break;

		case 'acf/unident-promotion':
			$resolved = unident_resolve_promotion_block();
			break;

		case 'acf/unident-service-prices':
			$resolved = unident_resolve_service_prices_block();
			break;

		case 'acf/unident-anchor-nav':
			$resolved = unident_resolve_anchor_nav_block();
			break;

		case 'acf/unident-expert-kb':
			$resolved = unident_resolve_expert_kb_block();
			break;

		default:
			$resolved = $data;
			break;
	}

	acf_reset_meta( $block['attrs']['id'] ?? '' );

	return $resolved;
}

/* ─── Individual block resolvers ──────────────────────────── */

function unident_resolve_text_block() {
	return array(
		'heading'   => get_field( 'heading' ) ?: '',
		'headingTag' => get_field( 'heading_tag' ) ?: 'h2',
		'content'   => get_field( 'content' ) ?: '',
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_toc_block() {
	$items = get_field( 'items' );
	$resolved_items = array();

	if ( is_array( $items ) ) {
		foreach ( $items as $item ) {
			$resolved_items[] = array(
				'anchorId' => $item['anchor_id'] ?? '',
				'label'    => $item['label'] ?? '',
			);
		}
	}

	return array(
		'heading' => get_field( 'heading' ) ?: 'Содержание',
		'items'   => $resolved_items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_universal_block() {
	$components = get_field( 'components' );
	$resolved   = array();

	if ( is_array( $components ) ) {
		foreach ( $components as $comp ) {
			$entry = array(
				'type'      => $comp['type'] ?? 'text_regular',
				'sortOrder' => (int) ( $comp['sort_order'] ?? 0 ),
			);

			$type = $entry['type'];

			if ( $type === 'text_regular' || $type === 'text_highlight' ) {
				$entry['textContent'] = $comp['text_content'] ?? '';
			} elseif ( $type === 'bullet_list' ) {
				$list = array();
				if ( ! empty( $comp['list_items'] ) && is_array( $comp['list_items'] ) ) {
					foreach ( $comp['list_items'] as $li ) {
						$list[] = $li['item_text'] ?? '';
					}
				}
				$entry['listItems'] = $list;
				$entry['icon']      = $comp['list_marker'] ?? 'dot';
			} elseif ( $type === 'image' ) {
				$entry['image'] = unident_resolve_image_field( $comp['image'] ?? null );
			}

			$resolved[] = $entry;
		}

		usort( $resolved, function ( $a, $b ) {
			return $a['sortOrder'] - $b['sortOrder'];
		} );
	}

	return array(
		'heading'    => get_field( 'heading' ) ?: '',
		'components' => $resolved,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_important_block() {
	return array(
		'heading'    => get_field( 'heading' ) ?: 'Важно!',
		'smallImage' => unident_resolve_image_field( get_field( 'small_image' ) ),
		'content'    => get_field( 'content' ) ?: '',
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_list_block() {
	$items    = get_field( 'items' );
	$resolved = array();

	if ( is_array( $items ) ) {
		foreach ( $items as $item ) {
			$entry = array(
				'number'          => $item['number'] ?? '',
				'itemHeading'     => $item['item_heading'] ?? '',
				'itemDescription' => $item['item_description'] ?? '',
				'serviceLink'     => null,
			);

			$svc = $item['service_link'] ?? null;
			if ( $svc && is_array( $svc ) && ! empty( $svc[0] ) ) {
				$svc_post = $svc[0];
				$svc_id   = $svc_post instanceof WP_Post ? $svc_post->ID : (int) $svc_post;
				$entry['serviceLink'] = array(
					'title' => get_the_title( $svc_id ),
					'slug'  => get_post_field( 'post_name', $svc_id ),
				);
			}

			$resolved[] = $entry;
		}
	}

	return array(
		'heading'     => get_field( 'heading' ) ?: '',
		'description' => get_field( 'description' ) ?: '',
		'listType'    => get_field( 'list_type' ) ? 'numbered' : 'bulleted',
		'marker'      => get_field( 'list_type' ) ? null : ( get_field( 'list_marker' ) ?: 'dot' ),
		'items'       => $resolved,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_title_text_block() {
	return array(
		'title'       => get_field( 'unident_title_text_title' ) ?: '',
		'tag'         => get_field( 'unident_title_text_tag' ) ?: 'h2',
		'description' => get_field( 'unident_title_text_description' ) ?: '',
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_numbered_list_block() {
	$items_raw = get_field( 'unident_numbered_list_items' );
	$items     = array();

	if ( is_array( $items_raw ) ) {
		foreach ( $items_raw as $it ) {
			$items[] = array(
				'number' => $it['repeater_num'] ?? '',
				'text'   => $it['repeater_text'] ?? '',
			);
		}
	}

	return array(
		'title'       => get_field( 'unident_numbered_list_title' ) ?: '',
		'h3'          => get_field( 'unident_numbered_list_h3' ) ?: '',
		'h4'          => get_field( 'unident_numbered_list_h4' ) ?: '',
		'description' => get_field( 'unident_numbered_list_description' ) ?: '',
		'listType'     => get_field( 'unident_numbered_list_type' ) ? 'numbered' : 'bulleted',
		'marker'      => get_field( 'unident_numbered_list_marker' ) ?: 'checkmark',
		'items'       => $items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_readings_block() {
	$items_raw = get_field( 'unident_readings_items' );
	$items     = array();

	if ( is_array( $items_raw ) ) {
		foreach ( $items_raw as $it ) {
			if ( ! empty( $it['item_text'] ) ) {
				$items[] = array( 'itemText' => $it['item_text'] );
			}
		}
	}

	return array(
		'title'       => get_field( 'unident_readings_title' ) ?: '',
		'description' => get_field( 'unident_readings_description' ) ?: '',
		'icon'        => get_field( 'unident_readings_icon' ) ?: 'dot',
		'items'       => $items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_video_block() {
	$items_raw = get_field( 'unident_video_items' );
	$items     = array();

	if ( is_array( $items_raw ) ) {
		foreach ( $items_raw as $it ) {
			$mt = $it['media_type'] ?? 'video';
			$entry = array(
				'mediaType'   => $mt,
				'headline'    => $it['headline'] ?? '',
				'description' => $it['description'] ?? '',
				'width'       => $it['width'] ?? '1-2',
			);

			if ( $mt === 'video' && is_array( $it['video'] ?? null ) && ! empty( $it['video']['url'] ) ) {
				$entry['videoUrl'] = $it['video']['url'];
				$entry['videoMime'] = $it['video']['mime_type'] ?? 'video/mp4';
			} elseif ( $mt === 'image' && is_array( $it['image'] ?? null ) && ! empty( $it['image']['ID'] ?? 0 ) ) {
				$entry['image'] = unident_resolve_image_field( $it['image'] );
			} else {
				continue;
			}

			$items[] = $entry;
		}
	}

	return array(
		'title'        => get_field( 'unident_video_title' ) ?: '',
		'text'         => get_field( 'unident_video_text' ) ?: '',
		'textPosition' => get_field( 'unident_video_text_position' ) ?: 'under_title',
		'items'        => $items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_quote_block() {
	return array(
		'title' => get_field( 'unident_quote_title' ) ?: '',
		'text'  => get_field( 'unident_quote_text' ) ?: '',
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_table_block() {
	$shortcode = get_field( 'unident_table_shortcode' );

	return array(
		'title'       => get_field( 'unident_table_title' ) ?: '',
		'description' => get_field( 'unident_table_description' ) ?: '',
		'tableHtml'   => ! empty( $shortcode ) && is_string( $shortcode ) ? do_shortcode( $shortcode ) : '',
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_image_text_block() {
	$image = get_field( 'unident_image_text_image' );

	return array(
		'title'               => get_field( 'unident_image_text_title' ) ?: '',
		'image'               => unident_resolve_image_field( $image ),
		'description'         => get_field( 'unident_image_text_description' ) ?: '',
		'layout'              => get_field( 'unident_image_text_layout' ) ?: 'left',
		'descriptionPosition' => get_field( 'unident_image_text_description_position' ) ?: 'under_image',
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_advantages_block() {
	$items_raw = get_field( 'unident_advantages_items' );
	$items     = array();

	if ( is_array( $items_raw ) ) {
		foreach ( $items_raw as $it ) {
			$items[] = array(
				'num'   => $it['item_num'] ?? '',
				'title' => $it['item_title'] ?? '',
				'text'  => $it['item_text'] ?? '',
			);
		}
	}

	return array(
		'title'       => get_field( 'unident_advantages_title' ) ?: '',
		'description' => get_field( 'unident_advantages_description' ) ?: '',
		'items'       => $items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_faq_block() {
	$items_raw = get_field( 'unident_faq_items' );
	$items     = array();

	if ( is_array( $items_raw ) ) {
		foreach ( $items_raw as $it ) {
			$items[] = array(
				'question' => $it['question'] ?? '',
				'answer'   => $it['answer'] ?? '',
			);
		}
	}

	return array(
		'title' => get_field( 'unident_faq_title' ) ?: '',
		'items' => $items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_cta_block() {
	return array(
		'title'       => get_field( 'unident_cta_title' ) ?: '',
		'description' => get_field( 'unident_cta_description' ) ?: '',
		'urlPaid'     => get_field( 'unident_cta_url_paid' ) ?: '/zapis',
		'urlOms'      => get_field( 'unident_cta_url_oms' ) ?: '',
		'showPaid'    => get_field( 'unident_cta_show_paid' ) !== false,
		'showOms'     => get_field( 'unident_cta_show_oms' ) === true || get_field( 'unident_cta_show_oms' ) === 1,
		'showCallback' => get_field( 'unident_cta_show_callback' ) === true || get_field( 'unident_cta_show_callback' ) === 1,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_cta_form_block() {
	$bg = get_field( 'unident_cta_form_bg_image' );

	return array(
		'title'       => get_field( 'unident_cta_form_title' ) ?: '',
		'description' => get_field( 'unident_cta_form_description' ) ?: '',
		'bgImage'     => unident_resolve_image_field( $bg ),
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_slider_image_block() {
	$images_raw = get_field( 'unident_slider_image_images' );
	$images     = array();

	if ( is_array( $images_raw ) && ! empty( $images_raw ) ) {
		foreach ( $images_raw as $img ) {
			if ( is_array( $img ) && ! empty( $img['ID'] ) ) {
				$resolved = unident_resolve_image_field( $img );
				if ( $resolved ) {
					$images[] = $resolved;
				}
			}
		}
	}

	return array(
		'title'  => get_field( 'unident_slider_image_title' ) ?: '',
		'text'   => get_field( 'unident_slider_image_text' ) ?: '',
		'images' => $images,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_licences_block() {
	$items_raw = get_field( 'unident_licences_items' );
	$items     = array();

	if ( is_array( $items_raw ) && ! empty( $items_raw ) ) {
		foreach ( $items_raw as $it ) {
			$img = $it['item_image'] ?? null;
			$entry = array(
				'itemTitle'       => isset( $it['item_title'] ) ? trim( (string) $it['item_title'] ) : '',
				'itemDescription' => isset( $it['item_description'] ) ? trim( (string) $it['item_description'] ) : '',
				'image'           => unident_resolve_image_field( $img ),
			);
			$items[] = $entry;
		}
	}

	return array(
		'title' => get_field( 'unident_licences_title' ) ?: 'Наши лицензии',
		'items' => $items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_promotion_block() {
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
			$desktop_img = unident_resolve_image_field( $row['image_desktop'] ?? null );
			$mobile_img  = ( $mobile && $mobile !== $desktop ) ? unident_resolve_image_field( $row['image_mobile'] ?? null ) : $desktop_img;
			$slides[]    = array(
				'link'         => $link,
				'imageDesktop' => $desktop_img,
				'imageMobile'   => $mobile_img ?: $desktop_img,
			);
		}
	}

	return array(
		'slides' => $slides,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_sta_logo_block() {
	$logo = get_field( 'unident_sta_logotype' );

	return array(
		'title'       => get_field( 'unident_sta_title' ) ?: '',
		'description' => get_field( 'unident_sta_description' ) ?: '',
		'logotype'    => unident_resolve_image_field( $logo ),
		'urlPaid'     => get_field( 'unident_sta_url_paid' ) ?: '/zapis',
		'urlOms'      => get_field( 'unident_sta_url_oms' ) ?: '',
		'showPaid'    => get_field( 'unident_sta_show_paid' ) !== false,
		'showOms'     => get_field( 'unident_sta_show_oms' ) === true || get_field( 'unident_sta_show_oms' ) === 1,
		'showCallback' => get_field( 'unident_sta_show_callback' ) === true || get_field( 'unident_sta_show_callback' ) === 1,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_service_prices_block() {
	$service_obj = get_field( 'unident_service_prices_service' );
	$service_id  = 0;
	if ( $service_obj ) {
		if ( is_array( $service_obj ) && ! empty( $service_obj[0] ) ) {
			$service_id = $service_obj[0] instanceof WP_Post ? $service_obj[0]->ID : (int) $service_obj[0];
		} elseif ( $service_obj instanceof WP_Post ) {
			$service_id = $service_obj->ID;
		} elseif ( is_numeric( $service_obj ) ) {
			$service_id = (int) $service_obj;
		}
	}

	$prices     = array();
	$focus_price = null;

	if ( $service_id && get_post_type( $service_id ) === 'services' ) {
		$focus_prices = get_field( 'focus_prices', $service_id );
		$related      = get_field( 'related_prices', $service_id );

		$price_ids = array();
		if ( is_array( $focus_prices ) && ! empty( $focus_prices ) ) {
			foreach ( $focus_prices as $p ) {
				$pid = $p instanceof WP_Post ? $p->ID : ( is_numeric( $p ) ? (int) $p : 0 );
				if ( $pid ) {
					$price_ids[] = $pid;
				}
			}
		}
		if ( is_array( $related ) ) {
			foreach ( $related as $p ) {
				$pid = $p instanceof WP_Post ? $p->ID : ( is_numeric( $p ) ? (int) $p : 0 );
				if ( $pid && ! in_array( $pid, $price_ids, true ) ) {
					$price_ids[] = $pid;
				}
			}
		}

		$focus_id = ! empty( $price_ids ) ? $price_ids[0] : null;
		foreach ( $price_ids as $pid ) {
			$title   = get_the_title( $pid );
			$regular = get_field( 'regular_price', $pid );
			$promo   = get_field( 'promo_price', $pid );
			$currency = get_field( 'currency', $pid ) ?: '₽';
			$price_val = $promo ? (float) $promo : ( $regular ? (float) $regular : null );
			$price_str = $price_val !== null ? number_format( $price_val, 0, '', ' ' ) : '';

			$entry = array(
				'uid'    => (string) $pid,
				'name'   => $title ?: '',
				'price'  => $price_str,
				'currency' => $currency,
			);
			$prices[] = $entry;
			if ( $focus_id === $pid ) {
				$focus_price = $entry;
			}
		}
		if ( ! $focus_price && ! empty( $prices ) ) {
			$focus_price = $prices[0];
		}
	}

	$headline = get_field( 'unident_service_prices_headline_override' ) ?: ( $service_id ? get_the_title( $service_id ) : '' );

	return array(
		'sectionTitle' => get_field( 'unident_service_prices_section_title' ) ?: 'Цены',
		'headline'     => $headline,
		'prices'       => $prices,
		'focusPrice'   => $focus_price,
		'urlPaid'      => get_field( 'unident_service_prices_url_paid' ) ?: '/zapis',
		'urlOms'       => get_field( 'unident_service_prices_url_oms' ) ?: '',
		'showPaid'     => get_field( 'unident_service_prices_show_paid' ) !== false,
		'showOms'      => get_field( 'unident_service_prices_show_oms' ) === true || get_field( 'unident_service_prices_show_oms' ) === 1,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_anchor_nav_block() {
	$items_raw = get_field( 'unident_anchor_nav_items' );
	$items     = array();

	if ( is_array( $items_raw ) ) {
		foreach ( $items_raw as $it ) {
			$text   = $it['nav_item_text'] ?? '';
			$anchor = $it['nav_item_anchor'] ?? '';
			if ( empty( $text ) || empty( $anchor ) ) {
				continue;
			}
			$items[] = array(
				'text'   => $text,
				'anchor' => sanitize_title( $anchor ),
			);
		}
	}

	return array(
		'items' => $items,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_expert_kb_block() {
	$data_source = get_field( 'unident_expert_kb_data_source' );
	$use_connection = ( $data_source === true || $data_source === '1' || $data_source === 1 );

	$doctor   = null;
	$doctor_id = 0;
	$doctor_rel = get_field( 'unident_expert_kb_doctor' );

	if ( $use_connection && $doctor_rel ) {
		$d = is_array( $doctor_rel ) && ! empty( $doctor_rel[0] ) ? $doctor_rel[0] : $doctor_rel;
		$doctor_id = $d instanceof WP_Post ? $d->ID : ( is_numeric( $d ) ? (int) $d : 0 );

		if ( $doctor_id ) {
			$specs = wp_get_object_terms( $doctor_id, 'doctor_specializations' );
			$specialties = ! is_wp_error( $specs ) ? wp_list_pluck( $specs, 'name' ) : array();
			$experience = get_field( 'experience', $doctor_id );
			$exp_text = is_string( $experience ) ? unident_format_experience_years( $experience ) : '';

			$doctor = array(
				'name'       => get_the_title( $doctor_id ),
				'slug'       => get_post_field( 'post_name', $doctor_id ),
				'specialty'  => implode( ', ', $specialties ),
				'experience' => $exp_text,
				'imageUrl'   => get_the_post_thumbnail_url( $doctor_id, 'medium_large' ) ?: '',
				'url'        => get_permalink( $doctor_id ) ?: '',
			);
		}
	}

	$manual_img = get_field( 'unident_expert_kb_manual_image' );
	$custom_img = get_field( 'unident_expert_kb_custom_image' );
	$use_doctor_photo = get_field( 'unident_expert_kb_use_doctor_photo' ) !== false;

	$display_image = null;
	if ( $use_connection && $doctor && $use_doctor_photo && $doctor_id ) {
		$thumb_id = get_post_thumbnail_id( $doctor_id );
		if ( $thumb_id ) {
			$display_image = unident_resolve_image_field( $thumb_id );
		}
	}
	if ( ! $display_image && $custom_img ) {
		$display_image = unident_resolve_image_field( $custom_img );
	}
	if ( ! $display_image && ! $use_connection && $manual_img ) {
		$display_image = unident_resolve_image_field( $manual_img );
	}

	return array(
		'quote'           => get_field( 'unident_expert_kb_quote' ) ?: '',
		'dataSource'      => $use_connection ? 'connection' : 'manual',
		'doctor'          => $doctor,
		'manualName'      => get_field( 'unident_expert_kb_manual_name' ) ?: '',
		'manualUrl'       => get_field( 'unident_expert_kb_manual_doctor_url' ) ?: '',
		'manualSpecialties' => get_field( 'unident_expert_kb_manual_specialties' ) ?: '',
		'manualExperience'  => get_field( 'unident_expert_kb_manual_experience' ) ?: '',
		'manualImage'     => unident_resolve_image_field( $manual_img ),
		'customImage'     => unident_resolve_image_field( $custom_img ),
		'displayImage'    => $display_image,
		'showPhoto'       => get_field( 'unident_expert_kb_show_photo' ) !== false,
		'showName'        => get_field( 'unident_expert_kb_show_name' ) !== false,
		'showSpecialties' => get_field( 'unident_expert_kb_show_specialties' ) !== false,
		'showExperience'  => get_field( 'unident_expert_kb_show_experience' ) !== false,
		'urlPaid'         => get_field( 'unident_expert_kb_url_paid' ) ?: '/zapis',
		'urlOms'          => get_field( 'unident_expert_kb_url_oms' ) ?: '',
		'showPaid'        => get_field( 'unident_expert_kb_show_paid' ) !== false,
		'showOms'         => get_field( 'unident_expert_kb_show_oms' ) === true || get_field( 'unident_expert_kb_show_oms' ) === 1,
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

function unident_resolve_expert_block() {
	$doctor_rel = get_field( 'doctor' );
	$doctor     = null;

	if ( $doctor_rel && is_array( $doctor_rel ) && ! empty( $doctor_rel[0] ) ) {
		$d    = $doctor_rel[0];
		$d_id = $d instanceof WP_Post ? $d->ID : (int) $d;

		$specializations = array();
		$specs = wp_get_object_terms( $d_id, 'doctor_specializations' );
		if ( ! is_wp_error( $specs ) ) {
			$specializations = wp_list_pluck( $specs, 'name' );
		}

		$experience = get_field( 'experience', $d_id );
		$exp_value  = '';
		if ( $experience ) {
			$exp_value = unident_format_experience_years( $experience );
		}

		$featured = get_the_post_thumbnail_url( $d_id, 'medium_large' );

		$doctor = array(
			'name'            => get_the_title( $d_id ),
			'slug'            => get_post_field( 'post_name', $d_id ),
			'specialty'       => implode( ', ', $specializations ),
			'experience'      => $exp_value,
			'imageUrl'        => $featured ?: '',
		);
	}

	return array(
		'heading'     => get_field( 'heading' ) ?: '',
		'quote'       => get_field( 'quote' ) ?: '',
		'doctor'      => $doctor,
		'customImage' => unident_resolve_image_field( get_field( 'custom_image' ) ),
		'marginBottom' => unident_get_block_margin_bottom(),
	);
}

/* ─── Helpers ─────────────────────────────────────────────── */

function unident_resolve_image_field( $img ) {
	if ( ! $img ) {
		return null;
	}

	if ( is_array( $img ) && ! empty( $img['url'] ) ) {
		return array(
			'url'    => $img['url'],
			'alt'    => $img['alt'] ?? '',
			'width'  => $img['width'] ?? 0,
			'height' => $img['height'] ?? 0,
		);
	}

	if ( is_numeric( $img ) ) {
		$url = wp_get_attachment_url( (int) $img );
		if ( $url ) {
			$meta = wp_get_attachment_metadata( (int) $img );
			return array(
				'url'    => $url,
				'alt'    => get_post_meta( (int) $img, '_wp_attachment_image_alt', true ) ?: '',
				'width'  => $meta['width'] ?? 0,
				'height' => $meta['height'] ?? 0,
			);
		}
	}

	return null;
}

/**
 * Преобразует дату начала работы в "N год/года/лет".
 * Если значение не похоже на дату (YYYY-MM-DD или YYYY) — возвращает как есть.
 *
 * @param string|null $value ACF experience (дата или произвольный текст)
 * @return string "19 лет" или исходное значение
 */
function unident_format_experience_years( $value ) {
	if ( empty( $value ) || ! is_string( $value ) ) {
		return '';
	}
	$trimmed = trim( $value );
	if ( preg_match( '/^(\d{4})(?:-\d{2}-\d{2})?$/', $trimmed, $m ) ) {
		$year  = (int) $m[1];
		$years = max( 0, (int) gmdate( 'Y' ) - $year );
		$mod10  = $years % 10;
		$mod100 = $years % 100;
		$word   = ( $years === 1 || ( $mod10 === 1 && $mod100 !== 11 ) ) ? 'год'
			: ( ( ( $mod10 >= 2 && $mod10 <= 4 ) && ( $mod100 < 12 || $mod100 > 14 ) ) ? 'года' : 'лет' );
		return $years . ' ' . $word;
	}
	return $trimmed;
}
