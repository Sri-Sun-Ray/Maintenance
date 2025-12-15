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

// Process observations: $_POST['observations'] contains text fields, files are in $_FILES['observations']
$observations = isset($_POST['observations']) ? $_POST['observations'] : [];
$fileBag = isset($_FILES['observations']) ? $_FILES['observations'] : null;

foreach ($observations as $index => $obs) {
    $sNo = intval($obs['s_no']);

    // Common incoming fields from the front-end
    // For daily_monthly & quarterly_half these represent:
    //   name_number   -> location
    //   details       -> maintenance_task_description
    //   required_value-> action_taken
    //   date_commission -> frequency (stored as VARCHAR in new schema)
    //   observed_value-> equipment_condition
    $details = isset($obs['details']) ? htmlspecialchars($obs['details']) : '';
    $nameNumber = isset($obs['name_number']) ? htmlspecialchars($obs['name_number']) : '';
    $dateCommRaw = $obs['date_commission'] ?? '';
    $requiredValue = isset($obs['required_value']) ? htmlspecialchars($obs['required_value']) : '';
    $observedValue = isset($obs['observed_value']) ? htmlspecialchars($obs['observed_value']) : '';
    $dateCommission = !empty($dateCommRaw) ? htmlspecialchars($dateCommRaw) : null;
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

    // Handle removed images
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

    // Check if record exists
    $checkStmt = $conn->prepare("SELECT id FROM {$tableName} WHERE station_info_id = ? AND s_no = ? AND module = ?");
    $checkStmt->bind_param("iis", $stationInfoId, $sNo, $module);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        // Update existing record
        if ($tableName === 'quarterly_check') {
            $updateStmt = $conn->prepare("UPDATE quarterly_check 
                SET details = ?, name_number = ?, date_commission = ?, required_value = ?, observed_value = ?, remarks = ?, image_path = ? 
                WHERE station_info_id = ? AND s_no = ? AND module = ?");
            $updateStmt->bind_param(
                "sssssssiss",
                $details, $nameNumber, $dateCommission,
                $requiredValue, $observedValue,
                $remarks, $imageJson,
                $stationInfoId, $sNo, $module
            );
        } elseif ($tableName === 'daily_monthly' || $tableName === 'quarterly_half') {
            // Map generic variables to new column meanings
            $location    = $nameNumber;
            $taskDesc    = $details;
            $actionTaken = $requiredValue;
            $frequency   = $dateCommission;
            $equipCond   = $observedValue;

            $updateStmt = $conn->prepare("UPDATE {$tableName} 
                SET location = ?, maintenance_task_description = ?, action_taken = ?, 
                    frequency = ?, equipment_condition = ?, remarks = ?, image_path = ? 
                WHERE station_info_id = ? AND s_no = ? AND module = ?");
            $updateStmt->bind_param(
                "sssssssiss",
                $location, $taskDesc, $actionTaken,
                $frequency, $equipCond,
                $remarks, $imageJson,
                $stationInfoId, $sNo, $module
            );
        } else {
            echo json_encode(['success' => false, 'message' => 'Unsupported table: ' . $tableName]);
            exit;
        }

        if (!$updateStmt->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error updating data: ' . $updateStmt->error]);
            exit;
        }
        $updateStmt->close();
    } else {
        // Insert new record (mirror logic from save_module_data.php)
        $createdAt = date('Y-m-d H:i:s');

        if ($tableName === 'quarterly_check') {
            $insertStmt = $conn->prepare("INSERT INTO quarterly_check 
                (s_no, station_info_id, module, details, name_number, date_commission, required_value, observed_value, remarks, image_path, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $insertStmt->bind_param(
                "iisssssssss",
                $sNo, $stationInfoId, $module,
                $details, $nameNumber, $dateCommission,
                $requiredValue, $observedValue,
                $remarks, $imageJson, $createdAt
            );
        } elseif ($tableName === 'daily_monthly' || $tableName === 'quarterly_half') {
            $location    = $nameNumber;
            $taskDesc    = $details;
            $actionTaken = $requiredValue;
            $frequency   = $dateCommission;
            $equipCond   = $observedValue;

            $insertStmt = $conn->prepare("INSERT INTO {$tableName} 
                (s_no, station_info_id, module, 
                 location, maintenance_task_description, action_taken,
                 frequency, equipment_condition,
                 remarks, image_path, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $insertStmt->bind_param(
                "iisssssssss",
                $sNo, $stationInfoId, $module,
                $location, $taskDesc, $actionTaken,
                $frequency, $equipCond,
                $remarks, $imageJson, $createdAt
            );
        } else {
            echo json_encode(['success' => false, 'message' => 'Unsupported table: ' . $tableName]);
            exit;
        }

        if (!$insertStmt->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error inserting data: ' . $insertStmt->error]);
            exit;
        }
        $insertStmt->close();
    }
    
    $checkStmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Module data updated successfully']);
?>

