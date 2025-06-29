<?php
// File: add_moment.php (Diagnostic Version)
// This script ONLY logs what it receives from the server.

header('Content-Type: application/json');
$logFile = 'upload_log.txt';

// A simple function to write to our log file
function write_log($message) {
    global $logFile;
    // The FILE_APPEND flag ensures we add to the file, not overwrite it.
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND | LOCK_EX);
}

write_log("--- DIAGNOSTIC RUN ---");

// 1. Log the request method as seen by the server
$request_method = $_SERVER['REQUEST_METHOD'];
write_log("Received Request Method: " . $request_method);

// 2. Log the raw data from the request body
$raw_input = file_get_contents('php://input');
write_log("Received Raw Input Data: " . $raw_input);

// 3. Log the content of the $_POST superglobal array
write_log("Received POST Array Content: " . print_r($_POST, true));

write_log("--- END DIAGNOSTIC ---");

// Send a simple response back to the JavaScript to confirm the test ran
echo json_encode(['status' => 'diagnostic_complete', 'method_seen' => $request_method]);
?>

