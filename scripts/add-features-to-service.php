<?php
/**
 * Добавить особенности (features repeater) к услуге "Имплантация зубов"
 */

// ID услуги "Имплантация зубов"
$service_id = 41;

// Особенности услуги
$features = [
    ['text' => 'высокая биосовместимость с костной тканью'],
    ['text' => 'индивидуальный подбор модели импланта'],
    ['text' => 'надежный южнокорейский бренд'],
];

// Сохраняем repeater field
update_field('features', $features, $service_id);

echo "✅ Добавлены особенности к услуге ID {$service_id}\n";
echo "Features count: " . count($features) . "\n";

// Проверка
$saved_features = get_field('features', $service_id);
echo "Saved features: " . print_r($saved_features, true) . "\n";
