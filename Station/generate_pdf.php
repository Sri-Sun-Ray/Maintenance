<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json; charset=utf-8');

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$zone       = trim($input['zone'] ?? '');
$station    = trim($input['station'] ?? '');
$date       = trim($input['date'] ?? '');
$pdf_base64 = $input['pdf_base64'] ?? '';

if (!$zone || !$station || !$date) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields (zone, station, date)']);
    exit;
}

if (!$pdf_base64) {
    echo json_encode(['success' => false, 'message' => 'Missing pdf_base64. Generate PDF in browser first.']);
    exit;
}

// Create reports directory for Station module
$reportsDir = __DIR__ . '/reports';
if (!is_dir($reportsDir) && !mkdir($reportsDir, 0755, true)) {
    echo json_encode(['success' => false, 'message' => 'Failed to create Station reports directory']);
    exit;
}

// Generate safe filename
date_default_timezone_set('Asia/Kolkata');
$safeZone    = preg_replace('/[^A-Za-z0-9_-]/', '_', $zone);
$safeStation = preg_replace('/[^A-Za-z0-9_-]/', '_', $station);
$safeDate    = preg_replace('/[^0-9\-]/', '_', $date);

// Client may pass a preferred report name (with Completed / NotCompleted flag)
$clientName = trim($input['report_name'] ?? '');
if ($clientName !== '') {
    // allow letters, numbers, dash, underscore, dot
    $fileName = preg_replace('/[^A-Za-z0-9_\-.]/', '_', $clientName);
    if (stripos($fileName, '.pdf') === false) {
        $fileName .= '.pdf';
    }
} else {
    $timestamp = date('Y-m-d_H-i-s');
    $fileName = "STATION_{$safeZone}_{$safeStation}_{$safeDate}_{$timestamp}.pdf";
}

$filePath   = $reportsDir . '/' . $fileName;
$publicPath = 'reports/' . $fileName; // Relative path returned to client

// Decode and save PDF
$pdfData = base64_decode($pdf_base64);
if ($pdfData === false) {
    echo json_encode(['success' => false, 'message' => 'Failed to decode PDF base64']);
    exit;
}

if (file_put_contents($filePath, $pdfData) === false) {
    echo json_encode(['success' => false, 'message' => 'Failed to write PDF file on server']);
    exit;
}

// Save metadata in DB using a dedicated table station_reports
$servername = "localhost";
$username   = "root";
$password   = "Hbl@1234";
$dbname     = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    @unlink($filePath);
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

// Ensure station_reports table exists
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

// Determine next version for this zone / station / date
$stmt = $conn->prepare("SELECT MAX(version) AS max_ver FROM station_reports WHERE zone = ? AND station = ? AND report_date = ?");
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$currentMax = (int)($row['max_ver'] ?? 0);
$version = $currentMax + 1;
$stmt->close();

// Insert record
$stmt = $conn->prepare("INSERT INTO station_reports (zone, station, report_date, file_name, version, file_path) VALUES (?, ?, ?, ?, ?, ?)");
// types: s (zone), s (station), s (date), s (file_name), i (version), s (file_path)
$stmt->bind_param("ssssis", $zone, $station, $date, $fileName, $version, $publicPath);

if (!$stmt->execute()) {
    @unlink($filePath);
    echo json_encode(['success' => false, 'message' => 'Failed to save station report record: ' . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit;
}

$stmt->close();
$conn->close();

echo json_encode([
    'success'   => true,
    'file_name' => $fileName,
    'file_path' => $publicPath,
    'version'   => $version
]);
exit;
?>


