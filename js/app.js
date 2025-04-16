/**
 * app.js - Main application entry point
 * Coordinates between modules and handles core application logic
 */
import WordManager from './modules/core/WordManager.js';
import SpeechManager from './modules/core/SpeechManager.js';
import UIManager from './modules/ui/UIManager.js';

class EatwordApp {
  constructor() {
    console.log('Initializing Eatword application...');

    // Initialize modules
    this.speechManager = new SpeechManager();
    this.wordManager = new WordManager();
    this.ui = new UIManager(this);

    // Congratulation messages
    this.congratulationMessages = [
      "Good job!", "Excellent!", "Well done!", "Perfect!", "Amazing!",
      "做得好！", "太棒了！", "非常好！", "完美！", "加鸡腿", "真厉害！", "你真牛!", "太厉害了!"
    ];

    // Track incorrect attempts
    this.incorrectAttempts = 0;
    this.MAX_ATTEMPTS = 3;
    this.incorrectTimeout = null;

    // Bind event handlers
    this.bindEvents();

    // Load default level
    this.loadLevel(this.wordManager.currentLevel);
  }

  /**
   * Bind global event handlers
   */
  bindEvents() {
    // Add any global event handlers here
  }

  /**
   * Load a specific vocabulary level
   * @param {string} level - The level to load
   */
  async loadLevel(level) {
    console.log(`Loading level: ${level}`);

    // Show loading indicator
    this.ui.showLoading(level);

    // Load the vocabulary data
    const result = await this.wordManager.loadLevel(level);

    if (result.success) {
      // Rebuild the UI
      this.ui.rebuildUI();

      // Initialize the first word
      this.loadCurrentWord();
    } else {
      // Show error message
      this.ui.showError(level, result.error);
    }
  }

  /**
   * Set the current mode
   * @param {string} mode - The mode to set
   */
  setMode(mode) {
    console.log(`Setting mode: ${mode}`);

    // Update UI
    this.ui.setMode(mode);

    // Reset incorrect attempts
    this.incorrectAttempts = 0;

    // Reload the current word with the new mode
    this.loadCurrentWord();
  }

  /**
   * Load and display the current word
   */
  loadCurrentWord() {
    const currentWord = this.wordManager.getCurrentWord();

    if (currentWord) {
      console.log(`Loading word: ${currentWord.word}`);
      this.ui.displayWord(currentWord);
    } else {
      console.log('No words available');

      // Check if we were reviewing incorrect words and there are none left
      if (this.wordManager.isReviewingIncorrect() && this.wordManager.getIncorrectWordsCount() === 0) {
        this.ui.showIncorrectWordsCompleted();
      } else {
        // All units completed
        this.ui.showAllUnitsCompleted();
      }
    }
  }

  /**
   * Check the user's answer
   */
  checkAnswer() {
    const currentWord = this.wordManager.getCurrentWord();
    if (!currentWord) return;

    const userInput = this.ui.elements.wordInput.value.trim().toLowerCase();
    const mode = this.ui.currentMode;

    // Disable input temporarily to prevent double submission
    this.ui.elements.wordInput.disabled = true;
    this.ui.elements.checkButton.disabled = true;

    setTimeout(() => {
      if (this.ui.elements.checkButton.style.display !== 'none') {
        this.ui.elements.wordInput.disabled = false;
        this.ui.elements.checkButton.disabled = false;
        if (this.ui.elements.container.classList.contains('input-visible')) {
          this.ui.elements.wordInput.focus();
        }
      }
    }, 500);

    let isCorrect = false;

    // Check answer based on mode
    if (mode === 'review' || mode === 'dictation') {
      // In review and dictation modes, check against the word
      isCorrect = userInput === currentWord.word.toLowerCase();
    } else if (mode === 'listening') {
      // In listening mode, check against the meaning
      isCorrect = userInput === currentWord.meaning.toLowerCase();
    }

    if (isCorrect) {
      // Handle correct answer
      this.handleCorrectAnswer(currentWord);
    } else {
      // Handle incorrect answer
      this.handleIncorrectAnswer(currentWord);
    }
  }

  /**
   * Handle a correct answer
   * @param {Object} wordData - The current word data
   */
  handleCorrectAnswer(wordData) {
    // Show feedback with random correct message
    const randomFeedback = this.congratulationMessages[Math.floor(Math.random() * this.congratulationMessages.length)];
    this.ui.showFeedback(true, randomFeedback);

    // Speak a congratulation message
    this.speechManager.speak(randomFeedback, this.ui.elements.feedbackDiv);

    // If reviewing incorrect words, remove this word from the list
    if (this.wordManager.isReviewingIncorrect()) {
      this.wordManager.removeIncorrectWord(wordData.word);
    }

    // Move to next word after a delay
    setTimeout(() => {
      this.nextWord();
    }, 1000);
  }

  /**
   * Handle an incorrect answer
   * @param {Object} wordData - The current word data
   */
  handleIncorrectAnswer(wordData) {
    // Clear any existing timeout
    if (this.incorrectTimeout) {
      clearTimeout(this.incorrectTimeout);
      this.incorrectTimeout = null;
    }

    // Show feedback with incorrect message
    this.ui.showFeedback(false, 'Incorrect, please try again.');

    // Add the word to incorrect words list if not already there
    if (!this.wordManager.isReviewingIncorrect()) {
      this.wordManager.addIncorrectWord(wordData);
    }

    // Handle attempts for dictation and listening modes
    if (this.ui.currentMode === 'listening' || this.ui.currentMode === 'dictation') {
      this.incorrectAttempts++;
      this.ui.updateAttemptCounter(this.incorrectAttempts, this.MAX_ATTEMPTS);

      // If max attempts reached, show the correct answer
      if (this.incorrectAttempts >= this.MAX_ATTEMPTS) {
        this.ui.showFeedback(false, `Attempts exceeded! The correct ${this.ui.currentMode === 'dictation' ? 'word' : 'meaning'} was: ${this.ui.currentMode === 'dictation' ? wordData.word : wordData.meaning}`);
        this.ui.showResult(wordData);

        // Disable input and show next button
        this.ui.elements.wordInput.disabled = true;
        this.ui.elements.checkButton.style.display = 'none';
        this.ui.elements.nextWordButton.style.display = 'inline-block';

        if (this.ui.elements.container) {
          this.ui.elements.container.classList.remove('attempts-visible');
        }
      } else {
        // Speak the word again after a short delay
        this.incorrectTimeout = setTimeout(() => {
          this.speechManager.speak(wordData.word, this.ui.elements.feedbackDiv);
        }, 1000);
      }
    } else {
      // For review mode, just speak the word again
      this.incorrectTimeout = setTimeout(() => {
        this.speechManager.speak(wordData.word, this.ui.elements.feedbackDiv);
      }, 1000);
    }
  }

  /**
   * Move to the next word
   */
  nextWord() {
    // Reset incorrect attempts
    this.incorrectAttempts = 0;

    // Get next word
    this.wordManager.nextWord();

    // Load the new current word
    this.loadCurrentWord();
  }

  /**
   * Set the shuffle mode
   * @param {boolean} enabled - Whether shuffling is enabled
   */
  setShuffleMode(enabled) {
    console.log(`Setting shuffle mode: ${enabled}`);
    this.wordManager.toggleShuffle(enabled);
    this.loadCurrentWord();
  }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EatwordApp();
});

export default EatwordApp;
