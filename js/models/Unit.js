import { Word } from './Word.js';

/**
 * Represents a unit of vocabulary words
 */
export class Unit {
    /**
     * Create a new Unit
     * @param {Object} unitData - The unit data from JSON
     * @param {number} index - The index of this unit
     */
    constructor(unitData, index) {
        this.index = index;
        this.name = unitData.unit || `Unit ${index + 1}`;
        this.words = (unitData.words || []).map(wordData => new Word(wordData, index));
    }

    /**
     * Get the number of words in this unit
     * @returns {number} - The word count
     */
    get wordCount() {
        return this.words.length;
    }

    /**
     * Scramble all words in this unit
     * @returns {Unit} - Returns this unit instance for chaining
     */
    scrambleWords() {
        this.words.forEach(word => word.scramble());
        return this;
    }

    /**
     * Reset scrambling for all words in this unit
     * @returns {Unit} - Returns this unit instance for chaining
     */
    resetScramble() {
        this.words.forEach(word => word.resetScramble());
        return this;
    }
}
