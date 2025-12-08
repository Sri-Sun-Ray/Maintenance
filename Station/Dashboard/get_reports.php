<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$zoneFilter = isset($_GET['zone']) ? trim($_GET['zone']) : null;
// keep behavior: always return latest report per RIU; we'll compute a 'status' flag below
$reportsDir = __DIR__ . '/../reports';

if (!is_dir($reportsDir)) {
    echo json_encode(['success' => false, 'message' => 'Reports folder not found']);
    exit;
}

$files = glob($reportsDir . '/*.pdf');
$data = [];
$latestReports = []; // Array to track latest version for each base report (zone_station_riu_no)

foreach ($files as $file) {
    $fileName = basename($file);

    // Only consider files that start with RIU_
    if (stripos($fileName, 'RIU_') !== 0) continue;

    // Remove extension and split tokens
    $nameNoExt = pathinfo($fileName, PATHINFO_FILENAME);
    $tokens = explode('_', $nameNoExt);

    // Need at least: RIU, ZONE, STATION, RIU_NO
    if (count($tokens) < 4) continue;

    $zone = $tokens[1];
    $station = $tokens[2];
    $riu_no = $tokens[3];

    if ($zoneFilter && strcasecmp($zone, $zoneFilter) !== 0) {
        continue;
    }

    $baseName = "RIU_{$zone}_{$station}_{$riu_no}";

    // Attempt to find a date/time token in the filename tokens (YYYY-MM-DD and HH-MM-SS)
    $date = null;
    $time = null;
    foreach ($tokens as $t) {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $t)) {
            $date = $t;
        }
        if (preg_match('/^\d{2}-\d{2}-\d{2}$/', $t)) {
            $time = str_replace('-', ':', $t);
        }
    }

    // fallback: use file modification time if date not present
    if (!$date) {
        $fileMTime = filemtime($file);
        $date = date('Y-m-d', $fileMTime);
        $time = date('H:i:s', $fileMTime);
    }

    // Find latest version entry from DB for this zone/station/riu_no
    $stmt = $conn->prepare("SELECT version, file_name, created_at FROM reports WHERE zone = ? AND station = ? AND riu_no = ? ORDER BY CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC, created_at DESC LIMIT 1");
    $stmt->bind_param("ssi", $zone, $station, $riu_no);
    $stmt->execute();
    $result = $stmt->get_result();

    $latestVersion = null;
    $dbFileName = null;
    $createdAt = null;

    if ($row = $result->fetch_assoc()) {
        $latestVersion = $row['version'];
        $dbFileName = $row['file_name'];
        $createdAt = $row['created_at'];
    }

    $stmt->close();

    // get equip no if exists
    $stmt = $conn->prepare("SELECT riu_equip_no FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ?");
    $stmt->bind_param("ssi", $zone, $station, $riu_no);
    $stmt->execute();
    $result = $stmt->get_result();
    $equip_no = null;
    if ($r = $result->fetch_assoc()) {
        $equip_no = $r['riu_equip_no'];
    }
    $stmt->close();

    // Compute status for the latest report
    $detectedStatus = 'NotCompleted';

    // determine latest created time (prefer DB created_at)
    $latestCreated = $createdAt ?? ("$date $time");

    // find previous report (version < latest) to compute due date (previous.created_at + 1 month)
    $prevCreated = null;
    if ($latestVersion) {
        $stmtPrev = $conn->prepare("SELECT created_at FROM reports WHERE zone = ? AND station = ? AND riu_no = ? AND version < ? ORDER BY version DESC LIMIT 1");
        $stmtPrev->bind_param("sssi", $zone, $station, $riu_no, $latestVersion);
        $stmtPrev->execute();
        $resPrev = $stmtPrev->get_result();
        if ($rowPrev = $resPrev->fetch_assoc()) {
            $prevCreated = $rowPrev['created_at'];
        }
        $stmtPrev->close();
    }

    // check whether filename indicates completion
    $isCompletedFlag = false;
    $candidateName = $dbFileName ?? $fileName;
    // Avoid false-positive: check NotCompleted first (contains 'Completed' as substring)
    if (stripos($candidateName, 'NotCompleted') !== false || stripos($candidateName, 'Not_Completed') !== false) {
        $isCompletedFlag = false;
    } elseif (stripos($candidateName, 'Completed') !== false) {
        $isCompletedFlag = true;
    }

    if ($isCompletedFlag) {
        if ($prevCreated) {
            $dueDate = date('Y-m-d H:i:s', strtotime($prevCreated . ' +1 month'));
            if (strtotime($latestCreated) <= strtotime($dueDate)) {
                $detectedStatus = 'Completed';
            } else {
                $detectedStatus = 'CompletedLate';
            }
        } else {
            // no previous report to compute due date from — mark as Completed
            $detectedStatus = 'Completed';
        }
    } else {
        $detectedStatus = 'NotCompleted';
    }

    // Only store the latest version of the report if DB has a record for it
    if ($latestVersion) {
        // If DB has a file_name, use it to build path; otherwise fall back to current file
        $filePath = ($dbFileName && file_exists($reportsDir . '/' . $dbFileName)) ? '../reports/' . $dbFileName : '../reports/' . $fileName;

        $latestReports[$baseName] = [
            'zone' => $zone,
            'station' => $station,
            'riu_no' => $riu_no,
            'riu_equip_no' => $equip_no,
            'report' => "{$baseName}_v{$latestVersion}",
            'path' => $filePath,
            'last_updated' => $date,
            'created_at' => $createdAt ?? ("$date $time"),
            'status' => $detectedStatus,
            'file_name' => $dbFileName ?? $fileName,
        ];
    }
}

$conn->close(); // Close the connection after all data is processed

// Return response
if (empty($latestReports)) {
    echo json_encode(['success' => false, 'message' => 'No reports found for this zone']);
} else {
    // Convert the associative array to a simple indexed array to return
    echo json_encode(['success' => true, 'reports' => array_values($latestReports)]);
}
?>
