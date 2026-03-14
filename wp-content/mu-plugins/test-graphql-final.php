<?php
add_action('init', function() {
    if (!isset($_GET['test_graphql_final'])) return;
    
    $query = '
    query {
      headerSettings {
        featuredService {
          id
          databaseId
          title
          serviceFeatures {
            text
          }
          relatedPrices {
            edges {
              node {
                ... on Price {
                  id
                  databaseId
                  title
                  regularPrice
                  promoPrice
                  currency
                }
              }
            }
          }
        }
      }
    }
    ';
    
    $url = 'http://localhost/graphql';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['query' => $query]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    header('Content-Type: application/json');
    echo $response;
    exit;
}, 999);
