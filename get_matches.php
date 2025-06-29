<?php
// This script returns pre-defined match data.
// It has been updated with the complete match history from the user's screenshots.

header('Content-Type: application/json'); // We are returning JSON data
header('Access-Control-Allow-Origin: *'); // Allow all origins for CORS.

// Define match data based on the full history shown in the screenshots.
$allMatches = [
    // --- UPCOMING MATCHES (Kommende Kampe) ---
    [
       

        'teams' => "Slikker Som En Schæfer vs. TBD",

        'score' => "TBD",

        'date' => "TBD",

        'type' => "Turneringskamp",

        'isUpcoming' => true,

        'outcome' => 'TBD',
    ],

    // --- PAST RESULTS (Seneste Kampe) - From newest to oldest, based on screenshots ---
    [
        'teams' => "Slikker Som En Schæfer vs FLOT HÅR",
        'score' => "2 - 0",
        'date' => "22-06-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'win',
    ],
    [
        'teams' => "Slikker Som En Schæfer vs LORTEBÆNKEN",
        'score' => "0 - 2",
        'date' => "15-06-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'loss'
    ],
    [
        'teams' => "LORTEBÆNKEN vs Slikker Som En Schæfer",
        'score' => "8 - 13, 13 - 4",
        'date' => "08-06-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ],
    [
        'teams' => "Slikker Som En Schæfer vs AMAGER STAFF",
        'score' => "10 - 13, 13 - 8",
        'date' => "03-06-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ],
    [
        'teams' => "VANLØSE VIRGINS vs Slikker Som En Schæfer",
        'score' => "13 - 9, 11 - 13", // Corrected score from screenshot
        'date' => "01-06-2025 20:20",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ],
    [
        'teams' => "LBN KAFFE vs Slikker Som En Schæfer",
        'score' => "2 - 13, 9 - 13",
        'date' => "25-05-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'win'
    ],
    [
        'teams' => "Slikker Som En Schæfer vs FLOT HÅR",
        'score' => "9 - 13, 13 - 9",
        'date' => "20-05-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ],
    [
        'teams' => "Slikker Som En Schæfer vs GAMMEL OG GIFTIG",
        'score' => "6 - 13, 7 - 13",
        'date' => "18-05-2025 20:30",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'loss'
    ],
    [
        'teams' => "TEAMTOSSET vs Slikker Som En Schæfer",
        'score' => "4 - 13, 5 - 13",
        'date' => "27-04-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'win'
    ],
    [
        'teams' => "Slikker Som En Schæfer vs LETHAL RACCOONS",
        'score' => "14 - 16, 13 - 7",
        'date' => "23-03-2025 19:57",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ],
    [
        'teams' => "EXPLICIT OLDBOYS vs Slikker Som En Schæfer",
        'score' => "13 - 6, 10 - 13",
        'date' => "20-03-2025 20:00",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ],
    [
        'teams' => "Slikker Som En Schæfer vs TEAM TORBENSEN BYG",
        'score' => "13 - 11, 10 - 13",
        'date' => "09-03-2025 19:57",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ],
    [
        'teams' => "EGEDAL TILTED TITANS vs Slikker Som En Schæfer",
        'score' => "8 - 13, 13 - 8",
        'date' => "02-03-2025 19:57",
        'type' => "Turneringskamp",
        'isUpcoming' => false,
        'outcome' => 'draw'
    ]
];

// Send the match data as a JSON response
echo json_encode($allMatches);
?>
