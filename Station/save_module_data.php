<?php
/**
 * save_module_data.php
 * For Station Maintenance modules (quarterly_check, daily_monthly, quarterly_half).
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// --- Helper Functions ---
function ensureImageDirectory($relativePath) {
    $absolutePath = __DIR__ . '/' . $relativePath;
    if (!file_exists($absolutePath)) {
        if (!mkdir($absolutePath, 0777, true)) {
            die(json_encode(['success' => false, 'message' => "Failed to create directory: $relativePath"]));
        }
    }
    return rtrim($absolutePath, '/') . '/';
}

function sanitizeFileSegment($value) {
    return preg_replace('/[^a-zA-Z0-9_-]/', '_', $value ?: 'file');
}

function moveUploadedImage($tmp, $name, $meta, $folderRel, $folderAbs) {
    if (!$tmp || !is_uploaded_file($tmp)) return null;

    $ext = pathinfo($name, PATHINFO_EXTENSION);
    $safeBase = sanitizeFileSegment(pathinfo($name, PATHINFO_FILENAME));
    
    // Construct filename: Zone_Station_Date_SNo_UniqueId_Original.ext
    $filename = implode('_', [
        sanitizeFileSegment($meta['zone']),
        sanitizeFileSegment($meta['station']),
        sanitizeFileSegment($meta['date']),
        sanitizeFileSegment($meta['s_no']),
        uniqid()
    ]) . "_{$safeBase}.{$ext}";

    if (move_uploaded_file($tmp, $folderAbs . $filename)) {
        return $folderRel . $filename;
    }
    return null;
}

function collectUploadedImagesForRow($files, $rowIndex, $meta, $folderRel, $folderAbs) {
    $output = [];
    if (!isset($files['name'][$rowIndex]['images'])) return $output;

    foreach ($files['name'][$rowIndex]['images'] as $i => $originalName) {
        if (!$originalName) continue;

        $tmp = $files['tmp_name'][$rowIndex]['images'][$i] ?? null;
        $err = $files['error'][$rowIndex]['images'][$i] ?? UPLOAD_ERR_NO_FILE;

        if ($err === UPLOAD_ERR_OK && $tmp) {
            $stored = moveUploadedImage($tmp, $originalName, $meta, $folderRel, $folderAbs);
            if ($stored) $output[] = $stored;
        }
    }
    return $output;
}

// --- Main Execution ---

// 1. Inputs
$zone    = isset($_POST['zone']) ? htmlspecialchars($_POST['zone']) : null;
$station = isset($_POST['station']) ? htmlspecialchars($_POST['station']) : null;
$date    = isset($_POST['date']) ? htmlspecialchars($_POST['date']) : null;
$module  = $_POST['module'] ?? null;

if (!$zone || !$station || !$date || !$module) {
    die(json_encode(['success' => false, 'message' => 'Missing Zone, Station, Date or Module ID.']));
}

$observations = $_POST['observations'] ?? [];
$fileBag      = $_FILES['observations'] ?? null;

// 2. DB Connection
$servername = "localhost";
$username   = "root";
$password   = "Hbl@1234";
$dbname     = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// 3. Find station_info_id
$stmt = $conn->prepare("SELECT id FROM station_info WHERE zone=? AND station=? AND date=?");
if (!$stmt) {
    die(json_encode(['success' => false, 'message' => 'Prepare fallback station lookup failed: ' . $conn->error]));
}
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows == 0) {
    die(json_encode(['success' => false, 'message' => 'Station Info not found. Please save station info first. (Lookup: '.$zone.', '.$station.', '.$date.')']));
}
$row = $res->fetch_assoc();
$stationInfoId = $row['id'];
$stmt->close();

// 4. Working Folders
$imageFolder    = "uploads/images/";
$imageFolderAbs = ensureImageDirectory($imageFolder);

// 5. Save loop
$count = 0;
foreach ($observations as $index => $obs) {
    $sNo   = intval($obs['s_no']);
    $imagePaths = [];

    // Existing images (forwarded back for re-attachment)
    if (isset($obs['existing_images']) && is_array($obs['existing_images'])) {
        foreach ($obs['existing_images'] as $img) {
            if ($img) $imagePaths[] = htmlspecialchars($img);
        }
    }

    // New uploaded images
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

    $imageJson = $imagePaths ? json_encode($imagePaths) : null;
    $createdAt = date('Y-m-d H:i:s');

    if ($module === 'quarterly_check') {
        $details    = htmlspecialchars($obs['details'] ?? '');
        $nameNumber = htmlspecialchars($obs['name_number'] ?? '');
        $dateCommRaw = $obs['date_commission'] ?? ''; 
        $dateComm   = !empty($dateCommRaw) ? htmlspecialchars($dateCommRaw) : null;
        $reqValue   = htmlspecialchars($obs['required_value'] ?? '');
        $obsValue   = htmlspecialchars($obs['observed_value'] ?? '');
        $remarks    = htmlspecialchars($obs['remarks'] ?? '');

        // Use ON DUPLICATE KEY UPDATE to allow modular saves to be idempotent
        $sql = "INSERT INTO quarterly_check 
                (s_no, station_info_id, module, details, name_number, date_commission, required_value, observed_value, remarks, image_path, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                details=VALUES(details), 
                name_number=VALUES(name_number), 
                date_commission=VALUES(date_commission), 
                required_value=VALUES(required_value), 
                observed_value=VALUES(observed_value), 
                remarks=VALUES(remarks), 
                image_path=VALUES(image_path)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) die(json_encode(['success' => false, 'message' => 'Prepare failed for quarterly: ' . $conn->error]));
        $stmt->bind_param("iisssssssss", $sNo, $stationInfoId, $module, $details, $nameNumber, $dateComm, $reqValue, $obsValue, $remarks, $imageJson, $createdAt);
    } 
    else {
        // daily_monthly or quarterly_half
        $location   = htmlspecialchars($obs['name_number'] ?? $obs['location'] ?? '');
        $taskDesc   = htmlspecialchars($obs['details'] ?? $obs['task_description'] ?? '');
        $actionTaken= htmlspecialchars($obs['required_value'] ?? $obs['action_taken'] ?? '');
        $frequency  = htmlspecialchars($obs['date_commission'] ?? $obs['frequency'] ?? '');
        $equipCond  = htmlspecialchars($obs['observed_value'] ?? $obs['equipment_condition'] ?? '');
        $remarks    = htmlspecialchars($obs['remarks'] ?? '');

        $tableName = ($module === 'daily_monthly') ? 'daily_monthly' : 'quarterly_half';
        $sql = "INSERT INTO {$tableName} 
                (s_no, station_info_id, module, location, maintenance_task_description, action_taken, frequency, equipment_condition, remarks, image_path, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                location=VALUES(location), 
                maintenance_task_description=VALUES(maintenance_task_description), 
                action_taken=VALUES(action_taken), 
                frequency=VALUES(frequency), 
                equipment_condition=VALUES(equipment_condition), 
                remarks=VALUES(remarks), 
                image_path=VALUES(image_path)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) die(json_encode(['success' => false, 'message' => 'Prepare failed for daily/quarterly: ' . $conn->error]));
        $stmt->bind_param("iisssssssss", $sNo, $stationInfoId, $module, $location, $taskDesc, $actionTaken, $frequency, $equipCond, $remarks, $imageJson, $createdAt);
    }

    if ($stmt->execute()) {
        $count++;
    } else {
        die(json_encode(['success' => false, 'message' => 'Partial Save Error at S.No '.$sNo.': ' . $stmt->error]));
    }
    $stmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => "$count rows processed successfully."]);
?>
