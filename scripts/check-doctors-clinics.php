<?php
/**
 * Проверка клиник у врачей (может быть несколько)
 * 
 * Запуск:
 * docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/check-doctors-clinics.php --allow-root
 */

// GraphQL query для проверки клиник
$query = '
query GetDoctorsWithClinics {
  doctors(first: 10) {
    nodes {
      id
      databaseId
      title
      featuredImage {
        node {
          id
          sourceUrl
          mediaItemUrl
        }
      }
      clinic {
        ... on Clinic {
          id
          databaseId
          title
        }
      }
      clinics {
        nodes {
          id
          databaseId
          title
        }
      }
    }
  }
}
';

// Выполнение GraphQL запроса
$result = graphql([
    'query' => $query,
]);

echo "\n========================================\n";
echo "ПРОВЕРКА: Клиники у врачей\n";
echo "========================================\n\n";

if (isset($result['errors'])) {
    echo "❌ ОШИБКИ:\n";
    foreach ($result['errors'] as $error) {
        echo "  - " . $error['message'] . "\n";
    }
    echo "\n";
}

if (isset($result['data']['doctors']['nodes'])) {
    $doctors = $result['data']['doctors']['nodes'];
    
    foreach ($doctors as $doctor) {
        echo "👨‍⚕️ " . $doctor['title'] . " (ID: " . $doctor['databaseId'] . ")\n";
        
        // Featured Image
        if (isset($doctor['featuredImage']['node']['sourceUrl'])) {
            echo "  📷 Фото: " . basename($doctor['featuredImage']['node']['sourceUrl']) . "\n";
        } else {
            echo "  ❌ Фото: НЕТ\n";
        }
        
        // Singular clinic (ACF Relationship)
        if (isset($doctor['clinic']['title'])) {
            echo "  🏥 Клиника (singular): " . $doctor['clinic']['title'] . "\n";
        }
        
        // Multiple clinics (ACF Relationship - может быть массив?)
        if (isset($doctor['clinics']['nodes']) && !empty($doctor['clinics']['nodes'])) {
            echo "  🏥 Клиники (plural):\n";
            foreach ($doctor['clinics']['nodes'] as $clinic) {
                echo "      - " . $clinic['title'] . " (ID: " . $clinic['databaseId'] . ")\n";
            }
        }
        
        echo "\n";
    }
}

// Проверка через прямой ACF запрос
echo "========================================\n";
echo "ПРЯМАЯ ПРОВЕРКА ACF ПОЛЕЙ\n";
echo "========================================\n\n";

$doctors = get_posts([
    'post_type' => 'doctors',
    'posts_per_page' => 5,
    'post_status' => 'publish',
]);

foreach ($doctors as $doctor) {
    echo "👨‍⚕️ " . $doctor->post_title . " (ID: " . $doctor->ID . ")\n";
    
    // Проверка ACF поля clinic
    $clinic = get_field('clinic', $doctor->ID);
    
    if ($clinic) {
        if (is_array($clinic)) {
            echo "  🏥 Клиники (массив):\n";
            foreach ($clinic as $c) {
                $title = is_object($c) ? $c->post_title : get_the_title($c);
                echo "      - " . $title . "\n";
            }
        } else {
            $title = is_object($clinic) ? $clinic->post_title : get_the_title($clinic);
            echo "  🏥 Клиника: " . $title . "\n";
        }
    } else {
        echo "  ❌ Клиника: НЕТ\n";
    }
    
    // Featured image
    $thumbnail = get_the_post_thumbnail_url($doctor->ID, 'medium');
    if ($thumbnail) {
        echo "  📷 Фото: " . basename($thumbnail) . "\n";
    } else {
        echo "  ❌ Фото: НЕТ\n";
    }
    
    echo "\n";
}

echo "✅ Проверка завершена!\n";
