// --- Data Loading ---
let wordsData = [];
let currentLevel = 'H'; // Default to Level H

// Fetch vocabulary data from JSON file based on selected level
async function loadVocabularyData(level = currentLevel) {
    console.log(`loadVocabularyData called with level: ${level}`);
    // Update current level immediately
    currentLevel = level;
    // Reset shuffled words when changing levels
    shuffledWords = [];
    currentWordIndex = 0;
    // Show loading indicator
    document.querySelector('.container').innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading vocabulary data for Level ${level}...</p>
        </div>
    `;

    try {
        const url = `words/HF/level${level}.json`;
        console.log(`Fetching from URL: ${url}`);
        const response = await fetch(url);
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        wordsData = data.units;
        // We already set currentLevel at the beginning of the function
        // Make sure it matches what's in the file
        if (data.level !== currentLevel) {
            console.warn(`Level in file (${data.level}) doesn't match requested level (${currentLevel}). Using requested level.`);
        }
        console.log(`Vocabulary data loaded successfully (Level ${currentLevel}, version ${data.version}, last updated ${data.lastUpdated})`);

        // Store available units for this level
        availableUnits[currentLevel] = wordsData.map((unit, index) => ({
            index,
            name: unit.unit || `Unit ${index + 1}`,
            wordCount: unit.words ? unit.words.length : 0
        }));

        // Initialize selected units if not already set
        if (!selectedUnits[currentLevel]) {
            // By default, select all units
            selectedUnits[currentLevel] = availableUnits[currentLevel].map(unit => unit.index);
        }

        // Rebuild the UI with the loaded data
        rebuildUI();

        // Initialize the app (only once)
        // initializeApp() is called from rebuildUI(), so we don't need to call it again here
    } catch (error) {
        console.error(`Error loading vocabulary data for Level ${level}:`, error);
        document.querySelector('.container').innerHTML = `
            <h1>Error Loading Data</h1>
            <p>Sorry, there was a problem loading the vocabulary data for Level ${level}. Please try refreshing the page or selecting a different level.</p>
            <p>Error details: ${error.message}</p>
        `;
    }
}

// --- DOM References ---
let containerDiv = document.querySelector('.container');
let wordInput = document.getElementById('word-input');
let checkButton = document.getElementById('check-button');
let speakButton = document.getElementById('speak-button');
let nextWordButton = document.getElementById('next-word-button');
let feedbackDiv = document.getElementById('feedback');
let resultDiv = document.getElementById('result');
let correctWordP = document.getElementById('correct-word');
let meaningP = document.getElementById('meaning');
let progressDiv = document.getElementById('progress');
let promptDiv = document.getElementById('prompt');
let reviewDisplayDiv = document.getElementById('review-display');
let wordTextSpan = document.getElementById('word-text');
let wordSyllablesSpan = document.getElementById('word-syllables');
let wordPronunciationSpan = document.getElementById('word-pronunciation');
let wordMeaningReviewSpan = document.getElementById('word-meaning-review');
let promptDisplayDiv = document.getElementById('prompt-display');
let attemptCounterDiv = document.getElementById('attempt-counter');
let modeButtons = document.querySelectorAll('.mode-btn');
let actionButtonsDiv = document.getElementById('action-buttons');
// Level selector is now replaced with buttons

// --- Congratulation Messages ---
const congratulationMessages = [
    "Good job!", "Excellent!", "Well done!", "Perfect!", "Amazing!",
    "做得好！", "太棒了！", "非常好！", "完美！", "加鸡腿", "真厉害！", "你真牛!", "太厉害了!"
];

// Variables for tracking progress
let currentUnitIndex = 0;
let shuffledWords = [];
let incorrectWords = []; // Array to store words that were answered incorrectly
let totalProgress = 0; // Track total words completed across units
let selectedUnits = {}; // Object to track which units are selected for each level
let availableUnits = {}; // Object to store available units for each level

let currentWordIndex = 0;
let incorrectAttempts = 0;
const MAX_ATTEMPTS = 3;
let currentMode = 'review';
let isReviewingIncorrectWords = false; // Flag to indicate if we're reviewing incorrect words
let shuffleEnabled = false; // Flag to control whether words should be shuffled (default: not shuffled)
let scrambleWordsEnabled = false; // Flag to control whether words should be scrambled
let synth = window.speechSynthesis;
let voices = [];
let englishVoice = null;
let chineseVoice = null;
let currentUtterance = null;
let incorrectTimeout = null;
let isSpeaking = false;
const pronunciationPlaceholder = "No IPA available";

// 加载语音列表
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    console.log(`Loaded ${voices.length} voices`);

    // Cache the English and Chinese voices for future use
    if (voices.length > 0) {
        englishVoice = voices.find(v => v.lang.startsWith('en'));
        chineseVoice = voices.find(v => v.lang.startsWith('zh'));

        console.log(`Found English voice: ${englishVoice ? englishVoice.name : 'None'}`);
        console.log(`Found Chinese voice: ${chineseVoice ? chineseVoice.name : 'None'}`);
    }
}

// 确保语音加载完成
window.speechSynthesis.onvoiceschanged = loadVoices;

// Initial load of voices
loadVoices();

// --- Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function scrambleCurrentWords() {
    if (shuffledWords && shuffledWords.length > 0) {
        shuffledWords = shuffledWords.map(wordObj => {
            const scrambledWord = wordObj.word.split('').sort(() => Math.random() - 0.5).join('');
            return { ...wordObj, scrambledWord };
        });
        console.log('Words scrambled');
    }
}

function getTotalWords() {
    return wordsData.reduce((total, unit) => total + unit.words.length, 0);
}

