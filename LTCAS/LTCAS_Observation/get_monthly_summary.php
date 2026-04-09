<?php
header("Content-Type: application/json");
error_reporting(0);

$data = json_decode(file_get_contents("php://input"), true);

$station = $data['station'] ?? '';
$loco    = $data['loco'] ?? '';

if (!$station || !$loco) {
  echo json_encode([
    "success" => false,
    "message" => "Station and Loco are required"
  ]);
  exit;
}

$conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");
if ($conn->connect_error) {
  echo json_encode(["success" => false, "message" => "DB error"]);
  exit;
}

/* 🔹 Fixed total points per module */
$modules = [
  "locomotive"        => 23,
  "brake_interface"   => 15,
  "underframe"        => 5,
  "locomotive_avail"  => 23,
  "underframe2"       => 6,
  "roof"              => 14
];

$responseModules = [];
$totalPoints = array_sum($modules);
$totalOpenPoints = 0;

foreach ($modules as $module => $fixedTotal) {
  $tables[] = $module;
}

/* 🔹 Get overall report dates (min of all created_at, max of all updated_at) */
$reportCreatedAt = "-";
$reportUpdatedAt = "-";
$allCreated = [];
$allUpdated = [];

$escStation = $conn->real_escape_string($station);
$escLoco    = $conn->real_escape_string($loco);

foreach ($tables as $t) {
    if ($conn->query("SHOW TABLES LIKE '$t'")->num_rows > 0) {
        $dateRes = $conn->query("SELECT MIN(created_at) as c, MAX(updated_at) as u FROM `$t` WHERE station='$escStation' AND loco='$escLoco'");
        if ($dateRes && $dRow = $dateRes->fetch_assoc()) {
            if ($dRow['c']) $allCreated[] = strtotime($dRow['c']);
            if ($dRow['u']) $allUpdated[] = strtotime($dRow['u']);
        }
    }
}

if (!empty($allCreated)) $reportCreatedAt = date("d-m-Y", min($allCreated));
if (!empty($allUpdated)) $reportUpdatedAt = date("d-m-Y", max($allUpdated));

$responseModules = [];
$totalOpenPoints = 0;

foreach ($modules as $module => $fixedTotal) {
  $tableExistsResult = $conn->query("SHOW TABLES LIKE '$module'");
  $tableExists = $tableExistsResult->num_rows > 0;

  $closedPoints = 0;
  if ($tableExists) {
    $stmtClosed = $conn->prepare("SELECT COUNT(*) AS closed_points FROM $module WHERE station = ? AND loco = ? AND (trip = 1 OR ia_ib = 1 OR ic = 1 OR toh_aoh = 1 OR ioh_poh = 1)");
    if ($stmtClosed) {
      $stmtClosed->bind_param("ss", $station, $loco);
      $stmtClosed->execute();
      $closedRow = $stmtClosed->get_result()->fetch_assoc();
      $closedPoints = (int)$closedRow['closed_points'];
      $stmtClosed->close();
    }
  }

  $openPoints = $fixedTotal - $closedPoints;
  if ($openPoints < 0) $openPoints = 0;
  $totalOpenPoints += $openPoints;
  $moduleStatus = ($openPoints > 0) ? "Open" : "Closed";

  $responseModules[] = [
    "module" => ucfirst(str_replace("_", " ", $module)),
    "status" => $moduleStatus,
    "totalPoints" => $fixedTotal,
    "closedPoints" => $closedPoints,
    "openPoints" => $openPoints,
    "createdAt" => $reportCreatedAt,
    "updatedAt" => $reportUpdatedAt
  ];
}

$conn->close();

echo json_encode([
  "success" => true,
  "totalPoints" => $totalPoints,
  "openPoints" => $totalOpenPoints,
  "modules" => $responseModules,
  "reportCreated" => $reportCreatedAt,
  "reportUpdated" => $reportUpdatedAt
]);
