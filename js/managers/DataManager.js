import { Level } from '../models/Level.js';

/**
 * Manages loading and storing vocabulary data
 */
export class DataManager {
    constructor() {
        this.levels = {}; // Store loaded levels
        this.currentLevelId = null;
    }

    /**
     * Load vocabulary data for a specific level
     * @param {string} levelId - The level ID to load
     * @returns {Promise<Level>} - Promise resolving to the loaded Level
     */
    async loadLevel(levelId) {
        try {
            // Validate levelId
            if (!levelId || typeof levelId !== 'string') {
                throw new Error(`Invalid level ID: ${levelId}`);
            }

            // Check if level is already loaded
            if (this.isLevelLoaded(levelId)) {
                console.log(`Level ${levelId} already loaded, using cached data`);
                this.currentLevelId = levelId;
                return this.levels[levelId];
            }

            const url = `words/HF/level${levelId}.json`;
            console.log(`Fetching from URL: ${url}`);

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Validate level ID
                if (data.level !== levelId) {
                    console.warn(`Level in file (${data.level}) doesn't match requested level (${levelId}). Using requested level.`);
                }

                // Create and store the level
                const level = new Level(data);
                this.levels[levelId] = level;
                this.currentLevelId = levelId;

                console.log(`Vocabulary data loaded successfully (Level ${levelId}, version ${data.version}, last updated ${data.lastUpdated})`);

                return level;
            } catch (fetchError) {
                console.error(`Fetch error for Level ${levelId}:`, fetchError);

                // Try to load a fallback level if the requested one fails
                if (levelId !== 'H' && !this.isLevelLoaded('H')) {
                    console.log('Attempting to load fallback level H...');
                    return this.loadLevel('H');
                }

                throw new Error(`Failed to load vocabulary data: ${fetchError.message}`);
            }
        } catch (error) {
            console.error(`Error loading vocabulary data for Level ${levelId}:`, error);
            throw error;
        }
    }

    /**
     * Get the current level
     * @returns {Level|null} - The current level or null if none is loaded
     */
    getCurrentLevel() {
        return this.currentLevelId ? this.levels[this.currentLevelId] : null;
    }

    /**
     * Get a specific level
     * @param {string} levelId - The level ID to get
     * @returns {Level|null} - The requested level or null if not loaded
     */
    getLevel(levelId) {
        return this.levels[levelId] || null;
    }

    /**
     * Check if a level is loaded
     * @param {string} levelId - The level ID to check
     * @returns {boolean} - Whether the level is loaded
     */
    isLevelLoaded(levelId) {
        return !!this.levels[levelId];
    }

    /**
     * Set the current level
     * @param {string} levelId - The level ID to set as current
     * @returns {Level|null} - The current level or null if not loaded
     */
    setCurrentLevel(levelId) {
        if (this.isLevelLoaded(levelId)) {
            this.currentLevelId = levelId;
            return this.getCurrentLevel();
        }
        return null;
    }
}
