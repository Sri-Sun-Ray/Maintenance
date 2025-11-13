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

    // Pattern: RIU_ZONE_STATION_RIU_NO_DATE_TIME.pdf
    if (preg_match('/^RIU_([A-Za-z0-9]+)_([A-Za-z0-9]+)_([A-Za-z0-9]+)_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.pdf$/', $fileName, $matches)) {
        $zone = $matches[1];
        $station = $matches[2];
        $riu_no = $matches[3];
        $date = $matches[4];
        $time = str_replace('-', ':', $matches[5]);

        if ($zoneFilter && strcasecmp($zone, $zoneFilter) !== 0) {
            continue;
        }

        $baseName = "RIU_{$zone}_{$station}_{$riu_no}";

        // Fetch the version from the database for each file
        $stmt = $conn->prepare("SELECT version FROM reports WHERE file_name = ? ORDER BY CAST(SUBSTRING(version, 2) AS UNSIGNED) DESC");
        $stmt->bind_param("s", $fileName);
        $stmt->execute();
        $result = $stmt->get_result();

        // Initialize variables to store the latest version
        $latestVersion = null;
        $latestVersionString = '';

        while ($row = $result->fetch_assoc()) {
            // Get the version of the current file
            $version = $row['version'];

            // If it's the first time or we find a higher version, store it
            if ($latestVersion === null || version_compare($version, $latestVersionString, '>')) {
                $latestVersionString = $version;
                $latestVersion = $row['version'];
            }
        }

        $stmt->close();

        // Only store the latest version of the report
        if ($latestVersion) {
            // Store the latest report in the array
            $latestReports[$baseName] = [
                'zone' => $zone,
                'station' => $station,
                'riu_no' => $riu_no,
                'report' => "{$baseName}_v{$latestVersion}",
                'path' => '../reports/' . $fileName,
                'created_at' => "$date $time"
            ];
        }
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
