<?php
/**
 * update_module_data.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

function ensureImageDirectory($relativePath) {
    $absolutePath = rtrim(__DIR__ . '/' . $relativePath, '/') . '/';
    if (!file_exists($absolutePath)) {
        mkdir($absolutePath, 0777, true);
    }
    return $absolutePath;
}

function sanitizeFileSegment($value) {
    return preg_replace('/[^a-zA-Z0-9_-]/', '_', $value ?: 'file');
}

function moveUploadedImage($tmp, $name, $meta, $folderRel, $folderAbs) {
    if (!$tmp || !is_uploaded_file($tmp)) return null;
    $ext = pathinfo($name, PATHINFO_EXTENSION);
    $safeBase = sanitizeFileSegment(pathinfo($name, PATHINFO_FILENAME));
    $fileName = implode('_', [
        sanitizeFileSegment($meta['zone']),
        sanitizeFileSegment($meta['station']),
        sanitizeFileSegment($meta['date']),
        sanitizeFileSegment($meta['s_no']),
        uniqid()
    ]) . "_{$safeBase}.{$ext}";

    if (move_uploaded_file($tmp, $folderAbs . $fileName)) {
        return str_replace('\\', '/', $folderRel . $fileName);
    }
    return null;
}

function collectUploadedImagesForRow($filesRoot, $rowIndex, $metaParts, $folderRel, $folderAbs) {
    $output = [];
    if (!isset($filesRoot['name'][$rowIndex]['images'])) return $output;
    foreach ($filesRoot['name'][$rowIndex]['images'] as $i => $originalName) {
        if (!$originalName) continue;
        $tmp = $filesRoot['tmp_name'][$rowIndex]['images'][$i] ?? null;
        $err = $filesRoot['error'][$rowIndex]['images'][$i] ?? UPLOAD_ERR_NO_FILE;
        if ($err === UPLOAD_ERR_OK && $tmp) {
            $stored = moveUploadedImage($tmp, $originalName, $metaParts, $folderRel, $folderAbs);
            if ($stored) $output[] = $stored;
        }
    }
    return $output;
}

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
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows == 0) {
    die(json_encode(['success' => false, 'message' => 'Station Info not found for ' . $zone . '/' . $station . '/' . $date]));
}
$row = $res->fetch_assoc();
$stationInfoId = $row['id'];
$stmt->close();

$imageFolder = 'uploads/images/';
$imageFolderAbs = ensureImageDirectory($imageFolder);

$count = 0;
foreach ($observations as $index => $obs) {
    $sNo = intval($obs['s_no']);
    $imagePaths = [];

    // Existing images
    if (isset($obs['existing_images']) && is_array($obs['existing_images'])) {
        foreach ($obs['existing_images'] as $existingImg) {
            if (!empty($existingImg)) {
                $imagePaths[] = htmlspecialchars($existingImg);
            }
        }
    }

    // Removed images
    if (isset($obs['removed_images']) && is_array($obs['removed_images'])) {
        foreach ($obs['removed_images'] as $removedImg) {
            if (!empty($removedImg)) {
                $filePath = __DIR__ . '/' . $removedImg;
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
            }
        }
    }

    // New uploads
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
    $tableName = ($module === 'quarterly_check') ? 'quarterly_check' : (($module === 'daily_monthly') ? 'daily_monthly' : 'quarterly_half');

    if ($module === 'quarterly_check') {
        $details    = htmlspecialchars($obs['details'] ?? '');
        $nameNumber = htmlspecialchars($obs['name_number'] ?? '');
        $dateComm   = !empty($obs['date_commission']) ? htmlspecialchars($obs['date_commission']) : null;
        $reqValue   = htmlspecialchars($obs['required_value'] ?? '');
        $obsValue   = htmlspecialchars($obs['observed_value'] ?? '');
        $remarks    = htmlspecialchars($obs['remarks'] ?? '');

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
        $stmt->bind_param("iisssssssss", $sNo, $stationInfoId, $module, $details, $nameNumber, $dateComm, $reqValue, $obsValue, $remarks, $imageJson, $createdAt);
    } else {
        $location   = htmlspecialchars($obs['location'] ?? $obs['name_number'] ?? '');
        $taskDesc   = htmlspecialchars($obs['task_description'] ?? $obs['details'] ?? '');
        $actionTaken= htmlspecialchars($obs['action_taken'] ?? $obs['required_value'] ?? '');
        $frequency  = htmlspecialchars($obs['frequency'] ?? $obs['date_commission'] ?? '');
        $equipCond  = htmlspecialchars($obs['equipment_condition'] ?? $obs['observed_value'] ?? '');
        $remarks    = htmlspecialchars($obs['remarks'] ?? '');

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
        $stmt->bind_param("iisssssssss", $sNo, $stationInfoId, $module, $location, $taskDesc, $actionTaken, $frequency, $equipCond, $remarks, $imageJson, $createdAt);
    }

    if ($stmt->execute()) {
        $count++;
    }
    $stmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => "Update/Save successful. $count rows processed."]);
?>
