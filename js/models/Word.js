/**
 * Represents a vocabulary word with its properties
 */
export class Word {
    /**
     * Create a new Word
     * @param {Object} wordData - The word data from JSON
     * @param {number} unitIndex - The index of the unit this word belongs to
     */
    constructor(wordData, unitIndex) {
        this.word = wordData.word;
        this.syllables = wordData.syllables;
        this.pronunciation = wordData.pronunciation;
        this.meaning = wordData.meaning;
        this.unitIndex = unitIndex;
        this.scrambledWord = null;
    }

    /**
     * Scramble the letters of the word
     * @returns {Word} - Returns this word instance for chaining
     */
    scramble() {
        // Handle multi-word phrases by scrambling each word separately
        if (this.word.includes(' ')) {
            const words = this.word.split(' ');
            const scrambledWords = words.map(word =>
                word.split('').sort(() => Math.random() - 0.5).join('')
            );
            this.scrambledWord = scrambledWords.join(' ');
        } else {
            // Single word - scramble all letters
            this.scrambledWord = this.word.split('').sort(() => Math.random() - 0.5).join('');
        }
        return this;
    }

    /**
     * Reset the scrambled version of the word
     * @returns {Word} - Returns this word instance for chaining
     */
    resetScramble() {
        this.scrambledWord = null;
        return this;
    }

    /**
     * Get the display text based on whether scrambling is enabled
     * @param {boolean} scrambleEnabled - Whether scrambling is enabled
     * @returns {string} - The text to display
     */
    getDisplayText(scrambleEnabled) {
        if (scrambleEnabled && this.scrambledWord) {
            return this.scrambledWord;
        }
        return this.word;
    }

    /**
     * Check if the user's answer is correct
     * @param {string} userInput - The user's input
     * @returns {boolean} - Whether the answer is correct
     */
    checkAnswer(userInput) {
        return userInput.trim().toLowerCase() === this.word.toLowerCase();
    }
}
