<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$host = "localhost";
$user = "root";
$password = "Hbl@1234";
$db = "maintainance";

$conn = new mysqli($host, $user, $password, $db);

if ($conn->connect_error) {
  echo json_encode(["exists" => false, "message" => "DB connection failed"]);
  exit;
}

// ✅ SAFELY READ INPUT
$table   = $data['table']   ?? '';
$loco    = $data['loco']    ?? '';
$station = $data['station'] ?? '';

if (!$table || !$loco || !$station) {
  echo json_encode(["exists" => false, "message" => "Invalid input"]);
  exit;
}

// ✅ ALLOWED TABLES SECURITY
$allowedTables = [
  "locomotive",
  "brake_interface",
  "underframe",
  "locomotive_avail",
  "underframe2",
  "roof"
];

if (!in_array($table, $allowedTables)) {
  echo json_encode(["exists" => false, "message" => "Invalid table"]);
  exit;
}

// ✅ CHECK IF DATA EXISTS
$sql = "SELECT COUNT(*) as cnt FROM $table WHERE loco = ? AND station = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $loco, $station);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();

echo json_encode([
  "exists" => $row['cnt'] > 0
]);
?>
