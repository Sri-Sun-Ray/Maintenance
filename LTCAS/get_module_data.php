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

function tableHasColumn($conn, $table, $column) {
  $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
  return $result && $result->num_rows > 0;
}

function decodeImagePaths($value) {
  if ($value === null || $value === '') {
    return [];
  }

  if (is_array($value)) {
    return array_values(array_filter($value, function ($item) {
      return $item !== null && $item !== '';
    }));
  }

  $trimmed = trim((string)$value);
  if ($trimmed === '') {
    return [];
  }

  $decoded = json_decode($trimmed, true);
  if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
    return array_values(array_filter($decoded, function ($item) {
      return $item !== null && $item !== '';
    }));
  }

  return [$trimmed];
}

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
  "underframe",
  "locomotive_avail",
  "underframe2",
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

$imageSelect = tableHasColumn($conn, $table, 'image_path') ? ", image_path" : "";

$sql = "SELECT sno, cab1, cab2, remarks, trip, ia_ib, ic, toh_aoh, ioh_poh{$imageSelect}
        FROM $table
        WHERE loco = ? AND station = ?
        ORDER BY sno ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $loco, $station);
$stmt->execute();

$res = $stmt->get_result();

$rows = [];
while ($row = $res->fetch_assoc()) {
  if (isset($row['image_path'])) {
    $row['image_paths'] = decodeImagePaths($row['image_path']);
  } else {
    $row['image_paths'] = [];
  }
  $rows[] = $row;
}

echo json_encode([
  "success" => count($rows) > 0,
  "data" => $rows
]);
?>
