<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set the content type to JSON
header('Content-Type: application/json');

// Get the raw POST data
$data = json_decode(file_get_contents('php://input'), true);

// Check if the required data is provided
if (isset($data['zone'], $data['station'], $data['riu_no'], $data['equip_no'], $data['observations'])) {
    // Sanitize input to prevent SQL injection
    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riuNo = htmlspecialchars($data['riu_no']);
    $equipNo = htmlspecialchars($data['equip_no']);
    $observations = $data['observations'];

    // Database connection (replace with your actual database credentials)
    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check the connection
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    // Fetch the riu_info_id using zone, station, riu_no, and riu_equip_no
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

    // Prepare the SQL query to insert data into the riu_monthly_data table
    $stmt = $conn->prepare("INSERT INTO riu_monthly_data (sl_no, location, description, action_taken_range, observation, remarks, riu_info_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssi", $slNo, $location, $description, $actionTakenRange, $observation, $remarks, $riuInfoId);

    // Insert the observations into the database
    foreach ($observations as $observationData) {
        $slNo = $observationData['sl_no'];
        $location = $observationData['location'];
        $description = $observationData['description'];
        $actionTakenRange = $observationData['action_taken_range'];
        $observation = $observationData['observation'];
        $remarks = $observationData['remarks'];

        // Execute the query for each observation
        if (!$stmt->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error saving observation data']);
            exit;
        }
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Report saved successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
?>
