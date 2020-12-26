<?php
// This file is a part of bit.js project
// Written By Zain Ali for testing file uploads....
error_reporting(-1);
ini_set('display_errors', 'On');

$files = $_FILES;
echo json_encode([
    'files'=>$files,
    'form' =>$_POST,
]);

?>