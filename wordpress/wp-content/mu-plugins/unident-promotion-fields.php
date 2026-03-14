<?php
/**
 * Register Promotion ACF Fields with GraphQL
 *
 * File: wp-content/mu-plugins/unident-promotion-fields.php
 */

function unident_register_promotion_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array(
        'key' => 'group_promotion_fields',
        'title' => 'Настройки акции',
        'fields' => array(
            // Valid Until (дата окончания акции)
            array(
                'key' => 'field_promotion_valid_until',
                'label' => 'Действует до',
                'name' => 'valid_until',
                'type' => 'date_picker',
                'display_format' => 'd.m.Y',
                'return_format' => 'Y-m-d',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'validUntil',
            ),
            // Discount (процент скидки)
            array(
                'key' => 'field_promotion_discount',
                'label' => 'Скидка (%)',
                'name' => 'discount',
                'type' => 'number',
                'min' => 0,
                'max' => 100,
                'step' => 1,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'discount',
            ),
            // Description
            array(
                'key' => 'field_promotion_description',
                'label' => 'Описание акции',
                'name' => 'description',
                'type' => 'textarea',
                'rows' => 4,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'description',
            ),
            // Old Price (цена до скидки)
            array(
                'key' => 'field_promotion_old_price',
                'label' => 'Цена без скидки',
                'name' => 'old_price',
                'type' => 'number',
                'min' => 0,
                'step' => 0.01,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'oldPrice',
            ),
            // New Price (цена со скидкой)
            array(
                'key' => 'field_promotion_new_price',
                'label' => 'Цена со скидкой',
                'name' => 'new_price',
                'type' => 'number',
                'min' => 0,
                'step' => 0.01,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'newPrice',
            ),
            // Currency (валюта)
            array(
                'key' => 'field_promotion_currency',
                'label' => 'Валюта',
                'name' => 'currency',
                'type' => 'text',
                'default_value' => '₽',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'currency',
            ),
            // Badge (текст бейджа)
            array(
                'key' => 'field_promotion_badge',
                'label' => 'Бейдж',
                'name' => 'badge',
                'type' => 'text',
                'placeholder' => 'Например: Скидка 15%',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'badge',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'promotions',
                ),
            ),
        ),
        'active' => true,
        'show_in_graphql' => 1,
        'graphql_field_name' => 'promotionFields',
    ));
}
add_action('acf/init', 'unident_register_promotion_fields');

/**
 * Manual GraphQL registration for Number fields
 * Required because ACF number fields don't auto-expose correctly
 */
function unident_register_promotion_number_fields_graphql() {
    if (!function_exists('register_graphql_field')) {
        return;
    }

    // Discount field
    register_graphql_field('Promotion', 'promotionFields', [
        'type' => [
            'discount' => 'Float',
            'oldPrice' => 'Float',
            'newPrice' => 'Float',
        ],
    ]);
}
add_action('graphql_register_types', 'unident_register_promotion_number_fields_graphql', 10);
