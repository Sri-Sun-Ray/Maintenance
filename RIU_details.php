<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['zone'], $data['station'], $data['riu_no'], $data['equip_no'])) {
    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riuNo = intval($data['riu_no']);
    $equipNo = intval($data['equip_no']);

    // Database connection
    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    // Check if record exists
    $checkStmt = $conn->prepare("SELECT id FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
    $checkStmt->bind_param("ssii", $zone, $station, $riuNo, $equipNo);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        // Record already exists - return success
        $checkStmt->close();
        $conn->close();
        echo json_encode(['success' => false, 'message' => 'Record already exists']);
        exit;
    }
    $checkStmt->close();

    // Insert RIU info
    $insertStmt = $conn->prepare("INSERT INTO riu_info (zone, station, riu_no, riu_equip_no) VALUES (?, ?, ?, ?)");
    
    if (!$insertStmt) {
        die(json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]));
    }

    $insertStmt->bind_param("ssii", $zone, $station, $riuNo, $equipNo);
    
    if ($insertStmt->execute()) {
        $insertStmt->close();
        $conn->close();
        echo json_encode(['success' => true, 'message' => 'RIU details saved successfully']);
    } else {
        die(json_encode(['success' => false, 'message' => 'Error saving RIU details: ' . $insertStmt->error]));
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
}
?>
