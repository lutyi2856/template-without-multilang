<?php
/**
 * Тест GraphQL запроса headerSettings
 */

$query = '
query {
  headerSettings {
    locationsCount
  }
}
';

$data = json_encode(['query' => $query]);

$ch = curl_init('http://localhost:8080/graphql');
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
curl_close($ch);

echo "GraphQL Response:\n";
echo $result . "\n";
