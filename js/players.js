function initPlayersModule(players) {
    // --- DOM Element References ---
    const interactivePlayerGrid = document.getElementById('interactive-player-grid');
    const playerModal = document.getElementById('player-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalContentArea = document.getElementById('modal-content-area');

    if (!interactivePlayerGrid || !playerModal || !modalCloseBtn || !modalContentArea) {
        console.error("Player module elements are missing. Module cannot run.");
        return;
    }

    /**
     * Creates the grid of player cards on the main page.
     */
    const populatePlayerGrid = () => {
        interactivePlayerGrid.innerHTML = '';
        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-trigger-card';
            card.innerHTML = `<img src="${player.img}" alt="${player.nickname}" class="player-card-image"><div><h4 class="player-card-name">${player.nickname}</h4><p class="player-card-role">${player.role}</p></div>`;
            card.addEventListener('click', () => openPlayerModal(player));
            interactivePlayerGrid.appendChild(card);
        });
    };

    /**
     * Opens the modal with details for a specific player.
     * @param {object} player - The player object to display.
     */
    const openPlayerModal = (player) => {
        const stats = calculatePlayerStats(player);

        // This is the full, correct HTML for the modal content.
        modalContentArea.innerHTML = `
            <div class="player-detail-grid">
                <div class="player-image-container">
                    <img src="${player.img}" alt="${player.nickname}" class="player-detail-image">
                    <p class="player-real-name">${player.realName}</p>
                    <p class="player-quote">"${player.quote}"</p>
                </div>
                <div class="player-info-container">
                     <div class="player-header-info">
                        <div>
                            <h4 class="player-nickname text-5xl font-extrabold tracking-tighter">${player.nickname}</h4>
                            <p class="text-xl text-amber-400 font-semibold">${player.role}</p>
                        </div>
                        <div class="profile-links">
                            <a href="${player.steamProfileUrl}" target="_blank" class="profile-link steam-link" title="Steam Profile"><img src="misc/steam.webp" alt="Steam"></a>
                            <a href="${player.faceitUrl}" target="_blank" class="profile-link faceit-link" title="FACEIT Profile"><img src="misc/faceit.png" alt="FACEIT"></a>
                        </div>
                    </div>
                    <div class="key-stats-grid">
                       <div class="key-stat-box">
                            <span class="key-stat-label">Rating</span>
                            <span class="key-stat-value">${stats.rating.toFixed(2)}</span>
                        </div>
                        <div class="key-stat-box">
                            <span class="key-stat-label">ADR</span>
                            <span class="key-stat-value">${stats.adr.toFixed(0)}</span>
                        </div>
                        <div class="key-stat-box">
                            <span class="key-stat-label">K/D</span>
                            <span class="key-stat-value">${stats.kd.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="stats-display-area"></div>
                </div>
            </div>`;
        
        const statsDisplayArea = modalContentArea.querySelector('.stats-display-area');
        if (statsDisplayArea) {
            renderDetailedPlayerStatsInModal(player, statsDisplayArea);
        }
        
        playerModal.style.display = 'flex';
        document.body.classList.add('menu-open');
    };

    /**
     * Closes the player detail modal.
     */
    const closePlayerModal = () => {
        playerModal.style.display = 'none';
        modalContentArea.innerHTML = '';
        document.body.classList.remove('menu-open');
    };

    /**
     * Calculates the overall stats (Rating, ADR, KD) for a player.
     * @param {object} player - The player object with calculated map stats.
     * @returns {object} - An object containing rating, adr, and kd.
     */
    const calculatePlayerStats = (player) => {
        let totalKills = 0, totalDeaths = 0, totalDamage = 0, totalRounds = 0;
        if (player && player.mapStatsCalculated) {
            for (const mapName in player.mapStatsCalculated) {
                const mapData = player.mapStatsCalculated[mapName];
                totalKills += mapData.kills;
                totalDeaths += mapData.deaths;
                totalDamage += mapData.damage;
                totalRounds += mapData.totalRoundsPlayed;
            }
        }
        let rating = 0, adr = 0, kd = 0;
        if (totalRounds > 0) {
            adr = totalDamage / totalRounds;
            rating = (0.717 * (totalKills / totalRounds)) - (0.585 * (totalDeaths / totalRounds)) + (0.0073 * adr) + 0.259;
            kd = totalDeaths > 0 ? (totalKills / totalDeaths) : totalKills;
        }
        return { rating, adr, kd };
    };

    /**
     * Creates the dropdown and container for detailed map-by-map stats inside the modal.
     * @param {object} player - The player whose stats are being shown.
     * @param {HTMLElement} container - The element to render the content into.
     */
    const renderDetailedPlayerStatsInModal = (player, container) => {
        if (!container) return;
        container.innerHTML = '';
        const mapSelect = document.createElement('select');
        mapSelect.className = 'w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded-md detailed-stats-select';
        mapSelect.innerHTML = '<option value="all">Samlet Statistik</option>';
        
        Object.keys(player.mapStatsCalculated || {}).sort().forEach(mapName => {
            if (player.mapStatsCalculated[mapName] && player.mapStatsCalculated[mapName].gamesPlayed > 0) {
                const option = document.createElement('option');
                option.value = mapName;
                option.textContent = mapName.replace('de_', '').split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
                mapSelect.appendChild(option);
            }
        });
        
        const statsContentContainer = document.createElement('div');
        statsContentContainer.className = 'stats-content-container';

        mapSelect.addEventListener('change', (e) => {
             updateDetailedStatsInModal(player, e.target.value, statsContentContainer);
        });
        
        container.appendChild(mapSelect);
        container.appendChild(statsContentContainer);
        updateDetailedStatsInModal(player, 'all', statsContentContainer);
    };

    /**
     * Updates the detailed stats display when a new map is selected from the dropdown.
     * @param {object} player - The player object.
     * @param {string} selectedMap - The name of the map to show stats for ('all' for total).
     * @param {HTMLElement} container - The element to render the stats grid into.
     */
    const updateDetailedStatsInModal = (player, selectedMap, container) => {
        if (!container) return;
        let statsToDisplay = {};
        if (selectedMap === 'all') {
            const overallStats = calculatePlayerStats(player);
            let totalHeadshots = 0, totalClutches = 0, totalKills = 0;
            if (player && player.mapStatsCalculated) {
                for (const mapName in player.mapStatsCalculated) {
                    const mapData = player.mapStatsCalculated[mapName];
                    totalKills += mapData.kills;
                    totalHeadshots += mapData.headshots;
                    totalClutches += mapData.clutchesWon;
                }
            }
            statsToDisplay = {
                'Kills': totalKills,
                'Deaths': Object.values(player.mapStatsCalculated).reduce((sum, map) => sum + map.deaths, 0),
                'K/D Ratio': overallStats.kd.toFixed(2),
                'ADR': overallStats.adr.toFixed(0),
                'Headshot %': totalKills > 0 ? `${((totalHeadshots / totalKills) * 100).toFixed(0)}%` : '0%',
                'Clutches': totalClutches,
            };
        } else {
            const mapData = player.mapStatsCalculated[selectedMap];
            if (mapData) {
                const rounds = mapData.totalRoundsPlayed;
                const adr = rounds > 0 ? (mapData.damage / rounds) : 0;
                const kd = mapData.deaths > 0 ? (mapData.kills / mapData.deaths) : mapData.kills;
                statsToDisplay = {
                    'Kills': mapData.kills,
                    'Deaths': mapData.deaths,
                    'K/D Ratio': kd.toFixed(2),
                    'ADR': adr.toFixed(0),
                    'Headshot %': mapData.kills > 0 ? `${((mapData.headshots / mapData.kills) * 100).toFixed(0)}%` : '0%',
                    'Clutches': mapData.clutchesWon,
                };
            }
        }
        
        let statsHTML = '<div class="detailed-stats-grid">';
        for(const [label, value] of Object.entries(statsToDisplay)) {
            statsHTML += `<div class="detailed-stat-item"><span class="detailed-stat-label">${label}</span><span class="detailed-stat-value">${value}</span></div>`;
        }
        statsHTML += '</div>';
        container.innerHTML = statsHTML;
    };

    // --- Event Listeners ---
    modalCloseBtn.addEventListener('click', closePlayerModal);
    playerModal.addEventListener('click', (e) => {
        if (e.target === playerModal) {
            closePlayerModal();
        }
    });

    // --- Initial Load ---
    populatePlayerGrid();
}
