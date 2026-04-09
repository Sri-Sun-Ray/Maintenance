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

  $imageSelect = tableHasColumn($conn, $module, 'image_path') ? ", image_path" : "";

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
      ioh_poh{$imageSelect}
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
      if (isset($r['image_path'])) {
        $r['image_paths'] = decodeImagePaths($r['image_path']);
      } else {
        $r['image_paths'] = [];
      }
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
