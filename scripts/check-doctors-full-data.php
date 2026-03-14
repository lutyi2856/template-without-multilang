<?php
/**
 * Проверка полных данных врачей (ACF поля, featured_image, клиники)
 * 
 * Запуск:
 * docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/check-doctors-full-data.php --allow-root
 */

// GraphQL query для всех данных врачей
$query = '
query GetDoctorsFullData {
  doctors(first: 10) {
    nodes {
      id
      databaseId
      title
      slug
      featuredImage {
        node {
          sourceUrl
          mediaItemUrl
        }
      }
      doctorFields {
        experience
        rating
        ratingSource
        videoUrl
      }
      clinic {
        ... on Clinic {
          id
          databaseId
          title
        }
      }
      relatedServices {
        id
        title
      }
    }
  }
}
';

// Выполнение GraphQL запроса
$result = graphql([
    'query' => $query,
]);

// Форматированный вывод
echo "\n========================================\n";
echo "ПРОВЕРКА: Полные данные врачей\n";
echo "========================================\n\n";

if (isset($result['errors'])) {
    echo "❌ ОШИБКИ:\n";
    foreach ($result['errors'] as $error) {
        echo "  - " . $error['message'] . "\n";
        if (isset($error['debugMessage'])) {
            echo "    Debug: " . $error['debugMessage'] . "\n";
        }
    }
    echo "\n";
}

if (isset($result['data']['doctors']['nodes'])) {
    $doctors = $result['data']['doctors']['nodes'];
    echo "Найдено врачей: " . count($doctors) . "\n\n";
    
    $stats = [
        'total' => count($doctors),
        'with_photo' => 0,
        'with_experience' => 0,
        'with_rating' => 0,
        'with_clinic' => 0,
        'with_services' => 0,
        'full_data' => 0,
    ];
    
    foreach ($doctors as $doctor) {
        echo "👨‍⚕️ " . $doctor['title'] . " (ID: " . $doctor['databaseId'] . ")\n";
        
        // Фото
        if (isset($doctor['featuredImage']['node']['sourceUrl'])) {
            echo "  ✅ Фото: " . $doctor['featuredImage']['node']['sourceUrl'] . "\n";
            $stats['with_photo']++;
        } else {
            echo "  ❌ Фото: НЕТ\n";
        }
        
        // Experience
        $experience = $doctor['doctorFields']['experience'] ?? null;
        if ($experience) {
            echo "  ✅ Стаж: " . $experience . "\n";
            $stats['with_experience']++;
        } else {
            echo "  ❌ Стаж: НЕТ\n";
        }
        
        // Rating
        $rating = $doctor['doctorFields']['rating'] ?? null;
        $ratingSource = $doctor['doctorFields']['ratingSource'] ?? null;
        if ($rating) {
            echo "  ✅ Рейтинг: " . $rating . " (" . ($ratingSource ?? 'нет источника') . ")\n";
            $stats['with_rating']++;
        } else {
            echo "  ❌ Рейтинг: НЕТ\n";
        }
        
        // Clinic
        if (isset($doctor['clinic']['title'])) {
            echo "  ✅ Клиника: " . $doctor['clinic']['title'] . " (ID: " . $doctor['clinic']['databaseId'] . ")\n";
            $stats['with_clinic']++;
        } else {
            echo "  ❌ Клиника: НЕТ\n";
        }
        
        // Services
        if (isset($doctor['relatedServices']) && !empty($doctor['relatedServices'])) {
            echo "  ✅ Услуги: " . count($doctor['relatedServices']) . " шт.\n";
            $stats['with_services']++;
        } else {
            echo "  ❌ Услуги: НЕТ\n";
        }
        
        // Full data check
        $has_full_data = 
            isset($doctor['featuredImage']['node']['sourceUrl']) &&
            $experience &&
            $rating &&
            isset($doctor['clinic']['title']) &&
            isset($doctor['relatedServices']) && !empty($doctor['relatedServices']);
        
        if ($has_full_data) {
            echo "  ✅ ПОЛНЫЕ ДАННЫЕ\n";
            $stats['full_data']++;
        } else {
            echo "  ⚠️ НЕПОЛНЫЕ ДАННЫЕ\n";
        }
        
        echo "\n";
    }
    
    echo "========================================\n";
    echo "СТАТИСТИКА:\n";
    echo "========================================\n";
    echo "Всего врачей: " . $stats['total'] . "\n";
    echo "С фото: " . $stats['with_photo'] . " (" . round($stats['with_photo'] / $stats['total'] * 100) . "%)\n";
    echo "Со стажем: " . $stats['with_experience'] . " (" . round($stats['with_experience'] / $stats['total'] * 100) . "%)\n";
    echo "С рейтингом: " . $stats['with_rating'] . " (" . round($stats['with_rating'] / $stats['total'] * 100) . "%)\n";
    echo "С клиникой: " . $stats['with_clinic'] . " (" . round($stats['with_clinic'] / $stats['total'] * 100) . "%)\n";
    echo "С услугами: " . $stats['with_services'] . " (" . round($stats['with_services'] / $stats['total'] * 100) . "%)\n";
    echo "С ПОЛНЫМИ данными: " . $stats['full_data'] . " (" . round($stats['full_data'] / $stats['total'] * 100) . "%)\n";
    echo "\n";
}

echo "========================================\n";
echo "✅ Проверка завершена!\n";
echo "========================================\n";
