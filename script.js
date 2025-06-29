document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // I. GLOBAL CONSTANTS
    // =========================================================================
    const myTeamName = "Slikker Som En Schæfer";
    const players = [
        { id: 0, nickname: "Pomfritten", realName: "Jonas Rossen", steamId: "76561198351972301", steamProfileUrl: "https://steamcommunity.com/profiles/76561198351972301", img: "spiller/pomfritten.jpeg", role: "All-Around Rifle", quote: "Manden der altid er på hjemmebane...", faceitUrl: "https://www.faceit.com/en/players/Pomfritten-" },
        { id: 1, nickname: "Felix", realName: "Felix Dahl", steamId: "76561198032902270", steamProfileUrl: "https://steamcommunity.com/profiles/76561198032902270", img: "spiller/felix.jpg", role: "Entry Fragger", quote: "Numser er til for at blive slikket", faceitUrl: "https://www.faceit.com/en/players/Felliixx" },
        { id: 2, nickname: "Banzai", realName: "Kenneth Stefansen", steamId: "76561197960366201", steamProfileUrl: "https://steamcommunity.com/profiles/76561197960366201", img: "spiller/banzai.png", role: "Anchor/Support", quote: "Danmarks bedste rampe spiller...", faceitUrl: "https://www.faceit.com/en/players/banzaidk" },
        { id: 3, nickname: "Krag", realName: "Martin Krag", steamId: "76561197981113537", steamProfileUrl: "https://steamcommunity.com/profiles/76561197981113537", img: "spiller/krag.png", role: "Awp'er", quote: "Boncho nation, pitra de marte, com a ce", faceitUrl: "https://www.faceit.com/en/players/Danskenn1337" },
        { id: 4, nickname: "w0bz", realName: "Emil Hansen", steamId: "76561197996193719", steamProfileUrl: "https://steamcommunity.com/profiles/76561197996193719", img: "spiller/w0bz.jpg", role: "All-Around Rifle", quote: "Nørden, utility master...", faceitUrl: "https://www.faceit.com/en/players/w0bz" },
        { id: 5, nickname: "b3nnyF", realName: "Mathias Frandsen", steamId: "76561197983814949", steamProfileUrl: "https://steamcommunity.com/profiles/76561197983814949", img: "spiller/b3nnyf.jpg", role: "All-Around Rifle", quote: "Jeg tror ikke en skid på ham der...", faceitUrl: "https://www.faceit.com/en/players/b3nnyF" },
        { id: 6, nickname: "Fredericia", realName: "Nicolai Lundby", steamId: "76561198815995595", steamProfileUrl: "https://steamcommunity.com/profiles/76561198815995595", img: "spiller/fredericia.jpg", role: "IGL/Entry Fragger", quote: "Shift Master Extravaganza!", faceitUrl: "https://www.faceit.com/en/players/Fredericia" }
    ];

    // =========================================================================
    // II. DATA FETCHING & PROCESSING
    // =========================================================================
    
    const loadAndProcessAllData = async (initialPlayers) => {
        let jsonFileNames = [];
        try {
            const response = await fetch('list_json_files.php');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            jsonFileNames = await response.json();
            if (jsonFileNames.error) throw new Error(jsonFileNames.error);
        } catch (error) {
            console.error("Could not fetch match list:", error);
            return { allMatchData: [], playersWithStats: initialPlayers };
        }

        let allMatchData = [];
        initialPlayers.forEach(p => p.mapStatsCalculated = {});

        for (const fileName of jsonFileNames) {
            try {
                const response = await fetch(`json_data/${fileName}`);
                const jsonData = await response.json();
                if (!jsonData.mapName || !jsonData.date) continue;
                allMatchData.push(jsonData);
                const playersInMatch = new Set(jsonData.players.map(p => p.steamId));
                initialPlayers.forEach(player => {
                    if (playersInMatch.has(player.steamId)) {
                        const mapData = player.mapStatsCalculated[jsonData.mapName] || { kills: 0, deaths: 0, damage: 0, headshots: 0, clutchesWon: 0, gamesPlayed: 0, totalRoundsPlayed: 0 };
                        player.mapStatsCalculated[jsonData.mapName] = mapData;
                        mapData.gamesPlayed++;
                        const matchRounds = Math.max(...(jsonData.kills || []).map(k => k.roundNumber).filter(Boolean), 0);
                        mapData.totalRoundsPlayed += matchRounds;
                        (jsonData.kills || []).forEach(k => { if(k.killerSteamId === player.steamId) mapData.kills++; if(k.victimSteamId === player.steamId) mapData.deaths++; if(k.killerSteamId === player.steamId && k.isHeadshot) mapData.headshots++; });
                        (jsonData.damages || []).forEach(d => { if(d.attackerSteamId === player.steamId) mapData.damage += (d.healthDamage || 0); });
                        (jsonData.clutches || []).forEach(c => { if(c.clutcherSteamId === player.steamId && c.won) mapData.clutchesWon++; });
                    }
                });
            } catch (e) { console.error(`Error processing ${fileName}:`, e); }
        }
        return { allMatchData, playersWithStats: initialPlayers };
    };

    // =========================================================================
    // III. UI DISPLAY FUNCTIONS (Controlled by main)
    // =========================================================================
    
    const displayTeamSummaryStats = (matches, playersWithStats) => {
        const teamSummaryStatsContainer = document.getElementById('team-summary-stats');
        if (!teamSummaryStatsContainer) return;

        let totalKills = 0, totalDeaths = 0, totalDamage = 0, totalRounds = 0, totalClutches = 0, totalHeadshots = 0;
        playersWithStats.forEach(player => {
             for (const mapName in player.mapStatsCalculated) {
                const mapData = player.mapStatsCalculated[mapName];
                totalKills += mapData.kills;
                totalDeaths += mapData.deaths;
                totalDamage += mapData.damage;
                totalRounds += mapData.totalRoundsPlayed;
                totalClutches += mapData.clutchesWon;
                totalHeadshots += mapData.headshots;
            }
        });
        
        const teamKPR = totalRounds > 0 ? (totalKills / totalRounds).toFixed(2) : "0.00";
        const teamADR = totalRounds > 0 ? (totalDamage / totalRounds).toFixed(0) : "0";
        const teamHSP = totalKills > 0 ? ((totalHeadshots / totalKills) * 100).toFixed(0) + '%' : "0%";
        
        const wins = matches.filter(m => m.outcome === 'win').length;
        const totalGames = matches.length;
        const winPercentage = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(0) + '%' : "0%";

        const allStats = [
            { label: 'Total Kills', value: totalKills }, { label: 'Kills Per Round', value: teamKPR },
            { label: 'Team ADR', value: teamADR }, { label: 'Vinder Procent', value: winPercentage },
            { label: 'Total Clutches', value: totalClutches }, { label: 'Headshot %', value: teamHSP },
        ];
        
        const slides = [];
        for (let i = 0; i < allStats.length; i += 3) {
            slides.push(allStats.slice(i, i + 3));
        }

        const trackHTML = slides.map(slide => {
            const slideItems = slide.map(stat => `
                <div class="key-stat-box">
                    <span class="key-stat-label">${stat.label}</span>
                    <span class="key-stat-value">${stat.value}</span>
                </div>
            `).join('');
            return `<div class="stats-carousel-slide">${slideItems}</div>`;
        }).join('');
        
        const dotsHTML = slides.map((_, index) => `<span class="carousel-dot" data-slide="${index}"></span>`).join('');

        teamSummaryStatsContainer.innerHTML = `
            <h4 class="team-summary-title">Team-Statistik</h4>
            <div class="stats-carousel-viewport"><div class="stats-carousel-track">${trackHTML}</div></div>
            <div class="carousel-dots">${dotsHTML}</div>
        `;
        
        const track = teamSummaryStatsContainer.querySelector('.stats-carousel-track');
        const dots = teamSummaryStatsContainer.querySelectorAll('.carousel-dot');
        let currentSlide = 0;
        const slideCount = slides.length;
        if (slideCount <= 1) {
            if (dots.length > 0) dots[0].parentElement.style.display = 'none';
            return;
        }

        let autoScrollInterval;

        function goToSlide(slideIndex) {
            if(track) track.style.transform = `translateX(-${slideIndex * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            if(dots[slideIndex]) dots[slideIndex].classList.add('active');
            currentSlide = slideIndex;
        }
        function nextSlide() { goToSlide((currentSlide + 1) % slideCount); }
        function startAutoScroll() { stopAutoScroll(); autoScrollInterval = setInterval(nextSlide, 5000); }
        function stopAutoScroll() { clearInterval(autoScrollInterval); }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                goToSlide(parseInt(e.target.dataset.slide));
                startAutoScroll();
            });
        });
        
        teamSummaryStatsContainer.addEventListener('mouseenter', stopAutoScroll);
        teamSummaryStatsContainer.addEventListener('mouseleave', startAutoScroll);

        goToSlide(0);
        startAutoScroll();
    };

    // =========================================================================
    // IV. INITIALIZATION
    // =========================================================================
    
    const main = async () => {
        if (typeof initNavigation === 'function') initNavigation();
        if (typeof initHighlightsModule === 'function') initHighlightsModule();
        
        const { allMatchData, playersWithStats } = await loadAndProcessAllData(players);
        
        if (typeof initPlayersModule === 'function') {
            initPlayersModule(playersWithStats);
        }
        
        let processedMatches = [];
        if (typeof initMatchesModule === 'function') {
            processedMatches = initMatchesModule(allMatchData, playersWithStats, myTeamName);
        }
        
        // **FIXED**: The call to display the carousel is now present and correct.
        displayTeamSummaryStats(processedMatches, playersWithStats);
      
        if (typeof initMvpModule === 'function') {
            initMvpModule(playersWithStats, document.getElementById('mvp-content'));
        }
       
        if (typeof displayTerritoryStats === 'function') {
            displayTerritoryStats(playersWithStats);
        }
    };

    main();
});
