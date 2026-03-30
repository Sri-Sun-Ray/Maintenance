<?php
/**
 * get_observations.php
 * Fetches all observations for a station, categorized by module.
 * Returns both saved data and default rows for the report.
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Prevent any accidental output before JSON
ob_start();
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['zone'], $data['station'], $data['date'])) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Missing zone, station or date']);
        exit;
    }

    // Do NOT use htmlspecialchars on raw input used for SQL matching!
    // It can corrupt characters like & or ' which might be in the database names but escaped in input.
    $zone = $data['zone'];
    $station = $data['station'];
    $date = $data['date'];

    $servername = "localhost";
    $username = "root";
    $password = "Hbl@1234";
    $dbname = "maintainance";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // 1. Fetch Station Info ID
    $stmt = $conn->prepare("SELECT id, zone, station, date FROM station_info WHERE zone = ? AND station = ? AND date = ?");
    $stmt->bind_param("sss", $zone, $station, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Station Info not found for ' . $zone . '/' . $station . '/' . $date]);
        exit;
    }

    $stationInfo = $result->fetch_assoc();
    $stationInfoId = $stationInfo['id'];
    $stmt->close();

    // 2. Default Values (Matching Station_create.html exactly)
    $defaultValues = [
        'quarterly_check' => [
            1 => ['details' => 'Signalling and Interlocking Plan', 'required_value' => 'There shall not be any change in the SIP No.', 'date_commission' => 'Quarterly'],
            2 => ['details' => 'RFID Tag Layout', 'required_value' => 'The RFID Tag layout shall be based on SIP layout No mentioned above. Date of Commissioning on RFID Tag shall be on or after the Date of Commissioning as indicated in SIP', 'date_commission' => 'Quarterly'],
            3 => ['details' => 'Selection Table.(TOC)', 'required_value' => 'There shall not be any change in Selection Table No.', 'date_commission' => 'Quarterly'],
            4 => ['details' => 'TCAS Table of Control', 'required_value' => 'The TCAS Table of Control shall be based on Selection Table No mentioned above. Date of Commissioning on TCAS Table of Controlshall be on or after the Date of Commissioning as indicated in Selection Table of the Station', 'date_commission' => 'Quarterly'],
            5 => ['details' => 'Relay wiring Circuit diagram', 'required_value' => 'There shall not be any change in the Relay Circuit Diagram.', 'date_commission' => 'Quarterly'],
            6 => ['details' => 'TCAS Wiring Circuit diagram', 'required_value' => 'The TCAS wiring diagrams shall be an integral part of station wiring sheets If not, they shall be separately located in a sealed transparent covers', 'date_commission' => 'Quarterly'],
            7 => ['details' => 'Is there any noticeable change in relay wiring', 'required_value' => 'There shall not be any changes in the relay wiring', 'date_commission' => 'Quarterly'],
            8 => ['details' => 'Is there any noticeable change in Power Supply equipment', 'required_value' => 'There shall not be any changes in the power supply eqpt', 'date_commission' => 'Quarterly'],
            9 => ['details' => 'Number and Name of LCs Connected to Station as per SWR in Up direction', 'required_value' => '', 'date_commission' => 'Quarterly'],
            10 => ['details' => 'Number and Name of LCs Connected to Station as per TCAS in Up direction', 'required_value' => '', 'date_commission' => 'Quarterly'],
            11 => ['details' => 'Number and Name of LCs Connected to Station as per SWR in Down direction', 'required_value' => '', 'date_commission' => 'Quarterly'],
            12 => ['details' => 'Number and Name of LCs Connected to Station as per TCAS in Down direction', 'required_value' => '', 'date_commission' => 'Quarterly'],
            13 => ['details' => 'Number and Name of LCs Connected to Station as per SWR towards branch direction', 'required_value' => '', 'date_commission' => 'Quarterly'],
            14 => ['details' => 'Number and Name of LCs Connected to Station as per SWR towards branch direction', 'required_value' => '', 'date_commission' => 'Quarterly'],
            15 => ['details' => 'Number and Name of LCs Connected to Station as per TCAS towards branch direction', 'required_value' => '', 'date_commission' => 'Quarterly'],
            16 => ['details' => 'Is there any noticeable change in relay wiring', 'required_value' => '', 'date_commission' => 'Quarterly'],
            17 => ['details' => 'Working time table no.', 'required_value' => '', 'date_commission' => 'Quarterly'],
            18 => ['details' => 'PSR in up direction as per working time table', 'required_value' => '', 'date_commission' => 'Quarterly'],
            19 => ['details' => 'PSR in Down direction as per working time table', 'required_value' => '', 'date_commission' => 'Quarterly'],
            20 => ['details' => 'PSR towards branch line as per working time table', 'required_value' => '', 'date_commission' => 'Quarterly']
        ],
        'daily_monthly' => [
            1 => ['name_number' => 'NMS PC', 'details' => 'Ensure E1 network is always healthy and all stations communication is Healthy on line', 'required_value' => 'Ensure all TCAS stations are in working condition in NMS', 'date_commission' => 'Daily'],
            2 => ['name_number' => 'TCAS Eqpt Relay Room and LC gate equipment.', 'details' => 'Check the communication status of the TCAS Modules (if Any) and DSL modem (if Any)', 'required_value' => 'Relevant Communication and LEDs should be Glow/Blink', 'date_commission' => 'Monthly'],
            3 => ['name_number' => 'Radio Tower/Radio Modems', 'details' => 'Check the Power voltages at PWR connector of Radio for both radios', 'required_value' => '23V to 25V to be observed', 'date_commission' => 'Monthly'],
            4 => ['name_number' => 'Radio Tower/Radio Modems', 'details' => 'Check the communication status of the Radio Modems', 'required_value' => 'Tx LED shall blink alternative radios for every 2 seconds', 'date_commission' => 'Monthly'],
            5 => ['name_number' => 'Radio Tower/Radio Modems', 'details' => 'Check whether Radios, SRPS, Modems are fixed properly to the frame inside the Location Box', 'required_value' => 'Check for healthy and fixing along with connectors', 'date_commission' => 'Monthly'],
            6 => ['name_number' => 'Radio Tower/Radio Modems', 'details' => 'Ensure the radio status is healthy', 'required_value' => 'POWER and STATUS LEDs shall not show red indication', 'date_commission' => 'Monthly'],
            7 => ['name_number' => 'Radio Tower/Radio Modems', 'details' => 'Visually examine all the communication cables are connected properly and radio modems had tighten the corresponding screws', 'required_value' => 'Ensure the tightness of the cables and modem modules', 'date_commission' => 'Monthly'],
            8 => ['name_number' => 'Radio Tower / Radio Modems', 'details' => 'Ensure the reverse power of Transmitter and receiver antennas is less than 1W', 'required_value' => 'Measure reverse power of all 4 coaxial cables and record. Ensure reverse power is less than 1W for all cables', 'date_commission' => 'Monthly'],
            9 => ['name_number' => 'Radio Tower / Radio Modems', 'details' => 'Check the 110V DC output for Aviation Warning Lamp in the Location Box is correct and lamp is glowing', 'required_value' => 'Check for correctness', 'date_commission' => 'Monthly'],
            10 => ['name_number' => 'Earthing,LA &SPD', 'details' => 'Clean surface of the Earth electrode /MEEB/SEEB', 'required_value' => 'Surface should be kept clean', 'date_commission' => 'Monthly'],
            11 => ['name_number' => 'Earthing,LA &SPD', 'details' => 'Measure the Resistance of the Ring Earth If possible, fill water in the Earth Pits to keep low soil resistance', 'required_value' => 'Resistance Should be 1(Ohm) ', 'date_commission' => 'Monthly'],
            12 => ['name_number' => 'Earthing,LA &SPD', 'details' => 'Check the SPD devices for any signs of physical degradation', 'required_value' => 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace)', 'date_commission' => 'Monthly'],
            13 => ['name_number' => 'Earthing,LA &SPD', 'details' => 'Check Lightning Arrestor at the top of the tower connection at copper wire to Ring earth. Tighten all the connections/Terminations', 'required_value' => 'All the connections to be tightened.', 'date_commission' => 'Monthly'],
            14 => ['name_number' => 'Earthing,LA &SPD', 'details' => 'Check the serviceability SPD at IPS 110 V DC-DC converter', 'required_value' => 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace)', 'date_commission' => 'Monthly'],
            15 => ['name_number' => 'Earthing,LA &SPD', 'details' => 'Check the serviceability SPD at Radio MODEM', 'required_value' => 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace)', 'date_commission' => 'Monthly'],
            16 => ['name_number' => 'SOIP in SM ROOM', 'details' => 'Ensure buttons are working properly', 'required_value' => 'Insert SM key and turn to keyIN position. Press and hold each button for 6 seconds and wait for button stuck fault. After releasing, button stuck fault shall disappear from LCD.', 'date_commission' => 'Monthly'],
            17 => ['name_number' => 'SOIP in SM ROOM', 'details' => 'Ensure SM Key is working properly', 'required_value' => 'The above operation shall fail when SM key is OUT.', 'date_commission' => 'Monthly']
        ],
        'quarterly_half' => [
            1 => ['name_number' => 'IPS Room / Equipment / RelayRoom and Radio Tower', 'details' => 'Check the Voltage levels at 110V IPS Mains Input voltage to 110V/24V DCDC modules', 'required_value' => '100V to 115V', 'date_commission' => 'Quarterly'],
            2 => ['name_number' => 'IPS Room / Equipment / RelayRoom and Radio Tower', 'details' => 'Ensure DC-DC Modules Fail indication should not Glow.', 'required_value' => 'All Health and power ON Indications should glow.', 'date_commission' => 'Quarterly'],
            3 => ['name_number' => 'IPS Room / Equipment / RelayRoom and Radio Tower', 'details' => 'Check the voltages at Equipment End OF INTERNAL Supply.', 'required_value' => '22V to 26.5V to be observed', 'date_commission' => 'Quarterly'],
            4 => ['name_number' => 'IPS Room / Equipment / RelayRoom and Radio Tower', 'details' => 'Check the voltages at Equipment End of EXTERNAL (RADIO)', 'required_value' => '22V to 24V to be observed', 'date_commission' => 'Quarterly'],
            5 => ['name_number' => 'TCAS Equipment / Relay Room and LC gate equipment.', 'details' => 'Clean the Dust filters, Exhaust fan filters as well as fans', 'required_value' => 'To be free from dust', 'date_commission' => 'Quarterly'],
            6 => ['name_number' => 'TCAS Equipment / Relay Room and LC gate equipment.', 'details' => 'Clean the TCAS equipment', 'required_value' => 'To be free from dust', 'date_commission' => 'Quarterly'],
            7 => ['name_number' => 'TCAS Equipment / Relay Room and LC gate equipment.', 'details' => 'Check all Health Status LEDs ,i.e System health Indication, Output Voltage Indication of system', 'required_value' => 'LEDs should be Glow/Blink', 'date_commission' => 'Quarterly'],
            8 => ['name_number' => 'TCAS Equipment / Relay Room and LC gate equipment.', 'details' => 'Check the Power voltages at Equipment End of Ch-A & Ch-B', 'required_value' => '23V to 26.5V to be observed', 'date_commission' => 'Quarterly'],
            9 => ['name_number' => 'TCAS Equipment / Relay Room and LC gate equipment.', 'details' => 'Visually examine all the S/A cards are Inserted properly and tighten the corresponding screws', 'required_value' => 'Ensure the tightness of the cards', 'date_commission' => 'Quarterly'],
            10 => ['name_number' => 'TCAS Equipment / Relay Room and LC gate equipment.', 'details' => 'Check the all Wago fuse indications', 'required_value' => 'Check the all Wago fuse indications', 'date_commission' => 'Quarterly'],
            11 => ['name_number' => 'GPS antenna', 'details' => 'Check the communication status of the GPS Receivers', 'required_value' => 'GPS1 and GPS2 LED shall blink in VCC', 'date_commission' => 'Quarterly'],
            12 => ['name_number' => 'GPS antenna', 'details' => 'Check the GPS faults status in 7- segment display in Ch-A and Ch-B', 'required_value' => 'faults shall be present in 7- segment display.', 'date_commission' => 'Quarterly'],
            13 => ['name_number' => 'GPS antenna', 'details' => 'Tighten all the connections/Terminations', 'required_value' => 'All the connections to be tightened.', 'date_commission' => 'Quarterly'],
            14 => ['name_number' => 'GPS antenna', 'details' => 'Clean surface of the GPS antenna modems', 'required_value' => 'Surface should be kept clean Q', 'date_commission' => 'Quarterly'],
            15 => ['name_number' => 'GSM antenna', 'details' => 'Check the communication status of the GSM modems', 'required_value' => 'GSM1 and GSM2 LED shall blink in EVL', 'date_commission' => 'Half Yearly'],
            16 => ['name_number' => 'GSM antenna', 'details' => 'Tighten all the connections/Terminations', 'required_value' => 'All the connections to be tightened.', 'date_commission' => 'Half Yearly'],
            17 => ['name_number' => 'GSM antenna', 'details' => 'Clean surface of the GSM antenna modems', 'required_value' => 'Surface should be kept clean', 'date_commission' => 'Half Yearly'],
            18 => ['name_number' => 'GSM antenna', 'details' => 'Measure the signal strength of GSM-1', 'required_value' => '(>-85 dbm)', 'date_commission' => 'Half Yearly'],
            19 => ['name_number' => 'GSM antenna', 'details' => 'Measure the signal strength of GSM-2', 'required_value' => '(>-85 dbm)', 'date_commission' => 'Half Yearly'],
            20 => ['name_number' => 'GSM antenna', 'details' => 'Due date for the GSM-1 recharge/Balance amount', 'required_value' => '', 'date_commission' => 'Half Yearly'],
            21 => ['name_number' => 'GSM antenna', 'details' => 'Due date for the GSM-2 recharge/Balance amount', 'required_value' => '', 'date_commission' => 'Monthly'],
            22 => ['name_number' => 'RFID Fitments', 'details' => 'Fitment of the RFID in station section and block section is intact.', 'required_value' => 'Found OK or not', 'date_commission' => 'Monthly'],
            23 => ['name_number' => 'TCAS Equipment Relay Room and LC gate equipment.', 'details' => 'Relay output voltage to checked in Tapping Relay', 'required_value' => 'Should be greater than >22 Volt.', 'date_commission' => 'Monthly']
        ]
    ];

    // 3. Fetch Observations
    $observations = [];
    $modules = ['quarterly_check', 'daily_monthly', 'quarterly_half'];

    foreach ($modules as $module) {
        $savedRows = [];
        if ($module === 'quarterly_check') {
            $sql = "SELECT s_no, module, details, name_number, date_commission, required_value, observed_value, remarks, image_path, created_at 
                    FROM quarterly_check WHERE station_info_id = ? ORDER BY CAST(s_no AS SIGNED)";
        } else {
            $sql = "SELECT s_no, ? AS module, maintenance_task_description AS details, location AS name_number, frequency AS date_commission, action_taken AS required_value, equipment_condition AS observed_value, remarks, image_path, created_at 
                    FROM {$module} WHERE station_info_id = ? ORDER BY CAST(s_no AS SIGNED)";
        }

        $stmt = $conn->prepare($sql);
        if ($module === 'quarterly_check') {
            $stmt->bind_param("i", $stationInfoId);
        } else {
            $stmt->bind_param("si", $module, $stationInfoId);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            if (empty($row['module'])) $row['module'] = $module;
            $sNo = intval($row['s_no']);
            $savedRows[$sNo] = $row;
        }
        $stmt->close();

        // 4. Fill in entries (return all saved + default for placeholders)
        // Detect max rows from default values to ensure all are included
        $maxRowsRequired = count($defaultValues[$module]);
        // Also check if there are any saved rows beyond the default count
        if (!empty($savedRows)) {
            $maxRowsRequired = max($maxRowsRequired, max(array_keys($savedRows)));
        }

        for ($sNo = 1; $sNo <= $maxRowsRequired; $sNo++) {
            if (isset($savedRows[$sNo])) {
                $observations[] = $savedRows[$sNo];
            } elseif (isset($defaultValues[$module][$sNo])) {
                // Return default row even if not saved, so it shows up in report
                $observations[] = array_merge([
                    's_no' => $sNo,
                    'module' => $module,
                    'details' => '',
                    'name_number' => '',
                    'date_commission' => '',
                    'required_value' => '',
                    'observed_value' => '',
                    'remarks' => '',
                    'image_path' => '',
                    'created_at' => null
                ], $defaultValues[$module][$sNo]);
            }
        }
    }

    $startedAt = null;
    $updatedAt = null;
    foreach ($observations as $obs) {
        if (!empty($obs['created_at']) && $obs['created_at'] !== '0000-00-00 00:00:00') {
            if (!$startedAt || $obs['created_at'] < $startedAt) $startedAt = $obs['created_at'];
            if (!$updatedAt || $obs['created_at'] > $updatedAt) $updatedAt = $obs['created_at'];
        }
    }

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'station_info' => $stationInfo,
        'observations' => $observations,
        'started_at' => $startedAt,
        'updated_at' => $updatedAt
    ]);

    $conn->close();

} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
