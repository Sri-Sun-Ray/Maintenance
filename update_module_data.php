<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// Read POST top-level fields
$zone = isset($_POST['zone']) ? trim($_POST['zone']) : null;
$station = isset($_POST['station']) ? trim($_POST['station']) : null;
$riuNo = isset($_POST['riu_no']) ? intval($_POST['riu_no']) : null;
$equipNo = isset($_POST['equip_no']) ? intval($_POST['equip_no']) : null;
$module = isset($_POST['module']) ? trim($_POST['module']) : null;

if (!$zone || !$station || !$riuNo || !$equipNo || !$module) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
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
    echo json_encode(['success' => false, 'message' => 'Unsupported module']);
    exit;
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
        'image' => false
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

function normalizeToArray($value)
{
    if (is_array($value)) {
        return array_values(array_filter($value, function ($item) {
            return $item !== null && $item !== '';
        }));
    }

    if ($value === null || $value === '') {
        return [];
    }

    return [$value];
}

function deleteImageFiles($paths)
{
    foreach ($paths as $path) {
        if (!$path) {
            continue;
        }
        $normalized = ltrim(str_replace(['\\'], '/', $path), '/');
        $fullPath = __DIR__ . '/' . $normalized;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}

// DB connection
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

// Find riu_info id
$stmt = $conn->prepare("SELECT id FROM riu_info WHERE zone = ? AND station = ? AND riu_no = ? AND riu_equip_no = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param("ssii", $zone, $station, $riuNo, $equipNo);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'RIU record not found']);
    exit;
}
$row = $res->fetch_assoc();
$riuInfoId = $row['id'];
$stmt->close();

// Ensure uploads folder exists
$imageFolderRel = 'uploads/images/';
$imageFolderFull = ensureImageDirectory($imageFolderRel);

// Observations array from POST
$observations = isset($_POST['observations']) ? $_POST['observations'] : [];
$fileBag = isset($_FILES['observations']) ? $_FILES['observations'] : null;

foreach ($observations as $index => $obs) {
    // Text fields
    $slNo = isset($obs['sl_no']) ? intval($obs['sl_no']) : 0;
    $description = isset($obs['description']) ? trim($obs['description']) : '';
    $actionTaken = isset($obs['action_taken']) ? trim($obs['action_taken']) : '';
    $observation = isset($obs['observation']) ? trim($obs['observation']) : '';
    $remarks = isset($obs['remarks']) ? trim($obs['remarks']) : '';
    $existingImages = [];
    if (isset($obs['existing_images'])) {
        $existingImages = normalizeToArray($obs['existing_images']);
    } else {
        $existingImagePath = isset($obs['existing_image_path']) ? trim($obs['existing_image_path']) : '';
        if ($existingImagePath !== '') {
            $existingImages = [$existingImagePath];
        }
    }

    $removedImages = [];
    if (isset($obs['removed_images'])) {
        $removedImages = normalizeToArray($obs['removed_images']);
    } elseif (!empty($obs['remove_image']) && $obs['remove_image'] == '1') {
        $removedImages = $existingImages;
        $existingImages = [];
    }

    if (!empty($removedImages)) {
        deleteImageFiles($removedImages);
        $existingImages = array_values(array_diff($existingImages, $removedImages));
    }

    $uploadedPaths = [];
    if ($fileBag) {
        $uploadedPaths = collectUploadedImagesForRow(
            $fileBag,
            $index,
            ['zone' => $zone, 'station' => $station, 'riu' => $riuNo, 'sl' => $slNo],
            $imageFolderRel,
            $imageFolderFull
        );
    }

    $finalImages = array_values(array_unique(array_merge($existingImages, $uploadedPaths)));
    $imageJson = !empty($finalImages) ? json_encode($finalImages) : null;

    $updatedAt = date('Y-m-d H:i:s');
    $updateSql = "UPDATE {$tableName} SET description = ?, action_taken = ?, observation = ?, remarks = ?, image_path = ?, updated_at = ? WHERE sl_no = ? AND module = ? AND riu_info_id = ?";
    $stmtUp = $conn->prepare($updateSql);
    if (!$stmtUp) {
        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
        exit;
    }
    $stmtUp->bind_param("ssssssisi", $description, $actionTaken, $observation, $remarks, $imageJson, $updatedAt, $slNo, $module, $riuInfoId);

    if (!$stmtUp->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error updating row: ' . $stmtUp->error]);
        $stmtUp->close();
        exit;
    }
    $stmtUp->close();
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Module data updated successfully']);
exit;
?>
