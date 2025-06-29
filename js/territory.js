function displayTerritoryStats(players) {
    const container = document.getElementById('territory-content');
    if (!container) return;

    const allMapNames = new Set();
    players.forEach(p => {
        if (p.mapStatsCalculated) {
            Object.keys(p.mapStatsCalculated).forEach(mapName => allMapNames.add(mapName));
        }
    });

    container.innerHTML = ''; // Clear existing content.

    Array.from(allMapNames).sort().forEach(mapName => {
        const playersOnMap = players.map(player => {
            const mapStats = player.mapStatsCalculated ? player.mapStatsCalculated[mapName] : null;
            
            let hltvRating = 0;
            let adr = 0;
            let kdr = 0;

            if (mapStats && mapStats.totalRoundsPlayed > 0) {
                const rounds = mapStats.totalRoundsPlayed;
                const kpr = mapStats.kills / rounds;
                const dpr = mapStats.deaths / rounds;
                adr = mapStats.damage / rounds;
                kdr = mapStats.deaths > 0 ? mapStats.kills / mapStats.deaths : mapStats.kills;
                // Approximated HLTV Rating 2.0 formula
                hltvRating = (0.717 * kpr) - (0.585 * dpr) + (0.0073 * adr) + 0.259;
            }

            return {
                nickname: player.nickname,
                rating: hltvRating,
                adr: adr,
                kdr: kdr,
                gamesPlayed: mapStats ? mapStats.gamesPlayed || 0 : 0
            };
        })
        .filter(p => p.gamesPlayed > 0);

        if (playersOnMap.length === 0) {
            return;
        }

        const totalGamesPlayedOnMap = players.reduce((max, p) => {
            const games = p.mapStatsCalculated?.[mapName]?.gamesPlayed || 0;
            return Math.max(max, games);
        }, 0);

        const mapIconUrl = `misc/${mapName.replace('de_', '')}.webp`;

        const mapCard = document.createElement('div');
        mapCard.className = 'map-stats-card';
        
        mapCard.innerHTML = `
            <div class="map-stats-card-header">
                <img src="${mapIconUrl}" alt="${mapName}" class="map-icon" onerror="this.style.display='none'">
                <div class="map-header-text">
                    <h4 class="map-title">${mapName.replace('de_', '').replace(/_/g, ' ')}</h4>
                    <span class="map-games-played">${totalGamesPlayedOnMap} Kampe Spillet</span>
                </div>
                
                <!-- Desktop Buttons -->
                <div class="map-sort-controls">
                    <button data-sort="rating" class="sort-btn">Rating</button>
                    <button data-sort="kdr" class="sort-btn">KDR</button>
                    <button data-sort="adr" class="sort-btn">ADR</button>
                </div>
                
                <!-- Mobile Dropdown -->
                <div class="map-sort-dropdown">
                    <select class="sort-select">
                        <option value="rating">Sorter efter: Rating</option>
                        <option value="kdr">Sorter efter: KDR</option>
                        <option value="adr">Sorter efter: ADR</option>
                    </select>
                </div>
            </div>
            <div class="player-list-container"></div>
        `;
        
        const playerListContainer = mapCard.querySelector('.player-list-container');
        const sortButtons = mapCard.querySelectorAll('.sort-btn');
        const sortSelect = mapCard.querySelector('.sort-select');

        const renderPlayerList = (sortKey) => {
            playersOnMap.sort((a, b) => b[sortKey] - a[sortKey]);

            const getBarConfig = (player) => {
                let value, max_value;
                switch (sortKey) {
                    case 'kdr':
                        value = player.kdr;
                        max_value = 2.0; // Max value for KDR bar scaling
                        break;
                    case 'adr':
                        value = player.adr;
                        max_value = 120; // Max value for ADR bar scaling
                        break;
                    default: // rating
                        value = player.rating;
                        max_value = 1.5; // Max value for Rating bar scaling
                }
                const width = Math.min((value / max_value) * 100, 100);
                const displayValue = sortKey === 'adr' ? value.toFixed(0) : value.toFixed(2);
                return { width, displayValue };
            };

            playerListContainer.innerHTML = playersOnMap.map((playerStat, index) => {
                const barConfig = getBarConfig(playerStat);
                const isTopPlayer = index === 0 && playerStat[sortKey] > 0;
                
                return `
                    <div class="player-stat-row ${isTopPlayer ? 'top-player' : ''}">
                        <div class="name">${playerStat.nickname} ${isTopPlayer ? '👑' : ''}</div>
                        <div class="rating-bar-container">
                            <div class="rating-bar" style="width: ${barConfig.width}%;">
                                <span class="games-played-bar-text">${playerStat.gamesPlayed} spil</span>
                            </div>
                        </div>
                        <div class="rating-value">${barConfig.displayValue}</div>
                    </div>
                `;
            }).join('');
        };

        const updateSortState = (sortKey) => {
            // Update buttons
            sortButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.sort === sortKey);
            });
            // Update select dropdown
            sortSelect.value = sortKey;
            // Re-render the list with the new sorting
            renderPlayerList(sortKey);
        };
        
        // Add event listeners
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                updateSortState(button.dataset.sort);
            });
        });

        sortSelect.addEventListener('change', (e) => {
            updateSortState(e.target.value);
        });

        // Set initial state
        updateSortState('rating'); 
        
        container.appendChild(mapCard);
    });
}

