<?php
/**
 * Plugin Name: УниДент Review Fields GraphQL Registration
 * Description: Manual GraphQL Registration для Review Fields (ACF relationship fields не работают автоматически в WPGraphQL)
 * Version: 1.0
 * Author: УниДент
 */

// Защита от прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Manual GraphQL Registration для Review Fields
 * 
 * КРИТИЧНО: ACF relationship fields, number fields и image fields 
 * не работают автоматически в WPGraphQL.
 * Требуется ручная регистрация через register_graphql_field.
 * 
 * Согласно skill acf-graphql-manual-registration:
 * - Number field (rating) ТРЕБУЕТ Float type и casting (float) $value
 * - Image fields ТРЕБУЮТ MediaItem type и DataSource::resolve_post_object()
 * - Relationship fields ТРЕБУЮТ list_of формат и DataSource resolver
 */
function unident_register_review_graphql_fields() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Register simple text fields
    register_graphql_field('Review', 'answer', [
        'type' => 'String',
        'description' => 'Ответ клиники на отзыв',
        'resolve' => function($post) {
            return get_field('answer', $post->ID);
        }
    ]);

    register_graphql_field('Review', 'authorName', [
        'type' => 'String',
        'description' => 'Имя автора отзыва',
        'resolve' => function($post) {
            return get_field('author_name', $post->ID);
        }
    ]);

    // Register rating field (Number field - MUST be manual!)
    register_graphql_field('Review', 'rating', [
        'type' => 'Float',
        'description' => 'Рейтинг от 1 до 5',
        'resolve' => function($post) {
            $value = get_field('rating', $post->ID);
            return $value ? (float) $value : null;
        }
    ]);

    // Register platform logo field (Image field - MUST use MediaItem!)
    // Fallback: get_field может вернуть array или null; get_post_meta даёт raw ID
    // $source = WPGraphQL Model, используем databaseId. Priority 20 чтобы переопределить ACF.
    register_graphql_field('Review', 'platformLogo', [
        'type' => 'MediaItem',
        'description' => 'Логотип платформы отзывов',
        'resolve' => function($source, $args, $context) {
            $post_id = isset($source->databaseId) ? (int) $source->databaseId : null;
            if (!$post_id) {
                return null;
            }
            $attachment_id = (int) get_post_meta($post_id, 'platform_logo', true);
            if (!$attachment_id) {
                $image = get_field('platform_logo', $post_id);
                if (is_array($image) && isset($image['ID'])) {
                    $attachment_id = (int) $image['ID'];
                } elseif (is_numeric($image)) {
                    $attachment_id = (int) $image;
                }
            }
            if ($attachment_id) {
                return \WPGraphQL\Data\DataSource::resolve_post_object(
                    $attachment_id,
                    $context
                );
            }
            return null;
        }
    ]);

    // Register relationship: Review -> Doctors (MUST be manual!)
    register_graphql_field('Review', 'relatedDoctors', [
        'type' => ['list_of' => 'Doctor'],
        'description' => 'Лечащие врачи, упомянутые в отзыве',
        'resolve' => function($review, $args, $context) {
            $doctors = get_field('related_doctors', $review->ID);

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

    // Register relationship: Doctor -> Reviews (Bidirectional - MUST be manual!)
    register_graphql_field('Doctor', 'relatedReviews', [
        'type' => ['list_of' => 'Review'],
        'description' => 'Отзывы о враче',
        'resolve' => function($doctor, $args, $context) {
            $reviews = get_field('related_reviews', $doctor->ID);

            if (!$reviews || !is_array($reviews)) {
                return null;
            }

            $resolved = [];
            foreach ($reviews as $review_post) {
                if ($review_post instanceof \WP_Post) {
                    $resolved_review = \WPGraphQL\Data\DataSource::resolve_post_object(
                        $review_post->ID,
                        $context
                    );
                    if ($resolved_review) {
                        $resolved[] = $resolved_review;
                    }
                }
            }

            return !empty($resolved) ? $resolved : null;
        }
    ]);
}
// Priority 20: после ACF auto-registration, чтобы наш resolver переопределял ACF (ACF image resolver иногда возвращает null)
add_action('graphql_register_types', 'unident_register_review_graphql_fields', 20);
