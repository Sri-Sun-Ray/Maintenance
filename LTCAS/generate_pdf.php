<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$zone = trim($input['zone'] ?? '');
$station = trim($input['station'] ?? '');
$loco = trim($input['loco'] ?? '');
$pdf_base64 = $input['pdf_base64'] ?? '';

if (!$zone || !$station || !$loco) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields (zone, station, loco)']);
    exit;
}

if (!$pdf_base64) {
    echo json_encode(['success' => false, 'message' => 'Missing pdf_base64. Generate PDF in browser first.']);
    exit;
}

$reportsDir = __DIR__ . '/reports';
if (!is_dir($reportsDir) && !mkdir($reportsDir, 0755, true)) {
    echo json_encode(['success' => false, 'message' => 'Failed to create reports directory']);
    exit;
}

$safeZone = preg_replace('/[^A-Za-z0-9_-]/', '_', $zone);
$safeStation = preg_replace('/[^A-Za-z0-9_-]/', '_', $station);
$safeLoco = preg_replace('/[^A-Za-z0-9_-]/', '_', $loco);

date_default_timezone_set('Asia/Kolkata');
$clientName = trim($input['report_name'] ?? '');
if ($clientName !== '') {
    $fileName = preg_replace('/[^A-Za-z0-9_\-.]/', '_', $clientName);
    if (stripos($fileName, '.pdf') === false) {
        $fileName .= '.pdf';
    }
} else {
    $timestamp = date('Y-m-d_H-i-s');
    $fileName = "LTCAS_{$safeZone}_{$safeStation}_{$safeLoco}_{$timestamp}.pdf";
}

$filePath = $reportsDir . '/' . $fileName;
$publicPath = 'reports/' . $fileName;

$pdfData = base64_decode($pdf_base64);
if ($pdfData === false || $pdfData === '') {
    echo json_encode(['success' => false, 'message' => 'Failed to decode PDF base64 or PDF is empty']);
    exit;
}

$bytesWritten = file_put_contents($filePath, $pdfData);
if ($bytesWritten === false || $bytesWritten === 0) {
    @unlink($filePath);
    echo json_encode(['success' => false, 'message' => 'Failed to write PDF file on server']);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    @unlink($filePath);
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

$createSql = "CREATE TABLE IF NOT EXISTS ltcas_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone VARCHAR(100),
    station VARCHAR(100),
    loco VARCHAR(100),
    file_name VARCHAR(255),
    version INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->query($createSql);

$stmt = $conn->prepare("SELECT MAX(version) AS max_ver FROM ltcas_reports WHERE zone = ? AND station = ? AND loco = ?");
$stmt->bind_param("sss", $zone, $station, $loco);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$currentMax = (int)($row['max_ver'] ?? 0);
$version = $currentMax + 1;
$stmt->close();

$stmt = $conn->prepare("INSERT INTO ltcas_reports (zone, station, loco, file_name, version, file_path) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssis", $zone, $station, $loco, $fileName, $version, $publicPath);
if (!$stmt->execute()) {
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