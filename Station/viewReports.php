<?php
session_start();

// Require login (same behavior as RIU viewReports)
if (!isset($_SESSION['username'])) {
    header('Location: login.html');
    exit;
}

$username      = $_SESSION['username'];
$employee_name = $_SESSION['employee_name'] ?? 'Unknown';
$role          = $_SESSION['role'] ?? 'user';

// DB connection
$dsn   = "mysql:host=localhost;dbname=maintainance;charset=utf8mb4";
$dbUser = "root";
$dbPass = "Hbl@1234";

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo "DB connection error: " . htmlspecialchars($e->getMessage());
    exit;
}

// Optional zone filter ?zone=ER
$filterZone = isset($_GET['zone']) ? trim($_GET['zone']) : '';

// If no explicit zone provided and user is not admin, attempt to read user's zone from users table
if ($filterZone === '' && strtolower($role) !== 'admin') {
    try {
        $uStmt = $pdo->prepare("SELECT zone FROM users WHERE username = ? LIMIT 1");
        $uStmt->execute([$username]);
        $uRow = $uStmt->fetch();
        if ($uRow && !empty($uRow['zone'])) {
            $filterZone = trim($uRow['zone']);
        }
    } catch (Exception $e) {
        // ignore – keep $filterZone unchanged if lookup fails
    }
}

