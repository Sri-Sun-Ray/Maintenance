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
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

// ✅ DEFINE VARIABLES SAFELY
$table   = $data['table']   ?? '';
$loco    = $data['loco']    ?? '';
$station = $data['station'] ?? '';

$allowedTables = [
  "locomotive",
  "brake_interface",
  "underFrame",
  "locomotiveAvail",
  "underFrame2",
  "roof"
];

// ✅ VALIDATE INPUT
if (!$table || !$loco || !$station) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

if (!in_array($table, $allowedTables)) {
    echo json_encode(["success" => false, "message" => "Invalid table"]);
    exit;
}

$sql = "SELECT sno, cab1, cab2, remarks, trip, ia_ib, ic, toh_aoh, ioh_poh
        FROM $table
        WHERE loco = ? AND station = ?
        ORDER BY sno ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $loco, $station);
$stmt->execute();

$res = $stmt->get_result();

$rows = [];
while ($row = $res->fetch_assoc()) {
  $rows[] = $row;
}

echo json_encode([
  "success" => count($rows) > 0,
  "data" => $rows
]);
?>
