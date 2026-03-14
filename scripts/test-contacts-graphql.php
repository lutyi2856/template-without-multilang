<?php
define('WP_USE_THEMES', false);
require '/var/www/html/wp-load.php';

if (!function_exists('graphql')) {
    echo "GraphQL not available\n";
    exit(1);
}

$query = 'query { contactsSettings { socialContacts { icon iconSvg url } } }';
$result = graphql(['query' => $query]);

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
