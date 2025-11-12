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
$imageFolderFull = __DIR__ . '/' . $imageFolderRel;
if (!is_dir($imageFolderFull)) {
    if (!mkdir($imageFolderFull, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Failed to create image folder']);
        exit;
    }
}

// Observations array from POST
$observations = isset($_POST['observations']) ? $_POST['observations'] : [];

foreach ($observations as $index => $obs) {
    // Text fields
    $slNo = isset($obs['sl_no']) ? intval($obs['sl_no']) : 0;
    $description = isset($obs['description']) ? trim($obs['description']) : '';
    $actionTaken = isset($obs['action_taken']) ? trim($obs['action_taken']) : '';
    $observation = isset($obs['observation']) ? trim($obs['observation']) : '';
    $remarks = isset($obs['remarks']) ? trim($obs['remarks']) : '';
    $existingImagePath = isset($obs['existing_image_path']) ? trim($obs['existing_image_path']) : '';
    $removeImageFlag = isset($obs['remove_image']) && $obs['remove_image'] == '1';

    // Detect new uploaded file for this observation
    $newImageUploaded = false;
    $newImageRelPath = null;

    if (isset($_FILES['observations'])
        && isset($_FILES['observations']['name'][$index])
        && isset($_FILES['observations']['name'][$index]['image'])
        && isset($_FILES['observations']['tmp_name'][$index])
        && isset($_FILES['observations']['tmp_name'][$index]['image'])
    ) {
        $fileError = $_FILES['observations']['error'][$index]['image'];
        if ($fileError === UPLOAD_ERR_OK) {
            $tmpName = $_FILES['observations']['tmp_name'][$index]['image'];
            $origName = basename($_FILES['observations']['name'][$index]['image']);
            $timestamp = time();
            // sanitize filename a bit
            $origName = preg_replace('/[^a-zA-Z0-9\-\._]/', '_', $origName);
            $uniqueName = "{$zone}_{$station}_{$riuNo}_{$slNo}_{$timestamp}_{$origName}";
            $destFull = $imageFolderFull . $uniqueName;
            if (move_uploaded_file($tmpName, $destFull)) {
                $newImageUploaded = true;
                $newImageRelPath = $imageFolderRel . $uniqueName;
                // remove existing file if present
                if ($existingImagePath) {
                    $existingFull = __DIR__ . '/' . $existingImagePath;
                    if (file_exists($existingFull)) {
                        @unlink($existingFull);
                    }
                }
            } else {
                echo json_encode(['success' => false, 'message' => "Failed to move uploaded file for row {$index}"]);
                exit;
            }
        }
    }

    // If remove flag is set and no new image was uploaded, delete existing file and set to NULL
    $setImagePath = '__KEEP__'; // sentinel => leave unchanged
    if ($removeImageFlag && !$newImageUploaded) {
        if ($existingImagePath) {
            $existingFull = __DIR__ . '/' . $existingImagePath;
            if (file_exists($existingFull)) {
                @unlink($existingFull);
            }
        }
        $setImagePath = null; // explicitly set to NULL in DB
    } elseif ($newImageUploaded) {
        $setImagePath = $newImageRelPath; // set to new relative path
    }

    $updatedAt = date('Y-m-d H:i:s');

    // Build and execute UPDATE depending on $setImagePath
    if ($setImagePath === '__KEEP__') {
        // keep image_path unchanged
        $updateSql = "UPDATE nms SET description = ?, action_taken = ?, observation = ?, remarks = ?, updated_at = ? WHERE sl_no = ? AND module = ? AND riu_info_id = ?";
        $stmtUp = $conn->prepare($updateSql);
        if (!$stmtUp) {
            echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            exit;
        }
        // bind: desc(s), action(s), observation(s), remarks(s), updated_at(s), sl_no(i), module(s), riu_info_id(i)
        $stmtUp->bind_param("sssssisi", $description, $actionTaken, $observation, $remarks, $updatedAt, $slNo, $module, $riuInfoId);
    } elseif ($setImagePath === null) {
        // set image_path = NULL
        $updateSql = "UPDATE nms SET description = ?, action_taken = ?, observation = ?, remarks = ?, image_path = NULL, updated_at = ? WHERE sl_no = ? AND module = ? AND riu_info_id = ?";
        $stmtUp = $conn->prepare($updateSql);
        if (!$stmtUp) {
            echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            exit;
        }
        // bind: desc(s), action(s), observation(s), remarks(s), updated_at(s), sl_no(i), module(s), riu_info_id(i)
        $stmtUp->bind_param("sssssisi", $description, $actionTaken, $observation, $remarks, $updatedAt, $slNo, $module, $riuInfoId);
    } else {
        // set image_path to new relative path (string)
        $updateSql = "UPDATE nms SET description = ?, action_taken = ?, observation = ?, remarks = ?, image_path = ?, updated_at = ? WHERE sl_no = ? AND module = ? AND riu_info_id = ?";
        $stmtUp = $conn->prepare($updateSql);
        if (!$stmtUp) {
            echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
            exit;
        }
        // bind: desc(s), action(s), observation(s), remarks(s), image_path(s), updated_at(s), sl_no(i), module(s), riu_info_id(i)
        $stmtUp->bind_param("ssssssisi", $description, $actionTaken, $observation, $remarks, $setImagePath, $updatedAt, $slNo, $module, $riuInfoId);
    }

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
