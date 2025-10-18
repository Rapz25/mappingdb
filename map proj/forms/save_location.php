<?php
    $host = "localhost";
    $user = "root";  
    $pass = "";
    $db = "mappingproject"; 

    $conn = new mysqli($host, $user, $pass, $db);

    if($conn->connect_error) {
        die(json_encode([
            "status" => "error",  
            "message" => "DB connection failed: " . $conn->connect_error 
        ]));
    }

    $lat = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $lng = isset($_POST['longitude']) ? $_POST['longitude'] : null;
    $cat = isset($_POST['category']) ? $_POST['category'] : null;
    $name = isset($_POST['name']) ? $_POST['name'] : null;
    $desc = isset($_POST['description']) ? $_POST['description'] : null;

    if ($lat === null || $lng === null || $cat === null || $cat === "" || $name === "" || $desc === "") {
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data."
        ]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO locationtagging (latitude, longitude, category, name, description) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ddsss", $lat, $lng, $cat, $name, $desc);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Location saved."
        ]);
    }else {
        echo json_encode([
            "status" => "error",
            "message" => "Insert failed."
        ]);
    }

    $stmt->close();
    $conn->close();
?>
