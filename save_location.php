<?php
    $host = "localhost";
    $user = "root";
    $pass = "";
    $db = "mappingproject";

    $conn = new mysqli($host, $user, $pass, $db);

    if($conn -> connect_error){
        die(json_encode(
            ["status" => "error",
            "message" => "DB connection failed: " . $conn -> connect_error]));
    }

    $lat = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $lng = isset($_POST['longitude']) ? $_POST['longitude'] : null;
    $cat = isset($_POST['category']) ? $_POST['category'] : null;

    if($lat === null || $lng === null || $cat === null || $cat === ""){
        echo json_encode([
            "status" => "error",
            "message" => "Incomplete data."
        ]); exit;
    }

    $stmt = $conn -> prepare("INSERT INTO locationtagging (latitude, longitude, category) VALUES (?, ?, ?)");
    $stmt -> bind_param("dds", $lat, $lng, $cat);

    if($stmt -> execute()){
        echo json_encode([
            "status" => "success",
            "message" => "Location saved."
        ]);
    }else{
        echo json_encode([
            "status" => "error",
            "message" => "Insert failed."
        ]);
    }

    $stmt -> close();
    $conn -> close();
?>