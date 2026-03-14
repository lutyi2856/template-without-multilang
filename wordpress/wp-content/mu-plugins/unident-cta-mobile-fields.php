<?php
/**
 * Register CTA Mobile/Tablet Image Fields
 *
 * Adds separate image fields for mobile/tablet version of CTA blocks 1 and 2.
 * File: wp-content/mu-plugins/unident-cta-mobile-fields.php
 */

function unident_register_cta_mobile_fields() {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) {
        return;
    }

    acf_add_local_field_group(
        array(
            'key'    => 'group_cta_mobile_images',
            'title'  => 'CTA Mobile/Tablet Images',
            'fields' => array(
                array(
                    'key'                => 'field_cta_doctor_image_mobile',
                    'label'              => 'CTA: Фото врача (мобайл/планшет)',
                    'name'               => 'cta_doctor_image_mobile',
                    'type'               => 'image',
                    'return_format'      => 'array',
                    'preview_size'       => 'medium',
                    'library'            => 'all',
                    'show_in_graphql'   => 1,
                    'graphql_field_name' => 'ctaDoctorImageMobile',
                ),
                array(
                    'key'                => 'field_cta_doctor_image_2_mobile',
                    'label'              => 'CTA 2: Фото врача (мобайл/планшет)',
                    'name'               => 'cta_doctor_image_2_mobile',
                    'type'               => 'image',
                    'return_format'      => 'array',
                    'preview_size'       => 'medium',
                    'library'            => 'all',
                    'show_in_graphql'   => 1,
                    'graphql_field_name' => 'ctaDoctorImage2Mobile',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param'    => 'options_page',
                        'operator' => '==',
                        'value'    => 'mainpage-settings',
                    ),
                ),
            ),
        )
    );
}
add_action( 'acf/init', 'unident_register_cta_mobile_fields' );
