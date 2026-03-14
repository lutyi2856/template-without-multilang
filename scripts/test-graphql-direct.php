<?php
/**
 * Прямой тест GraphQL endpoint (имитация Next.js запроса)
 */

$query = '
query GetPrimaryMenu {
  menu(id: 19, idType: DATABASE_ID) {
    name
    menuItems {
      nodes {
        databaseId
        label
        url
        badgeCount
      }
    }
  }
}
';

$data = json_encode(['query' => $query]);

// Отправить запрос к GraphQL endpoint
$ch = curl_init('http://localhost:80/graphql');
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "=== ПРЯМОЙ ТЕСТ GRAPHQL ENDPOINT ===\n\n";
echo "HTTP Code: {$http_code}\n\n";
echo "Response:\n";
echo $result . "\n";

// Parse и analyze
$response = json_decode($result, true);
if (isset($response['data']['menu']['menuItems']['nodes'])) {
    echo "\n=== АНАЛИЗ BADGECOUNT ===\n\n";
    foreach ($response['data']['menu']['menuItems']['nodes'] as $item) {
        $label = $item['label'];
        $badge = $item['badgeCount'] ?? 'null';
        
        if ($badge !== null) {
            echo "  {$label}: badgeCount = {$badge}\n";
        }
    }
}
