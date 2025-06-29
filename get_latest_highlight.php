<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS for your frontend

// --- IMPORTANT: REPLACE WITH YOUR YOUTUBE API KEY ---
$youtubeApiKey = ''; // !!! YOU MUST GET YOUR OWN YOUTUBE DATA API KEY !!!
// Go to Google Cloud Console (console.cloud.google.com), create a project,
// enable YouTube Data API v3, and create an API key.

// Your YouTube Playlist ID
$playlistId = 'PLt0j-H80I2JdsuDo1xrdRGF3nBsIOdbZX'; // This is the ID from your provided URL

if (empty($youtubeApiKey)) {
    echo json_encode(['error' => 'YouTube API Key mangler. Indtast din API-nøgle i get_latest_highlight.php for at hente videoer.']);
    exit;
}

// YouTube Data API endpoint for playlist items
// maxResults=1 ensures we only get the latest (first) item
// order=date is crucial here, but YouTube API documentation says 'order' parameter is not supported for playlistItems.
// Instead, playlist items are naturally ordered by position in the playlist.
// To get the LATEST by upload date, you typically fetch the last item if it's ordered chronologically,
// or fetch multiple and sort. However, for a user's *newest uploads*, they often append to the playlist.
// Let's rely on the default order (which is usually chronologically from oldest to newest unless manual sort)
// and get the *first* item, assuming your playlist is set to show newest first or you add that way.
// A more robust way for "latest uploaded" would be to list all (or many) and sort by 'publishedAt'.
// For this API, 'order' is not available. So, we'll assume the first item is the most relevant.
$api_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId={$playlistId}&key={$youtubeApiKey}&maxResults=1";

$response = @file_get_contents($api_url);

if ($response === FALSE) {
    echo json_encode(['error' => 'Kunne ikke hente data fra YouTube API. Kontroller API-nøgle og netværk.']);
    exit;
}

$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Fejl ved parsing af YouTube API-svar: ' . json_last_error_msg()]);
    exit;
}

if (isset($data['error'])) {
    echo json_encode(['error' => 'YouTube API fejl: ' . $data['error']['message']]);
    exit;
}

if (isset($data['items']) && !empty($data['items'])) {
    $latestVideoId = $data['items'][0]['snippet']['resourceId']['videoId'];
    $videoTitle = $data['items'][0]['snippet']['title'];
    echo json_encode(['videoId' => $latestVideoId, 'title' => $videoTitle]);
} else {
    echo json_encode(['error' => 'Ingen videoer fundet i spillelisten, eller forkert spilleliste-ID.']);
}
?>

