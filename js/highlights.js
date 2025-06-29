function initHighlightsModule() {
    const funnyMomentsContainer = document.getElementById('funny-moments-container');
    if (!funnyMomentsContainer) return;

    const mainPlayerContainer = document.getElementById('main-video-player-container');
    const mainPlayer = document.getElementById('main-video-player');

    const playVideo = (videoId) => {
        if (!mainPlayer || !mainPlayerContainer) return;
        mainPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        mainPlayerContainer.style.display = 'block';
        mainPlayerContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    fetch('get_moments.php')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to load'))
        .then(moments => {
            if (!moments || moments.length === 0) {
                funnyMomentsContainer.innerHTML = '<p class="text-gray-400">Ingen sjove øjeblikke fundet.</p>';
                return;
            }
            funnyMomentsContainer.innerHTML = '';
            moments.forEach(moment => {
                const videoId = moment.youtubeId;
                const card = document.createElement('div');
                card.className = 'funny-moment-card';
                card.innerHTML = `
                    <div class="youtube-placeholder" data-youtube-id="${videoId}">
                        <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="${moment.title}" loading="lazy">
                        <div class="play-button-overlay"></div>
                    </div>
                    <div class="text-content"><h5>${moment.title}</h5><p>${moment.description}</p></div>
                `;
                card.addEventListener('click', () => playVideo(videoId));
                funnyMomentsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching highlights:', error);
            funnyMomentsContainer.innerHTML = `<p class="text-red-400">Kunne ikke indlæse highlights.</p>`;
        });
}
