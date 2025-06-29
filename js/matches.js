function initMatchesModule(allMatchData, players, myTeamName) {
    // --- DOM Element References ---
    const upcomingMatchesDiv = document.getElementById('upcoming-matches');
    const matchResultsDiv = document.getElementById('match-results');
    const matchModal = document.getElementById('match-modal');
    const matchModalCloseBtn = document.getElementById('match-modal-close-btn');
    const headerContainer = document.getElementById('match-modal-header-container');
    const scoreboardView = document.getElementById('scoreboard-view');
    const advancedStatsView = document.getElementById('advanced-stats-view');
    const heatmapView = document.getElementById('heatmap-view');
    const viewSwitcher = document.getElementById('match-modal-view-switcher');

    // --- State ---
    const myTeamSteamIds = new Set(players.map(p => p.steamId));
    let currentHeatmapState = { match: null, offsetX: 0, offsetY: 0, scale: 1.0, selectedPlayerId: 'all', eventType: 'kills', selectedSide: 'all', selectedRound: 'all' };

    // --- Main Display Function ---
    const displayMatches = (matchesData) => {
        if (!upcomingMatchesDiv || !matchResultsDiv) return [];
        
        upcomingMatchesDiv.innerHTML = '<p class="text-gray-400">Ingen kommende kampe planlagt.</p>';
        matchResultsDiv.innerHTML = ''; 

        const sortedMatches = matchesData
            .filter(match => match && match.teamA && match.teamB)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedMatches.length === 0) {
             matchResultsDiv.innerHTML = '<p class="text-gray-400">Ingen resultater endnu.</p>';
             return [];
        }

        const processedMatches = sortedMatches.map(match => {
            let team1Name = match.teamA.name, team2Name = match.teamB.name, team1Score = match.teamA.score, team2Score = match.teamB.score;
            if (team2Name === myTeamName) {
                [team1Name, team2Name] = [team2Name, team1Name];
                [team1Score, team2Score] = [team2Score, team1Score];
            }
            const outcome = team1Score > team2Score ? 'win' : (team1Score < team2Score ? 'loss' : 'draw');
            const matchDate = new Date(match.date).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' });

            const card = document.createElement('div');
            card.className = `match-card p-4 rounded-lg shadow-md flex justify-between items-center ${outcome}`;
            card.innerHTML = `<div><p class="font-bold">${team1Name} vs ${team2Name}</p><p class="text-sm text-gray-400">${match.mapName}</p></div><div class="text-right"><p class="score">${team1Score} - ${team2Score}</p><p class="text-sm text-gray-400">${matchDate}</p></div>`;
            
            card.addEventListener('click', () => openMatchModal(match));
            matchResultsDiv.appendChild(card);
            
            return {...match, outcome };
        });
        return processedMatches;
    };

    // --- Modal Logic ---
    const openMatchModal = (match) => {
        if (!match || !match.teamA || !match.teamB || !match.players) {
            console.error("Incomplete data for match modal:", match);
            return;
        }

        let myTeam = match.teamA.name === myTeamName ? match.teamA : match.teamB;
        let opponentTeam = match.teamA.name === myTeamName ? match.teamB : match.teamA;
        
        const myTeamWon = myTeam.score > opponentTeam.score;
        const myTeamNameHtml = `<span class="${myTeamWon ? 'winner' : 'loser'}">${myTeam.name}</span>`;
        const opponentTeamNameHtml = `<span class="${!myTeamWon ? 'winner' : 'loser'}">${opponentTeam.name}</span>`;

        headerContainer.innerHTML = `<div class="match-modal-header"><p class="match-modal-map">${match.mapName.replace('de_', '')}</p><p class="match-modal-teams">${myTeamNameHtml} ${myTeam.score} - ${opponentTeam.score} ${opponentTeamNameHtml}</p></div>`;
            
        const allPlayerStats = getMatchStatsForAll(match);
        const myTeamStats = allPlayerStats.filter(p => myTeamSteamIds.has(p.steamId));
        const opponentTeamStats = allPlayerStats.filter(p => !myTeamSteamIds.has(p.steamId));
        
        scoreboardView.innerHTML = `<div class="match-modal-scoreboard-container">${buildScoreboard(myTeamStats, opponentTeamStats, myTeam.name, opponentTeam.name)}</div>`;
        advancedStatsView.innerHTML = `<div class="advanced-stats-grid">${buildAdvancedStatsTable(myTeamStats, 'entry')}${buildAdvancedStatsTable(myTeamStats, 'trade')}${buildAdvancedStatsTable(myTeamStats, 'utility')}</div>`;
        
        const accordionTitles = advancedStatsView.querySelectorAll('.accordion-title');
        accordionTitles.forEach(title => {
            title.addEventListener('click', () => {
                const content = title.nextElementSibling;
                const wasActive = title.classList.contains('active');
                accordionTitles.forEach(t => t.classList.remove('active'));
                const allContent = advancedStatsView.querySelectorAll('.accordion-content');
                allContent.forEach(c => c.style.maxHeight = null);
                if (!wasActive) {
                    title.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        });

        const mapConfig = HEATMAP_CONFIG[match.mapName];
        currentHeatmapState = { ...currentHeatmapState, match, offsetX: mapConfig?.offsetX || 0, offsetY: mapConfig?.offsetY || 0, scale: mapConfig?.scale || 1 };
        
        const playerFilter = heatmapView.querySelector('#heatmap-player-filter');
        if (playerFilter) {
            playerFilter.innerHTML = `<option value="all">Alle Spillere</option>`;
            allPlayerStats.sort((a,b) => a.name.localeCompare(b.name)).forEach(p => {
                playerFilter.innerHTML += `<option value="${p.steamId}">${p.name}</option>`;
            });
        }

        const roundFilter = heatmapView.querySelector('#heatmap-round-filter');
        if (roundFilter) {
            const totalRounds = Math.max(0, ...(match.kills || []).map(k => k.roundNumber));
            roundFilter.innerHTML = '<option value="all">Alle Runder</option>';
            for (let i = 1; i <= totalRounds; i++) {
                roundFilter.innerHTML += `<option value="${i}">Runde ${i}</option>`;
            }
        }
        
        updateHeatmapFilters();
        matchModal.style.display = 'flex';
        document.body.classList.add('menu-open');
        setupViewSwitcher(true);
    };

    const closeMatchModal = () => {
        if(matchModal) matchModal.style.display = 'none';
        document.body.classList.remove('menu-open');
    };
    
    // --- Helper & Builder Functions ---
    const getMatchStatsForAll = (matchData) => {
        const stats = {};
        if (!matchData.players) return [];
        matchData.players.forEach(p => { stats[p.steamId] = { name: p.name, steamId: p.steamId, kills: 0, deaths: 0, damage: 0, headshots: 0, rating: 0, tradedDeaths: 0, untradedDeaths: 0, openingKills: 0, openingDeaths: 0, heDamage: 0, flashAssists: 0 }; });
        (matchData.kills || []).forEach(k => { if (stats[k.killerSteamId]) { stats[k.killerSteamId].kills++; if (k.isHeadshot) stats[k.killerSteamId].headshots++; } if (stats[k.victimSteamId]) stats[k.victimSteamId].deaths++; if (k.isAssistedFlash && stats[k.flasherSteamId]) stats[k.flasherSteamId].flashAssists++; });
        (matchData.damages || []).forEach(d => { if (stats[d.attackerSteamId]) { stats[d.attackerSteamId].damage += (d.healthDamage || 0); if (d.weaponName === 'HE Grenade') stats[d.attackerSteamId].heDamage += (d.healthDamage || 0); } });
        const totalRounds = Math.max(...(matchData.kills || []).map(k => k.roundNumber), 1);
        Object.values(stats).forEach(p => { const adr = totalRounds > 0 ? p.damage / totalRounds : 0; const kpr = totalRounds > 0 ? p.kills / totalRounds : 0; const dpr = totalRounds > 0 ? p.deaths / totalRounds : 0; p.rating = (0.717 * kpr) - (0.585 * dpr) + (0.0073 * adr) + 0.259; p.adr = Math.round(adr); });
        for(let i = 1; i <= totalRounds; i++){ const rk = (matchData.kills || []).filter(k => k.roundNumber === i).sort((a, b) => a.tick - b.tick); if(rk.length > 0) { if(stats[rk[0].killerSteamId]) stats[rk[0].killerSteamId].openingKills++; if(stats[rk[0].victimSteamId]) stats[rk[0].victimSteamId].openingDeaths++; rk.forEach((d, ix) => { let tr = false; for (let j = ix + 1; j < rk.length; j++) { if (rk[j].tick - d.tick <= 7 * matchData.tickrate) { if(rk[j].killerTeamName === d.victimTeamName && rk[j].victimTeamName === d.killerTeamName) { tr = true; break; }} else break; } if(stats[d.victimSteamId]){ if (tr) stats[d.victimSteamId].tradedDeaths++; else stats[d.victimSteamId].untradedDeaths++; } }); } }
        return Object.values(stats);
    };
    
    const buildScoreboard = (teamA, teamB, nameA, nameB) => {
        const buildRows = (team) => team.sort((a,b) => b.rating - a.rating).map(p => `<tr data-player-steamid="${p.steamId}"><td data-label="Spiller">${p.name}</td><td data-label="K">${p.kills}</td><td data-label="D">${p.deaths}</td><td data-label="ADR">${p.adr}</td><td data-label="Rating">${p.rating.toFixed(2)}</td></tr>`).join('');
        return `<div class="match-modal-scoreboard"><h4>${nameA}</h4><div class="table-wrapper"><table><thead><tr><th>Spiller</th><th>K</th><th>D</th><th>ADR</th><th>Rating</th></tr></thead><tbody>${buildRows(teamA)}</tbody></table></div></div><div class="match-modal-scoreboard"><h4>${nameB}</h4><div class="table-wrapper"><table><thead><tr><th>Spiller</th><th>K</th><th>D</th><th>ADR</th><th>Rating</th></tr></thead><tbody>${buildRows(teamB)}</tbody></table></div></div>`;
    };

    const buildAdvancedStatsTable = (stats, type) => {
        let headers, rows, title;
        if(type === 'entry') { title = "Åbningsdueller"; headers = `<th>Spiller</th><th>Åbningsdrab</th><th>Første Dødsfald</th><th>+/-</th>`; rows = stats.map(p => `<tr><td data-label="Spiller">${p.name}</td><td data-label="Åbningsdrab">${p.openingKills}</td><td data-label="Første Dødsfald">${p.openingDeaths}</td><td data-label="+/-">${p.openingKills - p.openingDeaths}</td></tr>`).join(''); }
        else if (type === 'trade') { title = "Trade Stats"; headers = `<th>Spiller</th><th>Dødsfald</th><th>Tradet</th><th>Utradet</th><th>Trade %</th>`; rows = stats.map(p => { const tradeRate = p.deaths > 0 ? ((p.tradedDeaths / p.deaths) * 100).toFixed(0) + '%' : 'N/A'; return `<tr><td data-label="Spiller">${p.name}</td><td data-label="Dødsfald">${p.deaths}</td><td data-label="Tradet">${p.tradedDeaths}</td><td data-label="Utradet">${p.untradedDeaths}</td><td data-label="Trade %">${tradeRate}</td></tr>` }).join(''); }
        else { title = "Utility Skade"; headers = `<th>Spiller</th><th>HE Skade</th><th>Flash Assists</th>`; rows = stats.map(p => `<tr><td data-label="Spiller">${p.name}</td><td data-label="HE Skade">${p.heDamage}</td><td data-label="Flash Assists">${p.flashAssists}</td></tr>`).join(''); }
        return `<div class="match-modal-scoreboard accordion-section"><h4 class="accordion-title">${title}</h4><div class="table-wrapper accordion-content" style="max-height:0;"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
    };
    
    const drawHeatmap = () => {
        const { match, offsetX, offsetY, scale, eventType, selectedPlayerId, selectedSide, selectedRound } = currentHeatmapState;
        const canvas = document.getElementById('heatmap-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!match || !match.mapName || !HEATMAP_CONFIG[match.mapName]) {
            canvas.style.display = 'none'; return;
        }
        canvas.style.display = 'block';
        const mapConfig = HEATMAP_CONFIG[match.mapName];
        const mapImage = new Image();
        mapImage.src = mapConfig.imageUrl;
        mapImage.onload = () => {
            canvas.width = mapImage.width;
            canvas.height = mapImage.height;
            ctx.drawImage(mapImage, 0, 0);
            let filteredEvents = match.kills || [];
            if (selectedRound && selectedRound !== 'all') {
                filteredEvents = filteredEvents.filter(event => event.roundNumber == selectedRound);
            }
            if (selectedSide !== 'all') {
                filteredEvents = filteredEvents.filter(event => {
                    const side = (eventType === 'kills' ? event.killerSide : event.victimSide) === 3 ? 'ct' : 't';
                    return side === selectedSide;
                });
            }
            if (selectedPlayerId !== 'all') {
                const idKey = eventType === 'kills' ? 'killerSteamId' : 'victimSteamId';
                filteredEvents = filteredEvents.filter(event => event[idKey] === selectedPlayerId);
            } 
            const mapBoundaries = mapConfig.boundaries;
            const mapWidth = mapBoundaries.maxX - mapBoundaries.minX;
            const mapHeight = mapBoundaries.maxY - mapBoundaries.minY;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            filteredEvents.forEach(event => {
                const xCoord = event.victimX;
                const yCoord = event.victimY;
                let x = ((xCoord - mapBoundaries.minX) / mapWidth) * canvas.width;
                let y = (1 - ((yCoord - mapBoundaries.minY) / mapHeight)) * canvas.height;
                let scaledX = centerX + (x - centerX) * scale;
                let scaledY = centerY + (y - centerY) * scale;
                const finalX = scaledX + offsetX;
                const finalY = scaledY + offsetY;
                const actingPlayerSide = eventType === 'kills' ? event.killerSide : event.victimSide;
                const dotColor = (actingPlayerSide === 3) ? 'rgba(96, 165, 250, 0.8)' : 'rgba(251, 146, 60, 0.8)';
                const ringColor = eventType === 'kills' ? 'rgba(74, 222, 128, 1)' : 'rgba(248, 113, 113, 1)';
                ctx.beginPath();
                ctx.arc(finalX, finalY, 5, 0, 2 * Math.PI, false);
                ctx.fillStyle = dotColor;
                ctx.fill();
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = ringColor;
                ctx.stroke();
            });
        };
        mapImage.onerror = () => { console.error("Failed to load map image:", mapConfig.imageUrl); };
    };
    
    const updateHeatmapFilters = () => {
        const playerFilter = document.getElementById('heatmap-player-filter');
        const eventTypeFilter = document.getElementById('heatmap-event-type-filter');
        const sideFilter = document.getElementById('heatmap-side-filter');
        const roundFilter = document.getElementById('heatmap-round-filter');
        
        if(playerFilter) currentHeatmapState.selectedPlayerId = playerFilter.value;
        if(eventTypeFilter) currentHeatmapState.eventType = eventTypeFilter.value;
        if(sideFilter) currentHeatmapState.selectedSide = sideFilter.value;
        if(roundFilter) currentHeatmapState.selectedRound = roundFilter.value;

        drawHeatmap();
    };

    const setupViewSwitcher = (reset = false) => {
        if (!viewSwitcher) return;
        if (reset) {
            if (heatmapView && !heatmapView.querySelector('#heatmap-filters')) {
                const heatmapFiltersHTML = `
                    <div id="heatmap-filters" class="heatmap-filters">
                        <select id="heatmap-player-filter"></select>
                        <select id="heatmap-round-filter"></select>
                        <select id="heatmap-event-type-filter">
                            <option value="kills">Kills</option>
                            <option value="deaths">Deaths</option>
                        </select>
                        <select id="heatmap-side-filter">
                            <option value="all">Alle Sider</option>
                            <option value="ct">CT</option>
                            <option value="t">T</option>
                        </select>
                    </div>
                    <div id="heatmap-container" class="heatmap-container">
                        <canvas id="heatmap-canvas"></canvas>
                    </div>`;
                heatmapView.innerHTML = heatmapFiltersHTML;
            }
            viewSwitcher.innerHTML = `<button class="view-switch-btn active" data-view="scoreboard">Scoreboard</button><button class="view-switch-btn" data-view="advanced-stats">Advanced</button><button class="view-switch-btn" data-view="heatmap">Heatmap</button>`;
        }
        viewSwitcher.onclick = (e) => {
            if (e.target.matches('.view-switch-btn')) {
                const view = e.target.dataset.view;
                viewSwitcher.querySelectorAll('.view-switch-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                [scoreboardView, advancedStatsView, heatmapView].forEach(v => v.classList.remove('active'));
                document.getElementById(`${view}-view`).classList.add('active');
            }
        };
    };
    
    if(matchModalCloseBtn) matchModalCloseBtn.addEventListener('click', closeMatchModal);
    if(matchModal) matchModal.addEventListener('click', (e) => e.target === matchModal && closeMatchModal());
    if (heatmapView) {
        heatmapView.addEventListener('change', (e) => {
            if (e.target.matches('select')) {
                updateHeatmapFilters();
            }
        });
    }
    
    setupViewSwitcher();
    return displayMatches(allMatchData);
}
