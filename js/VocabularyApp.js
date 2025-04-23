import { DataManager } from './managers/DataManager.js';
import { SpeechManager } from './managers/SpeechManager.js';
import { WordManager } from './managers/WordManager.js';
import { ModeManager } from './managers/ModeManager.js';
import { UIManager } from './managers/UIManager.js';

/**
 * Main application class for the Vocabulary Practice app
 */
export class VocabularyApp {
    constructor() {
        // Initialize managers
        this.dataManager = new DataManager();
        this.speechManager = new SpeechManager();
        this.wordManager = new WordManager();
        this.modeManager = new ModeManager();
        this.uiManager = new UIManager(this);
    }

    /**
     * Initialize the application
     */
    async initialize() {
        console.log('Initializing Vocabulary Practice application...');

        try {
            // Generate initial UI structure
            this.uiManager.generateInitialUI();

            // Initialize speech synthesis
            await this.speechManager.initialize();

            // Initialize UI components
            this.uiManager.initialize();

            // Load default level (H)
            await this.loadLevel('H');

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
            // Show error in the UI
            const container = document.querySelector('.container');
            if (container) {
                container.innerHTML = `
                    <h1>Error Initializing Application</h1>
                    <p>${error.message}</p>
                    <p>Please try refreshing the page.</p>
                    <button onclick="window.location.reload()">Refresh Page</button>
                `;
            }
        }
    }

    /**
     * Load a vocabulary level
     * @param {string} levelId - The level ID to load
     */
    async loadLevel(levelId) {
        try {
            console.log(`Loading level ${levelId}...`);

            // Show loading indicator
            this.uiManager.showLoadingIndicator(levelId);

            // Load the level data
            const level = await this.dataManager.loadLevel(levelId);

            // Set words from selected units
            this.wordManager.setWords(level.getSelectedWords());

            // Rebuild the UI
            this.uiManager.rebuildUI();

            // Load the first word
            this.loadWord();

            console.log(`Level ${levelId} loaded successfully`);
            return level;
        } catch (error) {
            console.error(`Error loading level ${levelId}:`, error);
            this.uiManager.showErrorMessage(`Error loading level ${levelId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load the current word
     */
    loadWord() {
        const currentWord = this.wordManager.getCurrentWord();

        if (!currentWord) {
            // No words available
            if (this.wordManager.isReviewing()) {
                // Finished reviewing incorrect words
                this.wordManager.finishReviewingIncorrectWords();
                this.uiManager.showCompletionMessage('Great job! You have mastered all the words you previously got wrong!');
            } else if (this.wordManager.getIncorrectWordCount() > 0) {
                // Start reviewing incorrect words
                this.wordManager.startReviewingIncorrectWords();
                this.uiManager.showReviewingMessage(this.wordManager.getIncorrectWordCount());
                this.loadWord(); // Load the first incorrect word
            } else {
                // All words completed
                this.uiManager.showCompletionMessage('Congratulations! You have completed all words!');
            }
            return;
        }

        // Update the UI for the current word
        this.uiManager.updateWordDisplay(currentWord);
    }

    /**
     * Handle the check action
     */
    handleCheckAction() {
        const currentWord = this.wordManager.getCurrentWord();
        if (!currentWord) return;

        const userInput = this.uiManager.elements.wordInput.value.trim();
        const isCorrect = currentWord.checkAnswer(userInput);

        // Show the result
        this.uiManager.showCheckResult(isCorrect, currentWord, userInput);

        if (isCorrect) {
            // Move to the next word
            this.wordManager.nextWord(true);

            // Set a timeout to load the next word
            setTimeout(() => {
                this.loadWord();
            }, 1000);
        }
    }

    /**
     * Handle unit selection
     * @param {string} levelId - The level ID
     * @param {string} unitAttr - The unit attribute (index or 'all')
     * @param {Element} unitOption - The unit option element
     */
    handleUnitSelection(levelId, unitAttr, unitOption) {
        const level = this.dataManager.getLevel(levelId);
        if (!level) return;

        const checkboxIndicator = unitOption.querySelector('.checkbox-indicator');
        if (!checkboxIndicator) return;

        if (unitAttr === 'all') {
            // Handle 'All Units' option
            const allSelected = level.areAllUnitsSelected();

            if (!allSelected) {
                // Select all units
                level.selectAllUnits();

                // Update all checkbox indicators
                document.querySelectorAll(`.unit-option[data-level="${levelId}"]`).forEach(option => {
                    const indicator = option.querySelector('.checkbox-indicator');
                    if (indicator) {
                        indicator.textContent = '☑️';
                    }
                });
            } else {
                // Deselect all units
                level.deselectAllUnits();

                // Update all checkbox indicators
                document.querySelectorAll(`.unit-option[data-level="${levelId}"]`).forEach(option => {
                    const indicator = option.querySelector('.checkbox-indicator');
                    if (indicator) {
                        indicator.textContent = '⬜';
                    }
                });
            }
        } else {
            // Handle individual unit option
            const unitIndex = parseInt(unitAttr);
            if (isNaN(unitIndex)) return;

            // Toggle unit selection
            const isSelected = level.toggleUnitSelection(unitIndex);

            // Update checkbox indicator
            checkboxIndicator.textContent = isSelected ? '☑️' : '⬜';

            // Update 'All Units' checkbox indicator
            const allUnitsOption = document.querySelector(`.unit-option[data-level="${levelId}"][data-unit="all"]`);
            if (allUnitsOption) {
                const allCheckboxIndicator = allUnitsOption.querySelector('.checkbox-indicator');
                if (allCheckboxIndicator) {
                    allCheckboxIndicator.textContent = level.areAllUnitsSelected() ? '☑️' : '⬜';
                }
            }
        }

        // Hide the dropdown
        const dropdown = document.getElementById(`level-${levelId}-dropdown`);
        if (dropdown) {
            dropdown.classList.remove('visible');
        }

        // If this is the current level, reload words
        if (levelId === this.dataManager.currentLevelId) {
            // Set words from selected units
            this.wordManager.setWords(level.getSelectedWords());

            // Load the first word
            this.loadWord();
        }
    }
}