function speakWord(text) {
    if (!text) {
        console.log('No text to speak');
        return;
    }

    // Check if voices are loaded, if not, try to load them
    if (!voices || voices.length === 0) {
        console.log('No voices available, trying to reload voices');
        loadVoices();

        // If still no voices, show error and return
        if (!voices || voices.length === 0) {
            console.error('Failed to load voices');
            feedbackDiv.textContent = '语音功能初始化失败，请刷新页面重试';
            feedbackDiv.className = 'incorrect';
            return;
        }
    }

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.onend = () => {
        console.log(`Finished speaking: ${text}`);
        currentUtterance = null;
        isSpeaking = false;
    };
    currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        feedbackDiv.textContent = '语音合成暂时不可用，请稍后再试';
        feedbackDiv.className = 'incorrect';
        currentUtterance = null;
        isSpeaking = false;
    };

    let selectedVoice = null;

    // Check if the text contains Chinese characters
    if (/[\u4e00-\u9fa5]/.test(text)) {
        // Use cached Chinese voice if available
        if (chineseVoice) {
            selectedVoice = chineseVoice;
            console.log(`Using cached Chinese voice: ${chineseVoice.name}`);
        } else {
            // Try to find a Chinese voice
            selectedVoice = voices.find(v => v.lang.startsWith('zh'));
            if (selectedVoice) {
                // Cache the voice for future use
                chineseVoice = selectedVoice;
                console.log(`Found and cached Chinese voice: ${selectedVoice.name}`);
            }
        }
    } else {
        // Use cached English voice if available
        if (englishVoice) {
            selectedVoice = englishVoice;
            console.log(`Using cached English voice: ${englishVoice.name}`);
        } else {
            // Try to find an English voice
            selectedVoice = voices.find(v => v.lang.startsWith('en'));
            if (selectedVoice) {
                // Cache the voice for future use
                englishVoice = selectedVoice;
                console.log(`Found and cached English voice: ${selectedVoice.name}`);
            }
        }
    }

    if (!selectedVoice) {
        console.warn('No appropriate voice found, using default voice');
    } else {
        console.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    }

    try {
        // Set voice if available
        if (selectedVoice) {
            currentUtterance.voice = selectedVoice;
            // Adjust speech parameters for better quality
            currentUtterance.pitch = 1.0;

            // Set slower rate for English words, normal rate for Chinese
            if (!/[\u4e00-\u9fa5]/.test(text)) {
                // English word - speak more slowly
                currentUtterance.rate = 0.8; // Slower rate for English
                console.log('Speaking English word slowly with rate: 0.7');
            } else {
                // Chinese text - normal rate
                currentUtterance.rate = 1;
                console.log('Speaking Chinese text with normal rate: 0.9');
            }
        }

        currentUtterance.volume = 1.0;
        synth.speak(currentUtterance);
        isSpeaking = true;
        console.log(`Speaking: ${text}`);
    } catch (error) {
        console.error('Speech synthesis initialization failed:', error);
        feedbackDiv.textContent = '语音功能初始化失败，请刷新页面重试';
        feedbackDiv.className = 'incorrect';
        isSpeaking = false;
    }
}

function showResultDetails() {
    const currentWordData = shuffledWords[currentWordIndex];
    if (!currentWordData) return;
    resultDiv.style.display = 'block';
    const pronunciationText = currentWordData.pronunciation && currentWordData.pronunciation !== pronunciationPlaceholder ? ` ${currentWordData.pronunciation}` : '';
    correctWordP.textContent = `Word: ${currentWordData.word}${pronunciationText}`;
    meaningP.textContent = currentWordData.meaning ? `Meaning: ${currentWordData.meaning}` : 'Meaning: Not available';
    meaningP.style.display = 'block';
}

