<?php
// Database connection details
$servername = "localhost";
$db_username = "root";
$db_password = "Hbl@1234";
$dbname = "maintainance";

// Create connection
$conn = new mysqli($servername, $db_username, $db_password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

session_start();

// ✅ Get the logged-in user's username from the session
if (!isset($_SESSION['username'])) {
  echo "User not logged in!";
  exit;
}

$username = $_SESSION['username'];  // get username stored at login

// ✅ Fetch Zone from users table
$sql = "SELECT Zone FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
  die("SQL Prepare failed: " . $conn->error);
}

$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$zone = "Not Found";
if ($row = $result->fetch_assoc()) {
  $zone = $row['Zone'];
}

$stmt->close();
$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Zone</title>
  <style>
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f2f5;
    }

    .zone-box {
      background: #fff;
      padding: 40px 80px;
      border-radius: 15px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      text-align: center;
    }

    .zone-box h2 {
      color: #0078d7;
      font-size: 2em;
      margin-bottom: 10px;
    }

    .zone-box p {
      font-size: 1.2em;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="zone-box">
    <h2>Zone Assigned</h2>
    <p id="zoneName"><?php echo htmlspecialchars($zone); ?></p>
  </div>
</body>
</html>
