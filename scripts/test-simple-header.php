<?php
require('/var/www/html/wp-load.php');

$query = '{headerSettings{phone email}}';
$result = graphql(['query' => $query]);
echo json_encode($result, JSON_PRETTY_PRINT);
