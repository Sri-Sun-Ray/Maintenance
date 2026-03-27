<?php
/**
 * get_module_data.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['zone'], $data['station'], $data['date'], $data['module'])) {
    die(json_encode(['success' => false, 'message' => 'Missing Zone, Station, Date or Module ID.']));
}

$zone = htmlspecialchars($data['zone']);
$station = htmlspecialchars($data['station']);
$date = htmlspecialchars($data['date']);
$module = $data['module'];

$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// 1. Find station_info_id
$stmt = $conn->prepare("SELECT id FROM station_info WHERE zone = ? AND station = ? AND date = ?");
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows == 0) {
    die(json_encode(['success' => false, 'message' => 'No station header info found.']));
}
$row = $res->fetch_assoc();
$stationInfoId = $row['id'];
$stmt->close();

// 2. Query actual module table
$tableName = ($module === 'quarterly_check') ? 'quarterly_check' : (($module === 'daily_monthly') ? 'daily_monthly' : 'quarterly_half');

if ($module === 'quarterly_check') {
    $stmt = $conn->prepare("SELECT s_no, details, name_number, date_commission, required_value, observed_value, remarks, image_path 
        FROM quarterly_check WHERE station_info_id = ? AND module = ?");
} else {
    $stmt = $conn->prepare("SELECT s_no, location AS name_number, maintenance_task_description AS details, action_taken AS required_value, frequency AS date_commission, equipment_condition AS observed_value, remarks, image_path 
        FROM {$tableName} WHERE station_info_id = ? AND module = ?");
}

$stmt->bind_param("is", $stationInfoId, $module);
$stmt->execute();
$res = $stmt->get_result();

$rows = [];
while ($row = $res->fetch_assoc()) {
    $imagePaths = [];
    if (!empty($row['image_path'])) {
        $decoded = json_decode($row['image_path'], true);
        if (is_array($decoded)) {
            $imagePaths = $decoded;
        } else {
            $imagePaths = [$row['image_path']];
        }
    }
    $row['image_paths'] = $imagePaths;
    $rows[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'data' => $rows]);
?>
