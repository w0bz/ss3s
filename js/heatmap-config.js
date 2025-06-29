// This file contains the configuration for the map heatmaps.
// Paths have been corrected to match the server structure.

const HEATMAP_CONFIG = {
    'de_nuke': {
        imageUrl: 'radar/de_nuke_radar.png',
        boundaries: { minX: -3450, maxX: 3750, minY: -4000, maxY: 2850 },
        offsetX: 0,
        offsetY: -9,
        scale: 0.90,
    },
    'de_anubis': {
        imageUrl: 'radar/de_anubis_radar.png',
        boundaries: { minX: -2500, maxX: 2500, minY: -2000, maxY: 3500 },
        offsetX: 26,
        offsetY: -24,
        scale: 0.95,
    },
    'de_mirage': {
        imageUrl: 'radar/de_mirage_radar.png',
        boundaries: { minX: -3200, maxX: 1850, minY: -3400, maxY: 1700 },
        offsetX: 0,
        offsetY: 0,
        scale: 1,
    },
    'de_inferno': {
        imageUrl: 'radar/de_inferno_radar.png',
        boundaries: { minX: -2100, maxX: 3000, minY: -1100, maxY: 3850 },
        offsetX: 5,
        offsetY: 0,
        scale: 1,
    },
     'de_ancient': {
        imageUrl: 'radar/de_ancient_radar.png',
        boundaries: { minX: -4500, maxX: 2500, minY: -3500, maxY: 4500 },
        offsetX: -120,
        offsetY: -155,
        scale: 1.35,
    },
    'de_train': {
        imageUrl: 'radar/de_train_radar.png',
        boundaries: { minX: -2400, maxX: 2400, minY: -2400, maxY: 2400 },
        offsetX: 71,
        offsetY: 0,
        scale: 1.15,
    },
    'de_dust2': { // Added from your screenshot
        imageUrl: 'radar/de_dust2_radar.png',
        boundaries: { minX: -2476, maxX: 2128, minY: -1200, maxY: 3372 },
        offsetX: 0,
        offsetY: 0,
        scale: 1,
    },
    'de_vertigo': { // Added from your screenshot
        imageUrl: 'radar/de_vertigo_radar.png',
        boundaries: { minX: -3128, maxX: 1240, minY: -1688, maxY: 2680 },
        offsetX: 0,
        offsetY: 0,
        scale: 1,
    }
};
