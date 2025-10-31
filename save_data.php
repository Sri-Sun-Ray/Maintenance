<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set the content type to JSON
header('Content-Type: application/json');

// Get the raw POST data
$data = json_decode(file_get_contents('php://input'), true);

// Check if the required data is provided
if (isset($data['zone'], $data['station'], $data['riu'], $data['equip'])) {
    // Sanitize input
    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riu = htmlspecialchars($data['riu']);
    $equip = htmlspecialchars($data['equip']);

    // Database connection
    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    // ✅ Check if record already exists
    $checkStmt = $conn->prepare("SELECT id FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
    $checkStmt->bind_param("ssii", $zone, $station, $riu, $equip);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        // ✅ Record already exists — do not insert again
        $row = $checkResult->fetch_assoc();
        $existingId = $row['id'];

        echo json_encode([
            'success' => true,
            'message' => 'Record already exists. ID: ' . $existingId,
            'id' => $existingId,
            'key'=> 'exist'
        ]);
    } else {
        // ✅ Insert new record
        $insertStmt = $conn->prepare("INSERT INTO riu_info (zone, station, riu_no, riu_equip_no) VALUES (?, ?, ?, ?)");
        $insertStmt->bind_param("ssii", $zone, $station, $riu, $equip);

        if ($insertStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'New record inserted successfully',
                'id' => $insertStmt->insert_id
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error inserting data']);
        }

        $insertStmt->close();
    }

    // Close connections
    $checkStmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
?>
