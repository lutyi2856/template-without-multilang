<?php
/**
 * Fix ACF relationship fields for our-works <-> doctors.
 * Run via: docker exec wp-new-wordpress wp eval-file /tmp/fix-relationships.php --allow-root
 */

// our-works -> related_doctors (work -> doctor)
$works = array(
    862 => array(807), 865 => array(807), 868 => array(807),
    871 => array(811), 874 => array(811),
    877 => array(819), 880 => array(819),
    883 => array(823), 886 => array(823),
    889 => array(827), 892 => array(827),
    895 => array(831), 898 => array(831),
    901 => array(835), 904 => array(835),
    907 => array(837), 910 => array(837),
    913 => array(847), 916 => array(847),
    919 => array(851), 922 => array(851), 925 => array(851),
    928 => array(855), 931 => array(855),
);

// doctors -> related_works (doctor -> works)
$doctors = array(
    807 => array(862, 865, 868),
    811 => array(871, 874),
    819 => array(877, 880),
    823 => array(883, 886),
    827 => array(889, 892),
    831 => array(895, 898),
    835 => array(901, 904),
    837 => array(907, 910),
    847 => array(913, 916),
    851 => array(919, 922, 925),
    855 => array(928, 931),
);

echo "=== Fixing our-works -> related_doctors ===\n";
foreach ( $works as $work_id => $doctor_ids ) {
    $result = update_field( 'field_work_related_doctors', $doctor_ids, $work_id );
    echo "  Work #$work_id -> doctors [" . implode(',', $doctor_ids) . "] : " . ( $result ? 'OK' : 'FAIL' ) . "\n";
}

echo "\n=== Fixing doctors -> related_works ===\n";
foreach ( $doctors as $doctor_id => $work_ids ) {
    $result = update_field( 'field_doctor_related_works', $work_ids, $doctor_id );
    echo "  Doctor #$doctor_id -> works [" . implode(',', $work_ids) . "] : " . ( $result ? 'OK' : 'FAIL' ) . "\n";
}

echo "\n=== DONE ===\n";
