<?php
$mysqli = new mysqli('localhost','root','Hbl@1234','maintainance');
if ($mysqli->connect_errno) { echo "DB connect error: " . $mysqli->connect_error; exit; }
$zone='ECR';
$rius = ['456554','5345454'];
foreach($rius as $riu) {
    echo "\n--- Reports for RIU: $riu ---\n";
    $stmt = $mysqli->prepare("SELECT id, zone, station, riu_no, file_name, version, created_at FROM reports WHERE zone=? AND riu_no=? ORDER BY version DESC");
    $stmt->bind_param('ss',$zone,$riu);
    $stmt->execute();
    $res = $stmt->get_result();
    while($r = $res->fetch_assoc()) {
        echo json_encode($r) . "\n";
    }
    $stmt->close();
}
$mysqli->close();
?>