function loadWord() {
    console.log('Loading new word');

    // Check if we have valid data
    if (!wordsData || wordsData.length === 0) {
        console.error('No vocabulary data available');
        promptDiv.textContent = 'Error: No vocabulary data available. Please try selecting a different level.';
        progressDiv.textContent = `Level: ${currentLevel} | No data available | Mode: ${getModeName(currentMode)}`;
        return;
    }

    // Check if we have valid shuffled words
    if (!shuffledWords || shuffledWords.length === 0) {
        console.log('No shuffled words available');

        // Check if any units are selected
        const selectedUnitIndices = selectedUnits[currentLevel] || [];
        if (selectedUnitIndices.length === 0) {
            console.log('No units selected for the current level');
            promptDiv.textContent = 'Please select at least one unit to practice.';
            progressDiv.textContent = `Level: ${currentLevel} | No units selected | Mode: ${getModeName(currentMode)}`;
            return;
        }

        // Try to load words from selected units
        console.log('Attempting to load words from selected units');
        shuffledWords = [];
        selectedUnitIndices.forEach(unitIndex => {
            if (wordsData[unitIndex] && wordsData[unitIndex].words) {
                const unitWords = wordsData[unitIndex].words.map(word => ({
                    ...word,
                    unitIndex // Add unit index to track which unit each word belongs to
                }));
                shuffledWords = shuffledWords.concat(unitWords);
            }
        });

        if (shuffledWords.length > 0) {
            console.log(`Loaded ${shuffledWords.length} words from selected units`);
            if (shuffleEnabled) {
                shuffleArray(shuffledWords);
                console.log('Words shuffled');
            } else {
                console.log('Words kept in original order');
            }
            currentWordIndex = 0;
        } else {
            console.error('No words available in the selected units');
            promptDiv.textContent = 'Error: No words available in the selected units. Please select different units.';
            progressDiv.textContent = `Level: ${currentLevel} | No words available | Mode: ${getModeName(currentMode)}`;
            return;
        }
    }

    if (currentWordIndex >= shuffledWords.length) {
        // Check if we have incorrect words to review
        if (!isReviewingIncorrectWords && incorrectWords.length > 0) {
            // Switch to reviewing incorrect words
            isReviewingIncorrectWords = true;
            shuffledWords = [...incorrectWords];
            if (shuffleEnabled) {
                shuffleArray(shuffledWords);
                console.log('Incorrect words shuffled for review');
            } else {
                console.log('Incorrect words kept in original order for review');
            }
            currentWordIndex = 0;

            // Update UI to indicate we're reviewing incorrect words
            promptDiv.textContent = `Review Mode: Practicing ${incorrectWords.length} words you got wrong. Master them all!`;
            progressDiv.textContent = `Level: ${currentLevel} ${currentUnitIndex + 1} | Mode: ${getModeName(currentMode)} | Reviewing incorrect words: ${incorrectWords.length} remaining`;

            console.log(`Switching to incorrect words review mode. ${incorrectWords.length} words to review.`);

            // Continue with displaying the first incorrect word
            loadWord();
            return;
        }

        // If we were reviewing incorrect words and there are none left, or if there were no incorrect words
        if (isReviewingIncorrectWords && incorrectWords.length === 0) {
            // Reset to normal mode
            isReviewingIncorrectWords = false;

            // Show congratulations message for completing the review
            promptDiv.textContent = 'Great job! You have mastered all the words you previously got wrong!';
            feedbackDiv.textContent = '';
            resultDiv.style.display = 'none';
            reviewDisplayDiv.style.display = 'none';
            promptDisplayDiv.style.display = 'none';
            containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
            progressDiv.textContent = `Level: ${currentLevel} ${currentUnitIndex + 1} | Mode: ${getModeName(currentMode)} | All incorrect words mastered!`;

            // Check if there are more units to continue to
            if (currentUnitIndex + 1 < wordsData.length) {
                // Speak a congratulatory message
                const congratsMessage = 'Great job! Moving to the next unit.';
                promptDiv.textContent = congratsMessage;
                speakWord(congratsMessage);

                // Automatically continue to the next unit after a delay
                setTimeout(() => {
                    // Continue with normal progression
                    currentUnitIndex++;
                    if (currentUnitIndex < wordsData.length) {
                        shuffledWords = [...wordsData[currentUnitIndex].words];
                        if (shuffleEnabled) {
                            shuffleArray(shuffledWords);
                            console.log('Words shuffled for next unit');
                        } else {
                            console.log('Words kept in original order for next unit');
                        }
                        currentWordIndex = 0;
                        loadWord();
                    } else {
                        // All units completed
                        promptDiv.textContent = 'Congratulations! You have completed all units!';
                        progressDiv.textContent = `Level: ${currentLevel} ${currentUnitIndex} | Mode: ${getModeName(currentMode)} | Total ${totalProgress} words completed.`;
                        speakWord('Congratulations! You have completed all units!');
                    }
                }, 3000); // Wait 3 seconds before moving to the next unit
            } else {
                // No more units, show completion message
                const completionMessage = 'Congratulations! You have completed all units in this level!';
                promptDiv.textContent = completionMessage;
                progressDiv.textContent = `Level: ${currentLevel} ${currentUnitIndex} | Mode: ${getModeName(currentMode)} | Total ${totalProgress} words completed.`;
                speakWord(completionMessage);
            }
            return;
        }

        // Normal progression to next unit
        currentUnitIndex++;
        if (currentUnitIndex >= wordsData.length) {
            promptDiv.textContent = 'Congratulations! You have completed all units!';
            feedbackDiv.textContent = '';
            resultDiv.style.display = 'none';
            reviewDisplayDiv.style.display = 'none';
            promptDisplayDiv.style.display = 'none';
            containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
            progressDiv.textContent = `Level: ${currentLevel} ${currentUnitIndex + 1} | Mode: ${getModeName(currentMode)} | Total ${totalProgress} words completed.`;
            return;
        }

        if (wordsData[currentUnitIndex] && wordsData[currentUnitIndex].words) {
            shuffledWords = [...wordsData[currentUnitIndex].words];
            if (shuffleEnabled) {
                shuffleArray(shuffledWords);
                console.log('Words shuffled for next unit');
            } else {
                console.log('Words kept in original order for next unit');
            }
            currentWordIndex = 0;
        } else {
            console.error('Invalid unit data');
            promptDiv.textContent = 'Error: Invalid unit data. Please try selecting a different level.';
            return;
        }
    }
    const currentWordData = shuffledWords[currentWordIndex];
    incorrectAttempts = 0;
    feedbackDiv.textContent = ''; feedbackDiv.className = '';
    resultDiv.style.display = 'none';
    wordInput.value = ''; wordInput.disabled = false;
    checkButton.disabled = false; checkButton.style.display = 'inline-block';
    nextWordButton.style.display = 'none';
    speakButton.disabled = false; speakButton.style.display = 'none';
    attemptCounterDiv.textContent = '';
    reviewDisplayDiv.style.display = 'none'; promptDisplayDiv.style.display = 'none';
    promptDisplayDiv.classList.remove('missing-pronunciation');
    wordMeaningReviewSpan.style.display = 'none'; wordMeaningReviewSpan.textContent = '';
    containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
    containerDiv.classList.add('buttons-visible');
    let hasPronunciation = currentWordData.pronunciation && currentWordData.pronunciation !== pronunciationPlaceholder;

    switch (currentMode) {
        case 'review':
            promptDiv.textContent = '';
            wordTextSpan.textContent = scrambleWordsEnabled ? currentWordData.scrambledWord || currentWordData.word : currentWordData.word;
            wordSyllablesSpan.textContent = currentWordData.syllables;
            wordPronunciationSpan.textContent = currentWordData.pronunciation || pronunciationPlaceholder;
            wordMeaningReviewSpan.textContent = currentWordData.meaning;
            wordMeaningReviewSpan.style.display = 'block';
            reviewDisplayDiv.style.display = 'block';
            containerDiv.classList.add('input-visible');
            checkButton.textContent = 'Check';
            speakButton.style.display = 'none';
            wordInput.focus();
            break;
        case 'dictation':
            promptDiv.textContent = '';
            if (hasPronunciation) {
                promptDisplayDiv.textContent = currentWordData.pronunciation;
            } else {
                promptDisplayDiv.textContent = "(Cannot use this mode: IPA missing for this word)";
                promptDisplayDiv.classList.add('missing-pronunciation');
                wordInput.disabled = true;
                checkButton.disabled = true;
            }
            promptDisplayDiv.style.display = 'block';
            containerDiv.classList.add('input-visible', 'attempts-visible');
            checkButton.textContent = 'Check';
            speakButton.style.display = 'none';
            updateAttemptCounter();
            if (!wordInput.disabled) wordInput.focus();
            break;
        case 'listening':
            promptDiv.textContent = '';
            containerDiv.classList.add('input-visible', 'attempts-visible');
            checkButton.textContent = 'Check'; speakButton.style.display = 'none';
            updateAttemptCounter();
            wordInput.focus();
            break;
    }
    speakWord(currentWordData.word);
    updateProgress();
}

