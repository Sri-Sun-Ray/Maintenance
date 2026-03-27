<?php
$c = new mysqli('localhost','root','Hbl@1234','maintainance');
$res = $c->query('SELECT username, zone, role FROM users');
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
