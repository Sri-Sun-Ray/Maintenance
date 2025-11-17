<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['zone'], $data['station'], $data['riu_no'], $data['equip_no'], $data['module'])) {
    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riuNo = intval($data['riu_no']);
    $equipNo = intval($data['equip_no']);
    $module = htmlspecialchars($data['module']);

    // Database connection
    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    // Get the riu_info_id
    $stmt = $conn->prepare("SELECT id FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
    $stmt->bind_param("ssii", $zone, $station, $riuNo, $equipNo);
    $stmt->execute();
    $result = $stmt->get_result();
    $riuInfoId = null;

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $riuInfoId = $row['id'];
    } else {
        echo json_encode(['success' => false, 'message' => 'RIU Info not found']);
        exit;
    }
    $stmt->close();

    // Map module to table name
    $tableMap = [
        'nms' => 'nms',
        'power' => 'nms',  // All modules use same table
        'riu_equip' => 'nms',
        'comm' => 'nms',
        'earthing' => 'nms'
    ];

    $tableName = isset($tableMap[$module]) ? $tableMap[$module] : 'nms';

    // Fetch module data with image paths
    $selectStmt = $conn->prepare("SELECT sl_no, description, action_taken, observation, remarks, image_path FROM $tableName 
        WHERE module = ? AND riu_info_id = ? ORDER BY sl_no ASC");
    $selectStmt->bind_param("si", $module, $riuInfoId);
    $selectStmt->execute();
    $result = $selectStmt->get_result();

    $moduleData = [];
    while ($row = $result->fetch_assoc()) {
        $moduleData[] = $row;
    }

    $selectStmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'data' => $moduleData]);
} else {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
}
?>
