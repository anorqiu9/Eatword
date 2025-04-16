/**
 * WordManager.js - Manages word data and operations
 * Handles loading, shuffling, and tracking progress of vocabulary words
 */
class WordManager {
  constructor() {
    this.wordsData = [];
    this.shuffledWords = [];
    this.currentWordIndex = 0;
    this.currentUnitIndex = 0;
    this.currentLevel = 'H'; // Default level
    this.totalProgress = 0;
    this.incorrectWords = [];
    this.isReviewingIncorrectWords = false;
    this.shuffleEnabled = false;
  }

  /**
   * Load vocabulary data for a specific level
   * @param {string} level - The level to load
   * @returns {Promise} Promise that resolves when data is loaded
   */
  async loadLevel(level) {
    try {
      this.currentLevel = level;
      this.shuffledWords = [];
      this.currentWordIndex = 0;
      this.currentUnitIndex = 0;

      // Fetch the vocabulary data
      const url = `words/HF/level${level}.json`;
      console.log(`Fetching from URL: ${url}`);
      const response = await fetch(url);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      this.wordsData = data.units;

      // Make sure the level matches what's in the file
      if (data.level !== this.currentLevel) {
        console.warn(`Level in file (${data.level}) doesn't match requested level (${this.currentLevel}). Using requested level.`);
      }

      console.log(`Vocabulary data loaded successfully (Level ${this.currentLevel}, version ${data.version}, last updated ${data.lastUpdated})`);

      // Initialize the first unit
      const initSuccess = this.initializeCurrentUnit();

      return {
        success: initSuccess,
        data: data
      };
    } catch (error) {
      console.error(`Error loading vocabulary data for Level ${level}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Initialize the shuffled words array for the current unit
   */
  initializeCurrentUnit() {
    console.log('Initializing current unit:', this.currentUnitIndex);
    console.log('Words data:', this.wordsData);

    if (this.isReviewingIncorrectWords) {
      // Use incorrect words for review
      this.shuffledWords = [...this.incorrectWords];
      console.log('Using incorrect words for review:', this.shuffledWords.length);
    } else if (this.wordsData && this.wordsData.length > 0) {
      // Make sure we have a valid unit index
      if (this.currentUnitIndex >= this.wordsData.length) {
        this.currentUnitIndex = 0;
      }

      // Check if the unit has words
      if (this.wordsData[this.currentUnitIndex] &&
          this.wordsData[this.currentUnitIndex].words &&
          this.wordsData[this.currentUnitIndex].words.length > 0) {
        // Use words from the current unit
        this.shuffledWords = [...this.wordsData[this.currentUnitIndex].words];
        console.log(`Using words from unit ${this.currentUnitIndex}:`, this.shuffledWords.length);
      } else {
        console.error('No words available in this unit');
        return false;
      }
    } else {
      console.error('No words data available');
      return false;
    }

    // Shuffle if enabled
    if (this.shuffleEnabled) {
      this.shuffleArray(this.shuffledWords);
      console.log('Words shuffled');
    } else {
      console.log('Words kept in original order');
    }

    this.currentWordIndex = 0;
    return true;
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param {Array} array - The array to shuffle
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Get the current word
   * @returns {Object|null} The current word object or null if no words
   */
  getCurrentWord() {
    if (this.shuffledWords.length === 0) {
      if (!this.initializeCurrentUnit()) {
        return null;
      }
    }

    if (this.currentWordIndex >= this.shuffledWords.length) {
      return null;
    }

    return this.shuffledWords[this.currentWordIndex];
  }

  /**
   * Move to the next word
   * @returns {Object|null} The next word object or null if no more words
   */
  nextWord() {
    this.currentWordIndex++;
    this.totalProgress++;

    // If we've reached the end of the current unit
    if (this.currentWordIndex >= this.shuffledWords.length) {
      // If we're reviewing incorrect words and there are none left
      if (this.isReviewingIncorrectWords && this.incorrectWords.length === 0) {
        return null;
      }

      // Move to the next unit if not reviewing incorrect words
      if (!this.isReviewingIncorrectWords) {
        this.currentUnitIndex++;

        // If we've reached the end of all units
        if (this.currentUnitIndex >= this.wordsData.length) {
          return null;
        }

        // Initialize the next unit
        this.initializeCurrentUnit();
      }
    }

    return this.getCurrentWord();
  }

  /**
   * Add a word to the incorrect words list
   * @param {Object} word - The word object to add
   */
  addIncorrectWord(word) {
    if (!this.isReviewingIncorrectWords) {
      // Check if the word already exists in the list
      const wordExists = this.incorrectWords.some(w =>
        w.word.toLowerCase() === word.word.toLowerCase()
      );

      if (!wordExists) {
        this.incorrectWords.push(word);
        console.log(`Added word "${word.word}" to incorrect words list. Total: ${this.incorrectWords.length}`);
      }
    }
  }

  /**
   * Remove a word from the incorrect words list
   * @param {string} word - The word to remove
   */
  removeIncorrectWord(word) {
    if (this.isReviewingIncorrectWords) {
      const wordIndex = this.incorrectWords.findIndex(w =>
        w.word.toLowerCase() === word.toLowerCase()
      );

      if (wordIndex !== -1) {
        const removedWord = this.incorrectWords[wordIndex];
        this.incorrectWords.splice(wordIndex, 1);
        console.log(`Removed word "${removedWord.word}" from incorrect words list. ${this.incorrectWords.length} words remaining.`);

        // Also remove from shuffled words if we're reviewing incorrect words
        const shuffledIndex = this.shuffledWords.findIndex(w =>
          w.word.toLowerCase() === word.toLowerCase()
        );

        if (shuffledIndex !== -1) {
          this.shuffledWords.splice(shuffledIndex, 1);
        }
      }
    }
  }

  /**
   * Toggle review mode for incorrect words
   * @param {boolean} enable - Whether to enable review mode
   */
  toggleIncorrectWordsReview(enable) {
    this.isReviewingIncorrectWords = enable;
    this.currentWordIndex = 0;

    // Reinitialize words
    if (enable) {
      this.shuffledWords = [...this.incorrectWords];
      if (this.shuffleEnabled) {
        this.shuffleArray(this.shuffledWords);
      }
    } else {
      this.initializeCurrentUnit();
    }
  }

  /**
   * Toggle word shuffling
   * @param {boolean} enable - Whether to enable shuffling
   */
  toggleShuffle(enable) {
    this.shuffleEnabled = enable;

    // Reinitialize words with new shuffle setting
    this.initializeCurrentUnit();
  }

  /**
   * Get the total number of words
   * @returns {number} Total word count
   */
  getTotalWords() {
    if (this.isReviewingIncorrectWords) {
      return this.incorrectWords.length;
    }

    return this.wordsData.reduce((total, unit) => total + unit.words.length, 0);
  }

  /**
   * Get the number of incorrect words
   * @returns {number} Incorrect word count
   */
  getIncorrectWordsCount() {
    return this.incorrectWords.length;
  }

  /**
   * Check if we're reviewing incorrect words
   * @returns {boolean} True if reviewing incorrect words
   */
  isReviewingIncorrect() {
    return this.isReviewingIncorrectWords;
  }

  /**
   * Check if shuffling is enabled
   * @returns {boolean} True if shuffling is enabled
   */
  isShuffleEnabled() {
    return this.shuffleEnabled;
  }
}

export default WordManager;
