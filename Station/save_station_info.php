<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['zone'], $data['station'], $data['date'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$zone = htmlspecialchars($data['zone']);
$station = htmlspecialchars($data['station']);
$date = htmlspecialchars($data['date']);

// Database connection
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Check if record already exists for same zone, station, date
$checkStmt = $conn->prepare("
    SELECT id 
    FROM station_info 
    WHERE zone = ? AND station = ? AND date = ?
");
$checkStmt->bind_param("sss", $zone, $station, $date);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    // Already exists → return the ID
    $row = $checkResult->fetch_assoc();
    echo json_encode([
        'success' => true,
        'message' => 'Details already exist',
        'station_id' => $row['id']
    ]);
    exit;
}
$checkStmt->close();

// Insert new record
$insertStmt = $conn->prepare("
    INSERT INTO station_info (zone, station, date)
    VALUES (?, ?, ?)
");

if (!$insertStmt) {
    die(json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]));
}

$insertStmt->bind_param("sss", $zone, $station, $date);

if ($insertStmt->execute()) {
    $insertId = $insertStmt->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'Station details saved successfully',
        'station_id' => $insertId
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error saving details: ' . $insertStmt->error]);
}

$insertStmt->close();
$conn->close();
?>
