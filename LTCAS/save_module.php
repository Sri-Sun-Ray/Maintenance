<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}
function tableHasColumn($conn, $table, $column) {
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    return $result && $result->num_rows > 0;
}

function ensureImageColumn($conn, $table) {
    if (!tableHasColumn($conn, $table, 'image_path')) {
        $conn->query("ALTER TABLE `$table` ADD COLUMN image_path TEXT DEFAULT NULL");
    }
}

function sanitizeFileNameSegment($value) {
    $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', $value);
    return $safe === '' ? 'file' : $safe;
}

function saveBase64Image($dataUrl, $metaParts, $folderRel, $folderAbs) {
    if (!preg_match('/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/', $dataUrl, $matches)) {
        return null;
    }

    $mimeType = $matches[1];
    $base64Data = $matches[2];
    $imageData = base64_decode($base64Data);

    if ($imageData === false) {
        return null;
    }

    $extension = $mimeType === 'jpeg' ? 'jpg' : $mimeType;
    $fileName = sprintf(
        "%s_%s_%s_%s_%s.%s",
        sanitizeFileNameSegment($metaParts['station'] ?? 'station'),
        sanitizeFileNameSegment($metaParts['loco'] ?? 'loco'),
        sanitizeFileNameSegment($metaParts['sno'] ?? 'sno'),
        uniqid(),
        substr(md5($base64Data), 0, 6),
        $extension
    );

    if (!is_dir($folderAbs)) {
        mkdir($folderAbs, 0755, true);
    }

    $destination = $folderAbs . DIRECTORY_SEPARATOR . $fileName;
    if (file_put_contents($destination, $imageData) === false) {
        return null;
    }

    return rtrim($folderRel, '/') . '/' . $fileName;
}

function normalizeImagePaths($imagePaths, $metaParts, $folderRel, $folderAbs) {
    $normalized = [];
    foreach ((array)$imagePaths as $path) {
        if (!$path) {
            continue;
        }

        if (strpos($path, 'data:image/') === 0) {
            $saved = saveBase64Image($path, $metaParts, $folderRel, $folderAbs);
            if ($saved) {
                $normalized[] = $saved;
            }
        } else {
            $normalized[] = $path;
        }
    }

    return array_values(array_unique($normalized));
}
$table = $data['table'] ?? '';
$tableData = $data['tableData'] ?? [];

$allowedTables = [
  "locomotive",
  "brake_interface",
  "underframe",
  "locomotive_avail",
  "underframe2",
  "roof"
];

if (!in_array($table, $allowedTables)) {
    echo json_encode(["success" => false, "message" => "Invalid table"]);
    exit;
}

$imageColumnExists = tableHasColumn($conn, $table, 'image_path');
if (!$imageColumnExists) {
    ensureImageColumn($conn, $table);
    $imageColumnExists = tableHasColumn($conn, $table, 'image_path');
}

// INSERT only the columns that exist in the module tables (no `module` column)
$sql = "
INSERT INTO $table
(sno, description, parameter, cab1, cab2, remarks,
 trip, ia_ib, ic, toh_aoh, ioh_poh, station, loco" .
 ($imageColumnExists ? ", image_path" : "") . ")
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?" .
 ($imageColumnExists ? ", ?" : "") . ")
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode(["success" => false, "message" => "SQL prepare failed: " . $conn->error]);
  $conn->close();
  exit;
}

foreach ($tableData as $row) {
    $imagePaths = isset($row['image_paths']) ? $row['image_paths'] : [];
    $imagePaths = normalizeImagePaths($imagePaths, [
        'station' => $row['station'] ?? '',
        'loco' => $row['loco'] ?? '',
        'sno' => $row['sno'] ?? ''
    ], '/Maintenance/LTCAS/uploads/images', __DIR__ . '/uploads/images');
    $imageJson = !empty($imagePaths) ? json_encode($imagePaths) : null;

    if ($imageColumnExists) {
        $stmt->bind_param(
            "ssssssiiiiisss",
            $row["sno"],
            $row["description"],
            $row["parameter"],
            $row["cab1"],
            $row["cab2"],
            $row["remarks"],
            $row["trip"],
            $row["ia_ib"],
            $row["ic"],
            $row["toh_aoh"],
            $row["ioh_poh"],
            $row["station"],
            $row["loco"],
            $imageJson
        );
    } else {
        $stmt->bind_param(
            "ssssssiiiiiss",
            $row["sno"],
            $row["description"],
            $row["parameter"],
            $row["cab1"],
            $row["cab2"],
            $row["remarks"],
            $row["trip"],
            $row["ia_ib"],
            $row["ic"],
            $row["toh_aoh"],
            $row["ioh_poh"],
            $row["station"],
            $row["loco"]
        );
    }

    if (!$stmt->execute()) {
        echo json_encode(["success" => false, "message" => "Execution failed: " . $stmt->error]);
        $stmt->close();
        $conn->close();
        exit;
    }
}

$stmt->close();
$conn->close();

echo json_encode([
  "success" => true,
  "message" => "Data saved successfully"
]);
