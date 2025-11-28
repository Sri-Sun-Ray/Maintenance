<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$zone = isset($_POST['zone']) ? htmlspecialchars($_POST['zone']) : null;
$station = isset($_POST['station']) ? htmlspecialchars($_POST['station']) : null;
$riuNo = isset($_POST['riu_no']) ? intval($_POST['riu_no']) : null;
$equipNo = isset($_POST['equip_no']) ? intval($_POST['equip_no']) : null;
$module = isset($_POST['module']) ? htmlspecialchars($_POST['module']) : null;

if (!$zone || !$station || !$riuNo || !$equipNo || !$module) {
    die(json_encode(['success' => false, 'message' => 'Missing required fields']));
}

function resolveModuleTable($module)
{
    $map = [
        'nms' => 'nms',
        'power' => 'power',
        'riu_equip' => 'riu_equip',
        'comm' => 'comm',
        'earthing' => 'earthing'
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
        sanitizeFileSegment($metaParts['riu']),
        sanitizeFileSegment($metaParts['sl']),
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

    $targetSets = [
        'images' => true,
        'image' => false // legacy single upload key
    ];

    foreach ($targetSets as $key => $isArray) {
        if (!isset($filesRoot['name'][$rowIndex][$key])) {
            continue;
        }

        if ($isArray) {
            foreach ($filesRoot['name'][$rowIndex][$key] as $imgIdx => $originalName) {
                if (!$originalName) {
                    continue;
                }

                $errorCode = $filesRoot['error'][$rowIndex][$key][$imgIdx] ?? UPLOAD_ERR_NO_FILE;
                $tmpName = $filesRoot['tmp_name'][$rowIndex][$key][$imgIdx] ?? null;
                if ($errorCode !== UPLOAD_ERR_OK || !$tmpName) {
                    continue;
                }

                $stored = moveUploadedImage($tmpName, $originalName, $metaParts, $folderRel, $folderAbs);
                if ($stored) {
                    $collected[] = $stored;
                }
            }
        } else {
            $originalName = $filesRoot['name'][$rowIndex][$key];
            if (!$originalName) {
                continue;
            }

            $errorCode = $filesRoot['error'][$rowIndex][$key] ?? UPLOAD_ERR_NO_FILE;
            $tmpName = $filesRoot['tmp_name'][$rowIndex][$key] ?? null;
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

// Get the riu_info_id
$stmt = $conn->prepare("SELECT id FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
$stmt->bind_param("ssii", $zone, $station, $riuNo, $equipNo);
$stmt->execute();
$result = $stmt->get_result();
$riuInfoId = null;

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $riuInfoId = $row['id'];
} else {
    echo json_encode(['success' => false, 'message' => 'RIU Info not found']);
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
    $slNo = intval($obs['sl_no']);
    $description = isset($obs['description']) ? htmlspecialchars($obs['description']) : '';
    $actionTaken = isset($obs['action_taken']) ? htmlspecialchars($obs['action_taken']) : '';
    $observation = isset($obs['observation']) ? htmlspecialchars($obs['observation']) : '';
    $remarks = isset($obs['remarks']) ? htmlspecialchars($obs['remarks']) : '';
    $imagePaths = [];

    if ($fileBag) {
        $imagePaths = collectUploadedImagesForRow(
            $fileBag,
            $index,
            ['zone' => $zone, 'station' => $station, 'riu' => $riuNo, 'sl' => $slNo],
            $imageFolder,
            $imageFolderAbs
        );
    }

    $imageJson = !empty($imagePaths) ? json_encode($imagePaths) : null;

    // Insert into module-specific table
    $insertStmt = $conn->prepare("INSERT INTO {$tableName} (sl_no, module, description, action_taken, observation, remarks, image_path, riu_info_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $createdAt = date('Y-m-d H:i:s');
    // types: i, s, s, s, s, s, s, i, s => "issssssis"
    $insertStmt->bind_param("issssssis", $slNo, $module, $description, $actionTaken, $observation, $remarks, $imageJson, $riuInfoId, $createdAt);

    if (!$insertStmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error inserting data: ' . $insertStmt->error]);
        exit;
    }
    $insertStmt->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Module data saved successfully']);
?>
