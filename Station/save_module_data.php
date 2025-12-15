<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

/* --------------------------
    REQUIRED POST VALUES
--------------------------- */
$zone    = $_POST['zone'] ?? null;
$station = $_POST['station'] ?? null;
$date    = $_POST['date'] ?? null;
$module  = $_POST['module'] ?? null;

if (!$zone || !$station || !$date || !$module) {
    die(json_encode(['success' => false, 'message' => 'Missing required fields']));
}

/* --------------------------
    MAP MODULE → TABLE
--------------------------- */
function resolveModuleTable($module) {
    $map = [
        'quarterly_check' => 'quarterly_check',
        'daily_monthly'   => 'daily_monthly',
        'quarterly_half'  => 'quarterly_half'
    ];
    return $map[strtolower($module)] ?? null;
}

$tableName = resolveModuleTable($module);
if (!$tableName) {
    die(json_encode(['success' => false, 'message' => 'Unsupported module']));
}

/* --------------------------
    IMAGE HANDLING HELPERS
--------------------------- */
function ensureImageDirectory($relativePath) {
    $absolutePath = __DIR__ . '/' . $relativePath;
    if (!is_dir($absolutePath)) mkdir($absolutePath, 0755, true);
    return rtrim($absolutePath, '/') . '/';
}

function sanitizeSegment($value) {
    return preg_replace('/[^a-zA-Z0-9_-]/', '_', $value ?: 'file');
}

function moveUploadedImage($tmp, $name, $meta, $folderRel, $folderAbs) {
    if (!$tmp || !is_uploaded_file($tmp)) return null;

    $safeBase = sanitizeSegment(pathinfo($name, PATHINFO_FILENAME));
    $ext = sanitizeSegment(pathinfo($name, PATHINFO_EXTENSION)) ?: 'png';

    $filename = implode('_', [
        sanitizeSegment($meta['zone']),
        sanitizeSegment($meta['station']),
        sanitizeSegment($meta['date']),
        sanitizeSegment($meta['s_no']),
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
        if ($err !== UPLOAD_ERR_OK) continue;

        $stored = moveUploadedImage($tmp, $originalName, $meta, $folderRel, $folderAbs);
        if ($stored) $output[] = $stored;
    }
    return $output;
}

/* --------------------------
    DATABASE CONNECTION
--------------------------- */
$conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'DB Error: ' . $conn->connect_error]));
}

/* --------------------------
    FETCH station_info_id
--------------------------- */
$stmt = $conn->prepare("SELECT id FROM station_info WHERE zone=? AND station=? AND date=?");
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows == 0) {
    die(json_encode(['success' => false, 'message' => 'Station Info not found. Save station info first.']));
}
$stationInfoId = $res->fetch_assoc()['id'];
$stmt->close();

/* --------------------------
    CREATE IMAGE FOLDER
--------------------------- */
$imageFolder    = "uploads/images/";
$imageFolderAbs = ensureImageDirectory($imageFolder);

/* --------------------------
   FINAL OBSERVATION PROCESSING
--------------------------- */
$observations = $_POST['observations'] ?? [];
$fileBag      = $_FILES['observations'] ?? null;

foreach ($observations as $index => $obs) {

    $sNo   = intval($obs['s_no']);
    $remarks = htmlspecialchars($obs['remarks'] ?? '');

    /* --------------------------
        IMAGE MERGE
    --------------------------- */
    $imagePaths = [];

    if (!empty($obs['existing_images']) && is_array($obs['existing_images'])) {
        foreach ($obs['existing_images'] as $img) {
            if ($img) $imagePaths[] = htmlspecialchars($img);
        }
    }

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

    // Common incoming fields from the front-end
    // NOTE: For daily_monthly & quarterly_half these represent:
    //   name_number   -> location
    //   details       -> maintenance_task_description
    //   required_value-> action_taken
    //   date_commission -> frequency (stored as VARCHAR in new schema)
    //   observed_value-> equipment_condition
    $details      = htmlspecialchars($obs['details'] ?? '');
    $nameNumber   = htmlspecialchars($obs['name_number'] ?? '');
    $dateCommRaw  = $obs['date_commission'] ?? '';
    $reqValue     = htmlspecialchars($obs['required_value'] ?? '');
    $obsValue     = htmlspecialchars($obs['observed_value'] ?? '');

    // For quarterly_check we keep DATE type, for new tables frequency is VARCHAR
    $dateComm = !empty($dateCommRaw) ? htmlspecialchars($dateCommRaw) : null;

    // Build SQL per-table to match the new schemas
    if ($tableName === 'quarterly_check') {
        // Old structure kept as-is
        $sql = "
            INSERT INTO quarterly_check
            (s_no, station_info_id, module, details, name_number, date_commission,
             required_value, observed_value, remarks, image_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            die(json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]));
        }

        $stmt->bind_param(
            "iisssssssss",
            $sNo, $stationInfoId, $module,
            $details, $nameNumber, $dateComm,
            $reqValue, $obsValue,
            $remarks, $imageJson, $createdAt
        );
    } elseif ($tableName === 'daily_monthly' || $tableName === 'quarterly_half') {
        // New structure with explicit column names
        // Map generic variables to new column meanings
        $location      = $nameNumber;
        $taskDesc      = $details;
        $actionTaken   = $reqValue;
        $frequency     = $dateComm; // stored as VARCHAR(255) now
        $equipCond     = $obsValue;

        $sql = "
            INSERT INTO {$tableName}
            (s_no, station_info_id, module,
             location, maintenance_task_description, action_taken,
             frequency, equipment_condition,
             remarks, image_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            die(json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]));
        }

        $stmt->bind_param(
            "iisssssssss",
            $sNo, $stationInfoId, $module,
            $location, $taskDesc, $actionTaken,
            $frequency, $equipCond,
            $remarks, $imageJson, $createdAt
        );
    } else {
        die(json_encode(['success' => false, 'message' => 'Unsupported table: ' . $tableName]));
    }

    if (!$stmt->execute()) {
        die(json_encode(['success' => false, 'message' => 'Insert Error: ' . $stmt->error]));
    }
    $stmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Module data saved successfully']);
?>
