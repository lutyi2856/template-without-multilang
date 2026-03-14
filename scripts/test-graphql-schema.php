<?php
require('/var/www/html/wp-load.php');

echo '=== Testing WPGraphQL Schema ===' . PHP_EOL . PHP_EOL;

// Test Promotion type
$query = '
{
  __type(name: "Promotion") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
';

$result = graphql(['query' => $query]);

echo 'Promotion type fields:' . PHP_EOL;
if (isset($result['data']['__type']['fields'])) {
    foreach ($result['data']['__type']['fields'] as $field) {
        echo '  - ' . $field['name'];
        if ($field['name'] === 'relatedServices' || $field['name'] === 'relatedPrices') {
            echo ' ✓ FOUND!';
        }
        echo PHP_EOL;
    }
} else {
    echo '  ERROR: No fields found!' . PHP_EOL;
}

echo PHP_EOL . '=== Checking ACF Field Groups ===' . PHP_EOL;

$groups = acf_get_field_groups();
foreach ($groups as $group) {
    if (strpos($group['key'], 'relationship') !== false) {
        echo PHP_EOL . 'Group: ' . $group['title'] . ' (' . $group['key'] . ')' . PHP_EOL;
        echo '  Show in GraphQL: ' . ($group['show_in_graphql'] ? 'YES' : 'NO') . PHP_EOL;
        echo '  GraphQL Type Name: ' . ($group['graphql_field_name'] ?? 'not set') . PHP_EOL;
        echo '  GraphQL Types: ' . json_encode($group['graphql_types'] ?? []) . PHP_EOL;
        
        $fields = acf_get_fields($group['key']);
        if ($fields) {
            echo '  Fields:' . PHP_EOL;
            foreach ($fields as $field) {
                echo '    - ' . $field['name'] . ' (' . $field['type'] . ')';
                if ($field['type'] === 'relationship') {
                    echo ' [bidirectional: ' . ($field['bidirectional'] ? 'YES' : 'NO') . ']';
                }
                echo PHP_EOL;
                echo '      Show in GraphQL: ' . ($field['show_in_graphql'] ? 'YES' : 'NO') . PHP_EOL;
                echo '      GraphQL Field Name: ' . ($field['graphql_field_name'] ?? 'not set') . PHP_EOL;
            }
        }
    }
}
