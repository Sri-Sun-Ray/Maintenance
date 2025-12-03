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
}