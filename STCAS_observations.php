<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['zone'], $data['station'], $data['riu_no'], $data['equip_no'], $data['observations'])) {
    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riuNo = htmlspecialchars($data['riu_no']);
    $equipNo = htmlspecialchars($data['equip_no']);
    $observations = $data['observations'];

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

    // Loop through observations
    foreach ($observations as $observationData) {
        $slNo = $observationData['sl_no'];
        $location = $observationData['location'];
        $description = $observationData['description'];
        $actionTakenRange = $observationData['action_taken_range'];
        $observation = $observationData['observation'];
        $remarks = $observationData['remarks'];

        // Check if record exists
        $checkStmt = $conn->prepare("SELECT id FROM riu_monthly_data WHERE sl_no = ? AND riu_info_id = ?");
        $checkStmt->bind_param("ii", $slNo, $riuInfoId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            // ✅ Update existing record
            $updateStmt = $conn->prepare("UPDATE riu_monthly_data 
                SET location = ?, description = ?, action_taken_range = ?, observation = ?, remarks = ?
                WHERE sl_no = ? AND riu_info_id = ?");
            $updateStmt->bind_param("ssssssi", $location, $description, $actionTakenRange, $observation, $remarks, $slNo, $riuInfoId);
            if (!$updateStmt->execute()) {
                echo json_encode(['success' => false, 'message' => 'Error updating observation data']);
                exit;
            }
            $updateStmt->close();
        } else {
            // ✅ Insert new record
            $insertStmt = $conn->prepare("INSERT INTO riu_monthly_data (sl_no, location, description, action_taken_range, observation, remarks, riu_info_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)");
            $insertStmt->bind_param("isssssi", $slNo, $location, $description, $actionTakenRange, $observation, $remarks, $riuInfoId);
            if (!$insertStmt->execute()) {
                echo json_encode(['success' => false, 'message' => 'Error inserting observation data']);
                exit;
            }
            $insertStmt->close();
        }
        $checkStmt->close();
    }

    $conn->close();
    echo json_encode(['success' => true, 'message' => 'Report saved successfully (updated or inserted)']);
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
?>
