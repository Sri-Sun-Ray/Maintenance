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

  /* 1️⃣ Count CLOSED points (any schedule checked) */
  $stmtClosed = $conn->prepare("
    SELECT COUNT(*) AS closed_points
    FROM $module
    WHERE station = ?
      AND loco = ?
      AND (
        trip = 1 OR ia_ib = 1 OR ic = 1 OR
        toh_aoh = 1 OR ioh_poh = 1
      )
  ");
  $stmtClosed->bind_param("ss", $station, $loco);
  $stmtClosed->execute();
  $closedRow = $stmtClosed->get_result()->fetch_assoc();
  $closedPoints = (int)$closedRow['closed_points'];
  $stmtClosed->close();

  /* 2️⃣ OPEN points = fixed total − closed points */
  $openPoints = $fixedTotal - $closedPoints;
  if ($openPoints < 0) $openPoints = 0;

  $totalOpenPoints += $openPoints;

  /* 3️⃣ Module status */
  $moduleStatus = ($openPoints > 0) ? "Open" : "Closed";

  $responseModules[] = [
    "module" => ucfirst(str_replace("_", " ", $module)),
    "status" => $moduleStatus,
    "openPoints" => $openPoints
  ];
}

$conn->close();

/* 4️⃣ Final response */
echo json_encode([
  "success" => true,
  "totalPoints" => $totalPoints,
  "openPoints" => $totalOpenPoints,
  "modules" => $responseModules
]);
