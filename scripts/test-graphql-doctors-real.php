<?php
/**
 * Тест GraphQL запроса для врачей - проверка реальных данных
 */

$query = '
query GetDoctors {
  doctors(first: 3) {
    nodes {
      id
      databaseId
      title
      featuredImage {
        node {
          sourceUrl(size: MEDIUM)
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      doctorFields {
        experience
        rating
        ratingSource
        videoUrl
      }
      clinic {
        id
        databaseId
        title
      }
    }
  }
}
';

$result = graphql(['query' => $query]);

echo "=== GRAPHQL РЕЗУЛЬТАТ ===\n\n";
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
