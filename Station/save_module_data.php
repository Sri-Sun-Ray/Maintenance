<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$zone = isset($_POST['zone']) ? htmlspecialchars($_POST['zone']) : null;
$station = isset($_POST['station']) ? htmlspecialchars($_POST['station']) : null;
$date = isset($_POST['date']) ? htmlspecialchars($_POST['date']) : null;
$module = isset($_POST['module']) ? htmlspecialchars($_POST['module']) : null;

if (!$zone || !$station || !$date || !$module) {
    die(json_encode(['success' => false, 'message' => 'Missing required fields']));
}

function resolveModuleTable($module)
{
    $map = [
        'quarterly_check' => 'quarterly_check',
        'daily_monthly' => 'daily_monthly',
        'quarterly_half' => 'quarterly_half'
    ];

    $key = strtolower($module);
    return $map[$key] ?? null;
}

$tableName = resolveModuleTable($module);
if (!$tableName) {
    die(json_encode(['success' => false, 'message' => 'Unsupported module']));
}

function ensureImageDirectory($relativePath)
{
    $absolutePath = rtrim(__DIR__ . '/' . $relativePath, '/') . '/';
    if (!is_dir($absolutePath)) {
        mkdir($absolutePath, 0755, true);
    }
    return $absolutePath;
}

function sanitizeFileSegment($value)
{
    $sanitized = preg_replace('/[^a-zA-Z0-9_-]/', '_', $value);
    return $sanitized === '' ? 'file' : $sanitized;
}

function moveUploadedImage($tmpName, $originalName, $metaParts, $folderRel, $folderAbs)
{
    if (!$tmpName || !is_uploaded_file($tmpName)) {
        return null;
    }

    $safeOriginal = sanitizeFileSegment(pathinfo($originalName ?? 'image.png', PATHINFO_FILENAME));
    $extension = pathinfo($originalName ?? '', PATHINFO_EXTENSION);
    $extPart = $extension ? '.' . preg_replace('/[^a-zA-Z0-9]/', '', $extension) : '.png';

    $fileName = implode('_', [
        sanitizeFileSegment($metaParts['zone']),
        sanitizeFileSegment($metaParts['station']),
        sanitizeFileSegment($metaParts['date']),
        sanitizeFileSegment($metaParts['s_no']),
        uniqid()
    ]) . '_' . $safeOriginal . $extPart;

    $destinationAbs = $folderAbs . $fileName;
    if (move_uploaded_file($tmpName, $destinationAbs)) {
        return str_replace('\\', '/', $folderRel . $fileName);
    }

    return null;
}

function collectUploadedImagesForRow($filesRoot, $rowIndex, $metaParts, $folderRel, $folderAbs)
{
    $collected = [];
    if (!$filesRoot || !isset($filesRoot['name'][$rowIndex])) {
        return $collected;
    }

    if (isset($filesRoot['name'][$rowIndex]['images'])) {
        foreach ($filesRoot['name'][$rowIndex]['images'] as $imgIdx => $originalName) {
            if (!$originalName) {
                continue;
            }

            $errorCode = $filesRoot['error'][$rowIndex]['images'][$imgIdx] ?? UPLOAD_ERR_NO_FILE;
            $tmpName = $filesRoot['tmp_name'][$rowIndex]['images'][$imgIdx] ?? null;
            if ($errorCode !== UPLOAD_ERR_OK || !$tmpName) {
                continue;
            }

            $stored = moveUploadedImage($tmpName, $originalName, $metaParts, $folderRel, $folderAbs);
            if ($stored) {
                $collected[] = $stored;
            }
        }
    }

    return $collected;
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get the station_info_id
$stmt = $conn->prepare("SELECT id FROM station_info WHERE zone = ? AND station = ? AND date = ?");
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$result = $stmt->get_result();
$stationInfoId = null;

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $stationInfoId = $row['id'];
} else {
    echo json_encode(['success' => false, 'message' => 'Station Info not found. Please save station info first.']);
    exit;
}
$stmt->close();

// Create image folder if not exists
$imageFolder = 'uploads/images/';
$imageFolderAbs = ensureImageDirectory($imageFolder);

// Create table if not exists
$createTableSql = "CREATE TABLE IF NOT EXISTS {$tableName} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    s_no INT NOT NULL,
    station_info_id INT NOT NULL,
    module VARCHAR(50),
    details VARCHAR(255),
    name_number VARCHAR(255),
    date_commission DATE,
    required_value VARCHAR(255),
    observed_value VARCHAR(255),
    remarks TEXT,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_info_id) REFERENCES station_info(id) ON DELETE CASCADE,
    UNIQUE KEY unique_row (station_info_id, s_no, module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$conn->query($createTableSql);

// Add module column if it doesn't exist (for existing tables)
$checkColumnSql = "SHOW COLUMNS FROM {$tableName} LIKE 'module'";
$columnResult = $conn->query($checkColumnSql);
if ($columnResult->num_rows == 0) {
    $alterSql = "ALTER TABLE {$tableName} ADD COLUMN module VARCHAR(50) AFTER station_info_id";
    $conn->query($alterSql);
}

// Process observations: $_POST['observations'] contains text fields, files are in $_FILES['observations']
$observations = isset($_POST['observations']) ? $_POST['observations'] : [];
$fileBag = isset($_FILES['observations']) ? $_FILES['observations'] : null;

foreach ($observations as $index => $obs) {
    $sNo = intval($obs['s_no']);
    $details = isset($obs['details']) ? htmlspecialchars($obs['details']) : '';
    $nameNumber = isset($obs['name_number']) ? htmlspecialchars($obs['name_number']) : '';
    $dateCommission = isset($obs['date_commission']) && !empty($obs['date_commission']) ? htmlspecialchars($obs['date_commission']) : null;
    $requiredValue = isset($obs['required_value']) ? htmlspecialchars($obs['required_value']) : '';
    $observedValue = isset($obs['observed_value']) ? htmlspecialchars($obs['observed_value']) : '';
    $remarks = isset($obs['remarks']) ? htmlspecialchars($obs['remarks']) : '';
    
    $imagePaths = [];
    
    // Handle existing images (from previous saves)
    if (isset($obs['existing_images']) && is_array($obs['existing_images'])) {
        foreach ($obs['existing_images'] as $existingImg) {
            if (!empty($existingImg)) {
                $imagePaths[] = htmlspecialchars($existingImg);
            }
        }
    }

    // Handle new uploaded images
    if ($fileBag) {
        $newImages = collectUploadedImagesForRow(
            $fileBag,
            $index,
            ['zone' => $zone, 'station' => $station, 'date' => $date, 's_no' => $sNo],
            $imageFolder,
            $imageFolderAbs
        );
        $imagePaths = array_merge($imagePaths, $newImages);
    }

    $imageJson = !empty($imagePaths) ? json_encode($imagePaths) : null;

    // Insert into module-specific table
    $insertStmt = $conn->prepare("INSERT INTO {$tableName} (s_no, station_info_id, module, details, name_number, date_commission, required_value, observed_value, remarks, image_path, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $createdAt = date('Y-m-d H:i:s');
    $insertStmt->bind_param("iisssssssss", $sNo, $stationInfoId, $module, $details, $nameNumber, $dateCommission, $requiredValue, $observedValue, $remarks, $imageJson, $createdAt);

    if (!$insertStmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error inserting data: ' . $insertStmt->error]);
        exit;
    }
    $insertStmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Module data saved successfully']);
?>