function handleCheckAction() {
    if (currentWordIndex >= shuffledWords.length || checkButton.disabled || checkButton.style.display === 'none') return;

    const currentWordData = shuffledWords[currentWordIndex];
    const userInput = wordInput.value.trim().toLowerCase();
    const correctWordLower = currentWordData.word.toLowerCase();
    const nextWordData = currentWordIndex + 1 < shuffledWords.length ? shuffledWords[currentWordIndex + 1] : null;

    // Debounce input
    wordInput.disabled = true;
    checkButton.disabled = true;
    setTimeout(() => {
        if (checkButton.style.display !== 'none') {
            wordInput.disabled = false;
            checkButton.disabled = false;
            if (containerDiv.classList.contains('input-visible')) wordInput.focus();
        }
    }, 500);

    if (userInput === correctWordLower) {
        feedbackDiv.textContent = 'Correct!';
        feedbackDiv.className = 'correct';
        if (incorrectTimeout) {
            clearTimeout(incorrectTimeout);
            incorrectTimeout = null;
        }

        // If we're in review mode for incorrect words, remove this word from the incorrect words list
        if (isReviewingIncorrectWords) {
            // Find and remove the word from incorrectWords array
            const wordIndex = incorrectWords.findIndex(w => w.word.toLowerCase() === correctWordLower);
            if (wordIndex !== -1) {
                incorrectWords.splice(wordIndex, 1);
                console.log(`Removed word "${currentWordData.word}" from incorrect words list. ${incorrectWords.length} words remaining.`);
            }
        }

        if (nextWordData) {
            const randomMessage = congratulationMessages[Math.floor(Math.random() * congratulationMessages.length)];
            speakWord(randomMessage);
            setTimeout(() => {
                currentWordIndex++;
                totalProgress++; // Increment only on correct answer
                loadWord();
            }, 1000);
        } else {
            currentWordIndex++;
            totalProgress++; // Increment only on correct answer
            loadWord();
        }
        return;
    } else {
        feedbackDiv.textContent = 'Incorrect, please try again.';
        feedbackDiv.className = 'incorrect';
        wordInput.value = '';
        speakWord("Uh-oh");

        // Add the word to incorrectWords array if it's not already there and we're not already reviewing incorrect words
        if (!isReviewingIncorrectWords) {
            const wordExists = incorrectWords.some(w => w.word.toLowerCase() === currentWordData.word.toLowerCase());
            if (!wordExists) {
                incorrectWords.push(currentWordData);
                console.log(`Added word "${currentWordData.word}" to incorrect words list. Total: ${incorrectWords.length}`);
            }
        }
        if (currentMode === 'listening') {
            incorrectAttempts++;
            updateAttemptCounter();
            if (incorrectAttempts >= MAX_ATTEMPTS) {
                if (incorrectTimeout) {
                    clearTimeout(incorrectTimeout);
                    incorrectTimeout = null;
                }
                feedbackDiv.textContent = `Attempts exceeded! The correct word was: ${currentWordData.word}`;
                feedbackDiv.className = 'reveal';
                showResultDetails();
                wordInput.disabled = true;
                checkButton.style.display = 'none';
                nextWordButton.style.display = 'inline-block';
                containerDiv.classList.remove('attempts-visible');
            } else {
                if (incorrectTimeout) {
                    clearTimeout(incorrectTimeout);
                }
                incorrectTimeout = setTimeout(() => {
                    speakWord(currentWordData.word);
                    incorrectTimeout = null;
                }, 100);
            }
        } else {
            if (incorrectTimeout) {
                clearTimeout(incorrectTimeout);
            }
            incorrectTimeout = setTimeout(() => {
                speakWord(currentWordData.word);
                incorrectTimeout = null;
            }, 100);
        }
    }
}

function updateAttemptCounter() {
    if ((currentMode === 'dictation' || currentMode === 'listening') && !wordInput.disabled) {
        attemptCounterDiv.textContent = `Attempts remaining: ${MAX_ATTEMPTS - incorrectAttempts}`;
    } else {
        attemptCounterDiv.textContent = '';
    }
}

function updateProgress() {
    const totalWords = getTotalWords();

    // Get selected units for display
    const selectedUnitIndices = selectedUnits[currentLevel] || [];
    const selectedUnitsText = selectedUnitIndices.length > 0 ?
        `Units: ${selectedUnitIndices.map(i => i + 1).join(', ')}` :
        'No units selected';

    if (isReviewingIncorrectWords) {
        // Show progress for incorrect words review
        progressDiv.textContent = `Level: ${currentLevel} | ${selectedUnitsText} | Mode: ${getModeName(currentMode)} | Progress: ${totalProgress + 1} / ${totalWords} | Reviewing incorrect words: ${incorrectWords.length} remaining`;
    } else {
        // Show normal progress
        let progressText = `Level: ${currentLevel} | ${selectedUnitsText} | Mode: ${getModeName(currentMode)} | Progress: ${totalProgress + 1} / ${totalWords}`;

        // Add incorrect words count if there are any
        if (incorrectWords.length > 0) {
            progressText += ` | Incorrect words: ${incorrectWords.length}`;
        }

        progressDiv.textContent = progressText;
    }
}

function getModeName(modeValue) {
    switch(modeValue) {
        case 'review': return 'Review';
        case 'dictation': return 'Dictation';
        case 'listening': return 'Listening';
        default: return '';
    }
}

// Generate unit options HTML for a level dropdown
function generateUnitOptions(level) {
    try {
        // Make sure availableUnits is initialized for this level
        if (!availableUnits[level]) {
            console.log(`No available units for level ${level}, initializing empty array`);
            availableUnits[level] = [];
            return '<div class="unit-option">Loading units for Level ' + level + '...</div>';
        }

        const units = availableUnits[level];
        console.log(`Found ${units.length} units for level ${level}:`, units);

        // If no units are available yet, show a loading message
        if (units.length === 0) {
            return '<div class="unit-option">Loading units for Level ' + level + '...</div>';
        }

        // Make sure selectedUnits is initialized for this level
        if (!selectedUnits[level]) {
            // By default, select all units
            selectedUnits[level] = units.map(unit => unit.index);
            console.log(`Initialized selectedUnits[${level}] to all units:`, selectedUnits[level]);
        }

        const selectedUnitIndices = selectedUnits[level];
        console.log(`Selected units for level ${level}:`, selectedUnitIndices);

        // Add 'All Units' option
        let html = `
            <div class="unit-option" data-level="${level}" data-unit="all">
                <span class="checkbox-indicator">${selectedUnitIndices.length === units.length ? '☑️' : '⬜'}</span>
                <span>A</span>
                <span class="unit-tooltip">All Units (${units.reduce((total, unit) => total + unit.wordCount, 0)} words)</span>
            </div>
        `;

        // Add individual unit options
        units.forEach(unit => {
            html += `
                <div class="unit-option" data-level="${level}" data-unit="${unit.index}">
                    <span class="checkbox-indicator">${selectedUnitIndices.includes(unit.index) ? '☑️' : '⬜'}</span>
                    <span>${unit.index + 1}</span>
                    <span class="unit-tooltip">${unit.name} (${unit.wordCount} words)</span>
                </div>
            `;
        });

        return html;
    } catch (error) {
        console.error(`Error generating unit options for level ${level}:`, error);
        return '<div class="unit-option">Error loading units</div>';
    }
}

