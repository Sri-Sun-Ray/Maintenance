<?php

header('Content-Type: application/json; charset=utf-8');


$reportsDir = __DIR__ . '/../reports';

// If reports folder is not found
if (!is_dir($reportsDir)) {
    echo json_encode(['success' => false, 'message' => 'Reports folder not found']);
    exit;
}

$files = glob($reportsDir . '/*.pdf');
$data = [];

foreach ($files as $file) {
    $fileName = basename($file);
    // pattern: RIU_ZONE_STATION_RIU_NO_DATE_TIME.pdf
    if (preg_match('/^RIU_([A-Za-z0-9]+)_([A-Za-z0-9]+)_([A-Za-z0-9]+)_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.pdf$/', $fileName, $matches)) {
        $zone = $matches[1];
        $station = $matches[2];
        $riu_no = $matches[3];
        $date = $matches[4];
        $time = str_replace('-', ':', $matches[5]); // convert 16-13-21 → 16:13:21

        $data[] = [
            'zone' => $zone,
            'station' => $station,
            'riu_no' => $riu_no,
            'report' => $fileName,
            'path' => 'reports/' . $fileName,
            'created_at' => "$date $time"
        ];
    }
}

echo json_encode(['success' => true, 'reports' => $data]);
?>

