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

    $sql = "SELECT latitude, longitude, category, name, description FROM locationtagging";
    $result = $conn->query($sql);

    $locations = [];
    if($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $locations[] = $row;
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $locations
    ]);

    $conn->close();
?>