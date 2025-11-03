<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// Read JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['zone'], $data['station'], $data['riu_no'], $data['equip_no'])) {
    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $riuNo = htmlspecialchars($data['riu_no']);
    $equipNo = htmlspecialchars($data['equip_no']);

    // ✅ Direct database connection (same as your working file)
    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    // Use string types for all inputs
    $stmt = $conn->prepare("SELECT id, zone, station, riu_no, riu_equip_no FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
    $stmt->bind_param("ssss", $zone, $station, $riuNo, $equipNo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
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

    // ✅ Now fetch monthly observations using that riu_info_id
    $stmt = $conn->prepare("SELECT sl_no, location, description, action_taken_range, observation, remarks 
                            FROM riu_monthly_data 
                            WHERE riu_info_id = ? ORDER BY CAST(sl_no AS SIGNED)");
    $stmt->bind_param("i", $riuInfoId);
    $stmt->execute();
    $result = $stmt->get_result();

    $observations = [];
    while ($row = $result->fetch_assoc()) {
        $observations[] = $row;
    }

    if (count($observations) > 0) {
        echo json_encode([
            'success' => true,
            'riu_info' => $riuInfo,
            'observations' => $observations
        ]);
    } else {
        // return riu_info even if no observations so client can render header
        echo json_encode(['success' => false, 'message' => 'No data found for this RIU entry', 'riu_info' => $riuInfo]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
}
?>
