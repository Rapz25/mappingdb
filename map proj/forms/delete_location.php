<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    include("db_connect.php");
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        $data = $_POST;
    }

    $id = $data['id'] ?? '';
    if (empty($id)) {
        echo json_encode(["status" => "error", "message" => "Location ID is required", "debug" => "No ID provided"]);
        exit();
    }

    if (!is_numeric($id)) {
        echo json_encode(["status" => "error", "message" => "Invalid ID format", "debug" => "ID: $id"]);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM locationtagging WHERE id = ?");
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Location deleted successfully", "id" => $id]);
        } else {
            echo json_encode(["status" => "error", "message" => "Location not found", "id" => $id]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Error deleting location: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>