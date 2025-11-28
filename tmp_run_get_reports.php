<?php
// wrapper to run get_reports.php with a simulated GET param for CLI inspection
$_GET['zone'] = 'ECR';
// ensure script uses correct working dir
chdir(__DIR__ . '/Dashboard');
include 'get_reports.php';
?>