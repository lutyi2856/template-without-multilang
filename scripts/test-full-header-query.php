<?php
require('/var/www/html/wp-load.php');

echo 'Testing Full Header Query with Nested Relationships...' . PHP_EOL . PHP_EOL;

$query = '
{
  headerSettings {
    phone
    email
    featuredPromotion {
      id
      title
      uri
      promotionRelationships {
        relatedServices {
          edges {
            node {
              ... on Service {
                id
                title
                uri
                serviceRelationships {
                  relatedPrices {
                    edges {
                      node {
                        ... on Price {
                          id
                          title
                          priceFields {
                            regularPrice
                            promoPrice
                            currency
                            period
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
';

$result = graphql(['query' => $query]);

if (isset($result['errors'])) {
    echo 'Errors:' . PHP_EOL;
    foreach ($result['errors'] as $error) {
        echo '  - ' . $error['message'] . PHP_EOL;
    }
} else {
    echo 'SUCCESS!' . PHP_EOL;
    echo json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
