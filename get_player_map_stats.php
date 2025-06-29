<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin (your website)

// Define the path to the json_data folder
$dir = __DIR__ . '/json_data/'; 

// Get SteamID and MapName from GET parameters
$playerSteamId = $_GET['steamId'] ?? null;
$mapName = $_GET['mapName'] ?? null;

if (!$playerSteamId || !$mapName) {
    echo json_encode(['error' => 'Missing steamId or mapName parameter.']);
    exit;
}

// Player mapping (MUST match your players array in script.js)
$steamIdToNickname = [
    "76561198351972301" => "Pomfritten",
    "76561198032902270" => "Felix",
    "76561197960366201" => "Banzai",
    "76561197981113537" => "Krag",
    "76561197996193719" => "w0bz",
    "76561197983814949" => "b3nnyF",
    "76561198815995595" => "Fredericia"
];

$nickname = $steamIdToNickname[$playerSteamId] ?? null;

if (!$nickname) {
    echo json_encode(['error' => 'SteamID not recognized as a team player.']);
    exit;
}

$playerCombinedStats = [
    'kills' => 0,
    'deaths' => 0,
    'headshots' => 0,
    'damage' => 0,
    'clutchesWon' => 0,
    'roundsPlayed' => new stdClass() // Use an object to mimic a Set for unique rounds
];

// Scan the json_data directory for files
if (is_dir($dir) && $dh = opendir($dir)) {
    while (($file = readdir($dh)) !== false) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
            $filePath = $dir . $file;
            $jsonData = json_decode(file_get_contents($filePath), true);

            // Only process if the mapName matches AND players array exists
            if (isset($jsonData['mapName']) && $jsonData['mapName'] === $mapName && isset($jsonData['players']) && is_array($jsonData['players'])) {
                $playerInThisMatch = false;
                foreach ($jsonData['players'] as $p) {
                    if ($p['steamId'] === $playerSteamId) {
                        $playerInThisMatch = true;
                        break;
                    }
                }

                if ($playerInThisMatch) { // Only aggregate if the player actually played on this map
                    // Aggregation logic for this specific file, for this specific player
                    
                    // Process kills
                    if (isset($jsonData['kills']) && is_array($jsonData['kills'])) {
                        foreach ($jsonData['kills'] as $kill) {
                            if ($kill['killerSteamId'] === $playerSteamId) {
                                $playerCombinedStats['kills']++;
                                if ($kill['isHeadshot']) $playerCombinedStats['headshots']++;
                                if (isset($kill['roundNumber'])) $playerCombinedStats['roundsPlayed']->{$kill['roundNumber']} = true;
                            }
                            if ($kill['victimSteamId'] === $playerSteamId) {
                                $playerCombinedStats['deaths']++;
                                if (isset($kill['roundNumber'])) $playerCombinedStats['roundsPlayed']->{$kill['roundNumber']} = true;
                            }
                        }
                    }

                    // Process damages
                    if (isset($jsonData['damages']) && is_array($jsonData['damages'])) {
                        foreach ($jsonData['damages'] as $damage) {
                            if ($damage['attackerSteamId'] === $playerSteamId) {
                                $playerCombinedStats['damage'] += $damage['healthDamage'];
                                if (isset($damage['roundNumber'])) $playerCombinedStats['roundsPlayed']->{$damage['roundNumber']} = true;
                            }
                        }
                    }

                    // Process clutches
                    if (isset($jsonData['clutches']) && is_array($jsonData['clutches'])) {
                        foreach ($jsonData['clutches'] as $clutch) {
                            if ($clutch['clutcherSteamId'] === $playerSteamId && $clutch['won']) {
                                $playerCombinedStats['clutchesWon']++;
                                if (isset($clutch['roundNumber'])) $playerCombinedStats['roundsPlayed']->{$clutch['roundNumber']} = true;
                            }
                        }
                    }
                }
            }
        }
    }
    closedir($dh);
} else {
    echo json_encode(['error' => 'Mappen "json_data" blev ikke fundet eller kunne ikke læses.']);
    exit;
}

// Convert roundsPlayed Set (PHP object) to count
$totalRoundsPlayed = count(get_object_vars($playerCombinedStats['roundsPlayed']));

// Calculate derived stats
$kdRatio = $playerCombinedStats['deaths'] > 0 ? round($playerCombinedStats['kills'] / $playerCombinedStats['deaths'], 2) : ($playerCombinedStats['kills'] > 0 ? "INF" : "0.00");
$hsPercentage = $playerCombinedStats['kills'] > 0 ? round(($playerCombinedStats['headshots'] / $playerCombinedStats['kills']) * 100) : 0;
$adr = $totalRoundsPlayed > 0 ? round($playerCombinedStats['damage'] / $totalRoundsPlayed) : 0;

$responseStats = [
    'kills' => $playerCombinedStats['kills'],
    'deaths' => $playerCombinedStats['deaths'],
    'kdRatio' => $kdRatio,
    'hsPercentage' => $hsPercentage,
    'adr' => $adr,
    'clutchesWon' => $playerCombinedStats['clutchesWon'],
    'roundsPlayed' => $totalRoundsPlayed,
    'mapName' => $mapName // Return map name for confirmation
];

echo json_encode($responseStats);
?>
