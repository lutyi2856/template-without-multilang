<?php
/**
 * Manual GraphQL Registration для Doctors ↔ Services bidirectional relationship
 * 
 * ACF Relationship fields не автоматически экспонируются в WPGraphQL.
 * Необходима ручная регистрация для обеих сторон связи.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Doctor → Services relationship (relatedServices)
 */
function unident_register_doctor_services_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Doctor → Services (один врач может оказывать несколько услуг)
    register_graphql_field('Doctor', 'relatedServices', [
        'type' => ['list_of' => 'Service'],
        'description' => 'Услуги, которые оказывает врач',
        'resolve' => function($doctor, $args, $context, $info) {
            $services = get_field('related_services', $doctor->ID);

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

    // Service → Doctors (у одной услуги может быть несколько врачей)
    register_graphql_field('Service', 'relatedDoctors', [
        'type' => ['list_of' => 'Doctor'],
        'description' => 'Врачи, которые оказывают эту услугу',
        'resolve' => function($service, $args, $context, $info) {
            $doctors = get_field('related_doctors', $service->ID);

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

    // Doctor → Consultation Services (услуги консультаций / первичного приёма)
    register_graphql_field('Doctor', 'consultationServices', [
        'type' => ['list_of' => 'Service'],
        'description' => 'Услуги консультаций и первичного приёма по направлению врача',
        'resolve' => function($doctor, $args, $context, $info) {
            $services = get_field('consultation_services', $doctor->ID);
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

    // Service → Consulting Doctors (врачи, оказывающие эту консультацию)
    register_graphql_field('Service', 'consultingDoctors', [
        'type' => ['list_of' => 'Doctor'],
        'description' => 'Врачи, оказывающие эту услугу консультации / первичного приёма',
        'resolve' => function($service, $args, $context, $info) {
            $doctors = get_field('consulting_doctors', $service->ID);
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
add_action('graphql_register_types', 'unident_register_doctor_services_graphql', 10);
