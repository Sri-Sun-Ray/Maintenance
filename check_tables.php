<?php
$conn = new mysqli("localhost", "root", "Hbl@1234", "maintainance");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$tables = ["locomotive", "brake_interface", "underframe", "locomotive_avail", "underframe2", "roof"];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "Table $table EXISTS\n";
    } else {
        echo "Table $table DOES NOT EXIST\n";
    }
}
$conn->close();
?>
