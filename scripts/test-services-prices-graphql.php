<?php
/**
 * Test GraphQL query for Services with Prices
 * 
 * Проверяет:
 * 1. Возвращаются ли услуги из GraphQL
 * 2. Есть ли у услуг связанные цены
 * 3. Структуру данных relatedPrices
 */

require_once('/var/www/html/wp-load.php');

echo "\n=== Testing GraphQL Services with Prices ===\n\n";

// Test 1: Проверяем услуги напрямую через WP_Query
echo "1. Checking services in database...\n";
$services = get_posts([
    'post_type' => 'services',
    'posts_per_page' => 5,
    'orderby' => 'title',
    'order' => 'ASC',
]);

echo "   Found " . count($services) . " services\n\n";

// Test 2: Проверяем связи для каждой услуги
echo "2. Checking relationships for first 3 services...\n";
foreach (array_slice($services, 0, 3) as $service) {
    echo "\n   Service: {$service->post_title} (ID: {$service->ID})\n";
    
    // Проверяем related_prices field
    $related_prices = get_field('related_prices', $service->ID);
    
    if ($related_prices && is_array($related_prices)) {
        echo "   ✓ Has " . count($related_prices) . " related price(s)\n";
        foreach ($related_prices as $price_post) {
            $price_id = is_object($price_post) ? $price_post->ID : $price_post;
            $regular_price = get_field('regular_price', $price_id);
            $average_price_city = get_field('average_price_city', $price_id);
            echo "      - Price ID: {$price_id}, Regular: {$regular_price}₽, Avg City: {$average_price_city}₽\n";
        }
    } else {
        echo "   ✗ No related prices (field value: " . var_export($related_prices, true) . ")\n";
    }
}

echo "\n3. Testing GraphQL query structure...\n";

// Test 3: Тестируем GraphQL запрос
$query = '
query TestServicesWithPrices {
  services(first: 3) {
    nodes {
      id
      databaseId
      title
      relatedPrices {
        id
        databaseId
        title
        priceFields {
          regularPrice
          promoPrice
          averagePriceCity
          currency
          period
        }
      }
    }
  }
}
';

// Выполняем GraphQL запрос
$request = new \WPGraphQL\Request($query);
$result = $request->execute();

if (!empty($result['errors'])) {
    echo "   ✗ GraphQL Errors:\n";
    foreach ($result['errors'] as $error) {
        echo "      - " . $error['message'] . "\n";
        if (!empty($error['debugMessage'])) {
            echo "        Debug: " . $error['debugMessage'] . "\n";
        }
    }
} else {
    echo "   ✓ GraphQL query executed successfully\n";
    
    if (!empty($result['data']['services']['nodes'])) {
        $services_count = count($result['data']['services']['nodes']);
        echo "   ✓ Returned {$services_count} services\n\n";
        
        echo "4. Checking relatedPrices structure...\n";
        foreach ($result['data']['services']['nodes'] as $service) {
            echo "\n   Service: {$service['title']} (ID: {$service['databaseId']})\n";
            
            if (!empty($service['relatedPrices'])) {
                $prices_count = count($service['relatedPrices']);
                echo "   ✓ Has {$prices_count} related price(s)\n";
                
                foreach ($service['relatedPrices'] as $price) {
                    $regular = $price['priceFields']['regularPrice'] ?? 'N/A';
                    $avg_city = $price['priceFields']['averagePriceCity'] ?? 'N/A';
                    echo "      - {$price['title']}: Regular: {$regular}₽, Avg City: {$avg_city}₽\n";
                }
            } else {
                echo "   ✗ No relatedPrices field in GraphQL response\n";
                echo "      Available keys: " . implode(', ', array_keys($service)) . "\n";
            }
        }
    } else {
        echo "   ✗ No services returned\n";
    }
}

echo "\n=== Test Complete ===\n\n";
