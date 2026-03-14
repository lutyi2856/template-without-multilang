<?php
/**
 * Test serviceFeatures GraphQL field
 */

// GraphQL запрос
$query = '
query TestServiceFeatures {
  service(id: "cG9zdDo0MQ==") {
    id
    title
    serviceFeatures {
      text
    }
  }
}
';

$result = do_graphql_request($query);

echo "=== GraphQL Result ===\n";
echo print_r($result, true);

if (!empty($result['errors'])) {
    echo "\n=== Errors ===\n";
    foreach ($result['errors'] as $error) {
        echo $error['message'] . "\n";
    }
}

if (!empty($result['data'])) {
    echo "\n=== Data ===\n";
    echo json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
