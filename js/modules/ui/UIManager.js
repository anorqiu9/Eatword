/**
 * UIManager.js - Manages UI interactions and updates
 * Handles DOM manipulation, event binding, and UI state
 */
class UIManager {
  constructor(app) {
    this.app = app;
    this.elements = {};
    this.currentMode = 'review';
    this.pronunciationPlaceholder = "No IPA available";

    // Initialize UI when DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.initialize.bind(this));
    } else {
      this.initialize();
    }
  }

  /**
   * Initialize the UI
   */
  initialize() {
    // Cache DOM elements
    this.cacheElements();

    // Bind event listeners
    this.bindEvents();

    console.log('UI initialized');
  }

  /**
   * Cache DOM elements for faster access
   */
  cacheElements() {
    // Main container
    this.elements.container = document.querySelector('.container');

    // Input and buttons
    this.elements.wordInput = document.getElementById('word-input');
    this.elements.checkButton = document.getElementById('check-button');
    this.elements.speakButton = document.getElementById('speak-button');
    this.elements.nextWordButton = document.getElementById('next-word-button');

    // Display areas
    this.elements.feedbackDiv = document.getElementById('feedback');
    this.elements.resultDiv = document.getElementById('result');
    this.elements.correctWordP = document.getElementById('correct-word');
    this.elements.meaningP = document.getElementById('meaning');
    this.elements.promptDiv = document.getElementById('prompt');
    this.elements.progressDiv = document.getElementById('progress');
    this.elements.attemptCounterDiv = document.getElementById('attempt-counter');
    this.elements.reviewDisplayDiv = document.getElementById('review-display');
    this.elements.promptDisplayDiv = document.getElementById('prompt-display');
    this.elements.actionButtonsDiv = document.getElementById('action-buttons');

    // Word display elements
    this.elements.wordTextSpan = document.getElementById('word-text');
    this.elements.wordSyllablesSpan = document.getElementById('word-syllables');
    this.elements.wordPronunciationSpan = document.getElementById('word-pronunciation');
    this.elements.wordMeaningReviewSpan = document.getElementById('word-meaning-review');

    // Level and mode selectors
    this.elements.levelButtons = document.querySelectorAll('.level-button');
    this.elements.modeButtons = document.querySelectorAll('.mode-button');
    this.elements.shuffleToggle = document.getElementById('shuffle-toggle');

    console.log('DOM elements cached');
  }

  /**
   * Bind event listeners to UI elements
   */
  bindEvents() {
    // Check button
    if (this.elements.checkButton) {
      this.elements.checkButton.addEventListener('click', () => {
        this.app.checkAnswer();
      });
    }

    // Word input (for Enter key)
    if (this.elements.wordInput) {
      this.elements.wordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.app.checkAnswer();
        }
      });
    }

    // Speak button
    if (this.elements.speakButton) {
      this.elements.speakButton.addEventListener('click', () => {
        const currentWord = this.app.wordManager.getCurrentWord();
        if (currentWord) {
          this.app.speechManager.speak(currentWord.word, this.elements.feedbackDiv);
        }
      });
    }

    // Next word button
    if (this.elements.nextWordButton) {
      this.elements.nextWordButton.addEventListener('click', () => {
        this.app.nextWord();
      });
    }

    // Review display area (for clicking to hear pronunciation)
    if (this.elements.reviewDisplayDiv) {
      this.elements.reviewDisplayDiv.addEventListener('click', () => {
        const currentWord = this.app.wordManager.getCurrentWord();
        if (currentWord) {
          this.app.speechManager.speak(currentWord.word, this.elements.feedbackDiv);
        }
      });
    }

    // Level buttons
    if (this.elements.levelButtons) {
      this.elements.levelButtons.forEach(button => {
        button.addEventListener('click', () => {
          const level = button.getAttribute('data-level');
          this.app.loadLevel(level);

          // Update active button
          this.elements.levelButtons.forEach(btn => {
            btn.classList.remove('active');
          });
          button.classList.add('active');
        });

        // Set the current level button as active
        if (button.getAttribute('data-level') === this.app.wordManager.currentLevel) {
          button.classList.add('active');
        }
      });
    }

    // Mode buttons
    if (this.elements.modeButtons) {
      this.elements.modeButtons.forEach(button => {
        button.addEventListener('click', () => {
          const mode = button.getAttribute('data-mode');
          this.app.setMode(mode);

          // Update active button
          this.elements.modeButtons.forEach(btn => {
            btn.classList.remove('active');
          });
          button.classList.add('active');
        });

        // Set the current mode button as active
        if (button.getAttribute('data-mode') === this.app.mode) {
          button.classList.add('active');
        }
      });
    }

    // Shuffle toggle
    if (this.elements.shuffleToggle) {
      this.elements.shuffleToggle.addEventListener('change', () => {
        const shuffleEnabled = this.elements.shuffleToggle.checked;
        this.app.setShuffleMode(shuffleEnabled);
      });
    }

    console.log('Event listeners bound');
  }

  /**
   * Show loading indicator
   * @param {string} level - The level being loaded
   */
  showLoading(level) {
    if (this.elements.container) {
      this.elements.container.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Loading vocabulary data for Level ${level}...</p>
        </div>
      `;
    }
  }

  /**
   * Show error message
   * @param {string} level - The level that failed to load
   * @param {string} errorMessage - The error message
   */
  showError(level, errorMessage) {
    if (this.elements.container) {
      this.elements.container.innerHTML = `
        <h1>Error Loading Data</h1>
        <p>Sorry, there was a problem loading the vocabulary data for Level ${level}. Please try refreshing the page or selecting a different level.</p>
        <p>Error details: ${errorMessage}</p>
      `;
    }
  }

  /**
   * Rebuild the UI after loading data
   */
  rebuildUI() {
    // Instead of fetching the HTML, let's just restore the original structure directly
    this.elements.container.innerHTML = `
      <h1>Vocabulary Practice</h1>

      <div class="controls">
        <span>HFLevel:</span>
        <button class="level-button" data-level="C">C</button>
        <button class="level-button" data-level="D">D</button>
        <button class="level-button" data-level="E">E</button>
        <button class="level-button" data-level="F">F</button>
        <button class="level-button" data-level="G">G</button>
        <button class="level-button" data-level="H">H</button>
        <button class="level-button" data-level="J">J</button>
        <span>Mode:</span>
        <button class="mode-button" data-mode="review">Review</button>
        <button class="mode-button" data-mode="dictation">Dictation</button>
        <button class="mode-button" data-mode="listening">Listening</button>
        <label class="shuffle-toggle">
          <input type="checkbox" id="shuffle-toggle">
          <span>Shuffling</span>
        </label>
      </div>

      <div id="review-display" class="display-area">
        <div id="word-text" class="word-text"></div>
        <div id="word-syllables" class="word-syllables"></div>
        <div id="word-pronunciation" class="word-pronunciation"></div>
        <div id="word-meaning-review" class="word-meaning" style="display: none;"></div>
      </div>
      <div id="prompt-display" class="display-area"></div>

      <div id="feedback"></div>

      <input type="text" id="word-input" placeholder="Type the word here..." autocomplete="off">
      <div id="attempt-counter"></div>

      <div id="action-buttons">
        <button id="speak-button" class="speak-button">Speak Again</button>
        <button id="check-button" class="check-button">Check</button>
        <button id="next-word-button" class="next-button" style="display: none;">Next Word</button>
      </div>

      <div id="result">
        <p id="correct-word"></p>
        <p id="meaning"></p>
      </div>

      <div id="progress"></div>
    `;

    // Re-cache the DOM elements and re-bind event listeners
    this.cacheElements();
    this.bindEvents();

    console.log('UI rebuilt successfully');
  }

  /**
   * Display the current word
   * @param {Object} wordData - The word data to display
   */
  displayWord(wordData) {
    if (!wordData) return;

    // Clear previous feedback
    if (this.elements.feedbackDiv) {
      this.elements.feedbackDiv.textContent = '';
      this.elements.feedbackDiv.className = '';
    }

    // Hide result
    if (this.elements.resultDiv) {
      this.elements.resultDiv.style.display = 'none';
    }

    // Reset input
    if (this.elements.wordInput) {
      this.elements.wordInput.value = '';
      this.elements.wordInput.disabled = false;
    }

    // Show/hide buttons
    if (this.elements.checkButton) {
      this.elements.checkButton.disabled = false;
      this.elements.checkButton.style.display = 'inline-block';
    }

    if (this.elements.nextWordButton) {
      this.elements.nextWordButton.style.display = 'none';
    }

    if (this.elements.speakButton) {
      this.elements.speakButton.disabled = false;
      this.elements.speakButton.style.display = 'inline-block';
    }

    // Clear attempt counter
    if (this.elements.attemptCounterDiv) {
      this.elements.attemptCounterDiv.textContent = '';
    }

    // Update container classes
    if (this.elements.container) {
      this.elements.container.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
      this.elements.container.classList.add('buttons-visible');
    }

    // Reset display areas
    if (this.elements.reviewDisplayDiv) {
      this.elements.reviewDisplayDiv.style.display = 'none';
    }

    if (this.elements.promptDisplayDiv) {
      this.elements.promptDisplayDiv.style.display = 'none';
      this.elements.promptDisplayDiv.classList.remove('missing-pronunciation');
    }

    if (this.elements.wordMeaningReviewSpan) {
      this.elements.wordMeaningReviewSpan.style.display = 'none';
      this.elements.wordMeaningReviewSpan.textContent = '';
    }

    // Check if the word has pronunciation
    const hasPronunciation = wordData.pronunciation && wordData.pronunciation !== this.pronunciationPlaceholder;

    // Display word based on mode
    switch (this.currentMode) {
      case 'review':
        this.displayReviewMode(wordData);
        break;
      case 'dictation':
        this.displayDictationMode(wordData, hasPronunciation);
        break;
      case 'listening':
        this.displayListeningMode(wordData);
        break;
      default:
        this.displayReviewMode(wordData);
    }

    // Speak the word automatically for all modes
    setTimeout(() => {
      this.app.speechManager.speak(wordData.word, this.elements.feedbackDiv);
    }, 500);

    // Update progress and active buttons
    this.updateProgress();
    this.updateActiveButtons();
  }

  /**
   * Display word in review mode
   * @param {Object} wordData - The word data to display
   */
  displayReviewMode(wordData) {
    if (this.elements.promptDiv) {
      this.elements.promptDiv.textContent = '';
    }

    if (this.elements.wordTextSpan) {
      this.elements.wordTextSpan.textContent = wordData.word;
    }

    if (this.elements.wordSyllablesSpan) {
      this.elements.wordSyllablesSpan.textContent = wordData.syllables;
    }

    if (this.elements.wordPronunciationSpan) {
      this.elements.wordPronunciationSpan.textContent = wordData.pronunciation || this.pronunciationPlaceholder;
    }

    if (this.elements.wordMeaningReviewSpan) {
      this.elements.wordMeaningReviewSpan.textContent = wordData.meaning;
      this.elements.wordMeaningReviewSpan.style.display = 'block';
    }

    if (this.elements.reviewDisplayDiv) {
      this.elements.reviewDisplayDiv.style.display = 'block';
    }

    if (this.elements.container) {
      this.elements.container.classList.add('input-visible');
    }

    if (this.elements.checkButton) {
      this.elements.checkButton.textContent = 'Check';
    }

    if (this.elements.wordInput) {
      this.elements.wordInput.focus();
    }

    // Speak the word automatically
    setTimeout(() => {
      this.app.speechManager.speak(wordData.word, this.elements.feedbackDiv);
    }, 500);
  }

  /**
   * Display word in dictation mode
   * @param {Object} wordData - The word data to display
   * @param {boolean} hasPronunciation - Whether the word has pronunciation data
   */
  displayDictationMode(wordData, hasPronunciation) {
    if (this.elements.promptDiv) {
      this.elements.promptDiv.textContent = '';
    }

    if (this.elements.promptDisplayDiv) {
      if (hasPronunciation) {
        this.elements.promptDisplayDiv.textContent = 'Listen and type the word';
      } else {
        this.elements.promptDisplayDiv.textContent = 'No pronunciation available. Type the word';
        this.elements.promptDisplayDiv.classList.add('missing-pronunciation');
      }
      this.elements.promptDisplayDiv.style.display = 'block';
    }

    if (this.elements.container) {
      this.elements.container.classList.add('input-visible', 'attempts-visible');
    }

    if (this.elements.checkButton) {
      this.elements.checkButton.textContent = 'Check';
    }

    if (this.elements.wordInput) {
      this.elements.wordInput.focus();
    }

    // Speak the word if pronunciation is available
    if (hasPronunciation) {
      setTimeout(() => {
        this.app.speechManager.speak(wordData.word, this.elements.feedbackDiv);
      }, 500);
    }
  }

  /**
   * Display word in listening mode
   * @param {Object} wordData - The word data to display
   */
  displayListeningMode(wordData) {
    if (this.elements.promptDiv) {
      this.elements.promptDiv.textContent = '';
    }

    if (this.elements.promptDisplayDiv) {
      this.elements.promptDisplayDiv.textContent = 'Listen and type the meaning';
      this.elements.promptDisplayDiv.style.display = 'block';
    }

    if (this.elements.container) {
      this.elements.container.classList.add('input-visible', 'attempts-visible');
    }

    if (this.elements.checkButton) {
      this.elements.checkButton.textContent = 'Check';
    }

    if (this.elements.wordInput) {
      this.elements.wordInput.focus();
    }

    // Speak the word
    setTimeout(() => {
      this.app.speechManager.speak(wordData.word, this.elements.feedbackDiv);
    }, 500);
  }

  /**
   * Update the progress display
   */
  updateProgress() {
    if (!this.elements.progressDiv) return;

    const wordManager = this.app.wordManager;
    const incorrectCount = wordManager.getIncorrectWordsCount();
    const isReviewing = wordManager.isReviewingIncorrect();

    // Get the current unit's total words count
    let totalWords = 0;
    if (isReviewing) {
      totalWords = wordManager.incorrectWords.length;
    } else if (wordManager.wordsData &&
               wordManager.wordsData.length > 0 &&
               wordManager.currentUnitIndex < wordManager.wordsData.length) {
      const currentUnit = wordManager.wordsData[wordManager.currentUnitIndex];
      if (currentUnit && currentUnit.words) {
        totalWords = currentUnit.words.length;
      }
    }

    // Calculate current index (add 1 because it's 0-based)
    const currentIndex = wordManager.currentWordIndex + 1;

    let progressText = `Level: ${wordManager.currentLevel} | Mode: ${this.getModeName(this.currentMode)} | Progress: ${currentIndex} / ${totalWords}`;

    if (isReviewing) {
      progressText += ` | Reviewing incorrect words: ${incorrectCount} remaining`;
    } else if (incorrectCount > 0) {
      progressText += ` | Incorrect words: ${incorrectCount}`;
    }

    this.elements.progressDiv.textContent = progressText;
  }

  /**
   * Get the display name for a mode
   * @param {string} mode - The mode identifier
   * @returns {string} The display name
   */
  getModeName(mode) {
    switch (mode) {
      case 'review': return 'Review';
      case 'dictation': return 'Dictation';
      case 'listening': return 'Listening';
      default: return 'Unknown';
    }
  }

  /**
   * Show feedback for an answer
   * @param {boolean} isCorrect - Whether the answer is correct
   * @param {string} message - The feedback message
   */
  showFeedback(isCorrect, message) {
    if (!this.elements.feedbackDiv) return;

    this.elements.feedbackDiv.textContent = message;
    this.elements.feedbackDiv.className = isCorrect ? 'correct' : 'incorrect';
  }

  /**
   * Show detailed result for a word
   * @param {Object} wordData - The word data
   */
  showResult(wordData) {
    if (!this.elements.resultDiv || !this.elements.correctWordP || !this.elements.meaningP) return;

    this.elements.resultDiv.style.display = 'block';

    const pronunciationText = wordData.pronunciation && wordData.pronunciation !== this.pronunciationPlaceholder ?
      ` ${wordData.pronunciation}` : '';

    this.elements.correctWordP.textContent = `Word: ${wordData.word}${pronunciationText}`;
    this.elements.meaningP.textContent = wordData.meaning ?
      `Meaning: ${wordData.meaning}` : 'Meaning: Not available';
    this.elements.meaningP.style.display = 'block';
  }

  /**
   * Update attempt counter
   * @param {number} attempts - Current attempts
   * @param {number} maxAttempts - Maximum allowed attempts
   */
  updateAttemptCounter(attempts, maxAttempts) {
    if (!this.elements.attemptCounterDiv) return;

    if ((this.currentMode === 'dictation' || this.currentMode === 'listening') &&
        this.elements.wordInput && !this.elements.wordInput.disabled) {
      this.elements.attemptCounterDiv.textContent = `Attempts remaining: ${maxAttempts - attempts}`;
    } else {
      this.elements.attemptCounterDiv.textContent = '';
    }
  }

  /**
   * Show completion message for incorrect words review
   */
  showIncorrectWordsCompleted() {
    if (!this.elements.promptDiv || !this.elements.container || !this.elements.progressDiv) return;

    // Show congratulations message for completing the review
    this.elements.promptDiv.textContent = 'Great job! You have mastered all the words you previously got wrong!';

    if (this.elements.feedbackDiv) {
      this.elements.feedbackDiv.textContent = '';
    }

    if (this.elements.resultDiv) {
      this.elements.resultDiv.style.display = 'none';
    }

    if (this.elements.reviewDisplayDiv) {
      this.elements.reviewDisplayDiv.style.display = 'none';
    }

    if (this.elements.promptDisplayDiv) {
      this.elements.promptDisplayDiv.style.display = 'none';
    }

    this.elements.container.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
    this.elements.progressDiv.textContent = `Level: ${this.app.wordManager.currentLevel} | Mode: ${this.getModeName(this.currentMode)} | All incorrect words mastered!`;

    // Add a button to continue to the next unit
    const continueButton = document.createElement('button');
    continueButton.textContent = 'Continue to Next Unit';
    continueButton.className = 'continue-button';
    continueButton.addEventListener('click', () => {
      this.app.wordManager.toggleIncorrectWordsReview(false);
      this.app.nextWord();
    });

    // Add the button to the container
    this.elements.container.appendChild(continueButton);
  }

  /**
   * Show completion message for all units
   */
  showAllUnitsCompleted() {
    if (!this.elements.promptDiv || !this.elements.container || !this.elements.progressDiv) return;

    this.elements.promptDiv.textContent = 'Congratulations! You have completed all units!';

    if (this.elements.feedbackDiv) {
      this.elements.feedbackDiv.textContent = '';
    }

    if (this.elements.resultDiv) {
      this.elements.resultDiv.style.display = 'none';
    }

    if (this.elements.reviewDisplayDiv) {
      this.elements.reviewDisplayDiv.style.display = 'none';
    }

    if (this.elements.promptDisplayDiv) {
      this.elements.promptDisplayDiv.style.display = 'none';
    }

    this.elements.container.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
    this.elements.progressDiv.textContent = `Level: ${this.app.wordManager.currentLevel} | Mode: ${this.getModeName(this.currentMode)} | Total ${this.app.wordManager.totalProgress} words completed.`;
  }

  /**
   * Set the current mode
   * @param {string} mode - The mode to set
   */
  setMode(mode) {
    this.currentMode = mode;

    // Update mode buttons if they exist
    if (this.elements.modeButtons) {
      this.elements.modeButtons.forEach(button => {
        button.checked = button.value === mode;
      });
    }
  }

  /**
   * Update the progress display
   */
  updateProgress() {
    if (!this.elements.progressDiv) return;

    const currentIndex = this.app.wordManager.currentWordIndex + 1;

    // Get the total words count for all units in the level
    let totalWords = 0;
    const wordManager = this.app.wordManager;

    if (wordManager.isReviewingIncorrect()) {
      totalWords = wordManager.incorrectWords.length;
    } else {
      // Use the getTotalWords method to get the total for all units
      totalWords = wordManager.getTotalWords();
    }

    this.elements.progressDiv.textContent = `Level: ${this.app.wordManager.currentLevel} | Mode: ${this.getModeName(this.currentMode)} | Progress: ${currentIndex} / ${totalWords}`;
  }

  /**
   * Update active buttons based on current state
   */
  updateActiveButtons() {
    // Update level buttons
    if (this.elements.levelButtons) {
      this.elements.levelButtons.forEach(button => {
        if (button.getAttribute('data-level') === this.app.wordManager.currentLevel) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }

    // Update mode buttons
    if (this.elements.modeButtons) {
      this.elements.modeButtons.forEach(button => {
        if (button.getAttribute('data-mode') === this.currentMode) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }
  }
}

export default UIManager;
