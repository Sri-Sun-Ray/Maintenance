<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$servername = "localhost";
$username   = "root";
$password   = "Hbl@1234";
$dbname     = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$zoneFilter = isset($_GET['zone']) ? trim($_GET['zone']) : null;

// Ensure station_reports table exists (same definition as in generate_pdf.php)
$createSql = "CREATE TABLE IF NOT EXISTS station_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone VARCHAR(100),
    station VARCHAR(100),
    report_date DATE,
    file_name VARCHAR(255),
    version INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->query($createSql);

// Select latest version per zone/station/date
$params = [];
$where = '';
if ($zoneFilter !== null && $zoneFilter !== '') {
    $where = 'WHERE LOWER(sr.zone) = LOWER(?)';
    $params[] = $zoneFilter;
}

$sql = "
    SELECT sr.id, sr.zone, sr.station, sr.report_date, sr.file_name, sr.version, sr.created_at, sr.file_path
    FROM station_reports sr
    INNER JOIN (
        SELECT zone, station, report_date, MAX(version) AS max_ver
        FROM station_reports
        GROUP BY zone, station, report_date
    ) t ON sr.zone = t.zone
       AND sr.station = t.station
       AND sr.report_date = t.report_date
       AND sr.version = t.max_ver
    $where
    ORDER BY sr.created_at DESC
";

if ($where) {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $params[0]);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($sql);
}

$reports = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $zone    = $row['zone'];
        $station = $row['station'];
        $date    = $row['report_date'];
        $file    = $row['file_name'];
        $version = (int)$row['version'];
        $created = $row['created_at'];
        $filePath = $row['file_path'] ?: ('reports/' . $file);

        // Determine status from filename: NotCompleted vs Completed
        $status = 'NotCompleted';
        $candidateName = $file ?: '';
        if (stripos($candidateName, 'NotCompleted') !== false || stripos($candidateName, 'Not_Completed') !== false) {
            $status = 'NotCompleted';
        } elseif (stripos($candidateName, 'Completed') !== false) {
            $status = 'Completed';
        }

        // last_updated used by dashboard for due-date logic (use report_date)
        $lastUpdated = $date ?: substr($created, 0, 10);

        $reports[] = [
            'zone'        => $zone,
            'station'     => $station,
            'riu_no'      => '',          // not used for Station, kept for JS compatibility
            'riu_equip_no'=> '',
            'report'      => "STATION_{$zone}_{$station}_{$date}_v{$version}",
            'path'        => '../' . ltrim($filePath, './'),
            'report_date' => $date,
            'last_updated'=> $lastUpdated,
            'created_at'  => $created,
            'status'      => $status,
            'file_name'   => $file,
            'version'     => $version,
        ];
    }
}

$conn->close();

if (empty($reports)) {
    echo json_encode(['success' => false, 'message' => 'No reports found for this zone']);
} else {
    echo json_encode(['success' => true, 'reports' => $reports]);
}
?>
