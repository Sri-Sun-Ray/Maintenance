<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

function decodeImagePathsValue($value) {
    if (!$value) return [];
    if (is_array($value)) return array_values(array_filter($value));
    $decoded = json_decode(trim((string)$value), true);
    return (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? array_values(array_filter($decoded)) : [$value];
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['zone'], $data['station'], $data['date'])) throw new Exception('Missing parameters');

    $zone = $data['zone'];
    $station = $data['station'];
    $date = $data['date'];

    $conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");
    if ($conn->connect_error) throw new Exception('DB connection failed');

    // Station info
    $stmt = $conn->prepare("SELECT id, zone, station, date FROM station_info WHERE zone=? AND station=? AND date=?");
    $stmt->bind_param("sss", $zone, $station, $date);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) throw new Exception('Station Info not found');
    $stationRow = $res->fetch_assoc();
    $stationInfoId = $stationRow['id'];
    $stationInfo = [
        'zone' => $stationRow['zone'],
        'station' => $stationRow['station'],
        'date' => $stationRow['date']
    ];
    $stmt->close();

    $observations = [];

    // Define modules with correct column mapping
    $modules = [
        'quarterly_check' => [
            'table' => 'quarterly_check',
            'columns' => ['s_no','module','details','name_number','date_commission','required_value','observed_value','remarks','image_path']
        ],
        'daily_monthly' => [
            'table' => 'daily_monthly',
            'columns' => ['s_no','module','location','maintenance_task_description','action_taken','frequency','equipment_condition','remarks','image_path']
        ],
        'quarterly_half' => [
            'table' => 'quarterly_half',
            'columns' => ['s_no','module','location','maintenance_task_description','action_taken','frequency','equipment_condition','remarks','image_path']
        ]
    ];

    foreach ($modules as $mod => $info) {
        $colStr = implode(",", $info['columns']);
        $stmt = $conn->prepare("SELECT {$colStr} FROM {$info['table']} WHERE station_info_id=? ORDER BY CAST(s_no AS UNSIGNED)");
        $stmt->bind_param("i", $stationInfoId);
        $stmt->execute();
        $res = $stmt->get_result();

        while ($row = $res->fetch_assoc()) {
            $row['image_paths'] = decodeImagePathsValue($row['image_path'] ?? null);
            unset($row['image_path']);
            $observations[] = $row;
        }
        $stmt->close();
    }

    $conn->close();
    ob_end_clean();
    echo json_encode(['success' => true, 'station_info' => $stationInfo, 'observations' => $observations]);

} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
