<?php
// Suppress all output except JSON
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

try {
    // Read JSON input
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['zone'], $data['station'], $data['riu_no'], $data['equip_no'])) {
        throw new Exception('Missing parameters');
    }

    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riuNo = htmlspecialchars($data['riu_no']);
    $equipNo = htmlspecialchars($data['equip_no']);

    // ✅ Direct database connection
    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    // Query RIU info
    $stmt = $conn->prepare("SELECT id, zone, station, riu_no, riu_equip_no FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
    $stmt->bind_param("ssss", $zone, $station, $riuNo, $equipNo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'RIU Info not found']);
        exit;
    }

    $row = $result->fetch_assoc();
    $riuInfoId = $row['id'];
    $riuInfo = [
        'zone' => $row['zone'],
        'station' => $row['station'],
        'riu_no' => $row['riu_no'],
        'riu_equip_no' => $row['riu_equip_no']
    ];
    $stmt->close();

    // Query observations
    $stmt = $conn->prepare("SELECT sl_no, module, description, action_taken, observation, remarks, image_path 
                        FROM nms
                        WHERE riu_info_id = ? ORDER BY CAST(sl_no AS SIGNED)");

    $stmt->bind_param("i", $riuInfoId);
    $stmt->execute();
    $result = $stmt->get_result();

    $observations = [];
    while ($row = $result->fetch_assoc()) {
        $observations[] = $row;
    }

    $stmt->close();
    $conn->close();

    // Return response
    ob_end_clean();
    echo json_encode([
        'success' => count($observations) > 0,
        'riu_info' => $riuInfo,
        'observations' => $observations
    ]);

} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
