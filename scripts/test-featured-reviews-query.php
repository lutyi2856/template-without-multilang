<?php
/**
 * Тест GraphQL запроса для featured reviews
 * 
 * Запуск:
 * docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/test-featured-reviews-query.php --allow-root
 */

$query = '
query GetFeaturedReviews($first: Int = 3) {
  reviews(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
    nodes {
      id
      databaseId
      title
      content
      date
      slug
      answer
      authorName
      rating
      platformLogo {
        sourceUrl
        altText
      }
      relatedDoctors {
        id
        databaseId
        title
        slug
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        doctorFields {
          specialization
        }
        relatedServices {
          id
          databaseId
          title
          slug
        }
      }
    }
  }
}
';

$result = graphql([
    'query' => $query,
    'variables' => ['first' => 3],
]);

echo "\n========================================\n";
echo "ПРОВЕРКА: Featured Reviews Query\n";
echo "========================================\n\n";

if (isset($result['errors'])) {
    echo "❌ ОШИБКИ:\n";
    foreach ($result['errors'] as $error) {
        echo "  - " . $error['message'] . "\n";
        if (isset($error['debugMessage'])) {
            echo "    Debug: " . $error['debugMessage'] . "\n";
        }
    }
    exit(1);
}

if (isset($result['data']['reviews']['nodes'])) {
    $reviews = $result['data']['reviews']['nodes'];
    echo "✅ Найдено отзывов: " . count($reviews) . "\n\n";
    
    foreach ($reviews as $review) {
        echo "📝 " . $review['title'] . " (ID: " . $review['databaseId'] . ")\n";
        echo "   Автор: " . ($review['authorName'] ?? 'Не указан') . "\n";
        echo "   Рейтинг: " . ($review['rating'] ?? 'Не указан') . "\n";
        echo "   Ответ клиники: " . (empty($review['answer']) ? 'Нет' : 'Да') . "\n";
        
        if (isset($review['relatedDoctors']) && !empty($review['relatedDoctors'])) {
            echo "   Врачи (" . count($review['relatedDoctors']) . "):\n";
            foreach ($review['relatedDoctors'] as $doctor) {
                echo "     - " . $doctor['title'] . "\n";
                if (isset($doctor['relatedServices']) && !empty($doctor['relatedServices'])) {
                    echo "       Услуги (" . count($doctor['relatedServices']) . "):\n";
                    foreach ($doctor['relatedServices'] as $service) {
                        echo "         * " . $service['title'] . "\n";
                    }
                } else {
                    echo "       ⚠️ Услуг нет\n";
                }
            }
        } else {
            echo "   ⚠️ Врачей нет\n";
        }
        echo "\n";
    }
} else {
    echo "❌ Отзывов не найдено\n";
}

echo "========================================\n";
