/**
 * Manages word selection, shuffling, and tracking progress
 */
export class WordManager {
    constructor() {
        this.words = []; // Current set of words
        this.currentIndex = 0;
        this.incorrectWords = []; // Words that were answered incorrectly
        this.isReviewingIncorrectWords = false;
        this.shuffleEnabled = false;
        this.scrambleEnabled = false;
        this.totalProgress = 0;
    }

    /**
     * Set the words to use
     * @param {Array} words - Array of Word objects
     * @returns {WordManager} - Returns this instance for chaining
     */
    setWords(words) {
        this.words = [...words];
        this.currentIndex = 0;
        
        if (this.shuffleEnabled) {
            this.shuffle();
        }
        
        if (this.scrambleEnabled) {
            this.scrambleWords();
        }
        
        return this;
    }

    /**
     * Get the current word
     * @returns {Word|null} - The current word or null if no words are available
     */
    getCurrentWord() {
        if (this.words.length === 0 || this.currentIndex >= this.words.length) {
            return null;
        }
        return this.words[this.currentIndex];
    }

    /**
     * Move to the next word
     * @param {boolean} wasCorrect - Whether the current word was answered correctly
     * @returns {Word|null} - The next word or null if no more words are available
     */
    nextWord(wasCorrect = true) {
        const currentWord = this.getCurrentWord();
        
        if (currentWord && !wasCorrect && !this.isReviewingIncorrectWords) {
            // Add to incorrect words if not already reviewing incorrect words
            if (!this.incorrectWords.some(w => w.word === currentWord.word)) {
                this.incorrectWords.push(currentWord);
            }
        }
        
        if (wasCorrect) {
            this.totalProgress++;
        }
        
        this.currentIndex++;
        
        // Check if we've reached the end of the words
        if (this.currentIndex >= this.words.length) {
            // If we have incorrect words and we're not already reviewing them, switch to reviewing
            if (this.incorrectWords.length > 0 && !this.isReviewingIncorrectWords) {
                this.startReviewingIncorrectWords();
            }
        }
        
        return this.getCurrentWord();
    }

    /**
     * Start reviewing incorrect words
     * @returns {Word|null} - The first incorrect word or null if no incorrect words
     */
    startReviewingIncorrectWords() {
        if (this.incorrectWords.length === 0) {
            return null;
        }
        
        this.isReviewingIncorrectWords = true;
        this.words = [...this.incorrectWords];
        this.currentIndex = 0;
        
        if (this.shuffleEnabled) {
            this.shuffle();
        }
        
        return this.getCurrentWord();
    }

    /**
     * Finish reviewing incorrect words
     */
    finishReviewingIncorrectWords() {
        this.isReviewingIncorrectWords = false;
        this.incorrectWords = [];
    }

    /**
     * Shuffle the words
     * @returns {WordManager} - Returns this instance for chaining
     */
    shuffle() {
        for (let i = this.words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
        }
        return this;
    }

    /**
     * Enable or disable shuffling
     * @param {boolean} enabled - Whether shuffling should be enabled
     * @returns {WordManager} - Returns this instance for chaining
     */
    setShuffleEnabled(enabled) {
        this.shuffleEnabled = enabled;
        if (enabled && this.words.length > 0) {
            this.shuffle();
        }
        return this;
    }

    /**
     * Scramble all words
     * @returns {WordManager} - Returns this instance for chaining
     */
    scrambleWords() {
        this.words.forEach(word => word.scramble());
        return this;
    }

    /**
     * Enable or disable scrambling
     * @param {boolean} enabled - Whether scrambling should be enabled
     * @returns {WordManager} - Returns this instance for chaining
     */
    setScrambleEnabled(enabled) {
        this.scrambleEnabled = enabled;
        if (enabled && this.words.length > 0) {
            this.scrambleWords();
        } else if (!enabled) {
            this.words.forEach(word => word.resetScramble());
        }
        return this;
    }

    /**
     * Reset progress
     * @returns {WordManager} - Returns this instance for chaining
     */
    resetProgress() {
        this.currentIndex = 0;
        this.totalProgress = 0;
        return this;
    }

    /**
     * Get the total number of words
     * @returns {number} - The total number of words
     */
    getTotalWords() {
        return this.words.length;
    }

    /**
     * Get the current progress
     * @returns {number} - The current progress (0-based index)
     */
    getCurrentProgress() {
        return this.currentIndex;
    }

    /**
     * Get the total progress
     * @returns {number} - The total progress (number of correctly answered words)
     */
    getTotalProgress() {
        return this.totalProgress;
    }

    /**
     * Check if we're reviewing incorrect words
     * @returns {boolean} - Whether we're reviewing incorrect words
     */
    isReviewing() {
        return this.isReviewingIncorrectWords;
    }

    /**
     * Get the number of incorrect words
     * @returns {number} - The number of incorrect words
     */
    getIncorrectWordCount() {
        return this.incorrectWords.length;
    }
}
