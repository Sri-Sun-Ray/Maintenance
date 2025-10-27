<?php
// Database connection details
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "maintainance";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and validate input
    $employee_name = trim($_POST["employee_name"]);
    $phone_number  = trim($_POST["phone_number"]);
    $zone          = trim($_POST["zone"]);
    $username      = trim($_POST["username"]);
    $password      = trim($_POST["password"]);

    $errors = [];

    // Validate Employee Name
    if (strlen($employee_name) < 3 || strlen($employee_name) > 50) {
        $errors[] = "Employee Name must be between 3 and 50 characters.";
    }

    // Validate Phone Number
    if (!preg_match("/^\d{10}$/", $phone_number)) {
        $errors[] = "Phone Number must contain exactly 10 digits.";
    }

    // Validate Zone and Station
    if (empty($zone)) {
        $errors[] = "Zone selection is required.";
    }

    // Validate Username and Password
    if (empty($username)) {
        $errors[] = "Username is required.";
    }
    if (empty($password)) {
        $errors[] = "Password is required.";
    }

    // If there are validation errors, display them
    if (!empty($errors)) {
        echo "<h3>Errors:</h3><ul>";
        foreach ($errors as $error) {
            echo "<li>$error</li>";
        }
        echo "</ul>";
    } else {
        // Optional: Check if username already exists
        $check = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $check->bind_param("s", $username);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            echo "<h3>Username already exists. Please choose another.</h3>";
            $check->close();
        } else {
            $check->close();

            // Insert the user data into database
            $stmt = $conn->prepare("INSERT INTO users (employee_name, phone_number, zone, username, password) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssss", $employee_name, $phone_number, $zone, $username, $password);

            if ($stmt->execute()) {
                echo "<h3>Account created successfully!</h3>";
                echo "<p><a href='login.html'>Click here to login</a></p>";
            } else {
                echo "Error: " . $stmt->error;
            }

            $stmt->close();
        }
    }
}

$conn->close();
?>
