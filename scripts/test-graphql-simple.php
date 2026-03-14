<?php
/**
 * Simple GraphQL test - check relatedPrices field
 */

require_once('/var/www/html/wp-load.php');

echo "\n=== Simple GraphQL Test ===\n\n";

// Get first service
$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => 1,
    'orderby' => 'title',
    'order' => 'ASC',
]);

if (empty($services)) {
    echo "✗ No services found\n";
    exit(1);
}

$service = $services[0];
echo "Testing service: {$service->post_title} (ID: {$service->ID})\n\n";

// Check related_prices field
$related_prices = get_field('related_prices', $service->ID);
echo "1. Database check:\n";
echo "   related_prices field: " . (is_array($related_prices) ? count($related_prices) . " prices" : "null") . "\n\n";

// Check if WPGraphQL is active
if (!function_exists('graphql')) {
    echo "✗ WPGraphQL is not active\n";
    exit(1);
}

// Test simple GraphQL query
echo "2. GraphQL query test:\n";

$result = graphql([
    'query' => '
        query TestService($id: ID!) {
            service(id: $id, idType: DATABASE_ID) {
                id
                databaseId
                title
                relatedPrices {
                    id
                    databaseId
                    title
                }
            }
        }
    ',
    'variables' => [
        'id' => $service->ID
    ]
]);

if (!empty($result['errors'])) {
    echo "   ✗ GraphQL Errors:\n";
    foreach ($result['errors'] as $error) {
        echo "      - " . $error['message'] . "\n";
    }
} else {
    echo "   ✓ GraphQL query successful\n";
    
    $service_data = $result['data']['service'] ?? null;
    if ($service_data) {
        echo "   ✓ Service found: {$service_data['title']}\n";
        
        if (isset($service_data['relatedPrices'])) {
            $prices = $service_data['relatedPrices'];
            if (is_array($prices)) {
                echo "   ✓ relatedPrices field exists (array with " . count($prices) . " items)\n";
                
                if (count($prices) > 0) {
                    echo "\n   First price:\n";
                    $first_price = $prices[0];
                    echo "      - ID: {$first_price['id']}\n";
                    echo "      - Database ID: {$first_price['databaseId']}\n";
                    echo "      - Title: {$first_price['title']}\n";
                } else {
                    echo "   ✗ relatedPrices array is empty\n";
                }
            } else {
                echo "   ✗ relatedPrices is not an array: " . var_export($prices, true) . "\n";
            }
        } else {
            echo "   ✗ relatedPrices field not found in GraphQL response\n";
            echo "   Available fields: " . implode(', ', array_keys($service_data)) . "\n";
        }
    } else {
        echo "   ✗ Service not found in GraphQL response\n";
    }
}

echo "\n=== Test Complete ===\n\n";
