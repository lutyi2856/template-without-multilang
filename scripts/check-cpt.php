<?php
require('/var/www/html/wp-load.php');

echo 'Registered Post Types:' . PHP_EOL . PHP_EOL;

$cpts = get_post_types(['public' => true], 'objects');
foreach ($cpts as $cpt) {
    echo '- ' . $cpt->name . ' (' . $cpt->label . ')' . PHP_EOL;
}

echo PHP_EOL . 'Looking for prices...' . PHP_EOL;
$prices = get_post_type_object('prices');
if ($prices) {
    echo 'FOUND: Prices CPT is registered!' . PHP_EOL;
    echo '  Label: ' . $prices->label . PHP_EOL;
    echo '  Show in menu: ' . ($prices->show_in_menu ? 'YES' : 'NO') . PHP_EOL;
    echo '  Show in GraphQL: ' . ($prices->show_in_graphql ? 'YES' : 'NO') . PHP_EOL;
} else {
    echo 'NOT FOUND: Prices CPT is not registered!' . PHP_EOL;
    echo PHP_EOL . 'Checking mu-plugins...' . PHP_EOL;
    
    $mu_plugins = get_mu_plugins();
    foreach ($mu_plugins as $plugin_file => $plugin_data) {
        if (strpos($plugin_file, 'unident-structure') !== false) {
            echo 'Found: ' . $plugin_data['Name'] . ' (' . $plugin_file . ')' . PHP_EOL;
        }
    }
}
