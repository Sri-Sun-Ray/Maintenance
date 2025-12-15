<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

/* -------------------------- REQUIRED POST VALUES --------------------------- */
$zone    = $_POST['zone'] ?? null;
$station = $_POST['station'] ?? null;
$date    = $_POST['date'] ?? null;
$module  = $_POST['module'] ?? null;

if (!$zone || !$station || !$date || !$module) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

/* -------------------------- MAP MODULE → TABLE --------------------------- */
function resolveModuleTable($module) {
    return match (strtolower($module)) {
        'quarterly_check' => 'quarterly_check',
        'daily_monthly'   => 'daily_monthly',
        'quarterly_half'  => 'quarterly_half',
        default           => null
    };
}

$tableName = resolveModuleTable($module);
if (!$tableName) {
    echo json_encode(['success' => false, 'message' => 'Unsupported module']);
    exit;
}

/* -------------------------- IMAGE HELPERS --------------------------- */
function ensureImageDirectory($relativePath) {
    $absolutePath = __DIR__ . '/' . $relativePath;
    if (!is_dir($absolutePath)) {
        mkdir($absolutePath, 0755, true);
    }
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

    return move_uploaded_file($tmp, $folderAbs . $filename)
        ? $folderRel . $filename
        : null;
}

function collectUploadedImagesForRow($files, $rowIndex, $meta, $folderRel, $folderAbs) {
    $output = [];
    if (!isset($files['name'][$rowIndex]['images'])) return $output;

    foreach ($files['name'][$rowIndex]['images'] as $i => $originalName) {
        if (!$originalName) continue;

        if (($files['error'][$rowIndex]['images'][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            continue;
        }

        $tmp = $files['tmp_name'][$rowIndex]['images'][$i] ?? null;
        $stored = moveUploadedImage($tmp, $originalName, $meta, $folderRel, $folderAbs);
        if ($stored) $output[] = $stored;
    }
    return $output;
}

/* -------------------------- DB CONNECTION --------------------------- */
$conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => $conn->connect_error]);
    exit;
}

/* -------------------------- FETCH station_info_id --------------------------- */
$stmt = $conn->prepare("SELECT id FROM station_info WHERE zone=? AND station=? AND date=?");
$stmt->bind_param("sss", $zone, $station, $date);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Station info not found']);
    exit;
}

$stationInfoId = $res->fetch_assoc()['id'];
$stmt->close();

/* -------------------------- IMAGE DIRECTORY --------------------------- */
$imageFolder    = "uploads/images/";
$imageFolderAbs = ensureImageDirectory($imageFolder);

/* -------------------------- PROCESS OBSERVATIONS --------------------------- */
$observations = $_POST['observations'] ?? [];
$fileBag      = $_FILES['observations'] ?? null;

foreach ($observations as $index => $obs) {
    $sNo       = (int)$obs['s_no'];
    $remarks   = htmlspecialchars($obs['remarks'] ?? '');
    $createdAt = date('Y-m-d H:i:s');

    /* ---- Merge images ---- */
    $imagePaths = [];

    if (!empty($obs['existing_images']) && is_array($obs['existing_images'])) {
        foreach ($obs['existing_images'] as $img) {
            if ($img) $imagePaths[] = htmlspecialchars($img);
        }
    }

    if ($fileBag) {
        $imagePaths = array_merge(
            $imagePaths,
            collectUploadedImagesForRow(
                $fileBag,
                $index,
                ['zone'=>$zone,'station'=>$station,'date'=>$date,'s_no'=>$sNo],
                $imageFolder,
                $imageFolderAbs
            )
        );
    }

    $imageJson = $imagePaths ? json_encode($imagePaths) : null;

    /* -------------------------- MODULE-WISE INSERT --------------------------- */
    if ($module === 'quarterly_check') {
        $details      = htmlspecialchars($obs['details'] ?? '');
        $nameNumber   = htmlspecialchars($obs['name_number'] ?? '');
        $dateComm     = !empty($obs['date_commission']) ? $obs['date_commission'] : null;
        $reqValue     = htmlspecialchars($obs['required_value'] ?? '');
        $obsValue     = htmlspecialchars($obs['observed_value'] ?? '');

        $sql = "INSERT INTO quarterly_check
            (s_no, station_info_id, module, details, name_number, date_commission,
             required_value, observed_value, remarks, image_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "iisssssssss",
            $sNo, $stationInfoId, $module,
            $details, $nameNumber, $dateComm,
            $reqValue, $obsValue,
            $remarks, $imageJson, $createdAt
        );

    } else {
        $location    = htmlspecialchars($obs['location'] ?? '');
        $taskDesc    = htmlspecialchars($obs['maintenance_task_description'] ?? '');
        $actionTaken = htmlspecialchars($obs['action_taken'] ?? '');
        $frequency   = htmlspecialchars($obs['frequency'] ?? '');
        $condition   = htmlspecialchars($obs['equipment_condition'] ?? '');

        $sql = "INSERT INTO {$tableName}
            (s_no, station_info_id, module, location,
             maintenance_task_description, action_taken,
             frequency, equipment_condition,
             remarks, image_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "iisssssssss",
            $sNo, $stationInfoId, $module,
            $location, $taskDesc, $actionTaken,
            $frequency, $condition,
            $remarks, $imageJson, $createdAt
        );
    }

    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
        exit;
    }

    $stmt->close();
}

$conn->close();

echo json_encode(['success' => true, 'message' => 'Module data saved successfully']);
?>
