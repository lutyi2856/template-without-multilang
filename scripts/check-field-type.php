<?php
do_action('acf/init');
$field = acf_get_field('field_service_features');
if ($field && $field['type'] === 'repeater') {
    echo "SUCCESS: Field is repeater\n";
    echo "Sub fields: " . count($field['sub_fields']) . "\n";
} else {
    echo "ERROR: Field type is " . ($field ? $field['type'] : 'not found') . "\n";
}
