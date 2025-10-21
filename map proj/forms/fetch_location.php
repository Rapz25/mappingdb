<?php
include("db_connect.php");
$sql = "SELECT id, latitude, longitude, category, name, description FROM locationtagging";
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