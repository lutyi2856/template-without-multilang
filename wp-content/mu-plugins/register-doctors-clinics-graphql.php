<?php
/**
 * Manual GraphQL Registration для Doctors ↔ Clinics bidirectional relationship
 * и для repeater поля specialization
 * 
 * ACF Relationship и Repeater fields не автоматически экспонируются в WPGraphQL.
 * Необходима ручная регистрация.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Doctor → Clinic relationship (clinic)
 * Одно значение, так как multiple => 0
 */
function unident_register_doctor_clinic_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Doctor → Clinics (один врач может работать в нескольких клиниках)
    register_graphql_field('Doctor', 'clinic', [
        'type' => ['list_of' => 'Clinic'],
        'description' => 'Клиники, где работает врач',
        'resolve' => function($doctor, $args, $context, $info) {
            $clinics = get_field('clinic', $doctor->ID);

            if (!$clinics || !is_array($clinics)) {
                return null;
            }

            $resolved = [];
            foreach ($clinics as $clinic_post) {
                // ACF relationship возвращает WP_Post объект
                if ($clinic_post instanceof \WP_Post) {
                    $resolved_clinic = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $clinic_post->ID,
                        $context
                    );
                    if ($resolved_clinic) {
                        $resolved[] = $resolved_clinic;
                    }
                } elseif (is_numeric($clinic_post)) {
                    // Если это ID
                    $resolved_clinic = \WPGraphQL\Data\DataSource::resolve_post_object(
                        (int) $clinic_post,
                        $context
                    );
                    if ($resolved_clinic) {
                        $resolved[] = $resolved_clinic;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);

    // Clinic → Doctors (в одной клинике может работать несколько врачей)
    register_graphql_field('Clinic', 'relatedDoctors', [
        'type' => ['list_of' => 'Doctor'],
        'description' => 'Врачи, работающие в этой клинике',
        'resolve' => function($clinic, $args, $context, $info) {
            $doctors = get_field('related_doctors', $clinic->ID);

            if (!$doctors || !is_array($doctors)) {
                return null;
            }

            $resolved = [];
            foreach ($doctors as $doctor_post) {
                if ($doctor_post instanceof \WP_Post) {
                    $resolved_doctor = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $doctor_post->ID,
                        $context
                    );
                    if ($resolved_doctor) {
                        $resolved[] = $resolved_doctor;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_doctor_clinic_graphql', 10);

/**
 * Register clinicSlug and categorySlug in RootQueryToDoctorConnectionWhereArgs
 * categorySlug = taxonomy service_categories (category tied to doctors)
 */
function unident_register_doctor_connection_where_args() {
    if ( ! function_exists('register_graphql_field') ) {
        return;
    }

    register_graphql_field('RootQueryToDoctorConnectionWhereArgs', 'clinicSlug', [
        'type'        => 'String',
        'description' => 'Filter doctors by clinic slug (ACF relationship)',
    ]);

    register_graphql_field('RootQueryToDoctorConnectionWhereArgs', 'categorySlug', [
        'type'        => 'String',
        'description' => 'Filter doctors by service_categories term slug',
    ]);

    register_graphql_field('RootQueryToDoctorConnectionWhereArgs', 'specializationSlug', [
        'type'        => 'String',
        'description' => 'Filter doctors by doctor_specializations term slug',
    ]);
}
add_action('graphql_register_types', 'unident_register_doctor_connection_where_args', 10);

/**
 * Custom root field: service_categories terms that have at least one doctor.
 * Used for doctors archive filter so empty categories are not shown.
 */
function unident_register_doctor_service_categories_root_field() {
    if ( ! function_exists( 'register_graphql_field' ) ) {
        return;
    }
    register_graphql_field( 'RootQuery', 'doctorServiceCategories', [
        'type'        => [ 'list_of' => 'ServiceCategory' ],
        'description' => 'Service categories that have at least one published doctor',
        'resolve'     => function() {
            $doctor_ids = get_posts( array(
                'post_type'      => 'doctors',
                'post_status'    => 'publish',
                'fields'         => 'ids',
                'posts_per_page' => -1,
            ) );
            if ( empty( $doctor_ids ) ) {
                return array();
            }
            $terms = get_terms( array(
                'taxonomy'   => 'service_categories',
                'object_ids' => $doctor_ids,
                'hide_empty' => true,
            ) );
            if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
                return array();
            }
            $context = \WPGraphQL::get_app_context();
            $result  = array();
            foreach ( $terms as $term ) {
                // DataSource::resolve_term_object( $id, $context ) expects term_id (int), not WP_Term
                $resolved = \WPGraphQL\Data\DataSource::resolve_term_object( (int) $term->term_id, $context );
                if ( $resolved ) {
                    $result[] = $resolved;
                }
            }
            return $result;
        },
    ] );
}
add_action( 'graphql_register_types', 'unident_register_doctor_service_categories_root_field', 10 );

/**
 * Custom root field: clinics that have at least one doctor (via ACF clinic on doctor).
 * Used for doctors archive filter so clinics with no doctors are not shown.
 */
function unident_register_clinics_with_doctors_root_field() {
    if ( ! function_exists( 'register_graphql_field' ) ) {
        return;
    }
    register_graphql_field( 'RootQuery', 'clinicsWithDoctors', [
        'type'        => [ 'list_of' => 'Clinic' ],
        'description' => 'Clinics that have at least one doctor assigned',
        'resolve'     => function() {
            $doctors = get_posts( array(
                'post_type'      => 'doctors',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
            ) );
            $clinic_ids = array();
            foreach ( $doctors as $doctor ) {
                $clinic = get_field( 'clinic', $doctor->ID );
                if ( is_array( $clinic ) ) {
                    foreach ( $clinic as $c ) {
                        $id = $c instanceof \WP_Post ? $c->ID : ( is_numeric( $c ) ? (int) $c : 0 );
                        if ( $id ) {
                            $clinic_ids[ $id ] = true;
                        }
                    }
                } elseif ( is_numeric( $clinic ) && (int) $clinic > 0 ) {
                    $clinic_ids[ (int) $clinic ] = true;
                } elseif ( $clinic instanceof \WP_Post ) {
                    $clinic_ids[ $clinic->ID ] = true;
                }
            }
            $clinic_ids = array_keys( $clinic_ids );
            if ( empty( $clinic_ids ) ) {
                return array();
            }
            $posts = get_posts( array(
                'post_type'      => 'clinics',
                'post_status'    => 'publish',
                'post__in'       => $clinic_ids,
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'         => 'ASC',
            ) );
            $context = \WPGraphQL::get_app_context();
            $result  = array();
            foreach ( $posts as $post ) {
                // DataSource::resolve_post_object( $id, $context ) expects post ID (int), not WP_Post
                $resolved = \WPGraphQL\Data\DataSource::resolve_post_object( (int) $post->ID, $context );
                if ( $resolved ) {
                    $result[] = $resolved;
                }
            }
            return $result;
        },
    ] );
}
add_action( 'graphql_register_types', 'unident_register_clinics_with_doctors_root_field', 10 );

/**
 * Map categorySlug and clinicSlug from GraphQL where to WP_Query (tax_query, meta_query).
 * categorySlug = taxonomy service_categories.
 */
function unident_doctors_map_where_to_wp_query( $query_args, $where_args, $source, $all_args, $context, $info, $post_type ) {
    $is_doctors = in_array( $post_type, array( 'doctors', 'doctor' ), true )
        || ( is_array( $post_type ) && ! empty( array_intersect( array( 'doctors', 'doctor' ), $post_type ) ) );
    if ( ! $is_doctors ) {
        return $query_args;
    }

    if ( ! empty( $where_args['categorySlug'] ) ) {
        $slug = sanitize_text_field( $where_args['categorySlug'] );
        $term = get_term_by( 'slug', $slug, 'service_categories' );
        if ( $term && ! is_wp_error( $term ) ) {
            $tax_query   = $query_args['tax_query'] ?? array();
            $tax_query   = array_filter( $tax_query, 'is_array' );
            $tax_query[] = array(
                'taxonomy' => 'service_categories',
                'field'    => 'term_id',
                'terms'    => array( (int) $term->term_id ),
            );
            if ( count( $tax_query ) > 1 && empty( $tax_query['relation'] ) ) {
                $tax_query['relation'] = 'AND';
            }
            $query_args['tax_query'] = $tax_query;
        }
    }

    if ( ! empty( $where_args['specializationSlug'] ) ) {
        $slug = sanitize_text_field( $where_args['specializationSlug'] );
        $term = get_term_by( 'slug', $slug, 'doctor_specializations' );
        if ( $term && ! is_wp_error( $term ) ) {
            $tax_query   = $query_args['tax_query'] ?? array();
            $tax_query   = array_filter( $tax_query, 'is_array' );
            $tax_query[] = array(
                'taxonomy' => 'doctor_specializations',
                'field'    => 'term_id',
                'terms'    => array( (int) $term->term_id ),
            );
            if ( count( $tax_query ) > 1 && empty( $tax_query['relation'] ) ) {
                $tax_query['relation'] = 'AND';
            }
            $query_args['tax_query'] = $tax_query;
        }
    }

    if ( ! empty( $where_args['clinicSlug'] ) ) {
        $clinic_slug = sanitize_text_field( $where_args['clinicSlug'] );
        $clinics     = get_posts([
            'post_type'      => 'clinics',
            'name'           => $clinic_slug,
            'posts_per_page' => 1,
            'post_status'    => 'publish',
            'fields'         => 'ids',
        ]);
        if ( ! empty( $clinics ) ) {
            $clinic_id   = (int) $clinics[0];
            $meta_query  = $query_args['meta_query'] ?? array();
            $meta_query  = array_filter( $meta_query, 'is_array' );
            $meta_query[] = array(
                'relation' => 'OR',
                array(
                    'key'     => 'clinic',
                    'value'   => $clinic_id,
                    'compare' => '=',
                ),
                array(
                    'key'     => 'clinic',
                    'value'   => '"' . $clinic_id . '"',
                    'compare' => 'LIKE',
                ),
            );
            if ( count( $meta_query ) > 1 && empty( $meta_query['relation'] ) ) {
                $meta_query['relation'] = 'AND';
            }
            $query_args['meta_query'] = $meta_query;
        }
    }

    return $query_args;
}
add_filter( 'graphql_map_input_fields_to_wp_query', 'unident_doctors_map_where_to_wp_query', 10, 7 );

/**
 * Apply categorySlug and clinicSlug filters via graphql_post_object_connection_query_args.
 * WPGraphQL may not pass custom where args to graphql_map_input_fields_to_wp_query for CPT.
 */
function unident_doctors_post_object_connection_query_args( $query_args, $source, $args, $context, $info ) {
    $post_type = $query_args['post_type'] ?? null;
    $is_doctors = ( is_string( $post_type ) && in_array( $post_type, array( 'doctors', 'doctor' ), true ) )
        || ( is_array( $post_type ) && ! empty( array_intersect( array( 'doctors', 'doctor' ), $post_type ) ) );
    if ( ! $is_doctors ) {
        return $query_args;
    }

    $where = $args['where'] ?? array();
    if ( empty( $where['categorySlug'] ) && empty( $where['clinicSlug'] ) && empty( $where['specializationSlug'] ) ) {
        return $query_args;
    }

    if ( ! empty( $where['categorySlug'] ) ) {
        $slug = sanitize_text_field( $where['categorySlug'] );
        $term = get_term_by( 'slug', $slug, 'service_categories' );
        if ( $term && ! is_wp_error( $term ) ) {
            $tax_query   = isset( $query_args['tax_query'] ) ? array_filter( (array) $query_args['tax_query'], 'is_array' ) : array();
            $tax_query[] = array(
                'taxonomy' => 'service_categories',
                'field'    => 'term_id',
                'terms'    => array( (int) $term->term_id ),
            );
            if ( count( $tax_query ) > 1 && empty( $tax_query['relation'] ) ) {
                $tax_query['relation'] = 'AND';
            }
            $query_args['tax_query'] = $tax_query;
        }
    }

    if ( ! empty( $where['specializationSlug'] ) ) {
        $slug = sanitize_text_field( $where['specializationSlug'] );
        $term = get_term_by( 'slug', $slug, 'doctor_specializations' );
        if ( $term && ! is_wp_error( $term ) ) {
            $tax_query   = isset( $query_args['tax_query'] ) ? array_filter( (array) $query_args['tax_query'], 'is_array' ) : array();
            $tax_query[] = array(
                'taxonomy' => 'doctor_specializations',
                'field'    => 'term_id',
                'terms'    => array( (int) $term->term_id ),
            );
            if ( count( $tax_query ) > 1 && empty( $tax_query['relation'] ) ) {
                $tax_query['relation'] = 'AND';
            }
            $query_args['tax_query'] = $tax_query;
        }
    }

    if ( ! empty( $where['clinicSlug'] ) ) {
        $clinic_slug = sanitize_text_field( $where['clinicSlug'] );
        $clinics     = get_posts( array(
            'post_type'      => 'clinics',
            'name'           => $clinic_slug,
            'posts_per_page' => 1,
            'post_status'    => 'publish',
            'fields'         => 'ids',
        ) );
        if ( ! empty( $clinics ) ) {
            $clinic_id  = (int) $clinics[0];
            $meta_query = isset( $query_args['meta_query'] ) ? array_filter( (array) $query_args['meta_query'], 'is_array' ) : array();
            $meta_query[] = array(
                'relation' => 'OR',
                array(
                    'key'     => 'clinic',
                    'value'   => $clinic_id,
                    'compare' => '=',
                ),
                array(
                    'key'     => 'clinic',
                    'value'   => '"' . $clinic_id . '"',
                    'compare' => 'LIKE',
                ),
            );
            if ( count( $meta_query ) > 1 && empty( $meta_query['relation'] ) ) {
                $meta_query['relation'] = 'AND';
            }
            $query_args['meta_query'] = $meta_query;
        }
    }

    return $query_args;
}
add_filter( 'graphql_post_object_connection_query_args', 'unident_doctors_post_object_connection_query_args', 10, 5 );

/**
 * Register custom type for specialization item
 * Должен быть зарегистрирован ДО использования в полях
 */
function unident_register_doctor_specialization_type() {
    if (!function_exists('register_graphql_object_type')) {
        return;
    }

    register_graphql_object_type('DoctorSpecializationItem', [
        'description' => 'Элемент специализации врача',
        'fields' => [
            'specializationItem' => [
                'type' => 'String',
                'description' => 'Название специализации',
            ],
        ],
    ]);

    register_graphql_object_type('DoctorEducationItem', [
        'description' => 'Элемент образования врача',
        'fields' => [
            'year' => [
                'type' => 'String',
                'description' => 'Год окончания',
            ],
            'place' => [
                'type' => 'String',
                'description' => 'Место учёбы',
            ],
            'educationType' => [
                'type' => 'String',
                'description' => 'Тип обучения (очные курсы, семинар и т.д.)',
            ],
        ],
    ]);
}
add_action('graphql_register_types', 'unident_register_doctor_specialization_type', 5);

/**
 * Register Doctor specialization repeater field
 * Repeater fields требуют ручной регистрации в GraphQL
 */
function unident_register_doctor_specialization_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Doctor → Specialization (repeater)
    register_graphql_field('Doctor', 'specialization', [
        'type' => ['list_of' => 'DoctorSpecializationItem'],
        'description' => 'Специализации врача',
        'resolve' => function($doctor, $args, $context, $info) {
            $specializations = get_field('specialization', $doctor->ID);

            if (!$specializations || !is_array($specializations)) {
                return null;
            }

            $resolved = [];
            foreach ($specializations as $item) {
                if (isset($item['specialization_item'])) {
                    $resolved[] = [
                        'specializationItem' => $item['specialization_item']
                    ];
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_doctor_specialization_graphql', 10);

/**
 * Register Doctor education repeater and certificates gallery
 */
function unident_register_doctor_education_certificates_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    register_graphql_field('Doctor', 'education', [
        'type' => ['list_of' => 'DoctorEducationItem'],
        'description' => 'Образование врача',
        'resolve' => function($doctor, $args, $context, $info) {
            $items = get_field('education', $doctor->ID);
            if (!$items || !is_array($items)) {
                return null;
            }
            $resolved = [];
            foreach ($items as $item) {
                $resolved[] = [
                    'year' => isset($item['year']) ? $item['year'] : null,
                    'place' => isset($item['place']) ? $item['place'] : null,
                    'educationType' => isset($item['education_type']) ? $item['education_type'] : null,
                ];
            }
            usort($resolved, function ($a, $b) {
                $yA = preg_match('/^(\d{4})/', (string)($a['year'] ?? ''), $mA) ? (int)$mA[1] : PHP_INT_MAX;
                $yB = preg_match('/^(\d{4})/', (string)($b['year'] ?? ''), $mB) ? (int)$mB[1] : PHP_INT_MAX;
                return $yA <=> $yB;
            });
            return !empty($resolved) ? $resolved : null;
        }
    ]);

    register_graphql_field('Doctor', 'certificates', [
        'type' => ['list_of' => 'MediaItem'],
        'description' => 'Сертификаты врача',
        'resolve' => function($doctor, $args, $context, $info) {
            $ids = get_field('certificates', $doctor->ID);
            if (!$ids || !is_array($ids)) {
                return null;
            }
            $resolved = [];
            foreach ($ids as $attachment_id) {
                $id = is_numeric($attachment_id) ? (int) $attachment_id : null;
                if ($id) {
                    $media = \WPGraphQL\Data\DataSource::resolve_post_object($id, $context);
                    if ($media) {
                        $resolved[] = $media;
                    }
                }
            }
            return !empty($resolved) ? $resolved : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_doctor_education_certificates_graphql', 10);

/**
 * Register Doctor experience date field
 * Date picker fields могут требовать ручной регистрации в GraphQL
 */
function unident_register_doctor_experience_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Doctor → Experience (date)
    register_graphql_field('Doctor', 'experience', [
        'type' => 'String',
        'description' => 'Дата начала работы врача (формат: Y-m-d)',
        'resolve' => function($doctor, $args, $context, $info) {
            $date = get_field('experience', $doctor->ID);
            
            if (!$date) {
                return null;
            }

            // ACF date_picker возвращает значение согласно return_format ('Y-m-d')
            return $date;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_doctor_experience_graphql', 10);
