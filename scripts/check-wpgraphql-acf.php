<?php
define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo 'Checking WPGraphQL ACF plugin...' . PHP_EOL . PHP_EOL;

// Check if plugin is active
$active_plugins = get_option('active_plugins');
$wpgraphql_acf_active = in_array('wpgraphql-acf/wpgraphql-acf.php', $active_plugins);

echo 'wpgraphql-acf plugin active: ' . ($wpgraphql_acf_active ? 'YES' : 'NO') . PHP_EOL;

// Check for class
$classes_to_check = [
    'WPGraphQL\ACF\ACF',
    'WPGraphQL\ACF\Config',
    'WPGraphQL\ACF\FieldConfig',
    'WPGraphQL_ACF',
];

echo PHP_EOL . 'Checking classes:' . PHP_EOL;
foreach ($classes_to_check as $class) {
    echo '- ' . $class . ': ' . (class_exists($class) ? 'EXISTS' : 'NOT FOUND') . PHP_EOL;
}

// Check if ACF functions are available
echo PHP_EOL . 'ACF functions:' . PHP_EOL;
echo '- acf(): ' . (function_exists('acf') ? 'YES' : 'NO') . PHP_EOL;
echo '- acf_get_field_groups(): ' . (function_exists('acf_get_field_groups') ? 'YES' : 'NO') . PHP_EOL;

// Try to see what WPGraphQL ACF registered
if (function_exists('do_action')) {
    echo PHP_EOL . 'Triggering graphql_register_types...' . PHP_EOL;
    do_action('graphql_register_types');
    echo 'Done.' . PHP_EOL;
}
