<?php
/**
 * Проверка GraphQL: Doctors ↔ Services bidirectional relationship
 * 
 * Запуск:
 * docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/test-doctors-services-graphql.php --allow-root
 */

// GraphQL query для проверки обеих сторон связи
$query = '
query TestDoctorServicesRelationship {
  doctors(first: 3) {
    nodes {
      id
      databaseId
      title
      relatedServices {
        id
        databaseId
        title
        slug
      }
    }
  }
  
  services(first: 3) {
    nodes {
      id
      databaseId
      title
      relatedDoctors {
        id
        databaseId
        title
        slug
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
echo "ПРОВЕРКА: Doctors ↔ Services Relationship\n";
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
    echo "✅ ВРАЧИ → УСЛУГИ:\n";
    foreach ($result['data']['doctors']['nodes'] as $doctor) {
        echo "\n  👨‍⚕️ " . $doctor['title'] . " (ID: " . $doctor['databaseId'] . ")\n";
        if (isset($doctor['relatedServices']) && !empty($doctor['relatedServices'])) {
            echo "     Услуги:\n";
            foreach ($doctor['relatedServices'] as $service) {
                echo "       - " . $service['title'] . " (ID: " . $service['databaseId'] . ")\n";
            }
        } else {
            echo "     ⚠️ Услуг нет\n";
        }
    }
    echo "\n";
}

if (isset($result['data']['services']['nodes'])) {
    echo "✅ УСЛУГИ → ВРАЧИ:\n";
    foreach ($result['data']['services']['nodes'] as $service) {
        echo "\n  💊 " . $service['title'] . " (ID: " . $service['databaseId'] . ")\n";
        if (isset($service['relatedDoctors']) && !empty($service['relatedDoctors'])) {
            echo "     Врачи:\n";
            foreach ($service['relatedDoctors'] as $doctor) {
                echo "       - " . $doctor['title'] . " (ID: " . $doctor['databaseId'] . ")\n";
            }
        } else {
            echo "     ⚠️ Врачей нет\n";
        }
    }
    echo "\n";
}

echo "========================================\n";
echo "✅ Проверка завершена!\n";
echo "========================================\n";
