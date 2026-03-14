<?php
require('/var/www/html/wp-load.php');

echo 'Testing Header Settings query...' . PHP_EOL . PHP_EOL;

$query = '
{
  headerSettings {
    phone
    email
    featuredPromotion {
      id
      title
    }
  }
}
';

$result = graphql(['query' => $query]);

if (isset($result['errors'])) {
    echo 'Errors:' . PHP_EOL;
    foreach ($result['errors'] as $error) {
        echo '  - ' . $error['message'] . PHP_EOL;
        if (isset($error['debugMessage'])) {
            echo '    Debug: ' . $error['debugMessage'] . PHP_EOL;
        }
        if (isset($error['trace'])) {
            echo '    Trace: ' . $error['trace'][0]['file'] . ':' . $error['trace'][0]['line'] . PHP_EOL;
        }
    }
} else {
    echo 'SUCCESS!' . PHP_EOL;
    echo json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
