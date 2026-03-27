<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!empty($data['zone']) && !empty($data['station']) && isset($data['fie_no']) && isset($data['equip_no'])) {

    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $fieNo = intval($data['fie_no']);      // Corrected variable name
    $equipNo = intval($data['equip_no']);

    if ($fieNo <= 0 || $equipNo <= 0) {
        echo json_encode(['success' => false, 'message' => 'FIE No and Equip No must be valid numbers']);
        exit;
    }

    // Database connection
    $conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    // Check if record exists
    $checkStmt = $conn->prepare("SELECT id FROM fie_info WHERE zone=? AND station=? AND fie_no=? AND fie_equip_no=?");
    $checkStmt->bind_param("ssii", $zone, $station, $fieNo, $equipNo);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        $checkStmt->close();
        $conn->close();
        echo json_encode(['success' => false, 'message' => 'Record already exists']);
        exit;
    }
    $checkStmt->close();

    // Insert record
    $insertStmt = $conn->prepare("INSERT INTO fie_info (zone, station, fie_no, fie_equip_no) VALUES (?, ?, ?, ?)");
    if (!$insertStmt) {
        die(json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]));
    }

    $insertStmt->bind_param("ssii", $zone, $station, $fieNo, $equipNo);

    if ($insertStmt->execute()) {
        $insertStmt->close();
        $conn->close();
        echo json_encode(['success' => true, 'message' => 'FIE details saved successfully']);
    } else {
        die(json_encode(['success' => false, 'message' => 'Error saving FIE details: ' . $insertStmt->error]));
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
}
?>
