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
    // Sanitize input to prevent SQL injection
    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riu = htmlspecialchars($data['riu']);
    $equip = htmlspecialchars($data['equip']);

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

    // Prepare the SQL query
    $stmt = $conn->prepare("INSERT INTO riu_info (zone, station, riu_no, riu_equip_no) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssii", $zone, $station, $riu, $equip);

    // Execute the query
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error saving data']);
    }

    // Close the connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
?>