// --- Event Listeners ---
checkButton.addEventListener('click', handleCheckAction);
wordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !wordInput.disabled && checkButton.style.display !== 'none') {
        event.preventDefault();

        synth.cancel(); // Clear speech queue
        isSpeaking = false; // Reset speaking state

        handleCheckAction();
    }
});
speakButton.addEventListener('click', () => {
    if (currentWordIndex < shuffledWords.length) {

        synth.cancel(); // Clear speech queue
        isSpeaking = false; // Reset speaking state

        speakWord(shuffledWords[currentWordIndex].word);
        if (containerDiv.classList.contains('input-visible') && !wordInput.disabled) {
            wordInput.focus();
        }
    }
});
nextWordButton.addEventListener('click', () => {
    currentWordIndex++;
    // Do NOT increment totalProgress here since the answer was incorrect
    loadWord();
});
// Mode buttons are now handled in the rebuildUI function

// --- Initialization ---
let speechInitialized = false;
function initializeSpeech() {
    if (!speechInitialized) {
        try {
            // Make sure synth is not paused
            if (synth.paused) synth.resume();

            // Initialize with a silent utterance
            const silentUtterance = new SpeechSynthesisUtterance('');
            silentUtterance.volume = 0;
            synth.speak(silentUtterance);

            // Mark as initialized
            speechInitialized = true;
            console.log("Speech synthesis initialized.");

            // Make sure voices are loaded
            if (!voices || voices.length === 0) {
                console.log("No voices loaded yet, trying to load voices...");
                loadVoices();

                if (voices.length === 0) {
                    // If still no voices, set up the onvoiceschanged event
                    console.log("Still no voices, waiting for voices to load...");
                    synth.onvoiceschanged = () => {
                        loadVoices();
                        if (voices.length > 0) {
                            console.log("Voices loaded successfully:", voices.length);
                            // Check if a mode is selected before loading a word
                            const selectedRadio = document.querySelector('input[name="mode"]:checked');
                            if (selectedRadio) {
                                console.log(`Mode selected: ${selectedRadio.value}, loading word`);
                                loadWord();
                            } else {
                                console.log('No mode selected yet, waiting for user selection');
                            }
                        }
                    };
                }
            }

            // Check if a mode is selected before loading a word
            const selectedRadio = document.querySelector('input[name="mode"]:checked');
            if (selectedRadio) {
                console.log(`Mode selected: ${selectedRadio.value}, loading word`);
                loadWord();
            } else {
                console.log('No mode selected yet, waiting for user selection');
            }
        } catch (error) {
            console.error("Speech synthesis initialization failed:", error);
            promptDiv.textContent = 'Speech synthesis could not be initialized. Click anywhere to try again.';
        }
    }
}

function initializeApp() {
    console.log('Initializing app with wordsData:', wordsData ? wordsData.length + ' units' : 'no data');
    // Initialize unit index and shuffled words
    currentUnitIndex = 0;
    currentWordIndex = 0;
    totalProgress = 0; // Track total words completed across units

    // Reset UI elements
    feedbackDiv.textContent = '';
    resultDiv.style.display = 'none';
    reviewDisplayDiv.style.display = 'none';
    promptDisplayDiv.style.display = 'none';

    // Load words from selected units
    if (wordsData && wordsData.length > 0) {
        // Get selected units for current level
        const selectedUnitIndices = selectedUnits[currentLevel] || [];

        // Handle both cases: units selected or no units selected
        shuffledWords = [];

        if (selectedUnitIndices.length > 0) {
            // Combine words from all selected units
            selectedUnitIndices.forEach(unitIndex => {
                if (wordsData[unitIndex] && wordsData[unitIndex].words) {
                    const unitWords = wordsData[unitIndex].words.map(word => ({
                        ...word,
                        unitIndex // Add unit index to track which unit each word belongs to
                    }));
                    shuffledWords = shuffledWords.concat(unitWords);
                }
            });

            console.log(`Loaded ${shuffledWords.length} words from ${selectedUnitIndices.length} selected units`);

            if (shuffleEnabled) {
                shuffleArray(shuffledWords);
                console.log('Words shuffled during initialization');
            } else {
                console.log('Words kept in original order during initialization');
            }
        } else {
            console.log('No units selected for the current level');
            promptDiv.textContent = 'Please select at least one unit to practice.';
            progressDiv.textContent = `Level: ${currentLevel} | No units selected | Mode: ${getModeName(currentMode)}`;
        }

        // Update UI
        containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
        promptDiv.textContent = 'Please select a mode and click anywhere on the page to activate audio.';

        // Get selected units text for display
        const selectedUnitsText = selectedUnitIndices.length > 0 ?
            `Units: ${selectedUnitIndices.map(i => i + 1).join(', ')}` :
            'No units selected';

        progressDiv.textContent = `Level: ${currentLevel} | ${selectedUnitsText} | Mode: ${getModeName(currentMode)}`;

        // Initialize speech and load first word
        document.body.addEventListener('click', () => {
            if (!speechInitialized) {
                initializeSpeech();
            }
        }, { once: true });
        setTimeout(initializeSpeech, 150);

        // If a mode is already selected, load the first word
        if (currentMode) {
            console.log(`Mode already selected: ${currentMode}, loading first word`);
            loadWord();
        }
    } else {
        shuffledWords = [];
        console.error('No vocabulary data available for the current level');
        promptDiv.textContent = 'Error: No vocabulary data available for this level. Please try selecting a different level.';
        progressDiv.textContent = `Level: ${currentLevel} | No data available`;
    }
}

