<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$zone = isset($_POST['zone']) ? htmlspecialchars($_POST['zone']) : null;
$station = isset($_POST['station']) ? htmlspecialchars($_POST['station']) : null;
$riuNo = isset($_POST['riu_no']) ? intval($_POST['riu_no']) : null;
$equipNo = isset($_POST['equip_no']) ? intval($_POST['equip_no']) : null;
$module = isset($_POST['module']) ? htmlspecialchars($_POST['module']) : null;

if (!$zone || !$station || !$riuNo || !$equipNo || !$module) {
    die(json_encode(['success' => false, 'message' => 'Missing required fields']));
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

// Get the riu_info_id
$stmt = $conn->prepare("SELECT id FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
$stmt->bind_param("ssii", $zone, $station, $riuNo, $equipNo);
$stmt->execute();
$result = $stmt->get_result();
$riuInfoId = null;

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $riuInfoId = $row['id'];
} else {
    echo json_encode(['success' => false, 'message' => 'RIU Info not found']);
    exit;
}
$stmt->close();

// Create image folder if not exists
$imageFolder = 'uploads/images/';
if (!is_dir($imageFolder)) {
    mkdir($imageFolder, 0755, true);
}

// Process observations: $_POST['observations'] contains text fields, files are in $_FILES['observations']
$observations = isset($_POST['observations']) ? $_POST['observations'] : [];

foreach ($observations as $index => $obs) {
    $slNo = intval($obs['sl_no']);
    $description = isset($obs['description']) ? htmlspecialchars($obs['description']) : '';
    $actionTaken = isset($obs['action_taken']) ? htmlspecialchars($obs['action_taken']) : '';
    $observation = isset($obs['observation']) ? htmlspecialchars($obs['observation']) : '';
    $remarks = isset($obs['remarks']) ? htmlspecialchars($obs['remarks']) : '';
    $imagePath = null;

    // Handle image upload if provided in $_FILES
    if (isset($_FILES['observations']['name'][$index]['image']) && $_FILES['observations']['name'][$index]['image']) {
        $tmpName = $_FILES['observations']['tmp_name'][$index]['image'];
        $fileName = basename($_FILES['observations']['name'][$index]['image']);
        $timestamp = time();
        $uniqueFileName = "{$zone}_{$station}_{$riuNo}_{$slNo}_{$timestamp}_" . $fileName;
        $destination = $imageFolder . $uniqueFileName;

        if (move_uploaded_file($tmpName, $destination)) {
            $imagePath = str_replace('\\', '/', $destination);
        } else {
            $imagePath = null;
        }
    }

    // Insert into nms table; ensure bind types/order are correct
    $insertStmt = $conn->prepare("INSERT INTO nms (sl_no, module, description, action_taken, observation, remarks, image_path, riu_info_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $createdAt = date('Y-m-d H:i:s');
    // types: i, s, s, s, s, s, s, i, s => "issssssis"
    $insertStmt->bind_param("issssssis", $slNo, $module, $description, $actionTaken, $observation, $remarks, $imagePath, $riuInfoId, $createdAt);

    if (!$insertStmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error inserting data: ' . $insertStmt->error]);
        exit;
    }
    $insertStmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Module data saved successfully']);
?>
