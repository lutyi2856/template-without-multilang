<?php
/**
 * Test filled doctor fields via GraphQL
 * 
 * Run: docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/test-filled-doctors.php --allow-root
 */

define('WP_USE_THEMES', false);
require_once '/var/www/html/wp-load.php';

echo "=== Проверка заполненных данных врачей ===\n\n";

// GraphQL query
$query = '
query GetDoctors {
  doctors(first: 3) {
    nodes {
      id
      databaseId
      title
      experience
      rating
      ratingSource
      clinic {
        ... on Clinic {
          id
          title
        }
      }
      relatedServices {
        ... on Service {
          id
          title
        }
      }
      relatedReviews {
        ... on Review {
          id
          title
        }
      }
      relatedWorks {
        ... on OurWork {
          id
          title
        }
      }
    }
  }
}
';

// Execute GraphQL query
$result = graphql([
    'query' => $query,
]);

if (isset($result['errors'])) {
    echo "❌ GraphQL Errors:\n";
    print_r($result['errors']);
    exit(1);
}

if (!isset($result['data']['doctors']['nodes'])) {
    echo "❌ Нет данных врачей\n";
    exit(1);
}

$doctors = $result['data']['doctors']['nodes'];

echo "Найдено врачей: " . count($doctors) . "\n\n";

foreach ($doctors as $index => $doctor) {
    $num = $index + 1;
    echo "[$num] {$doctor['title']} (ID: {$doctor['databaseId']})\n";
    
    // Experience
    echo "  Стаж: " . ($doctor['experience'] ?? 'не заполнено') . "\n";
    
    // Rating
    echo "  Рейтинг: " . ($doctor['rating'] ?? 'не заполнено') . "\n";
    
    // Rating Source
    echo "  Источник: " . ($doctor['ratingSource'] ?? 'не заполнено') . "\n";
    
    // Clinic
    $clinic = $doctor['clinic'] ?? null;
    if ($clinic) {
        echo "  Клиника: {$clinic['title']}\n";
    } else {
        echo "  Клиника: не заполнено\n";
    }
    
    // Services
    $services = $doctor['relatedServices'] ?? [];
    if (is_array($services)) {
        echo "  Услуги: " . count($services) . " шт.\n";
        if (!empty($services)) {
            foreach (array_slice($services, 0, 3) as $service) {
                if (isset($service['title'])) {
                    echo "    - {$service['title']}\n";
                }
            }
            if (count($services) > 3) {
                echo "    ... и еще " . (count($services) - 3) . " услуг\n";
            }
        }
    } else {
        echo "  Услуги: не заполнено\n";
    }
    
    // Reviews
    $reviews = $doctor['relatedReviews'] ?? [];
    if (is_array($reviews)) {
        echo "  Отзывы: " . count($reviews) . " шт.\n";
        if (!empty($reviews)) {
            foreach (array_slice($reviews, 0, 2) as $review) {
                if (isset($review['title'])) {
                    echo "    - {$review['title']}\n";
                }
            }
            if (count($reviews) > 2) {
                echo "    ... и еще " . (count($reviews) - 2) . " отзывов\n";
            }
        }
    } else {
        echo "  Отзывы: не заполнено\n";
    }
    
    // Works
    $works = $doctor['relatedWorks'] ?? [];
    if (is_array($works)) {
        echo "  Работы: " . count($works) . " шт.\n";
        if (!empty($works)) {
            foreach (array_slice($works, 0, 2) as $work) {
                if (isset($work['title'])) {
                    echo "    - {$work['title']}\n";
                }
            }
            if (count($works) > 2) {
                echo "    ... и еще " . (count($works) - 2) . " работ\n";
            }
        }
    } else {
        echo "  Работы: не заполнено\n";
    }
    
    echo "\n";
}

echo "✓ Проверка завершена!\n";
