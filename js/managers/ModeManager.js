/**
 * Manages practice modes (review, dictation, listening)
 */
export class ModeManager {
    constructor() {
        this.modes = ['review', 'dictation', 'listening'];
        this.currentMode = 'review'; // Default mode
        this.maxAttempts = 3;
    }

    /**
     * Set the current mode
     * @param {string} mode - The mode to set
     * @returns {boolean} - Whether the mode was set successfully
     */
    setMode(mode) {
        if (this.modes.includes(mode)) {
            this.currentMode = mode;
            return true;
        }
        return false;
    }

    /**
     * Get the current mode
     * @returns {string} - The current mode
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Get the display name for a mode
     * @param {string} mode - The mode to get the display name for
     * @returns {string} - The display name
     */
    getModeName(mode = this.currentMode) {
        switch(mode) {
            case 'review': return 'Review';
            case 'dictation': return 'Dictation';
            case 'listening': return 'Listening';
            default: return '';
        }
    }

    /**
     * Check if the current mode is review
     * @returns {boolean} - Whether the current mode is review
     */
    isReviewMode() {
        return this.currentMode === 'review';
    }

    /**
     * Check if the current mode is dictation
     * @returns {boolean} - Whether the current mode is dictation
     */
    isDictationMode() {
        return this.currentMode === 'dictation';
    }

    /**
     * Check if the current mode is listening
     * @returns {boolean} - Whether the current mode is listening
     */
    isListeningMode() {
        return this.currentMode === 'listening';
    }

    /**
     * Get the maximum number of attempts allowed
     * @returns {number} - The maximum number of attempts
     */
    getMaxAttempts() {
        return this.maxAttempts;
    }

    /**
     * Set the maximum number of attempts allowed
     * @param {number} maxAttempts - The maximum number of attempts
     */
    setMaxAttempts(maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    /**
     * Get all available modes
     * @returns {Array} - Array of available modes
     */
    getModes() {
        return [...this.modes];
    }
}
