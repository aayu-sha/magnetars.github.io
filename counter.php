<?php
$servername = "localhost";
$username = "your_db_user";
$password = "your_db_password";
$dbname = "your_db_name";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->query("UPDATE visits SET count = count + 1 WHERE id = 1");

$result = $conn->query("SELECT count FROM visits WHERE id = 1");
$row = $result->fetch_assoc();
echo $row["count"];

$conn->close();
?>
