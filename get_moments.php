<?php
// Set the content type to JSON so the browser knows how to read the data
header('Content-Type: application/json');

$momentsFile = 'moments.json';

// Check if the file exists and send its content
if (file_exists($momentsFile)) {
    echo file_get_contents($momentsFile);
} else {
    // If the file doesn't exist, return an empty JSON array
    echo "";
}
