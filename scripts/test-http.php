<?php
/**
 * Test HTTP response headers from GraphQL endpoint
 */

if (!defined('ABSPATH')) {
    require('/var/www/html/wp-load.php');
}

echo "=== HTTP HEADERS TEST ===\n\n";

// Make internal HTTP request to GraphQL
$url = home_url('/graphql');
echo "GraphQL URL: $url\n\n";

$response = wp_remote_post($url, [
    'headers' => [
        'Content-Type' => 'application/json',
    ],
    'body' => json_encode([
        'query' => '{ menuItems(where: {location: PRIMARY}, first: 2) { nodes { label databaseId } } }'
    ]),
    'timeout' => 30,
]);

if (is_wp_error($response)) {
    echo "Error: " . $response->get_error_message() . "\n";
} else {
    echo "Response Headers:\n";
    $headers = wp_remote_retrieve_headers($response);
    foreach ($headers as $key => $value) {
        echo "  $key: $value\n";
    }
    
    echo "\nResponse Body (raw):\n";
    $body = wp_remote_retrieve_body($response);
    echo $body . "\n";
    
    echo "\nResponse Body (decoded):\n";
    $decoded = json_decode($body, true);
    echo json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

echo "\nDone!\n";
