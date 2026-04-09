<?php
$dsn = "mysql:host=localhost;dbname=maintainance;charset=utf8mb4";
$dbUser = "root";
$dbPass = "Hbl@1234";

$filterZone = trim($_GET['zone'] ?? '');

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo "DB connection error: " . htmlspecialchars($e->getMessage());
    exit;
}

try {
    if ($filterZone !== '') {
        $stmt = $pdo->prepare("SELECT * FROM ltcas_reports WHERE LOWER(zone) = LOWER(?) ORDER BY created_at DESC");
        $stmt->execute([$filterZone]);
    } else {
        $stmt = $pdo->query("SELECT * FROM ltcas_reports ORDER BY created_at DESC");
    }
    $reports = $stmt->fetchAll();
} catch (Exception $e) {
    $reports = [];
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>LTCAS Reports</title>
<style>
body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
header { background:#00457C; color:#fff; padding:20px; text-align:center; }
.container{ padding:20px; max-width:1200px; margin:0 auto; }
button, .btn { cursor:pointer; }
table{ width:100%; border-collapse:collapse; margin-top:20px; }
th,td{ padding:10px; border:1px solid #ddd; text-align:left; }
th{ background:#00457C; color:#fff; }
.btn{ padding:8px 12px; margin:2px; border:none; color:#fff; border-radius:4px; text-decoration:none; display:inline-block; }
.view-btn{ background:#17a2b8; }
.download-btn{ background:#28a745; }
.edit-btn{ background:#ffc107; color:#212529; }
.edit-btn:hover{ background:#e0a800; }
.back-btn{ background:#6c757d; }
.search-row{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:12px; flex-wrap:wrap; }
#search-input{ padding:10px; width:320px; }
.version-badge{ background:#eee; padding:4px 8px; border-radius:4px; font-weight:700; }
@media(max-width:700px){ .search-row{ flex-direction:column; align-items:stretch; } #search-input{ width:100%; } }
</style>
</head>
<body>
<header>
  <h1>LTCAS Maintenance Reports</h1>
</header>
<div class="container">
  <a class="btn back-btn" href="LTCAS_index.html">Back to Dashboard</a>
  <div class="search-row">
    <h2>Saved Reports<?php echo $filterZone ? ' — ' . htmlspecialchars($filterZone) : ''; ?></h2>
    <div style="text-align:right;">
      <input id="search-input" type="text" placeholder="Search by Zone, Station or Loco..." />
    </div>
  </div>

<?php if (!empty($reports)): ?>
  <table id="report-table">
    <thead>
      <tr>
        <th>Zone</th>
        <th>Station</th>
        <th>Loco</th>
        <th>Report File</th>
        <th>Version</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($reports as $r):
        $zone = $r['zone'] ?? '';
        $station = $r['station'] ?? '';
        $loco = $r['loco'] ?? '';
        $file = $r['file_name'] ?? '';
        $version = $r['version'] ?? '';
        $created = isset($r['created_at']) ? date('d/m/Y H:i', strtotime($r['created_at'])) : '';
        $filePath = $r['file_path'] ?? ('reports/' . $file);
        $filePathEsc = htmlspecialchars($filePath);
    ?>
      <tr data-zone="<?php echo htmlspecialchars(strtolower($zone)); ?>" data-station="<?php echo htmlspecialchars(strtolower($station)); ?>" data-loco="<?php echo htmlspecialchars(strtolower($loco)); ?>">
        <td><?php echo htmlspecialchars($zone); ?></td>
        <td><?php echo htmlspecialchars($station); ?></td>
        <td><?php echo htmlspecialchars($loco); ?></td>
        <td><?php echo htmlspecialchars($file); ?></td>
        <td><span class="version-badge">v<?php echo (int)$version; ?></span></td>
        <td><?php echo htmlspecialchars($created); ?></td>
        <td>
          <a class="btn view-btn" href="<?php echo $filePathEsc; ?>" target="_blank">View</a>
          <a class="btn download-btn" href="<?php echo $filePathEsc; ?>" download>Download</a>
          <a class="btn edit-btn" href="LTCAS_create.html?zone=<?php echo urlencode($zone); ?>&station=<?php echo urlencode($station); ?>&loco=<?php echo urlencode($loco); ?>">Edit</a>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
<?php else: ?>
  <p><?php echo $filterZone ? 'No reports found for zone "' . htmlspecialchars($filterZone) . '".' : 'No reports found.'; ?></p>
<?php endif; ?>
</div>
<script>
document.getElementById('search-input').addEventListener('input', function(){
  const q = this.value.trim().toLowerCase();
  document.querySelectorAll('#report-table tbody tr').forEach(row => {
    const zone = row.getAttribute('data-zone') || '';
    const station = row.getAttribute('data-station') || '';
    const loco = row.getAttribute('data-loco') || '';
    row.style.display = (!q || zone.includes(q) || station.includes(q) || loco.includes(q)) ? '' : 'none';
  });
});
</script>
</body>
</html>