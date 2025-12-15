<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

function decodeImagePathsValue($value)
{
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

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['zone'], $data['station'], $data['date'])) {
        throw new Exception('Missing parameters');
    }

    $zone = htmlspecialchars($data['zone']);
    $station = htmlspecialchars($data['station']);
    $date = htmlspecialchars($data['date']);

    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    // Query station info
    $stmt = $conn->prepare("SELECT id, zone, station, date FROM station_info WHERE zone = ? AND station = ? AND date = ?");
    $stmt->bind_param("sss", $zone, $station, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Station Info not found']);
        exit;
    }

    $row = $result->fetch_assoc();
    $stationInfoId = $row['id'];
    $stationInfo = [
        'zone' => $row['zone'],
        'station' => $row['station'],
        'date' => $row['date']
    ];
    $stmt->close();

    $observations = [];
    $modules = ['quarterly_check', 'daily_monthly', 'quarterly_half'];
    
    // Default values mapping - these match the hardcoded values in HTML
    $defaultValues = [
        'quarterly_check' => [
            1 => ['details' => 'Signalling and Interlocking Plan', 'required_value' => 'There shall not be any change in the SIP No.'],
            2 => ['details' => 'RFID Tag Layout', 'required_value' => 'The RFID Tag layout shall be based on SIP layout No mentioned above. Date of Commissioning on RFID Tag shall be on or after the Date of Commissioning as indicated in SIP'],
            3 => ['details' => 'Selection Table.(TOC)', 'required_value' => 'There shall not be any change in Selection Table No.'],
            4 => ['details' => 'TCAS Table of Control', 'required_value' => 'The TCAS Table of Control shall be based on Selection Table No mentioned above. Date of Commissioning on TCAS Table of Controlshall be on or after the Date of Commissioning as indicated in Selection Table of the Station'],
            5 => ['details' => 'Relay wiring Circuit diagram', 'required_value' => 'There shall not be any change in the Relay Circuit Diagram.'],
            6 => ['details' => 'TCAS Wiring Circuit diagram', 'required_value' => 'The TCAS wiring diagrams shall be an integral part of station wiring sheets If not, they shall be separately located in a sealed transparent covers'],
            7 => ['details' => 'Is there any noticeable change in relay wiring', 'required_value' => 'There shall not be any changes in the relay wiring'],
            8 => ['details' => 'Is there any noticeable change in Power Supply equipment', 'required_value' => 'There shall not be any changes in the power supply eqpt'],
        ],
        'daily_monthly' => [],
        'quarterly_half' => []
    ];
    
    foreach ($modules as $module) {
        // Build SELECT per module so it matches new schemas while returning a common shape
        if ($module === 'quarterly_check') {
            $sql = "
                SELECT 
                    s_no,
                    module,
                    details,
                    name_number,
                    date_commission,
                    required_value,
                    observed_value,
                    remarks,
                    image_path
                FROM quarterly_check
                WHERE station_info_id = ?
                ORDER BY CAST(s_no AS SIGNED)
            ";
        } elseif ($module === 'daily_monthly' || $module === 'quarterly_half') {
            // New column names; alias to the generic ones used in reports
            $sql = "
                SELECT 
                    s_no,
                    ? AS module,
                    maintenance_task_description AS details,
                    location AS name_number,
                    frequency AS date_commission,
                    action_taken AS required_value,
                    equipment_condition AS observed_value,
                    remarks,
                    image_path
                FROM {$module}
                WHERE station_info_id = ?
                ORDER BY CAST(s_no AS SIGNED)
            ";
        } else {
            continue;
        }

        if ($module === 'quarterly_check') {
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                continue;
            }
            $stmt->bind_param("i", $stationInfoId);
        } else {
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                continue;
            }
            // Bind module name for the ? AS module and station_info_id
            $stmt->bind_param("si", $module, $stationInfoId);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        // Get all saved rows
        $savedRows = [];
        while ($row = $result->fetch_assoc()) {
            if (empty($row['module'])) {
                $row['module'] = $module;
            }
            $sNo = intval($row['s_no']);
            $savedRows[$sNo] = $row;
        }
        
        // Merge with default values - include all rows (saved + defaults)
        // For quarterly_check, we have 8 default rows
        $maxRows = ($module === 'quarterly_check') ? 8 : 50; // Adjust as needed
        
        for ($sNo = 1; $sNo <= $maxRows; $sNo++) {
            if (isset($savedRows[$sNo])) {
                // Use saved data, but fill defaults if empty
                $row = $savedRows[$sNo];
                if (isset($defaultValues[$module][$sNo])) {
                    if (empty($row['details']) && !empty($defaultValues[$module][$sNo]['details'])) {
                        $row['details'] = $defaultValues[$module][$sNo]['details'];
                    }
                    if (empty($row['required_value']) && !empty($defaultValues[$module][$sNo]['required_value'])) {
                        $row['required_value'] = $defaultValues[$module][$sNo]['required_value'];
                    }
                }
                $imagePaths = decodeImagePathsValue($row['image_path'] ?? null);
                $row['image_paths'] = $imagePaths;
                $row['image_path'] = $imagePaths[0] ?? '';
                $observations[] = $row;
            } elseif (isset($defaultValues[$module][$sNo])) {
                // Include default row even if not saved (for report display)
                $row = [
                    's_no' => $sNo,
                    'module' => $module,
                    'details' => $defaultValues[$module][$sNo]['details'],
                    'name_number' => '',
                    'date_commission' => '',
                    'required_value' => $defaultValues[$module][$sNo]['required_value'],
                    'observed_value' => '',
                    'remarks' => '',
                    'image_paths' => [],
                    'image_path' => ''
                ];
                $observations[] = $row;
            }
        }

        $stmt->close();
    }

    $conn->close();

    ob_end_clean();
    echo json_encode([
        'success' => count($observations) > 0,
        'station_info' => $stationInfo,
        'observations' => $observations
    ]);

} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

