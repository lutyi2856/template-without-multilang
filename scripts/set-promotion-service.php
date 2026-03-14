<?php
/**
 * Script: Set Promotion → Service relationship
 * Связывает акцию ID 42 с услугой ID 41
 */

require_once '/var/www/html/wp-load.php';

$promotion_id = 42; // Акция "Имплант OSSTEM с установкой"
$service_id = 41;   // Услуга "Имплантация зубов"

// Проверяем что посты существуют
$promotion = get_post($promotion_id);
$service = get_post($service_id);

if (!$promotion) {
    die("❌ Promotion ID {$promotion_id} not found\n");
}

if (!$service) {
    die("❌ Service ID {$service_id} not found\n");
}

echo "✅ Found Promotion: {$promotion->post_title}\n";
echo "✅ Found Service: {$service->post_title}\n";

// Устанавливаем связь через ACF
if (function_exists('update_field')) {
    // ACF relationship field ожидает массив ID постов
    $result = update_field('related_services', [$service_id], $promotion_id);
    
    if ($result) {
        echo "✅ Successfully linked Service ID {$service_id} to Promotion ID {$promotion_id}\n";
    } else {
        echo "⚠️ update_field returned false - checking if already set...\n";
    }
    
    // Проверяем что связь установлена
    $linked_services = get_field('related_services', $promotion_id);
    echo "Current related_services: ";
    var_dump($linked_services);
} else {
    echo "❌ ACF not loaded\n";
}

echo "\nDone!\n";
