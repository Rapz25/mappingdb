<?php
header('Content-Type: application/json');
include("db_connect.php");
$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'user';

if (empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Username and password are required"]);
    exit();
}

$check_stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
if (!$check_stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit();
}
$check_stmt->bind_param("s", $username);
$check_stmt->execute();
$check_res = $check_stmt->get_result();

if ($check_res->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username already taken"]);
    $check_stmt->close();
    $conn->close();
    exit();
}
$check_stmt->close(); 
$insert_stmt = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
if (!$insert_stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit();
}
$insert_stmt->bind_param("sss", $username, $password, $role);

if ($insert_stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Account created successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error creating account: " . $insert_stmt->error]);
}

$insert_stmt->close();
$conn->close();
?>