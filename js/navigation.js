function initNavigation() {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const overlayMenu = document.getElementById('overlay-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = (forceClose = false) => {
        if (!overlayMenu) return;
        if (forceClose || overlayMenu.classList.contains('active')) {
            overlayMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        } else {
            overlayMenu.classList.add('active');
            document.body.classList.add('menu-open');
        }
    };

    const setActiveSection = (sectionId) => {
        if (!sectionId) return;
        document.querySelectorAll('main .content-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        document.querySelectorAll(`.nav-link[data-section="${sectionId}"]`).forEach(l => l.classList.add('active'));
        window.location.hash = sectionId;
    };

    if (hamburgerIcon) {
        hamburgerIcon.addEventListener('click', () => toggleMenu());
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            setActiveSection(sectionId);
            toggleMenu(true);
        });
    });

    // Set initial section on page load
    const initialSection = window.location.hash.substring(1) || 'spillere-section';
    setActiveSection(initialSection);
}
