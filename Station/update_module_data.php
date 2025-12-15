<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// Get POST data
$zone = isset($_POST['zone']) ? htmlspecialchars($_POST['zone']) : null;
$station = isset($_POST['station']) ? htmlspecialchars($_POST['station']) : null;
$date = isset($_POST['date']) ? htmlspecialchars($_POST['date']) : null;
$module = isset($_POST['module']) ? htmlspecialchars($_POST['module']) : null;

if (!$zone || !$station || !$date || !$module) {
    die(json_encode(['success' => false, 'message' => 'Missing required fields']));
}

// Resolve module table
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
    die(json_encode(['success' => false, 'message' => 'Unsupported module']));
}

// DB connection
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Fetch station_info_id
$stmt = $conn->prepare("SELECT id FROM station_info WHERE zone = ? AND station = ? AND date = ?");
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$result = $stmt->get_result();
$stationInfoId = null;

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $stationInfoId = $row['id'];
} else {
    echo json_encode(['success' => false, 'message' => 'Station Info not found. Please save station info first.']);
    exit;
}
$stmt->close();

// Process observations
$observations = isset($_POST['observations']) ? $_POST['observations'] : [];
$fileBag = isset($_FILES['observations']) ? $_FILES['observations'] : null;

foreach ($observations as $index => $obs) {
    $sNo = intval($obs['s_no']);
    $details = isset($obs['details']) ? htmlspecialchars($obs['details']) : '';
    $nameNumber = isset($obs['name_number']) ? htmlspecialchars($obs['name_number']) : '';
    $dateCommission = isset($obs['date_commission']) && !empty($obs['date_commission']) ? htmlspecialchars($obs['date_commission']) : null;
    $requiredValue = isset($obs['required_value']) ? htmlspecialchars($obs['required_value']) : '';
    $observedValue = isset($obs['observed_value']) ? htmlspecialchars($obs['observed_value']) : '';
    $remarks = isset($obs['remarks']) ? htmlspecialchars($obs['remarks']) : '';

    $imagePaths = [];

    // Handle existing images (from previous saves)
    if (isset($obs['existing_images']) && is_array($obs['existing_images'])) {
        foreach ($obs['existing_images'] as $existingImg) {
            if (!empty($existingImg)) {
                $imagePaths[] = htmlspecialchars($existingImg);
            }
        }
    }

    // Handle new uploaded images
    if ($fileBag) {
        $newImages = collectUploadedImagesForRow(
            $fileBag,
            $index,
            ['zone' => $zone, 'station' => $station, 'date' => $date, 's_no' => $sNo],
            $imageFolder,
            $imageFolderAbs
        );
        $imagePaths = array_merge($imagePaths, $newImages);
    }

    $imageJson = !empty($imagePaths) ? json_encode($imagePaths) : null;

    // Check if record exists
    $checkStmt = $conn->prepare("SELECT id FROM {$tableName} WHERE station_info_id = ? AND s_no = ? AND module = ?");
    $checkStmt->bind_param("iis", $stationInfoId, $sNo, $module);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        // Update existing record
        $updateStmt = $conn->prepare("UPDATE {$tableName} SET details = ?, name_number = ?, date_commission = ?, required_value = ?, observed_value = ?, remarks = ?, image_path = ? 
            WHERE station_info_id = ? AND s_no = ? AND module = ?");
        $updateStmt->bind_param("sssssssiss", $details, $nameNumber, $dateCommission, $requiredValue, $observedValue, $remarks, $imageJson, $stationInfoId, $sNo, $module);

        if (!$updateStmt->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error updating data: ' . $updateStmt->error]);
            exit;
        }
        $updateStmt->close();
    } else {
        // Insert new record
        $insertStmt = $conn->prepare("INSERT INTO {$tableName} (s_no, station_info_id, module, details, name_number, date_commission, required_value, observed_value, remarks, image_path, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $createdAt = date('Y-m-d H:i:s');
        $insertStmt->bind_param("iisssssssss", $sNo, $stationInfoId, $module, $details, $nameNumber, $dateCommission, $requiredValue, $observedValue, $remarks, $imageJson, $createdAt);

        if (!$insertStmt->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error inserting data: ' . $insertStmt->error]);
            exit;
        }
        $insertStmt->close();
    }

    $checkStmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Module data updated successfully']);
?>
