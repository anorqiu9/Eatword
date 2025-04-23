import { Unit } from './Unit.js';

/**
 * Represents a vocabulary level containing multiple units
 */
export class Level {
    /**
     * Create a new Level
     * @param {Object} levelData - The level data from JSON
     */
    constructor(levelData) {
        this.id = levelData.level;
        this.version = levelData.version;
        this.lastUpdated = levelData.lastUpdated;
        this.units = (levelData.units || []).map((unitData, index) => new Unit(unitData, index));
        this.selectedUnitIndices = this.units.map(unit => unit.index); // By default, select all units
    }

    /**
     * Get all words from selected units
     * @returns {Array} - Array of Word objects
     */
    getSelectedWords() {
        let words = [];
        this.selectedUnitIndices.forEach(unitIndex => {
            if (this.units[unitIndex]) {
                words = words.concat(this.units[unitIndex].words);
            }
        });
        return words;
    }

    /**
     * Select all units
     * @returns {Level} - Returns this level instance for chaining
     */
    selectAllUnits() {
        this.selectedUnitIndices = this.units.map(unit => unit.index);
        return this;
    }

    /**
     * Deselect all units
     * @returns {Level} - Returns this level instance for chaining
     */
    deselectAllUnits() {
        this.selectedUnitIndices = [];
        return this;
    }

    /**
     * Toggle selection of a specific unit
     * @param {number} unitIndex - The index of the unit to toggle
     * @returns {boolean} - The new selection state
     */
    toggleUnitSelection(unitIndex) {
        const index = this.selectedUnitIndices.indexOf(unitIndex);
        if (index === -1) {
            // Unit not selected, add it
            this.selectedUnitIndices.push(unitIndex);
            return true;
        } else {
            // Unit already selected, remove it
            this.selectedUnitIndices.splice(index, 1);
            return false;
        }
    }

    /**
     * Check if a unit is selected
     * @param {number} unitIndex - The index of the unit to check
     * @returns {boolean} - Whether the unit is selected
     */
    isUnitSelected(unitIndex) {
        return this.selectedUnitIndices.includes(unitIndex);
    }

    /**
     * Check if all units are selected
     * @returns {boolean} - Whether all units are selected
     */
    areAllUnitsSelected() {
        return this.selectedUnitIndices.length === this.units.length && this.units.length > 0;
    }

    /**
     * Scramble words in all units
     * @returns {Level} - Returns this level instance for chaining
     */
    scrambleWords() {
        this.units.forEach(unit => unit.scrambleWords());
        return this;
    }

    /**
     * Reset scrambling for all words
     * @returns {Level} - Returns this level instance for chaining
     */
    resetScramble() {
        this.units.forEach(unit => unit.resetScramble());
        return this;
    }
}
