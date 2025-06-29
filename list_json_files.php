<?php
// PHP script to list JSON files in the 'json_data' directory

header('Content-Type: application/json'); // Respond with JSON
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin (your website)

// Define the path to the json_data folder
// __DIR__ is the directory where this PHP script itself is located.
// So, it assumes 'json_data' is a subfolder next to list_json_files.php
$dir = __DIR__ . '/json_data/'; 
$jsonFiles = []; // Array to store found JSON filenames

// Check if the directory exists and can be opened
if (is_dir($dir) && $dh = opendir($dir)) {
    while (($file = readdir($dh)) !== false) {
        // Only include files that end with '.json'
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
            $jsonFiles[] = $file;
        }
    }
    closedir($dh); // Close the directory handle
} else {
    // If the directory is not found or not readable, return an error message
    echo json_encode(['error' => 'Mappen "json_data" blev ikke fundet eller kunne ikke læses. Sørg for, at den eksisterer og er tilgængelig.']);
    exit;
}

// Return the list of found JSON filenames as a JSON array
echo json_encode($jsonFiles);
?>
