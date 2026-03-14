<?php
/**
 * Plugin Name: УниДент Our Works Fields GraphQL Registration
 * Description: Manual GraphQL Registration для Our Work Fields (копия подхода из register-reviews-graphql.php)
 * Version: 2.0
 * Author: УниДент
 */

// Защита от прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manual GraphQL Registration для Our Work Fields
 * 
 * ПОДХОД: Точно как в register-reviews-graphql.php
 * - Поля регистрируются напрямую на OurWork типе
 * - НЕТ промежуточного типа OurWorkFields
 * - Image fields напрямую: photoBefore, photoAfter, generalPhoto
 * - Relationships напрямую: relatedDoctors, relatedClinics
 */
function unident_register_our_works_fields_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Register image fields (аналогично platformLogo в reviews)
    register_graphql_field('OurWork', 'photoBefore', [
        'type' => 'MediaItem',
        'description' => 'Фото до лечения',
        'resolve' => function($post, $args, $context) {
            $image = get_field('photo_before', $post->ID);
            if ($image && isset($image['ID'])) {
                return \WPGraphQL\Data\DataSource::resolve_post_object(
                    $image['ID'],
                    $context
                );
            }
            return null;
        }
    ]);

    register_graphql_field('OurWork', 'photoAfter', [
        'type' => 'MediaItem',
        'description' => 'Фото после лечения',
        'resolve' => function($post, $args, $context) {
            $image = get_field('photo_after', $post->ID);
            if ($image && isset($image['ID'])) {
                return \WPGraphQL\Data\DataSource::resolve_post_object(
                    $image['ID'],
                    $context
                );
            }
            return null;
        }
    ]);

    register_graphql_field('OurWork', 'generalPhoto', [
        'type' => 'MediaItem',
        'description' => 'Общее фото (до и после вместе)',
        'resolve' => function($post, $args, $context) {
            $image = get_field('general_photo', $post->ID);
            if ($image && isset($image['ID'])) {
                return \WPGraphQL\Data\DataSource::resolve_post_object(
                    $image['ID'],
                    $context
                );
            }
            return null;
        }
    ]);

    register_graphql_field('OurWork', 'useGeneralPhoto', [
        'type' => 'Boolean',
        'description' => 'Использовать общее фото вместо двух отдельных',
        'resolve' => function($post) {
            $value = get_field('use_general_photo', $post->ID);
            return (bool) $value;
        }
    ]);

    // Register relationship: OurWork -> Doctors (точно как в reviews)
    register_graphql_field('OurWork', 'relatedDoctors', [
        'type' => ['list_of' => 'Doctor'],
        'description' => 'Врачи, которые выполнили эту работу',
        'resolve' => function($work, $args, $context) {
            $doctors = get_field('related_doctors', $work->ID);

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

    // Register relationship: OurWork -> Clinics (точно как в reviews)
    register_graphql_field('OurWork', 'relatedClinics', [
        'type' => ['list_of' => 'Clinic'],
        'description' => 'Клиники, где была выполнена эта работа',
        'resolve' => function($work, $args, $context) {
            $clinics = get_field('related_clinics', $work->ID);

            if (!$clinics || !is_array($clinics)) {
                return null;
            }

            $resolved = [];
            foreach ($clinics as $clinic_post) {
                if ($clinic_post instanceof \WP_Post) {
                    $resolved_clinic = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $clinic_post->ID,
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

    // Register relationship: OurWork -> Services
    register_graphql_field('OurWork', 'relatedServices', [
        'type' => ['list_of' => 'Service'],
        'description' => 'Услуги, оказанные в этой работе',
        'resolve' => function($work, $args, $context) {
            $services = get_field('related_services', $work->ID);

            if (!$services || !is_array($services)) {
                return null;
            }

            $resolved = [];
            foreach ($services as $service_post) {
                if ($service_post instanceof \WP_Post) {
                    $resolved_service = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $service_post->ID,
                        $context
                    );
                    if ($resolved_service) {
                        $resolved[] = $resolved_service;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);

    // Bidirectional: Doctor -> Works
    register_graphql_field('Doctor', 'relatedWorks', [
        'type' => ['list_of' => 'OurWork'],
        'description' => 'Работы, выполненные врачом',
        'resolve' => function($doctor, $args, $context) {
            $works = get_field('related_works', $doctor->ID);

            if (!$works || !is_array($works)) {
                return null;
            }

            $resolved = [];
            foreach ($works as $work_post) {
                if ($work_post instanceof \WP_Post) {
                    $resolved_work = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $work_post->ID,
                        $context
                    );
                    if ($resolved_work) {
                        $resolved[] = $resolved_work;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);

    // Bidirectional: Clinic -> Works
    register_graphql_field('Clinic', 'relatedWorks', [
        'type' => ['list_of' => 'OurWork'],
        'description' => 'Работы, выполненные в этой клинике',
        'resolve' => function($clinic, $args, $context) {
            $works = get_field('related_works', $clinic->ID);

            if (!$works || !is_array($works)) {
                return null;
            }

            $resolved = [];
            foreach ($works as $work_post) {
                if ($work_post instanceof \WP_Post) {
                    $resolved_work = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $work_post->ID,
                        $context
                    );
                    if ($resolved_work) {
                        $resolved[] = $resolved_work;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);

    // Bidirectional: Service -> Works
    register_graphql_field('Service', 'relatedWorks', [
        'type' => ['list_of' => 'OurWork'],
        'description' => 'Работы с использованием этой услуги',
        'resolve' => function($service, $args, $context) {
            $works = get_field('related_works', $service->ID);

            if (!$works || !is_array($works)) {
                return null;
            }

            $resolved = [];
            foreach ($works as $work_post) {
                if ($work_post instanceof \WP_Post) {
                    $resolved_work = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $work_post->ID,
                        $context
                    );
                    if ($resolved_work) {
                        $resolved[] = $resolved_work;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);
}
add_action('graphql_register_types', 'unident_register_our_works_fields_graphql', 10);