// Ensure station_reports table exists
$pdo->exec("CREATE TABLE IF NOT EXISTS station_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone VARCHAR(100),
    station VARCHAR(100),
    report_date DATE,
    file_name VARCHAR(255),
    version INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// NOTE: For Station we want to list **all** versions (v1, v2, v3, ...)
// so this view shows every row from station_reports, not just the latest.
try {
    if ($filterZone !== '') {
        $sql = "
            SELECT id, zone, station, report_date, file_name, version, created_at, file_path
            FROM station_reports
            WHERE LOWER(zone) = LOWER(?)
            ORDER BY zone, station, report_date DESC, version DESC, created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$filterZone]);
    } else {
        $sql = "
            SELECT id, zone, station, report_date, file_name, version, created_at, file_path
            FROM station_reports
            ORDER BY zone, station, report_date DESC, version DESC, created_at DESC";
        $stmt = $pdo->query($sql);
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
<title>Station Reports - HBL Engineering Ltd.</title>
<style>
body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
header { display:flex; align-items:center; justify-content:center; background:#00457C; color:#fff; padding:20px; position:relative; }
header img{ position:absolute; left:20px; height:50px;}
.profile{ position:absolute; right:20px; color:#fff; font-size:14px; }
.container{ padding:20px; max-width:1200px; margin:0 auto; }
h2{ text-align:center; margin-top:8px; }
table{ width:100%; border-collapse:collapse; margin-top:20px; }
th,td{ padding:10px; border:1px solid #ddd; text-align:left; }
th{ background:#00457C; color:#fff; }
.btn{ padding:6px 10px; margin:2px; border:none; color:#fff; border-radius:4px; cursor:pointer; text-decoration:none; display:inline-block; }
.view-btn{ background:#17a2b8; }
.edit-btn{ background:#ffc107; color:#000; }
.download-btn{ background:#28a745; }
.back-btn{ background:#6c757d; }
.search-row{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:12px; }
#search-input{ padding:10px; width:320px; }
.version-badge{ background:#eee; padding:4px 8px; border-radius:4px; font-weight:700; }
@media(max-width:700px){ .search-row{ flex-direction:column; align-items:stretch; } #search-input{ width:100%; } }
</style>
</head>
<body>
<header>
  <img src="./hbl logo.jpg" alt="HBL Logo">
  <div>
    <h1>HBL Engineering Ltd.</h1>
    <h3 style="margin:0; font-weight:400;">Electronics Group</h3>
  </div>
  <div class="profile">User: <?php echo htmlspecialchars($username); ?> | <?php echo htmlspecialchars($employee_name); ?></div>
</header>

<div class="container">
  <a href="station_index.html" class="btn back-btn">Back to Home</a>

  <div class="search-row">
    <h2>Station Maintenance Reports<?php echo $filterZone ? ' — ' . htmlspecialchars($filterZone) : ''; ?></h2>
    <div style="text-align:right;">
      <input id="search-input" type="text" placeholder="Search by Zone, Station or Date..." />
    </div>
  </div>

<?php if (!empty($reports)): ?>
  <table id="report-table">
    <thead>
      <tr>
        <th>Zone</th>
        <th>Station</th>
        <th>Date</th>
        <th>Report File</th>
        <th>Version</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($reports as $r):
        $zone    = $r['zone'] ?? '';
        $station = $r['station'] ?? '';
        $date    = $r['report_date'] ?? '';
        $file    = $r['file_name'] ?? '';
        $version = $r['version'] ?? '';
        $created = isset($r['created_at']) ? date('d/m/Y H:i', strtotime($r['created_at'])) : '';
        $filePath = $r['file_path'] ?? ('reports/' . $file);
        $filePathEsc = htmlspecialchars($filePath);

        $rForJs = [
            'zone'       => $zone,
            'station'    => $station,
            'report_date'=> $date,
            'file_name'  => $file,
            'version'    => $version,
            'file_path'  => $filePath
        ];
        $rJson = htmlspecialchars(json_encode($rForJs), ENT_QUOTES, 'UTF-8');
    ?>
      <tr data-zone="<?php echo htmlspecialchars(strtolower($zone)); ?>"
          data-station="<?php echo htmlspecialchars(strtolower($station)); ?>"
          data-date="<?php echo htmlspecialchars(strtolower($date)); ?>">
        <td><?php echo htmlspecialchars($zone); ?></td>
        <td><?php echo htmlspecialchars($station); ?></td>
        <td><?php echo htmlspecialchars($date); ?></td>
        <td><?php echo htmlspecialchars($file); ?></td>
        <td><span class="version-badge">v<?php echo (int)$version; ?></span></td>
        <td><?php echo htmlspecialchars($created); ?></td>
        <td>
          <a class="btn view-btn" href="<?php echo $filePathEsc; ?>" target="_blank">View</a>
          <a class="btn download-btn" href="<?php echo $filePathEsc; ?>" download>Download</a>
          <button class="btn edit-btn" onclick='editRecord(<?php echo $rJson; ?>)'>Edit</button>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
<?php else: ?>
  <p>
    <?php
      if ($filterZone) {
          echo 'No station reports found for zone "' . htmlspecialchars($filterZone) . '".';
      } else {
          echo 'No station reports found.';
      }
    ?>
  </p>
<?php endif; ?>

</div>

<script>
// Simple client-side search: filter by zone, station or date
document.getElementById('search-input').addEventListener('input', function(){
  const q = this.value.trim().toLowerCase();
  const rows = document.querySelectorAll('#report-table tbody tr');
  rows.forEach(row => {
    const zone = row.getAttribute('data-zone') || '';
    const station = row.getAttribute('data-station') || '';
    const date = row.getAttribute('data-date') || '';
    if (!q || zone.includes(q) || station.includes(q) || date.includes(q)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});

function editRecord(item) {
    const zone    = item.zone || "";
    const station = item.station || "";
    const date    = item.report_date || "";

    // Pre-fill storage used by Station create page
    if (zone) {
        localStorage.setItem("zone", zone);
        sessionStorage.setItem("zone", zone);
    }
    if (station) {
        localStorage.setItem("selectedStation", station);
        sessionStorage.setItem("station", station);
    }
    if (date) {
        localStorage.setItem("date", date);
        sessionStorage.setItem("date", date);
    }
    localStorage.setItem("stationEditMode", "1");

    window.location.href = "Station_create.html";
}

// Prefill search input when a zone filter was applied server-side
(function(){
  const presetZone = <?php echo json_encode($filterZone); ?>;
  if (presetZone) {
    document.getElementById('search-input').value = presetZone;
    const evt = new Event('input', { bubbles: true });
    document.getElementById('search-input').dispatchEvent(evt);
  }
})();
</script>
</body>
</html>


