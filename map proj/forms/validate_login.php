<?php
header('Content-Type: application/json');
session_start(); 
include("db_connect.php"); 


$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? ''; 

if (empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Please enter both fields"]);
    exit();
}
$stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE username = ?");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit();
}
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if ($password === $user['password']) {
        session_regenerate_id(true); 
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $redirect_page = ($user['role'] === 'admin') ? 'index.html' : 'user_index.html';
        
        echo json_encode([
            "status" => "success",
            "message" => "Login successful as " . $user['role'] . ".",
            "role" => $user['role'],
            "redirect" => "/map%20proj/" . $redirect_page
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid username or password."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid username or password."]);
}

$stmt->close();
$conn->close();
?>