<?php
/**
 * Test Social Links GraphQL Query
 */

define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');

echo "Testing Social Links GraphQL Query...\n\n";

// Test direct ACF field access
echo "=== Direct ACF Field Access ===\n";
$social_links = get_field('social_links', 'options');
echo "Social links (raw): " . print_r($social_links, true) . "\n\n";

// Test GraphQL query
if (function_exists('graphql')) {
    echo "=== GraphQL Query Test ===\n";
    
    $query = '
        query {
            headerSettings {
                phone
                email
                socialLinks {
                    name
                    icon
                    url
                }
            }
        }
    ';
    
    $result = graphql([
        'query' => $query,
    ]);
    
    echo "GraphQL Result:\n";
    echo json_encode($result, JSON_PRETTY_PRINT) . "\n\n";
    
    if (isset($result['errors'])) {
        echo "❌ GraphQL Errors:\n";
        foreach ($result['errors'] as $error) {
            echo "  - " . $error['message'] . "\n";
        }
    }
    
    if (isset($result['data']['headerSettings']['socialLinks'])) {
        echo "✓ socialLinks found in GraphQL response!\n";
        echo "Count: " . count($result['data']['headerSettings']['socialLinks']) . "\n";
    } else {
        echo "✗ socialLinks NOT found in GraphQL response\n";
    }
} else {
    echo "✗ GraphQL function not available\n";
}