// Rebuild the UI with the current data
function rebuildUI() {
    console.log('Rebuilding UI');
    // Recreate the container content
    containerDiv.innerHTML = `
        <h1>Vocabulary Practice</h1>

        <div class="top-controls">
            <div class="level-buttons">
                <span>HFLevel:</span>
                <div class="level-dropdown">
                    <button class="level-dropdown-btn ${currentLevel === 'C' ? 'active' : ''}" data-level="C">C</button>
                    <div class="level-dropdown-content" id="level-C-dropdown">
                        ${generateUnitOptions('C')}
                    </div>
                </div>
                <div class="level-dropdown">
                    <button class="level-dropdown-btn ${currentLevel === 'D' ? 'active' : ''}" data-level="D">D</button>
                    <div class="level-dropdown-content" id="level-D-dropdown">
                        ${generateUnitOptions('D')}
                    </div>
                </div>
                <div class="level-dropdown">
                    <button class="level-dropdown-btn ${currentLevel === 'E' ? 'active' : ''}" data-level="E">E</button>
                    <div class="level-dropdown-content" id="level-E-dropdown">
                        ${generateUnitOptions('E')}
                    </div>
                </div>
                <div class="level-dropdown">
                    <button class="level-dropdown-btn ${currentLevel === 'F' ? 'active' : ''}" data-level="F">F</button>
                    <div class="level-dropdown-content" id="level-F-dropdown">
                        ${generateUnitOptions('F')}
                    </div>
                </div>
                <div class="level-dropdown">
                    <button class="level-dropdown-btn ${currentLevel === 'G' ? 'active' : ''}" data-level="G">G</button>
                    <div class="level-dropdown-content" id="level-G-dropdown">
                        ${generateUnitOptions('G')}
                    </div>
                </div>
                <div class="level-dropdown">
                    <button class="level-dropdown-btn ${currentLevel === 'H' ? 'active' : ''}" data-level="H">H</button>
                    <div class="level-dropdown-content" id="level-H-dropdown">
                        ${generateUnitOptions('H')}
                    </div>
                </div>
                <div class="level-dropdown">
                    <button class="level-dropdown-btn ${currentLevel === 'J' ? 'active' : ''}" data-level="J">J</button>
                    <div class="level-dropdown-content" id="level-J-dropdown">
                        ${generateUnitOptions('J')}
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
                        <input type="checkbox" id="scramble-words-checkbox" ${scrambleWordsEnabled ? 'checked' : ''}>
                        <span>Scramble Words</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="divider"></div>

        <div id="review-display" class="display-area">
            <div id="word-text" class="word-text"></div>
            <div id="word-syllables" class="word-syllables"></div>
            <div id="word-pronunciation" class="word-pronunciation"></div>
            <div id="word-meaning-review" class="word-meaning" style="display: none;"></div>
        </div>

        <div id="prompt-display" class="display-area"></div>

        <div id="prompt" class="prompt-text">Please select a mode to start.</div>

        <!-- Feedback area moved up to where prompt was -->
        <div id="feedback">
            <div id="result"></div>
            <p id="correct-word"></p>
            <p id="meaning"></p>
        </div>

        <input type="text" id="word-input" placeholder="Type the word here..." autocomplete="off">
        <div id="attempt-counter"></div>

        <div id="action-buttons">
            <button id="speak-button" style="display: none;">Speak Again</button>
            <button id="check-button">Check</button>
            <button id="next-word-button">Next Word</button>
        </div>

        <div id="progress"></div>
    `;

    // Update DOM references after rebuilding the UI
    // Re-assign all DOM references
    const newContainerDiv = document.querySelector('.container');
    const newWordInput = document.getElementById('word-input');
    const newCheckButton = document.getElementById('check-button');
    const newSpeakButton = document.getElementById('speak-button');
    const newNextWordButton = document.getElementById('next-word-button');
    const newFeedbackDiv = document.getElementById('feedback');
    const newResultDiv = document.getElementById('result');
    const newCorrectWordP = document.getElementById('correct-word');
    const newMeaningP = document.getElementById('meaning');
    const newProgressDiv = document.getElementById('progress');
    const newPromptDiv = document.getElementById('prompt');
    const newReviewDisplayDiv = document.getElementById('review-display');
    const newWordTextSpan = document.getElementById('word-text');
    const newWordSyllablesSpan = document.getElementById('word-syllables');
    const newWordPronunciationSpan = document.getElementById('word-pronunciation');
    const newWordMeaningReviewSpan = document.getElementById('word-meaning-review');
    const newPromptDisplayDiv = document.getElementById('prompt-display');
    const newAttemptCounterDiv = document.getElementById('attempt-counter');
    const newActionButtonsDiv = document.getElementById('action-buttons');

    // Update global references
    containerDiv = newContainerDiv;
    wordInput = newWordInput;
    checkButton = newCheckButton;
    speakButton = newSpeakButton;
    nextWordButton = newNextWordButton;
    feedbackDiv = newFeedbackDiv;
    resultDiv = newResultDiv;
    correctWordP = newCorrectWordP;
    meaningP = newMeaningP;
    progressDiv = newProgressDiv;
    promptDiv = newPromptDiv;
    reviewDisplayDiv = newReviewDisplayDiv;
    wordTextSpan = newWordTextSpan;
    wordSyllablesSpan = newWordSyllablesSpan;
    wordPronunciationSpan = newWordPronunciationSpan;
    wordMeaningReviewSpan = newWordMeaningReviewSpan;
    promptDisplayDiv = newPromptDisplayDiv;
    attemptCounterDiv = newAttemptCounterDiv;
    modeButtons = document.querySelectorAll('.mode-btn');
    actionButtonsDiv = newActionButtonsDiv;

    // Set active level button
    console.log(`Setting active level button for level: ${currentLevel}`);
    document.querySelectorAll('.level-btn').forEach(btn => {
        if (btn.getAttribute('data-level') === currentLevel) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Set active mode button
    console.log(`Setting active mode button for mode: ${currentMode}`);
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.getAttribute('data-mode') === currentMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Re-attach event listeners
    checkButton.addEventListener('click', handleCheckAction);
    wordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !wordInput.disabled && checkButton.style.display !== 'none') {
            event.preventDefault();
            handleCheckAction();
        }
    });
    speakButton.addEventListener('click', () => {
        if (currentWordIndex < shuffledWords.length) {
            speakWord(shuffledWords[currentWordIndex].word);
            if (containerDiv.classList.contains('input-visible') && !wordInput.disabled) {
                wordInput.focus();
            }
        }
    });
    nextWordButton.addEventListener('click', () => {
        currentWordIndex++;
        // Do NOT increment totalProgress here since the answer was incorrect
        loadWord();
    });

    // Make the word area clickable to speak the word
    reviewDisplayDiv.addEventListener('click', () => {
        if (currentWordIndex < shuffledWords.length) {
            speakWord(shuffledWords[currentWordIndex].word);
        }
    });

    // Make the prompt display area (used in dictation mode) clickable to speak the word
    promptDisplayDiv.addEventListener('click', () => {
        if (currentWordIndex < shuffledWords.length) {
            speakWord(shuffledWords[currentWordIndex].word);
        }
    });

    // Add event listeners for level dropdown buttons
    document.querySelectorAll('.level-dropdown-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            // Prevent default action and stop propagation
            event.preventDefault();
            event.stopPropagation();

            // Cancel any ongoing speech to prevent multiple speaking
            if (synth && synth.speaking) {
                synth.cancel();
            }

            const newLevel = button.getAttribute('data-level');
            console.log(`Level button clicked: ${newLevel}`);

            // Get the dropdown for this level
            const dropdown = document.getElementById(`level-${newLevel}-dropdown`);
            if (!dropdown) {
                console.error(`Dropdown not found for level ${newLevel}`);
                return;
            }

            // Check if this dropdown is currently visible
            const isVisible = dropdown.classList.contains('visible');

            // Hide all dropdowns first
            document.querySelectorAll('.level-dropdown-content').forEach(d => {
                d.classList.remove('visible');
            });

            // If this is a new level, load the vocabulary data first
            if (newLevel !== currentLevel) {
                console.log(`Level changed to: ${newLevel}`);

                // Update active button
                document.querySelectorAll('.level-dropdown-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                try {
                    // Load vocabulary data for the new level
                    console.log(`Loading vocabulary data for level ${newLevel}...`);
                    await loadVocabularyData(newLevel);
                    console.log(`Vocabulary data loaded for level ${newLevel}`);

                    // Show the dropdown for the selected level
                    dropdown.classList.add('visible');
                } catch (error) {
                    console.error(`Error loading vocabulary data for level ${newLevel}:`, error);
                }
            } else {
                // For the current level, just toggle the dropdown visibility
                if (!isVisible) {
                    // Make sure we have data for this level before showing the menu
                    if (!availableUnits[newLevel] || availableUnits[newLevel].length === 0) {
                        console.log(`No data available for level ${newLevel}, loading data first...`);
                        try {
                            await loadVocabularyData(newLevel);
                            console.log(`Vocabulary data loaded for level ${newLevel}`);
                        } catch (error) {
                            console.error(`Error loading vocabulary data for level ${newLevel}:`, error);
                            return;
                        }
                    }

                    // Show the dropdown
                    dropdown.classList.add('visible');
                }
            }
        });
    });

    // Add event listener to hide dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.level-dropdown')) {
            document.querySelectorAll('.level-dropdown-content').forEach(dropdown => {
                dropdown.classList.remove('visible');
            });
        }
    });

    // Add event listeners for unit options
    document.addEventListener('click', (event) => {
        // Cancel any ongoing speech to prevent multiple speaking
        if (synth && synth.speaking) {
            synth.cancel();
        }

        // Check if this is a unit option click
        const unitOption = event.target.closest('.unit-option');
        if (unitOption && !unitOption.hasAttribute('data-processing')) {
            // Mark this element as being processed to prevent double processing
            unitOption.setAttribute('data-processing', 'true');

            // Use setTimeout to clear the processing flag after the event has been fully processed
            setTimeout(() => {
                unitOption.removeAttribute('data-processing');
            }, 100);

            // Prevent default action and stop propagation immediately
            event.preventDefault();
            event.stopPropagation();

            const level = unitOption.getAttribute('data-level');
            const unit = unitOption.getAttribute('data-unit');

            console.log(`Unit option clicked: Level ${level}, Unit ${unit}`);
            console.log(`Available units for level ${level}:`, availableUnits[level]);
            console.log(`Selected units for level ${level}:`, selectedUnits[level]);
            const checkboxIndicator = unitOption.querySelector('.checkbox-indicator');
            if (!checkboxIndicator) {
                console.error(`No checkbox indicator found for level ${level}, unit ${unit}`);
            }

            // Make sure availableUnits and selectedUnits are initialized for this level
            if (!availableUnits[level]) {
                availableUnits[level] = [];
            }
            if (!selectedUnits[level]) {
                selectedUnits[level] = [];
            }

            // Determine if this option is currently selected
            let isSelected = false;
            if (unit === 'all') {
                isSelected = selectedUnits[level].length === availableUnits[level].length && availableUnits[level].length > 0;
            } else {
                const unitIndex = parseInt(unit);
                isSelected = selectedUnits[level].includes(unitIndex);
            }

            // Toggle selection state
            isSelected = !isSelected;
            console.log(`Toggling selection for level ${level}, unit ${unit} to ${isSelected}`);

            // Update selected units
            if (!selectedUnits[level]) {
                selectedUnits[level] = [];
                console.log(`Initialized selectedUnits[${level}] to empty array`);
            }

            if (unit === 'all') {
                // Handle 'All Units' option
                if (isSelected && availableUnits[level].length > 0) {
                    // Select all units
                    selectedUnits[level] = availableUnits[level].map(u => u.index);
                    // Update all checkbox indicators
                    document.querySelectorAll(`.unit-option[data-level="${level}"]`).forEach(option => {
                        const indicator = option.querySelector('.checkbox-indicator');
                        if (indicator) {
                            indicator.textContent = '☑️';
                        }
                    });
                } else {
                    // Deselect all units
                    selectedUnits[level] = [];
                    console.log(`Deselected all units for level ${level}`);

                    // Update all checkbox indicators
                    document.querySelectorAll(`.unit-option[data-level="${level}"]`).forEach(option => {
                        const unitAttr = option.getAttribute('data-unit');
                        const indicator = option.querySelector('.checkbox-indicator');
                        if (indicator) {
                            // Uncheck all units including the 'all' option
                            indicator.textContent = '⬜';
                            console.log(`Setting checkbox for unit ${unitAttr} to unchecked`);
                        }
                    });
                }
            } else {
                // Handle individual unit option
                try {
                    const unitIndex = parseInt(unit);
                    console.log(`Processing unit ${unit}, parsed as index ${unitIndex}`);

                    if (isNaN(unitIndex)) {
                        console.error(`Failed to parse unit as integer: ${unit}`);
                        return;
                    }

                    if (isSelected) {
                        // Add unit to selected units if not already included
                        if (!selectedUnits[level].includes(unitIndex)) {
                            selectedUnits[level].push(unitIndex);
                            console.log(`Added unit ${unitIndex} to selectedUnits[${level}]:`, selectedUnits[level]);
                        }
                        // Always update the checkbox indicator
                        if (checkboxIndicator) {
                            checkboxIndicator.textContent = '☑️';
                        }
                    } else {
                        // Allow deselecting any unit, even if it's the last one
                        // Remove unit from selected units
                        selectedUnits[level] = selectedUnits[level].filter(u => u !== unitIndex);
                        console.log(`Removed unit ${unitIndex} from selectedUnits[${level}]:`, selectedUnits[level]);
                        // Always update the checkbox indicator
                        if (checkboxIndicator) {
                            checkboxIndicator.textContent = '⬜';
                        }
                    }
                } catch (error) {
                    console.error(`Error processing unit ${unit} for level ${level}:`, error);
                }

                // Update 'All Units' checkbox indicator
                const allUnitsOption = document.querySelector(`.unit-option[data-level="${level}"][data-unit="all"]`);
                if (allUnitsOption) {
                    const allCheckboxIndicator = allUnitsOption.querySelector('.checkbox-indicator');
                    if (allCheckboxIndicator) {
                        // Check if all available units are selected
                        const allSelected = availableUnits[level].length > 0 &&
                                          selectedUnits[level].length === availableUnits[level].length &&
                                          availableUnits[level].every(unit => selectedUnits[level].includes(unit.index));

                        if (allSelected) {
                            allCheckboxIndicator.textContent = '☑️';
                        } else {
                            allCheckboxIndicator.textContent = '⬜';
                        }
                    }
                }
            }

            // Hide the dropdown immediately
            const dropdown = document.getElementById(`level-${level}-dropdown`);
            if (dropdown) {
                dropdown.classList.remove('visible');
            }

            // Reload words with selected units only if this is the current level
            if (level === currentLevel) {
                /*
                // If no units are selected, select the first unit to prevent errors
                if (selectedUnits[level].length === 0) {
                    // Select at least the first unit if available
                    if (availableUnits[level] && availableUnits[level].length > 0) {
                        selectedUnits[level] = [availableUnits[level][0].index];
                        console.log(`Auto-selected first unit for level ${level} to prevent empty selection`);

                        // Update the checkbox for the first unit
                        const firstUnitOption = document.querySelector(`.unit-option[data-level="${level}"][data-unit="${availableUnits[level][0].index}"]`);
                        if (firstUnitOption) {
                            const indicator = firstUnitOption.querySelector('.checkbox-indicator');
                            if (indicator) {
                                indicator.textContent = '☑️';
                            }
                        }
                    }
                }
                */

                // Use setTimeout with a longer delay to ensure UI updates are complete
                setTimeout(() => {
                    console.log(`Initializing app after unit selection change for level ${level}`);
                    initializeApp();
                }, 100);
            }
        }
    });

    // Add event listeners for mode buttons
    document.querySelectorAll('.mode-btn').forEach(button => {
        button.addEventListener('click', () => {
            const newMode = button.getAttribute('data-mode');
            if (newMode !== currentMode) {
                console.log(`Mode changed to: ${newMode}`);
                // Update active button
                document.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                // Update mode and reset progress
                currentMode = newMode;
                currentWordIndex = 0;
                totalProgress = 0; // Reset progress when changing modes

                // Make sure we have shuffled words
                if (!shuffledWords || shuffledWords.length === 0) {
                    if (wordsData && wordsData.length > 0 && wordsData[currentUnitIndex] && wordsData[currentUnitIndex].words) {
                        console.log('Initializing shuffled words for mode change');
                        shuffledWords = [...wordsData[currentUnitIndex].words];
                    }
                }

                // Shuffle and load
                if (shuffledWords && shuffledWords.length > 0) {
                    if (shuffleEnabled) {
                        shuffleArray(shuffledWords);
                        console.log('Words shuffled for mode change');
                    } else {
                        console.log('Words kept in original order for mode change');
                    }
                    loadWord();
                } else {
                    console.error('No words available to load');
                    promptDiv.textContent = 'Error: No words available. Please try selecting a different level.';
                }
            }
        });
    });

    // Level buttons are now handled directly in their own event listeners above

    // Add event listener for menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const menuContent = document.getElementById('menu-content');
    if (menuToggle && menuContent) {
        menuToggle.addEventListener('click', () => {
            menuContent.classList.toggle('visible');
        });
    }

    // Add shuffle toggle event listener
    const shuffleToggle = document.getElementById('shuffle-toggle');
    if (shuffleToggle) {
        shuffleToggle.checked = shuffleEnabled;
        shuffleToggle.addEventListener('change', (event) => {
            shuffleEnabled = event.target.checked;
            console.log(`Shuffle ${shuffleEnabled ? 'enabled' : 'disabled'}`);

            // If we have words loaded, reshuffle or sort them based on the new setting
            if (shuffledWords && shuffledWords.length > 0) {
                if (shuffleEnabled) {
                    // Reshuffle the words
                    shuffleArray(shuffledWords);
                    console.log('Words reshuffled');
                } else {
                    // Sort words by their original order if possible
                    // This assumes words have some sort of index or order property
                    // If not, we'll just leave them in their current order
                    if (wordsData && wordsData[currentUnitIndex] && wordsData[currentUnitIndex].words) {
                        // Get original words in their natural order
                        const originalWords = [...wordsData[currentUnitIndex].words];
                        // Create a map of words by their text for quick lookup
                        const wordMap = new Map();
                        originalWords.forEach((word, index) => {
                            wordMap.set(word.word.toLowerCase(), { word, index });
                        });

                        // Sort the current shuffled words based on their original order
                        shuffledWords.sort((a, b) => {
                            const aInfo = wordMap.get(a.word.toLowerCase());
                            const bInfo = wordMap.get(b.word.toLowerCase());
                            if (aInfo && bInfo) {
                                return aInfo.index - bInfo.index;
                            }
                            return 0; // Keep original order if we can't find the words
                        });

                        console.log('Words sorted to original order');
                    }
                }

                // Reset to the beginning of the current set of words and reload
                currentWordIndex = 0;
                loadWord(); // Always reload the word to update the display
            }
        });
    }

    // Add scramble toggle event listener
    const scrambleToggle = document.getElementById('scramble-words-checkbox');
    if (scrambleToggle) {
        scrambleToggle.checked = scrambleWordsEnabled;
        scrambleToggle.addEventListener('change', (event) => {
            scrambleWordsEnabled = event.target.checked;
            console.log(`Scramble ${scrambleWordsEnabled ? 'enabled' : 'disabled'}`);

            // Reload words if scramble is enabled
            if (scrambleWordsEnabled && currentMode === 'review') {
                scrambleCurrentWords();
                loadWord();
            }
        });
    }

    // Mode buttons are now handled directly in their own event listeners above
    // Just load the word with the current mode
    if (currentMode) {
        console.log(`Mode already selected: ${currentMode}`);
        loadWord();
    }
}

// Start loading data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing application...');
    console.log(`Initial level set to: ${currentLevel}`);
    loadVocabularyData(currentLevel);
});