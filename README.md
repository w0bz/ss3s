# Slikker som en Schæfer - CS2 Team Website

## 📖 Description

This is a custom-built, dynamic statistics and team hub for the Counter-Strike 2 team "Slikker som en Schæfer". The website serves as a central place to view player information, track match history, analyze detailed game statistics, and showcase team highlights and achievements.

The site is built with vanilla JavaScript, HTML, and CSS (using Tailwind CSS for styling), and uses PHP scripts for simple backend tasks like reading data from the server's file system.

## ✨ Features

-   **Player Profiles ("Schæferne"):** Displays a grid of all team members. Clicking a player opens a detailed modal with their role, quote, key performance stats (Rating, ADR, K/D), and links to their Steam and FACEIT profiles.
-   **Team Stats Carousel:** A rotating carousel on the players page showing key team-wide statistics like overall win rate, total kills, and team ADR.
-   **Match History ("Kampe"):** Automatically fetches and displays a list of past match results.
-   **Detailed Match Modal:** Clicking on a past match opens an in-depth modal view with:
    -   **Scoreboard:** A familiar scoreboard layout showing stats for both teams.
    -   **Advanced Stats:** Accordion sections for more detailed statistics like opening duels, trade stats, and utility damage.
    -   **Positional Heatmap:** A visual, top-down map showing the locations of kills and deaths for any player, round, and side (T or CT).
-   **Map Performance ("Territorium"):** Ranks player performance on each map based on a calculated HLTV-like rating, providing a quick overview of who "owns" which map.
-   **Season MVP:** Dynamically loads and displays the current Season MVP and a list of past winners from a simple `mvp.json` file.
-   **Highlights:** Fetches and displays a scrollable list of "Sjove Øjeblikke" (Funny Moments) from a `moments.json` file, with an embedded YouTube player.
-   **Responsive Design:** The layout is fully responsive and adjusts for clean viewing on mobile, tablet, and desktop devices.

## 📁 File Structure

The project is organized into the following main directories and files:


/
├── 📄 index.html              # The main HTML file for the entire site.
├── 📄 style.css               # Main stylesheet for custom styles.
├── 📄 mvp.json                 # Data for the Season MVP section.
├── 📄 moments.json             # Data for the Highlights video clips.
│
├── 📁 js/                      # Contains all modular JavaScript files.
│   ├── 📜 script.js            # The main "controller" that orchestrates the site.
│   ├── 📜 navigation.js        # Handles the mobile menu and section navigation.
│   ├── 📜 players.js           # Logic for the player grid and modal.
│   ├── 📜 matches.js           # Logic for the match list and match detail modal.
│   ├── 📜 mvp.js                # Logic for the MVP section.
│   ├── 📜 highlights.js         # Logic for the YouTube highlights section.
│   ├── 📜 territory.js          # Logic for the map performance section.
│   └── 📜 heatmap-config.js     # Configuration data for map heatmaps.
│
├── 📁 json_data/              # Contains all the detailed match data files (.json).
│   └── 📜 22062025.json        # Example match data file.
│
├── 📁 php/                      # (Recommended) Contains all backend PHP scripts.
│   ├── 📜 list_json_files.php  # Reads the json_data directory and lists files.
│   └── 📜 get_moments.php       # Reads and serves moments.json.
│
├── 📁 spiller/                 # Contains all player profile images.
│
├── 📁 radar/                  # Contains all top-down map images for heatmaps.
│
└── 📁 misc/                   # Contains miscellaneous assets like icons (Steam, FACEIT).


## ⚙️ How It Works

The site operates on a "controller/library" model to keep the code clean and organized.

1.  **Initial Load:** The user loads `index.html`.
2.  **Controller Script:** `script.js` is the main controller. It waits for the page to fully load (`DOMContentLoaded`).
3.  **Data Fetching:** The `main()` function in `script.js` first calls `loadAndProcessAllData()`. This function:
    -   Fetches the list of all match JSON files from the server using `list_json_files.php`.
    -   Loops through each match file, reads its content, and aggregates all player statistics (kills, deaths, damage, etc.) across all games.
    -   Stores the processed player stats and the full match data.
4.  **Module Initialization:** Once all data is loaded and processed, `main()` calls the `init...` functions from the other JavaScript files (`initPlayersModule()`, `initMatchesModule()`, etc.), passing them the data they need to build their respective sections of the page.
5.  **User Interaction:** Each module (`players.js`, `matches.js`) handles the user interactions for its own section, such as opening modals or filtering data.

This ensures that all data is ready before the page tries to display it, preventing errors and ensuring a smooth user experience.
