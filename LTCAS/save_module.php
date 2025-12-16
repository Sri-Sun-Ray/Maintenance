<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

$table = $data['table'] ?? '';
$tableData = $data['tableData'] ?? [];

$allowedTables = [
  "locomotive",
  "brake_interface",
  "underframe",
  "locomotive_avail",
  "underframe2",
  "roof"
];

if (!in_array($table, $allowedTables)) {
    echo json_encode(["success" => false, "message" => "Invalid table"]);
    exit;
}

// INSERT only the columns that exist in the module tables (no `module` column)
$sql = "
INSERT INTO $table
(sno, description, parameter, cab1, cab2, remarks,
 trip, ia_ib, ic, toh_aoh, ioh_poh, station, loco)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode(["success" => false, "message" => "SQL prepare failed: " . $conn->error]);
  $conn->close();
  exit;
}

foreach ($tableData as $row) {

  $stmt->bind_param(
    "ssssssiiiiiss",
    $row["sno"],
    $row["description"],
    $row["parameter"],
    $row["cab1"],
    $row["cab2"],
    $row["remarks"],
    $row["trip"],
    $row["ia_ib"],
    $row["ic"],
    $row["toh_aoh"],
    $row["ioh_poh"],
    $row["station"],
    $row["loco"]
  );

  $stmt->execute();
}

$stmt->close();
$conn->close();

echo json_encode([
  "success" => true,
  "message" => "Data saved successfully"
]);
