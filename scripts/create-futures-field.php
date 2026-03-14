<?php
/**
 * Create Promotion Futures field согласно skills
 */
require_once(__DIR__ . '/../wp-load.php');

// Вызываем хук acf/init чтобы выполнилась функция создания поля
do_action('acf/init');

echo "Done! Field should be created.\n";
echo "Refresh promotion edit page in WordPress Admin.\n";
