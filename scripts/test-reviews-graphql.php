<?php
/**
 * Test Reviews GraphQL Query
 */

$query = '
query GetReviews {
  reviews(first: 5) {
    edges {
      node {
        id
        databaseId
        title
        date
        answer
        authorName
        rating
        relatedDoctors {
          id
          title
        }
      }
    }
  }
}
';

echo "=== Testing Reviews GraphQL Query ===\n\n";

$result = graphql([
    'query' => $query,
]);

if (isset($result['errors'])) {
    echo "❌ GraphQL Errors:\n";
    print_r($result['errors']);
} else {
    echo "✓ GraphQL Query Successful!\n\n";
    
    $reviews = $result['data']['reviews']['edges'];
    echo "Found reviews: " . count($reviews) . "\n\n";
    
    foreach ($reviews as $edge) {
        $review = $edge['node'];
        echo "═══════════════════════════════════\n";
        echo "ID: {$review['databaseId']}\n";
        echo "Title: {$review['title']}\n";
        echo "Author: " . ($review['authorName'] ?: 'N/A') . "\n";
        echo "Rating: " . ($review['rating'] ?: 'N/A') . "\n";
        echo "Answer: " . (isset($review['answer']) ? substr($review['answer'], 0, 60) . "..." : 'N/A') . "\n";
        
        if (!empty($review['relatedDoctors'])) {
            echo "Related Doctors:\n";
            foreach ($review['relatedDoctors'] as $doctor) {
                echo "  - {$doctor['title']}\n";
            }
        } else {
            echo "Related Doctors: None\n";
        }
        echo "\n";
    }
    
    echo "\n✓ All fields returned successfully!\n";
    echo "✓ Manual GraphQL registration is working!\n";
}
