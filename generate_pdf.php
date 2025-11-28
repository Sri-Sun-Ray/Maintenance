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

$zone = trim($input['zone'] ?? '');
$station = trim($input['station'] ?? '');
$riu_no = trim($input['riu_no'] ?? ($input['riuNo'] ?? ''));
$equip_no = trim($input['equip_no'] ?? ($input['equipNo'] ?? ''));
$pdf_base64 = $input['pdf_base64'] ?? '';

if (!$zone || !$station || !$riu_no) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields (zone, station, riu_no)']);
    exit;
}

if (!$pdf_base64) {
    echo json_encode(['success' => false, 'message' => 'Missing pdf_base64. Generate PDF in browser.']);
    exit;
}

// create reports directory
$reportsDir = __DIR__ . '/reports';
if (!is_dir($reportsDir) && !mkdir($reportsDir, 0755, true)) {
    echo json_encode(['success' => false, 'message' => 'Failed to create reports directory']);
    exit;
}

// generate safe filename
$safeZone = preg_replace('/[^A-Za-z0-9_-]/', '_', $zone);
$safeStation = preg_replace('/[^A-Za-z0-9_-]/', '_', $station);
$safeRiu = preg_replace('/[^A-Za-z0-9_-]/', '_', $riu_no);
// If client supplied a preferred report name use it (after sanitizing), otherwise fall back to timestamped name
date_default_timezone_set('Asia/Kolkata');
$clientName = trim($input['report_name'] ?? '');
if ($clientName !== '') {
    // sanitize: allow letters, numbers, dash, underscore, dot; replace other chars with underscore
    $fileName = preg_replace('/[^A-Za-z0-9_\-.]/', '_', $clientName);
    // ensure .pdf extension
    if (stripos($fileName, '.pdf') === false) {
        $fileName .= '.pdf';
    }
} else {
    $timestamp = date('Y-m-d_H-i-s');
    $fileName = "RIU_{$safeZone}_{$safeStation}_{$safeRiu}_{$timestamp}.pdf";
}
$filePath = $reportsDir . '/' . $fileName;
$publicPath = 'reports/' . $fileName; // relative path returned to client

// decode and save PDF
$pdfData = base64_decode($pdf_base64);
if ($pdfData === false) {
    echo json_encode(['success' => false, 'message' => 'Failed to decode PDF base64']);
    exit;
}
if (file_put_contents($filePath, $pdfData) === false) {
    echo json_encode(['success' => false, 'message' => 'Failed to write PDF file on server']);
    exit;
}

// DB save and versioning
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    // cleanup file
    @unlink($filePath);
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

// ensure reports table exists
$createSql = "CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone VARCHAR(100),
    station VARCHAR(100),
    riu_no VARCHAR(100),
    file_name VARCHAR(255),
    version INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->query($createSql);

// get current max version
$stmt = $conn->prepare("SELECT MAX(version) as max_ver FROM reports WHERE zone = ? AND station = ? AND riu_no = ?");
$stmt->bind_param("sss", $zone, $station, $riu_no);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$currentMax = (int)($row['max_ver'] ?? 0);
$version = $currentMax + 1;
$stmt->close();

// insert record
$stmt = $conn->prepare("INSERT INTO reports (zone, station, riu_no, file_name, version, file_path) VALUES (?, ?, ?, ?, ?, ?)");
// types: zone(s), station(s), riu_no(s), file_name(s), version(i), file_path(s)
$stmt->bind_param("ssssis", $zone, $station, $riu_no, $fileName, $version, $publicPath);
if (!$stmt->execute()) {
    // cleanup file on failure
    @unlink($filePath);
    echo json_encode(['success' => false, 'message' => 'Failed to save report record: ' . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'file_name' => $fileName, 'file_path' => $publicPath, 'version' => $version]);
exit;
?>
