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

/* ✅ SAME TABLE STYLE AS save_module.php */
$table = $data['table'] ?? '';
$rows  = $data['data'] ?? [];

$allowedTables = [
  "locomotive",
  "brake_interface",
  "underFrame",
  "locomotiveAvail",
  "underFrame2",
  "roof"
];

if (!$table || !in_array($table, $allowedTables)) {
    echo json_encode(["success" => false, "message" => "Invalid table"]);
    exit;
}

$updateSQL = "
UPDATE $table 
SET cab1=?, cab2=?, remarks=?, trip=?, ia_ib=?, ic=?, toh_aoh=?, ioh_poh=?
WHERE sno=? AND loco=? AND station=?
";

$stmt = $conn->prepare($updateSQL);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL prepare failed"]);
    exit;
}

foreach ($rows as $row) {

    /* ✅✅✅ FIXED TYPE STRING — 11 PARAMETERS ✅✅✅ */
    $stmt->bind_param(
        "sssiiiiisss",
        $row['cab1'],     // s
        $row['cab2'],     // s
        $row['remarks'],  // s
        $row['trip'],     // i
        $row['ia_ib'],    // i
        $row['ic'],       // i
        $row['toh_aoh'],  // i
        $row['ioh_poh'],  // i
        $row['sno'],      // s
        $row['loco'],     // s
        $row['station']   // s
    );

    $stmt->execute();
}

$stmt->close();
$conn->close();

echo json_encode([
  "success" => true,
  "message" => "Module updated successfully"
]);
?>
