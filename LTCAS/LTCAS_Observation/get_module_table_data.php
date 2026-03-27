<?php
header("Content-Type: application/json");
error_reporting(0);

$data = json_decode(file_get_contents("php://input"), true);

$module  = $data['module'] ?? '';
$station = $data['station'] ?? '';
$loco    = $data['loco'] ?? '';

$allowedModules = [
  "locomotive",
  "brake_interface",
  "underframe",
  "locomotive_avail",
  "underframe2",
  "roof"
];

if (!in_array($module, $allowedModules)) {
  echo json_encode(["success" => false, "message" => "Invalid module"]);
  exit;
}

$conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");
if ($conn->connect_error) {
  echo json_encode(["success" => false, "message" => "DB error"]);
  exit;
}

$tableExistsResult = $conn->query("SHOW TABLES LIKE '$module'");
$tableExists = $tableExistsResult->num_rows > 0;

$rows = [];
if ($tableExists) {

  $sql = "
    SELECT
      sno,
      description,
      parameter,
      cab1,
      cab2,
      remarks,
      trip,
      ia_ib,
      ic,
      toh_aoh,
      ioh_poh
    FROM $module
    WHERE station = ?
      AND loco = ?
    ORDER BY sno
  ";

  $stmt = $conn->prepare($sql);
  if ($stmt) {
    $stmt->bind_param("ss", $station, $loco);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($r = $result->fetch_assoc()) {
      $rows[] = $r;
    }
    $stmt->close();
  }
}

$conn->close();

echo json_encode([
  "success" => true,
  "module" => $module,
  "data" => $rows
]);
