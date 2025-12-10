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
    echo json_encode(["message" => "DB connection failed"]);
    exit;
}

$table=$data['table'] ?? '';
$tableData = $data['tableData'] ?? [];

$allowedTables = [
  "locomotive",
  "brake_interface",
  "underframe",
  "locomotive_avail",
  "underframe2",
  "roof"
];

if (!$table || !in_array($table, $allowedTables)) {
    echo json_encode(["success" => false, "message" => "Invalid table"]);
    exit;
}



$stmt = $conn->prepare(
    "INSERT INTO $table 
    (sno, description, parameter, cab1, cab2, remarks, trip, ia_ib, ic, toh_aoh, ioh_poh, station, loco)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

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

echo json_encode(["message" => "Data saved successfully"]);
?>
