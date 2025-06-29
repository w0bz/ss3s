// This function will be called from script.js to initialize the MVP module.
// We pass in the 'players' array and the container element to give this module access to them.
function initMvpModule(players, mvpContentContainer) {

    // If the container element doesn't exist, don't run the script.
    if (!mvpContentContainer) {
        console.warn('MVP content container not found, MVP module will not run.');
        return;
    }

    /**
     * Fetches MVP data from mvp.json and renders the entire section.
     */
    const displayMvpSection = async () => {
        try {
            const response = await fetch('mvp.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // The root of your mvp.json is an array.
            const mvpDataArray = await response.json();

            if (!mvpDataArray || mvpDataArray.length === 0) {
                 mvpContentContainer.innerHTML = '<p class="text-center text-gray-400">Ingen MVP data fundet.</p>';
                 return;
            }

            // The "current" MVP is the first one in the array.
            const currentMvpData = mvpDataArray[0];
            // The "past" MVPs are the rest of the array.
            const pastMvpsData = mvpDataArray.slice(1);

            // Clear any previous content
            mvpContentContainer.innerHTML = '';

            // Render the current MVP card
            mvpContentContainer.appendChild(createCurrentMvpCard(currentMvpData, players));
            
            // Render the list of past MVPs, if any exist
            if (pastMvpsData.length > 0) {
                mvpContentContainer.appendChild(createPastMvpsList(pastMvpsData, players));
            }

        } catch (error) {
            console.error('Error fetching or displaying MVP data:', error);
            mvpContentContainer.innerHTML = '<p class="text-center text-red-400">Kunne ikke indlæse MVP data.</p>';
        }
    };

    /**
     * Creates the HTML element for the current MVP card.
     * It now looks up player details from the passed-in 'players' array.
     */
    const createCurrentMvpCard = (mvp, allPlayers) => {
        // Find the full player object to get the image and real name
        const playerDetails = allPlayers.find(p => p.nickname === mvp.nickname);
        
        const card = document.createElement('div');
        card.className = 'current-mvp-card';

        // **FIXED**: Changed playerDetails.image to playerDetails.img to match the data structure in script.js
        const imageUrl = playerDetails ? playerDetails.img : 'placeholder.jpg';
        const realName = playerDetails ? playerDetails.realName : '';
        
        // The quote is the main feature, based on your JSON structure.
        card.innerHTML = `
            <h4 class="mvp-title">Sæsonens Spiller: ${mvp.season}</h4>
            <img src="${imageUrl}" alt="${mvp.nickname}" class="mvp-image">
            <h3 class="mvp-name">${mvp.nickname}</h3>
            <p class="mvp-real-name">${realName}</p>
            ${mvp.quote ? `<div class="mvp-quote">${mvp.quote}</div>` : ''}
        `;
        return card;
    };

    /**
     * Creates the container and list for past MVPs.
     * It also looks up player details for images.
     */
    const createPastMvpsList = (pastMvps, allPlayers) => {
        const container = document.createElement('div');
        container.className = 'past-mvps-container';

        const listItems = pastMvps.map(mvp => {
             // Find player details for each past MVP to get their image
            const playerDetails = allPlayers.find(p => p.nickname === mvp.nickname);
            // **FIXED**: Changed playerDetails.image to playerDetails.img
            const imageUrl = playerDetails ? playerDetails.img : 'placeholder.jpg';
            
            return `
                <li class="past-mvp-item">
                    <span class="past-mvp-year">${mvp.season}</span>
                    <div class="past-mvp-player">
                        <img src="${imageUrl}" alt="${mvp.nickname}" class="past-mvp-thumb">
                        <span>${mvp.nickname}</span>
                    </div>
                </li>
            `;
        }).join('');

        container.innerHTML = `
            <h4 class="team-summary-title">Tidligere Sæsonvindere</h4>
            <ul class="past-mvps-list">${listItems}</ul>
        `;
        return container;
    };

    // --- Initial Load ---
    displayMvpSection();
}

