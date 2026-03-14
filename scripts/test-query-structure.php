<?php
require('/var/www/html/wp-load.php');

echo 'Testing actual Promotion query with relationships...' . PHP_EOL . PHP_EOL;

$test_query = '
{
  promotions(first: 1) {
    nodes {
      id
      title
      promotionRelationships {
        relatedServices {
          edges {
            node {
              ... on Service {
                id
                title
              }
            }
          }
        }
      }
    }
  }
}
';

$test_result = graphql(['query' => $test_query]);

if (isset($test_result['errors'])) {
    echo 'Errors:' . PHP_EOL;
    foreach ($test_result['errors'] as $error) {
        echo '  - ' . $error['message'] . PHP_EOL;
    }
} else {
    echo 'SUCCESS! Query works!' . PHP_EOL;
    echo json_encode($test_result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
