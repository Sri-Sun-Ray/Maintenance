<?php
header('Content-Type: application/json');
include 'db_connect.php'; // ✅ Your DB connection file

// Read JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['zone'], $data['station'], $data['riu_no'], $data['equip_no'])) {
    $zone = $data['zone'];
    $station = $data['station'];
    $riu_no = $data['riu_no'];
    $equip_no = $data['equip_no'];

    // ✅ Prepare SQL query
    $stmt = $conn->prepare("SELECT sl_no, location, description, action_taken_range, observation, remarks 
                            FROM riu_monthly_data 
                            WHERE zone = ? AND station = ? AND riu_no = ? AND equip_no = ?");
    $stmt->bind_param("ssii", $zone, $station, $riu_no, $equip_no);
    $stmt->execute();
    $result = $stmt->get_result();

    $observations = [];
    while ($row = $result->fetch_assoc()) {
        $observations[] = $row;
    }

    if (count($observations) > 0) {
        echo json_encode([
            'success' => true,
            'observations' => $observations
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No data found']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
}
?>
