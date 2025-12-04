<?php
error_reporting(E_ALL);
ini_set('display_errors',1);
header('Content-Type: application/json');

$data=json_decode(file_get_contents('php://input'),true);

if(isset($data['zone'],$data['station'],$data['loco'],$data['date']))
{
    $zone = htmlspecialchars(($data['zone']));
    $station=htmlspecialchars($data['station']);
    $loco=htmlspecialchars($data['loco']);
    $date=htmlspecialchars($data['date']);

    $servername="localhost";
    $username="root";
    $password="Hbl@1234";
    $dbname="maintainance";

    $conn = new mysqli($servername,$username,$password,$dbname);

    if($conn->connect_error)
    {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));

    }

    $checkStmt = $conn->prepare("SELECT id FROM loco_info WHERE zone = ? AND station=? AND loco=?");
    $checkStmt->bind_param("sss", $zone,$station,$loco);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if($checkResult->num_rows>0)
    {
        $row =$checkResult->fetch_assoc();
        $existingId= $row['id'];

        echo json_encode([
            'success' => true,
            'message' => 'Record already exists ID: ' . $existingId,
            'id' => $existingId,
            'exist' => true
        ]);
    }
    else{
        $insertStmt=$conn->prepare("INSERT INTO loco_info(zone,station,loco,date) VALUES (?,?,?,?)");
        $insertStmt-> bind_param("ssss", $zone,$station,$loco,$date);

        if($insertStmt->execute())
        {
            echo json_encode([
                'success' => true,
                'message' => 'New record inserted succesfully',
                'id' => $insertStmt->insert_id,
                'exist' => false
            ]);
        }
        else{
            echo json_encode([
                'success' => false,
                'message' => 'Error Inserting data'
            ]);
        }
        $insertStmt->close();
    }
    $checkStmt->close();
    $conn->close();
}
else{
    echo json_encode([
        'success' => false,
        'message' => 'Missing data'
    ]);
}
?>