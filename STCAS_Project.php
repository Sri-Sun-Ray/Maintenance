<?php
// Database connection details
$servername = "localhost";
$db_username = "root";
$db_password = "Hbl@1234";
$dbname = "maintainance";

// Create connection
$conn = new mysqli($servername, $db_username, $db_password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

session_start();

if (!isset($_SESSION['username'])) {
  echo json_encode(["error" => "User not logged in"]);
  exit;
}

$username = $_SESSION['username'];

// ✅ Fetch Zone from users table
$sql = "SELECT Zone FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$response = [];
if ($row = $result->fetch_assoc()) {
  $response['zone'] = $row['Zone'];
} else {
  $response['zone'] = "Not Found";
}

$stmt->close();
$conn->close();

// ✅ Return as JSON
header('Content-Type: application/json');
echo json_encode($response);
?>
