<?php
$servername = "localhost";
$username = "root"; 
$dbname = "mappingproject"; 
$password = "";    


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit();
}
$conn->set_charset("utf8mb4");
?>