<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['zone'], $data['station'], $data['date'], $data['module'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$zone = htmlspecialchars($data['zone']);
$station = htmlspecialchars($data['station']);
$date = htmlspecialchars($data['date']);
$module = htmlspecialchars($data['module']);

function resolveModuleTable($module)
{
    $map = [
        'quarterly_check' => 'quarterly_check',
        'daily_monthly' => 'daily_monthly',
        'quarterly_half' => 'quarterly_half'
    ];

    $key = strtolower($module);
    return $map[$key] ?? null;
}

$tableName = resolveModuleTable($module);
if (!$tableName) {
    echo json_encode(['success' => false, 'message' => 'Unsupported module']);
    exit;
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get the station_info_id
$stmt = $conn->prepare("SELECT id FROM station_info WHERE zone = ? AND station = ? AND date = ?");
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$result = $stmt->get_result();
$stationInfoId = null;

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $stationInfoId = $row['id'];
} else {
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}
$stmt->close();

// Get module data
// Build SELECT per table to align new schemas with the front-end expectations
// Front-end expects keys: s_no, details, name_number, date_commission, required_value, observed_value, remarks, image_paths[]
if ($tableName === 'quarterly_check') {
    $sql = "
        SELECT 
            s_no,
            details,
            name_number,
            date_commission,
            required_value,
            observed_value,
            remarks,
            image_path
        FROM quarterly_check
        WHERE station_info_id = ? AND module = ?
        ORDER BY s_no ASC
    ";
} elseif ($tableName === 'daily_monthly' || $tableName === 'quarterly_half') {
    // New structure: location, maintenance_task_description, action_taken, frequency, equipment_condition
    // Map them back to the generic names the JS/report code already uses
    $sql = "
        SELECT 
            s_no,
            maintenance_task_description AS details,
            location AS name_number,
            frequency AS date_commission,
            action_taken AS required_value,
            equipment_condition AS observed_value,
            remarks,
            image_path
        FROM {$tableName}
        WHERE station_info_id = ? AND module = ?
        ORDER BY s_no ASC
    ";
} else {
    echo json_encode(['success' => false, 'message' => 'Unsupported module/table mapping']);
    exit;
}

$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $stationInfoId, $module);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $imagePaths = [];
    if (!empty($row['image_path'])) {
        $decoded = json_decode($row['image_path'], true);
        if (is_array($decoded)) {
            $imagePaths = $decoded;
        } else {
            $imagePaths = [$row['image_path']];
        }
    }
    
    $data[] = [
        's_no' => $row['s_no'],
        'details' => $row['details'],
        'name_number' => $row['name_number'],
        'date_commission' => $row['date_commission'],
        'required_value' => $row['required_value'],
        'observed_value' => $row['observed_value'],
        'remarks' => $row['remarks'],
        'image_paths' => $imagePaths
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'data' => $data]);
?>

