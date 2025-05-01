/**
 * Manages the user interface
 */
export class UIManager {
    constructor(app) {
        this.app = app;
        this.elements = {};
        this.congratulationMessages = [
            "Good job!", "Excellent!", "Well done!", "Perfect!", "Amazing!",
            "做得好！", "太棒了！", "非常好！", "完美！", "加鸡腿", "真厉害！", "你真牛!", "太厉害了!"
        ];
        this.pronunciationPlaceholder = "No IPA available";
        this.incorrectAttempts = 0;
        this.incorrectTimeout = null;
    }

    /**
     * Sanitize a word to create a valid filename
     * @param {string} word - The word to sanitize
     * @returns {string} - A sanitized filename
     */
    sanitizeFilename(word) {
        // Replace any character that's not a-z, A-Z, 0-9, underscore, dot, or hyphen with underscore
        return word.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase();
    }

    /**
     * Generate the initial UI structure
     */
    generateInitialUI() {
        console.log('Generating initial UI structure');
        const container = document.querySelector('.container');
        if (!container) {
            console.error('Container element not found');
            return;
        }

        // Generate basic UI structure
        container.innerHTML = `
            <h1>Vocabulary Practice</h1>
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Initializing application...</p>
            </div>
        `;
    }

    /**
     * Initialize the UI
     */
    initialize() {
        console.log('Initializing UI components');

        // Generate the container HTML
        const container = document.querySelector('.container');
        if (!container) {
            console.error('Container element not found');
            return;
        }

        // Generate the full UI
        container.innerHTML = this.generateContainerHTML();

        // Get DOM references immediately
        this.elements = {
            container: document.querySelector('.container'),
            wordInput: document.getElementById('word-input'),
            checkButton: document.getElementById('check-button'),
            speakButton: document.getElementById('speak-button'),
            nextWordButton: document.getElementById('next-word-button'),
            feedback: document.getElementById('feedback'),
            result: document.getElementById('result'),
            correctWord: document.getElementById('correct-word'),
            meaning: document.getElementById('meaning'),
            progress: document.getElementById('progress'),
            prompt: document.getElementById('prompt'),
            reviewDisplay: document.getElementById('review-display'),
            wordText: document.getElementById('word-text'),
            wordSyllables: document.getElementById('word-syllables'),
            wordPronunciation: document.getElementById('word-pronunciation'),
            wordMeaningReview: document.getElementById('word-meaning-review'),
            wordImageContainer: document.getElementById('word-image-container'),
            wordImage: document.getElementById('word-image'),
            imagePopup: document.getElementById('image-popup'),
            popupImage: document.getElementById('popup-image'),
            imagePopupClose: document.getElementById('image-popup-close'),
            promptDisplay: document.getElementById('prompt-display'),
            attemptCounter: document.getElementById('attempt-counter'),
            modeButtons: document.querySelectorAll('.mode-btn'),
            actionButtons: document.getElementById('action-buttons'),
            shuffleToggle: document.getElementById('shuffle-toggle'),
            scrambleToggle: document.getElementById('scramble-words-checkbox'),
            menuToggle: document.getElementById('menu-toggle'),
            menuContent: document.getElementById('menu-content'),
            englishVoiceSelect: document.getElementById('english-voice-select'),
            chineseVoiceSelect: document.getElementById('chinese-voice-select'),
            englishRateSlider: document.getElementById('english-rate-slider'),
            chineseRateSlider: document.getElementById('chinese-rate-slider'),
            englishRateValue: document.getElementById('english-rate-value'),
            chineseRateValue: document.getElementById('chinese-rate-value')
        };

        // Log the elements to help with debugging
        console.log('UI elements initialized:', Object.keys(this.elements).filter(key => this.elements[key] !== null));
        console.log('Missing UI elements:', Object.keys(this.elements).filter(key => this.elements[key] === null));

        // Check if critical elements exist
        if (!this.elements.checkButton) {
            console.error('Critical element not found: checkButton');
            container.innerHTML = `
                <h1>Error Initializing Application</h1>
                <p>Critical UI elements not found. Please try refreshing the page.</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            `;
            return;
        }

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // Check if elements exist before attaching event listeners
        console.log('Attaching event listeners to UI elements');

        // Log the elements to debug
        console.log('Elements:', this.elements);

        // Check button
        if (this.elements.checkButton) {
            this.elements.checkButton.addEventListener('click', () => {
                this.app.handleCheckAction();
            });
        } else {
            console.warn('Check button element not found');
        }

        // Word input
        if (this.elements.wordInput) {
            this.elements.wordInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' && !this.elements.wordInput.disabled &&
                    this.elements.checkButton && this.elements.checkButton.style.display !== 'none') {
                    event.preventDefault();
                    this.app.handleCheckAction();
                }
            });
        } else {
            console.warn('Word input element not found');
        }

        // Speak button
        if (this.elements.speakButton) {
            this.elements.speakButton.addEventListener('click', () => {
                const currentWord = this.app.wordManager.getCurrentWord();
                if (currentWord) {
                    this.app.speechManager.speak(currentWord.word);
                    if (this.elements.container && this.elements.container.classList.contains('input-visible') &&
                        this.elements.wordInput && !this.elements.wordInput.disabled) {
                        this.elements.wordInput.focus();
                    }
                }
            });
        } else {
            console.warn('Speak button element not found');
        }

        // Next word button
        if (this.elements.nextWordButton) {
            this.elements.nextWordButton.addEventListener('click', () => {
                this.app.wordManager.nextWord(false); // Move to next word without counting as correct
                this.app.loadWord();
            });
        } else {
            console.warn('Next word button element not found');
        }

        // Review display (clickable to speak the word)
        if (this.elements.reviewDisplay) {
            this.elements.reviewDisplay.addEventListener('click', (event) => {
                // Don't trigger speak if clicking on the image
                if (event.target === this.elements.wordImage) {
                    return;
                }

                const currentWord = this.app.wordManager.getCurrentWord();
                if (currentWord) {
                    this.app.speechManager.speak(currentWord.word);
                }
            });
        } else {
            console.warn('Review display element not found');
        }

        // Word image (double-click to show popup)
        if (this.elements.wordImage) {
            this.elements.wordImage.addEventListener('dblclick', () => {
                if (this.elements.wordImage.src && this.elements.wordImage.style.display !== 'none') {
                    this.elements.popupImage.src = this.elements.wordImage.src;
                    this.elements.imagePopup.classList.add('active');
                }
            });
        } else {
            console.warn('Word image element not found');
        }

        // Add event listener to speak the word when the image is clicked
        if (this.elements.wordImage) {
            this.elements.wordImage.addEventListener('click', () => {
                const currentWord = this.app.wordManager.getCurrentWord();
                if (currentWord) {
                    this.app.speechManager.speak(currentWord.word);
                }
            });
        }

        // Image popup close button
        if (this.elements.imagePopupClose) {
            this.elements.imagePopupClose.addEventListener('click', () => {
                this.elements.imagePopup.classList.remove('active');
            });
        } else {
            console.warn('Image popup close button not found');
        }

        // Refine the event listener to close the popup when clicking anywhere within the popup
        if (this.elements.imagePopup) {
            this.elements.imagePopup.addEventListener('click', () => {
                this.elements.imagePopup.classList.remove('active');
            });
        }

        // Prompt display (clickable to speak the word in dictation mode)
        if (this.elements.promptDisplay) {
            this.elements.promptDisplay.addEventListener('click', () => {
                const currentWord = this.app.wordManager.getCurrentWord();
                if (currentWord) {
                    this.app.speechManager.speak(currentWord.word);
                }
            });
        } else {
            console.warn('Prompt display element not found');
        }

        // Mode buttons
        if (this.elements.modeButtons && this.elements.modeButtons.length > 0) {
            this.elements.modeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const newMode = button.getAttribute('data-mode');
                    if (newMode !== this.app.modeManager.getCurrentMode()) {
                        // Update active button
                        this.elements.modeButtons.forEach(btn => {
                            btn.classList.remove('active');
                        });
                        button.classList.add('active');

                        // Set the new mode
                        this.app.modeManager.setMode(newMode);

                        // Handle scramble toggle state based on mode
                        if (this.elements.scrambleToggle) {
                            if (newMode === 'review') {
                                // Enable scramble toggle in review mode
                                this.elements.scrambleToggle.disabled = false;
                            } else {
                                // Disable scramble toggle in other modes
                                this.elements.scrambleToggle.checked = false;
                                this.elements.scrambleToggle.disabled = true;
                                this.app.wordManager.setScrambleEnabled(false);
                            }
                        }

                        this.app.wordManager.resetProgress();
                        this.app.loadWord();
                    }
                });
            });
        } else {
            console.warn('Mode buttons not found');
        }

        // Shuffle toggle
        if (this.elements.shuffleToggle) {
            this.elements.shuffleToggle.addEventListener('change', (event) => {
                this.app.wordManager.setShuffleEnabled(event.target.checked);
                this.app.loadWord();
            });
        }

        // Scramble toggle
        if (this.elements.scrambleToggle) {
            this.elements.scrambleToggle.addEventListener('change', (event) => {
                // Only enable scrambling in review mode
                if (this.app.modeManager.isReviewMode()) {
                    this.app.wordManager.setScrambleEnabled(event.target.checked);
                    this.app.loadWord();
                } else {
                    // If not in review mode, uncheck and disable
                    event.target.checked = false;
                    event.target.disabled = true;
                    this.app.wordManager.setScrambleEnabled(false);
                }
            });
        }

        // Menu toggle
        if (this.elements.menuToggle && this.elements.menuContent) {
            this.elements.menuToggle.addEventListener('click', () => {
                this.elements.menuContent.classList.toggle('visible');
            });
        }

        // Voice settings
        this.setupVoiceSettings();

        // Level dropdown buttons
        document.querySelectorAll('.level-dropdown-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();

                // Cancel any ongoing speech
                this.app.speechManager.cancel();

                const levelId = button.getAttribute('data-level');
                console.log(`Level button clicked: ${levelId}`);

                // Get the dropdown for this level
                const dropdown = document.getElementById(`level-${levelId}-dropdown`);
                if (!dropdown) {
                    console.error(`Dropdown not found for level ${levelId}`);
                    return;
                }

                // Check if this dropdown is currently visible
                const isVisible = dropdown.classList.contains('visible');

                // Hide all dropdowns first
                document.querySelectorAll('.level-dropdown-content').forEach(d => {
                    d.classList.remove('visible');
                });

                // If this is a new level, load it
                if (levelId !== this.app.dataManager.currentLevelId) {
                    // Update active button
                    document.querySelectorAll('.level-dropdown-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    button.classList.add('active');

                    try {
                        // Show loading indicator
                        this.showLoadingIndicator(levelId);

                        // Load the level
                        await this.app.loadLevel(levelId);

                        // Show the dropdown
                        dropdown.classList.add('visible');
                    } catch (error) {
                        console.error(`Error loading level ${levelId}:`, error);
                        this.showErrorMessage(`Error loading level ${levelId}: ${error.message}`);
                    }
                } else if (!isVisible) {
                    // For the current level, just toggle the dropdown visibility
                    dropdown.classList.add('visible');
                }
            });
        });

        // Click outside to close dropdowns
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.level-dropdown')) {
                document.querySelectorAll('.level-dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('visible');
                });
            }
        });

        // Unit option clicks
        document.addEventListener('click', (event) => {
            // Cancel any ongoing speech
            this.app.speechManager.cancel();

            // Check if this is a unit option click
            const unitOption = event.target.closest('.unit-option');
            if (unitOption && !unitOption.hasAttribute('data-processing')) {
                // Mark as processing to prevent double clicks
                unitOption.setAttribute('data-processing', 'true');

                // Clear processing flag after a short delay
                setTimeout(() => {
                    unitOption.removeAttribute('data-processing');
                }, 100);

                // Prevent default and stop propagation
                event.preventDefault();
                event.stopPropagation();

                const levelId = unitOption.getAttribute('data-level');
                const unitAttr = unitOption.getAttribute('data-unit');

                // Handle the unit selection
                this.app.handleUnitSelection(levelId, unitAttr, unitOption);
            }
        });
    }

    /**
     * Rebuild the UI
     */
    rebuildUI() {
        console.log('Rebuilding UI');

        // Get container (either from elements or directly from DOM)
        const container = this.elements.container || document.querySelector('.container');
        if (!container) {
            console.error('Container element not found, cannot rebuild UI');
            return;
        }

        try {
            // Generate HTML for the container
            container.innerHTML = this.generateContainerHTML();
            console.log('Container HTML generated');

            // Force browser to process the new DOM
            void container.offsetHeight;

            // Re-initialize the UI (reuse the initialize method)
            this.initialize();

            // Set active level button
            const currentLevelId = this.app.dataManager.currentLevelId;
            document.querySelectorAll('.level-dropdown-btn').forEach(btn => {
                if (btn.getAttribute('data-level') === currentLevelId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Set active mode button
            const currentMode = this.app.modeManager.getCurrentMode();
            document.querySelectorAll('.mode-btn').forEach(btn => {
                if (btn.getAttribute('data-mode') === currentMode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Set toggle states
            if (this.elements.shuffleToggle) {
                this.elements.shuffleToggle.checked = this.app.wordManager.shuffleEnabled;
            }

            if (this.elements.scrambleToggle) {
                this.elements.scrambleToggle.checked = this.app.wordManager.scrambleEnabled;

                // Disable scramble toggle if not in review mode
                if (currentMode !== 'review') {
                    this.elements.scrambleToggle.disabled = true;
                }
            }

            console.log('UI rebuilt successfully');
        } catch (error) {
            console.error('Error rebuilding UI:', error);
        }
    }

    /**
     * Generate HTML for the container
     * @returns {string} - The HTML for the container
     */
    generateContainerHTML() {
        const currentLevelId = this.app.dataManager.currentLevelId;
        const currentMode = this.app.modeManager.getCurrentMode();
        const shuffleEnabled = this.app.wordManager.shuffleEnabled;
        const scrambleEnabled = this.app.wordManager.scrambleEnabled;

        return `
            <h1>Vocabulary Practice</h1>

            <div class="top-controls">
                <div class="level-buttons">
                    <span>HFLevel:</span>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'C' ? 'active' : ''}" data-level="C">C</button>
                        <div class="level-dropdown-content" id="level-C-dropdown">
                            ${this.generateUnitOptionsHTML('C')}
                        </div>
                    </div>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'D' ? 'active' : ''}" data-level="D">D</button>
                        <div class="level-dropdown-content" id="level-D-dropdown">
                            ${this.generateUnitOptionsHTML('D')}
                        </div>
                    </div>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'E' ? 'active' : ''}" data-level="E">E</button>
                        <div class="level-dropdown-content" id="level-E-dropdown">
                            ${this.generateUnitOptionsHTML('E')}
                        </div>
                    </div>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'F' ? 'active' : ''}" data-level="F">F</button>
                        <div class="level-dropdown-content" id="level-F-dropdown">
                            ${this.generateUnitOptionsHTML('F')}
                        </div>
                    </div>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'G' ? 'active' : ''}" data-level="G">G</button>
                        <div class="level-dropdown-content" id="level-G-dropdown">
                            ${this.generateUnitOptionsHTML('G')}
                        </div>
                    </div>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'H' ? 'active' : ''}" data-level="H">H</button>
                        <div class="level-dropdown-content" id="level-H-dropdown">
                            ${this.generateUnitOptionsHTML('H')}
                        </div>
                    </div>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'I' ? 'active' : ''}" data-level="I">I</button>
                        <div class="level-dropdown-content" id="level-I-dropdown">
                            ${this.generateUnitOptionsHTML('I')}
                        </div>
                    </div>
                    <div class="level-dropdown">
                        <button class="level-dropdown-btn ${currentLevelId === 'J' ? 'active' : ''}" data-level="J">J</button>
                        <div class="level-dropdown-content" id="level-J-dropdown">
                            ${this.generateUnitOptionsHTML('J')}
                        </div>
                    </div>
                </div>

                <div class="mode-buttons">
                    <span>Mode:</span>
                    <button class="mode-btn ${currentMode === 'review' ? 'active' : ''}" data-mode="review" title="See English word, Chinese meaning and pronunciation">Review</button>
                    <button class="mode-btn ${currentMode === 'dictation' ? 'active' : ''}" data-mode="dictation" title="See pronunciation, type the English word">Dictation</button>
                    <button class="mode-btn ${currentMode === 'listening' ? 'active' : ''}" data-mode="listening" title="Listen to the word, type what you hear">Listening</button>
                </div>

                <div class="menu">
                    <button id="menu-toggle">⚙️</button>
                    <div id="menu-content" class="menu-content">
                        <label>
                            <input type="checkbox" id="shuffle-toggle" ${shuffleEnabled ? 'checked' : ''}>
                            <span>Shuffle Word List</span>
                        </label>
                        <label>
                            <input type="checkbox" id="scramble-words-checkbox" ${scrambleEnabled ? 'checked' : ''} ${currentMode !== 'review' ? 'disabled' : ''}>
                            <span>Scramble Words ${currentMode !== 'review' ? '(Review mode only)' : ''}</span>
                        </label>
                        <div class="settings-section">
                            <h3>Voice Settings</h3>

                            <div class="voice-settings-group">
                                <h4>English</h4>
                                <div class="voice-selection">
                                    <label for="english-voice-select">Voice:</label>
                                    <select id="english-voice-select">
                                        <option value="">Loading voices...</option>
                                    </select>
                                </div>
                                <div class="voice-rate">
                                    <label for="english-rate-slider">Rate: <span id="english-rate-value">0.7</span></label>
                                    <input type="range" id="english-rate-slider" min="0.5" max="1.5" step="0.1" value="0.7">
                                </div>
                            </div>

                            <div class="voice-settings-group">
                                <h4>Chinese</h4>
                                <div class="voice-selection">
                                    <label for="chinese-voice-select">Voice:</label>
                                    <select id="chinese-voice-select">
                                        <option value="">Loading voices...</option>
                                    </select>
                                </div>
                                <div class="voice-rate">
                                    <label for="chinese-rate-slider">Rate: <span id="chinese-rate-value">1.0</span></label>
                                    <input type="range" id="chinese-rate-slider" min="0.5" max="1.5" step="0.1" value="1.0">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <div id="review-display" class="display-area">
                <div class="word-content">
                    <div id="word-text" class="word-text"></div>
                    <div id="word-syllables" class="word-syllables"></div>
                    <div id="word-pronunciation" class="word-pronunciation"></div>
                    <div id="word-meaning-review" class="word-meaning" style="display: none;"></div>
                </div>
                <div id="word-image-container" class="word-image-container">
                    <img id="word-image" class="word-image" src="" alt="" style="display: none;">
                </div>
            </div>

            <div id="prompt-display" class="display-area"></div>

            <div id="image-popup" class="image-popup">
                <div class="image-popup-content">
                    <button id="image-popup-close" class="image-popup-close">×</button>
                    <img id="popup-image" src="" alt="">
                </div>
            </div>

            <div id="prompt" class="prompt-text">Please select a mode to start.</div>

            <!-- Feedback area -->
            <div id="feedback">
                <div id="result"></div>
                <p id="correct-word"></p>
                <p id="meaning"></p>
            </div>

            <input type="text" id="word-input" placeholder="Type the word here..." autocomplete="off">
            <div id="attempt-counter"></div>

            <div id="action-buttons">
                <button id="speak-button" style="display: none;">🔊 Speak Word</button>
                <button id="check-button">Check</button>
                <button id="next-word-button">Next Word</button>
            </div>

            <div id="progress"></div>
        `;
    }

    /**
     * Generate HTML for unit options
     * @param {string} levelId - The level ID
     * @returns {string} - The HTML for unit options
     */
    generateUnitOptionsHTML(levelId) {
        const level = this.app.dataManager.getLevel(levelId);

        if (!level) {
            return '<div class="unit-option">Loading units for Level ' + levelId + '...</div>';
        }

        const units = level.units;

        if (units.length === 0) {
            return '<div class="unit-option">No units available for Level ' + levelId + '</div>';
        }

        // Add 'All Units' option
        let html = `
            <div class="unit-option" data-level="${levelId}" data-unit="all">
                <span class="checkbox-indicator">${level.areAllUnitsSelected() ? '☑️' : '⬜'}</span>
                <span>A</span>
                <span class="unit-tooltip">All Units (${units.reduce((total, unit) => total + unit.wordCount, 0)} words)</span>
            </div>
        `;

        // Add individual unit options
        units.forEach(unit => {
            html += `
                <div class="unit-option" data-level="${levelId}" data-unit="${unit.index}">
                    <span class="checkbox-indicator">${level.isUnitSelected(unit.index) ? '☑️' : '⬜'}</span>
                    <span>${unit.index + 1}</span>
                    <span class="unit-tooltip">${unit.name} (${unit.wordCount} words)</span>
                </div>
            `;
        });

        return html;
    }

    /**
     * Show loading indicator
     * @param {string} levelId - The level being loaded
     */
    showLoadingIndicator(levelId) {
        // Check if container exists
        const container = this.elements.container || document.querySelector('.container');
        if (!container) {
            console.error('Container element not found, cannot show loading indicator');
            return;
        }

        container.innerHTML = `
            <h1>Vocabulary Practice</h1>
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading vocabulary data for Level ${levelId}...</p>
                <p class="loading-tip">If loading takes too long, try refreshing the page.</p>
            </div>
        `;
    }

    /**
     * Show error message
     * @param {string} message - The error message
     */
    showErrorMessage(message) {
        // Check if container exists
        const container = this.elements.container || document.querySelector('.container');
        if (!container) {
            console.error('Container element not found, cannot show error message');
            return;
        }

        container.innerHTML = `
            <h1>Error Loading Data</h1>
            <p>${message}</p>
            <p>Please try the following:</p>
            <ul>
                <li>Check your internet connection</li>
                <li>Refresh the page</li>
                <li>Try selecting a different level</li>
                <li>Clear your browser cache</li>
            </ul>
            <div class="error-actions">
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }

    /**
     * Load and display the image for a word
     * @param {Word} word - The word to load the image for
     */
    loadWordImage(word) {
        if (!word || !this.elements.wordImage) {
            return;
        }

        // Hide the image initially
        this.elements.wordImage.style.display = 'none';

        // Create a sanitized filename from the word
        const sanitizedWord = this.sanitizeFilename(word.word);
        const imagePath = `images/${sanitizedWord}.png`;

        // Create a new image to test if it exists
        const testImage = new Image();
        testImage.onload = () => {
            // Image exists, show it
            this.elements.wordImage.src = imagePath;
            this.elements.wordImage.alt = word.word;
            this.elements.wordImage.style.display = 'block';
        };
        testImage.onerror = () => {
            // Image doesn't exist, keep it hidden
            this.elements.wordImage.style.display = 'none';
            this.elements.wordImage.src = '';
            this.elements.wordImage.alt = '';
        };

        // Start loading the image
        testImage.src = imagePath;
    }

    /**
     * Update the UI for the current word
     * @param {Word} word - The current word
     */
    updateWordDisplay(word) {
        if (!word) {
            return;
        }

        const mode = this.app.modeManager.getCurrentMode();
        const scrambleEnabled = this.app.wordManager.scrambleEnabled;

        // Reset UI elements
        this.incorrectAttempts = 0;
        this.elements.feedback.textContent = '';
        this.elements.feedback.className = '';
        this.elements.result.style.display = 'none';
        this.elements.wordInput.value = '';
        this.elements.wordInput.disabled = false;
        this.elements.checkButton.disabled = false;
        this.elements.checkButton.style.display = 'inline-block';
        this.elements.nextWordButton.style.display = 'none';
        this.elements.speakButton.disabled = false;
        this.elements.speakButton.style.display = 'none';
        this.elements.attemptCounter.textContent = '';
        this.elements.reviewDisplay.style.display = 'none';
        this.elements.promptDisplay.style.display = 'none';
        this.elements.promptDisplay.classList.remove('missing-pronunciation');
        this.elements.wordMeaningReview.style.display = 'none';
        this.elements.wordMeaningReview.textContent = '';
        this.elements.wordImage.style.display = 'none';
        this.elements.wordImage.src = '';
        this.elements.wordImage.alt = '';
        this.elements.container.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
        this.elements.container.classList.add('buttons-visible');

        const hasPronunciation = word.pronunciation && word.pronunciation !== this.pronunciationPlaceholder;

        // Try to load the image for the word
        this.loadWordImage(word);

        switch (mode) {
            case 'review':
                this.elements.prompt.textContent = '';
                // Only apply scrambling in review mode
                if (scrambleEnabled && word.scrambledWord) {
                    this.elements.wordText.textContent = word.scrambledWord;
                    // If scrambled, don't show syllables as they won't match
                    this.elements.wordSyllables.textContent = '';
                } else {
                    this.elements.wordText.textContent = word.word;
                    this.elements.wordSyllables.textContent = word.syllables;
                }
                this.elements.wordPronunciation.textContent = word.pronunciation || this.pronunciationPlaceholder;
                this.elements.wordMeaningReview.textContent = word.meaning;
                this.elements.wordMeaningReview.style.display = 'block';
                this.elements.reviewDisplay.style.display = 'flex'; // Ensure flex layout for alignment
                this.elements.container.classList.add('input-visible');
                this.elements.checkButton.textContent = 'Check';
                this.elements.speakButton.style.display = 'inline-block'; // Show speak button in review mode
                this.elements.wordInput.focus();
                break;

            case 'dictation':
                this.elements.prompt.textContent = '';
                if (hasPronunciation) {
                    this.elements.promptDisplay.textContent = word.pronunciation;
                } else {
                    this.elements.promptDisplay.textContent = "(Cannot use this mode: IPA missing for this word)";
                    this.elements.promptDisplay.classList.add('missing-pronunciation');
                    this.elements.wordInput.disabled = true;
                    this.elements.checkButton.disabled = true;
                }
                this.elements.promptDisplay.style.display = 'flex'; // Ensure flex layout for alignment
                this.elements.container.classList.add('input-visible', 'attempts-visible');
                this.elements.checkButton.textContent = 'Check';
                this.elements.speakButton.style.display = 'inline-block'; // Show speak button in dictation mode
                this.updateAttemptCounter();
                if (!this.elements.wordInput.disabled) this.elements.wordInput.focus();

                // Show the image in Dictation mode
                this.elements.wordImageContainer.style.display = 'block';
                this.elements.promptDisplay.appendChild(this.elements.wordImageContainer);
                break;

            case 'listening':
                this.elements.prompt.textContent = '';
                this.elements.container.classList.add('input-visible', 'attempts-visible');
                this.elements.checkButton.textContent = 'Check';
                this.elements.speakButton.style.display = 'inline-block';
                this.updateAttemptCounter();
                this.elements.wordInput.focus();

                // Show the image in Listening mode
                this.elements.wordImage.style.display = 'block';
                break;
        }

        // Speak the word in all modes
        this.app.speechManager.speak(word.word);

        // Update progress display
        this.updateProgressDisplay();
    }

    /**
     * Setup voice settings event listeners
     */
    setupVoiceSettings() {
        // Populate the voice dropdowns
        this.populateVoiceDropdown();

        // English voice selection
        if (this.elements.englishVoiceSelect) {
            this.elements.englishVoiceSelect.addEventListener('change', () => {
                const selectedVoiceName = this.elements.englishVoiceSelect.value;
                if (selectedVoiceName) {
                    if (typeof this.app.speechManager.setEnglishVoice === 'function' && this.app.speechManager.setEnglishVoice(selectedVoiceName)) {
                        // Speak a sample to demonstrate the voice
                        this.app.speechManager.speak('English voice selected');
                    } else {
                        // Fallback: set the voice directly
                        const voice = this.app.speechManager.voices.find(v => v.name === selectedVoiceName);
                        if (voice) {
                            this.app.speechManager.englishVoice = voice;
                            localStorage.setItem('selectedEnglishVoice', selectedVoiceName);
                            this.app.speechManager.speak('English voice selected');
                        }
                    }
                }
            });
        }

        // Chinese voice selection
        if (this.elements.chineseVoiceSelect) {
            this.elements.chineseVoiceSelect.addEventListener('change', () => {
                const selectedVoiceName = this.elements.chineseVoiceSelect.value;
                if (selectedVoiceName) {
                    if (typeof this.app.speechManager.setChineseVoice === 'function' && this.app.speechManager.setChineseVoice(selectedVoiceName)) {
                        // Speak a sample to demonstrate the voice
                        this.app.speechManager.speak('中文语音已选择'); // Chinese voice selected
                    } else {
                        // Fallback: set the voice directly
                        const voice = this.app.speechManager.voices.find(v => v.name === selectedVoiceName);
                        if (voice) {
                            this.app.speechManager.chineseVoice = voice;
                            localStorage.setItem('selectedChineseVoice', selectedVoiceName);
                            this.app.speechManager.speak('中文语音已选择'); // Chinese voice selected
                        }
                    }
                }
            });
        }

        // English rate slider
        if (this.elements.englishRateSlider && this.elements.englishRateValue) {
            this.elements.englishRateSlider.addEventListener('input', () => {
                const rate = parseFloat(this.elements.englishRateSlider.value);
                this.elements.englishRateValue.textContent = rate.toFixed(1);
            });

            this.elements.englishRateSlider.addEventListener('change', () => {
                const rate = parseFloat(this.elements.englishRateSlider.value);
                if (typeof this.app.speechManager.setEnglishRate === 'function' && this.app.speechManager.setEnglishRate(rate)) {
                    // Speak a sample to demonstrate the rate
                    this.app.speechManager.speak('English rate adjusted');
                } else {
                    // Fallback: set the rate directly
                    this.app.speechManager.englishRate = rate;
                    localStorage.setItem('englishRate', rate.toString());
                    this.app.speechManager.speak('English rate adjusted');
                }
            });
        }

        // Chinese rate slider
        if (this.elements.chineseRateSlider && this.elements.chineseRateValue) {
            this.elements.chineseRateSlider.addEventListener('input', () => {
                const rate = parseFloat(this.elements.chineseRateSlider.value);
                this.elements.chineseRateValue.textContent = rate.toFixed(1);
            });

            this.elements.chineseRateSlider.addEventListener('change', () => {
                const rate = parseFloat(this.elements.chineseRateSlider.value);
                if (typeof this.app.speechManager.setChineseRate === 'function' && this.app.speechManager.setChineseRate(rate)) {
                    // Speak a sample to demonstrate the rate
                    this.app.speechManager.speak('中文语速已调整'); // Chinese rate adjusted
                } else {
                    // Fallback: set the rate directly
                    this.app.speechManager.chineseRate = rate;
                    localStorage.setItem('chineseRate', rate.toString());
                    this.app.speechManager.speak('中文语速已调整'); // Chinese rate adjusted
                }
            });
        }
    }

    /**
     * Update the attempt counter
     */
    updateAttemptCounter() {
        const maxAttempts = this.app.modeManager.getMaxAttempts();
        let attemptsText = '';

        for (let i = 0; i < maxAttempts; i++) {
            if (i < this.incorrectAttempts) {
                attemptsText += '❌ ';
            } else {
                attemptsText += '⭕ ';
            }
        }

        this.elements.attemptCounter.textContent = attemptsText;
    }

    /**
     * Populate the voice selection dropdowns with available voices
     */
    populateVoiceDropdown() {
        if (!this.elements.englishVoiceSelect || !this.elements.chineseVoiceSelect) return;

        try {
            // Check if the speech manager has the required methods
            if (!this.app.speechManager.voices) {
                console.warn('Speech manager not fully initialized yet, trying again in 1 second');
                setTimeout(() => this.populateVoiceDropdown(), 1000);
                return;
            }

            // Populate English voices
            let englishVoices = [];
            let currentEnglishVoice = null;

            // Check if the methods exist
            if (typeof this.app.speechManager.getEnglishVoices === 'function') {
                englishVoices = this.app.speechManager.getEnglishVoices();
            } else {
                // Fallback: filter voices manually
                englishVoices = this.app.speechManager.voices.filter(v => v.lang.startsWith('en'));
            }

            if (typeof this.app.speechManager.getSelectedEnglishVoice === 'function') {
                currentEnglishVoice = this.app.speechManager.getSelectedEnglishVoice();
            } else {
                currentEnglishVoice = this.app.speechManager.englishVoice;
            }

            if (englishVoices.length === 0) {
                // If no voices are available yet, try again after a short delay
                console.warn('No English voices found, trying again in 1 second');
                setTimeout(() => this.populateVoiceDropdown(), 1000);
                return;
            }

            // Clear existing options
            this.elements.englishVoiceSelect.innerHTML = '';

            // Add options for each English voice
            englishVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;

                // Select the current voice
                if (currentEnglishVoice && voice.name === currentEnglishVoice.name) {
                    option.selected = true;
                }

                this.elements.englishVoiceSelect.appendChild(option);
            });

            console.log(`Populated dropdown with ${englishVoices.length} English voices`);

            // Populate Chinese voices
            let chineseVoices = [];
            let currentChineseVoice = null;

            // Check if the methods exist
            if (typeof this.app.speechManager.getChineseVoices === 'function') {
                chineseVoices = this.app.speechManager.getChineseVoices();
            } else {
                // Fallback: filter voices manually
                chineseVoices = this.app.speechManager.voices.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
            }

            if (typeof this.app.speechManager.getSelectedChineseVoice === 'function') {
                currentChineseVoice = this.app.speechManager.getSelectedChineseVoice();
            } else {
                currentChineseVoice = this.app.speechManager.chineseVoice;
            }

            // Clear existing options
            this.elements.chineseVoiceSelect.innerHTML = '';

            if (chineseVoices.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No Chinese voices available';
                this.elements.chineseVoiceSelect.appendChild(option);
            } else {
                // Add options for each Chinese voice
                chineseVoices.forEach(voice => {
                    const option = document.createElement('option');
                    option.value = voice.name;
                    option.textContent = `${voice.name} (${voice.lang})`;

                    // Select the current voice
                    if (currentChineseVoice && voice.name === currentChineseVoice.name) {
                        option.selected = true;
                    }

                    this.elements.chineseVoiceSelect.appendChild(option);
                });
                console.log(`Populated dropdown with ${chineseVoices.length} Chinese voices`);
            }

            // Set rate slider values
            if (this.elements.englishRateSlider && this.elements.englishRateValue) {
                let englishRate = 0.7; // Default value

                if (typeof this.app.speechManager.getEnglishRate === 'function') {
                    englishRate = this.app.speechManager.getEnglishRate();
                } else if (this.app.speechManager.englishRate) {
                    englishRate = this.app.speechManager.englishRate;
                }

                this.elements.englishRateSlider.value = englishRate;
                this.elements.englishRateValue.textContent = englishRate.toFixed(1);
            }

            if (this.elements.chineseRateSlider && this.elements.chineseRateValue) {
                let chineseRate = 1.0; // Default value

                if (typeof this.app.speechManager.getChineseRate === 'function') {
                    chineseRate = this.app.speechManager.getChineseRate();
                } else if (this.app.speechManager.chineseRate) {
                    chineseRate = this.app.speechManager.chineseRate;
                }

                this.elements.chineseRateSlider.value = chineseRate;
                this.elements.chineseRateValue.textContent = chineseRate.toFixed(1);
            }
        } catch (error) {
            console.error('Error populating voice dropdowns:', error);
            // Try again after a delay
            setTimeout(() => this.populateVoiceDropdown(), 2000);
        }
    }

    /**
     * Update the progress display
     */
    updateProgressDisplay() {
        const currentLevel = this.app.dataManager.getCurrentLevel();
        const wordManager = this.app.wordManager;
        const modeManager = this.app.modeManager;

        if (!currentLevel) {
            return;
        }

        // Get selected units text
        const selectedUnitIndices = currentLevel.selectedUnitIndices || [];
        const selectedUnitsText = selectedUnitIndices.length > 0 ?
            `Units: ${selectedUnitIndices.map(i => i + 1).join(', ')}` :
            'No units selected';

        // Check if we're reviewing incorrect words
        if (wordManager.isReviewing()) {
            const incorrectCount = wordManager.getIncorrectWordCount();
            this.elements.progress.textContent = `Level: ${currentLevel.id} | ${selectedUnitsText} | Mode: ${modeManager.getModeName()} | Reviewing incorrect words: ${incorrectCount - wordManager.getCurrentProgress()} / ${incorrectCount}`;
            return;
        }

        // Regular progress
        const totalWords = wordManager.getTotalWords();
        const currentProgress = wordManager.getCurrentProgress() + 1; // 1-based for display

        let progressText = `Level: ${currentLevel.id} | ${selectedUnitsText} | Mode: ${modeManager.getModeName()} | Progress: ${currentProgress} / ${totalWords}`;

        // Add incorrect words count if there are any
        const incorrectCount = wordManager.getIncorrectWordCount();
        if (incorrectCount > 0) {
            progressText += ` | Incorrect words: ${incorrectCount}`;
        }

        this.elements.progress.textContent = progressText;
    }

    /**
     * Show the result of a check
     * @param {boolean} isCorrect - Whether the answer was correct
     * @param {Word} word - The current word
     * @param {string} userInput - The user's input
     */
    showCheckResult(isCorrect, word, userInput) {
        if (isCorrect) {
            // Correct answer
            const congratsMessage = this.congratulationMessages[Math.floor(Math.random() * this.congratulationMessages.length)];
            this.elements.feedback.textContent = congratsMessage;
            this.elements.feedback.className = 'correct';
            this.elements.wordInput.disabled = true;
            this.elements.checkButton.style.display = 'none';
            this.elements.nextWordButton.style.display = 'inline-block';

            // Speak the congratulation message
            this.app.speechManager.speak(congratsMessage);
        } else {
            // Incorrect answer
            this.elements.feedback.textContent = `Incorrect: "${userInput}". Try again.`;
            this.elements.feedback.className = 'incorrect';

            // Speak the error message with the correct word
            this.app.speechManager.speak(`Uh-oh, ${word.word}, try again`);

            // Clear the input field to let the user try again
            this.elements.wordInput.value = '';

            if (this.app.modeManager.isListeningMode()) {
                this.incorrectAttempts++;
                this.updateAttemptCounter();

                if (this.incorrectAttempts >= this.app.modeManager.getMaxAttempts()) {
                    if (this.incorrectTimeout) {
                        clearTimeout(this.incorrectTimeout);
                        this.incorrectTimeout = null;
                    }

                    this.elements.feedback.textContent = `Attempts exceeded! You typed "${userInput}". The correct word was: ${word.word}`;
                    this.elements.feedback.className = 'reveal';
                    this.showResultDetails(word);
                    //this.elements.wordInput.disabled = true;
                    //this.elements.checkButton.style.display = 'none';
                    //this.elements.nextWordButton.style.display = 'inline-block';
                    //this.elements.container.classList.remove('attempts-visible');
                } else {
                    if (this.incorrectTimeout) {
                        clearTimeout(this.incorrectTimeout);
                    }

                    // In listening mode, speak the word again after a short delay
                    this.incorrectTimeout = setTimeout(() => {
                        this.app.speechManager.speak(word.word);
                        this.incorrectTimeout = null;
                    }, 1000); // Increased delay to give user time to read the feedback
                }
            } else {
                if (this.incorrectTimeout) {
                    clearTimeout(this.incorrectTimeout);
                }

                this.incorrectTimeout = setTimeout(() => {
                    this.elements.feedback.textContent = '';
                    this.elements.feedback.className = '';
                    this.incorrectTimeout = null;
                }, 1500);
            }
        }
    }

    /**
     * Show detailed results for a word
     * @param {Word} word - The word to show details for
     */
    showResultDetails(word) {
        if (!word) return;

        this.elements.result.style.display = 'block';
        const pronunciationText = word.pronunciation && word.pronunciation !== this.pronunciationPlaceholder ?
            ` ${word.pronunciation}` : '';
        this.elements.correctWord.textContent = `Word: ${word.word}${pronunciationText}`;
        this.elements.meaning.textContent = word.meaning ? `Meaning: ${word.meaning}` : 'Meaning: Not available';
        this.elements.meaning.style.display = 'block';
    }

    /**
     * Show a message when reviewing incorrect words
     * @param {number} count - The number of incorrect words
     */
    showReviewingMessage(count) {
        this.elements.prompt.textContent = `Review Mode: Practicing ${count} words you got wrong. Master them all!`;
    }

    /**
     * Show a completion message
     * @param {string} message - The completion message
     */
    showCompletionMessage(message) {
        this.elements.prompt.textContent = message;
        this.elements.feedback.textContent = '';
        this.elements.result.style.display = 'none';
        this.elements.reviewDisplay.style.display = 'none';
        this.elements.promptDisplay.style.display = 'none';
        this.elements.container.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
    }

    /**
     * Get a random congratulation message
     * @returns {string} - A random congratulation message
     */
    getRandomCongratsMessage() {
        return this.congratulationMessages[Math.floor(Math.random() * this.congratulationMessages.length)];
    }

    /**
     * Update UI elements after rebuilding
     */
    updateUIAfterRebuild() {
        console.log('Updating UI after rebuild');

        try {
            // Set active level button
            const currentLevelId = this.app.dataManager.currentLevelId;
            document.querySelectorAll('.level-dropdown-btn').forEach(btn => {
                if (btn.getAttribute('data-level') === currentLevelId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Set active mode button
            const currentMode = this.app.modeManager.getCurrentMode();
            document.querySelectorAll('.mode-btn').forEach(btn => {
                if (btn.getAttribute('data-mode') === currentMode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Set toggle states
            if (this.elements.shuffleToggle) {
                this.elements.shuffleToggle.checked = this.app.wordManager.shuffleEnabled;
            }

            if (this.elements.scrambleToggle) {
                this.elements.scrambleToggle.checked = this.app.wordManager.scrambleEnabled;

                // Disable scramble toggle if not in review mode
                if (currentMode !== 'review') {
                    this.elements.scrambleToggle.disabled = true;
                }
            }

            console.log('UI updated successfully after rebuild');
        } catch (error) {
            console.error('Error updating UI after rebuild:', error);
        }
    }
}
