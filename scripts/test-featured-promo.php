<?php
require('/var/www/html/wp-load.php');

echo 'Testing Header Settings with Featured Promotion...' . PHP_EOL . PHP_EOL;

$query = '
{
  headerSettings {
    phone
    featuredPromotion {
      id
      title
      uri
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
