// --- Data Loading ---
let wordsData = [];

// Fetch vocabulary data from JSON file
async function loadVocabularyData() {
    // Show loading indicator
    document.querySelector('.container').innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading vocabulary data...</p>
        </div>
    `;

    try {
        const response = await fetch('words.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        wordsData = data.units;
        console.log(`Vocabulary data loaded successfully (version ${data.version}, last updated ${data.lastUpdated})`);

        // Rebuild the UI
        rebuildUI();

        // Initialize the app
        initializeApp();
    } catch (error) {
        console.error('Error loading vocabulary data:', error);
        document.querySelector('.container').innerHTML = `
            <h1>Error Loading Data</h1>
            <p>Sorry, there was a problem loading the vocabulary data. Please try refreshing the page.</p>
            <p>Error details: ${error.message}</p>
        `;
    }
}

// --- DOM References ---
let containerDiv, wordInput, checkButton, speakButton, nextWordButton, feedbackDiv;
let resultDiv, correctWordP, meaningP, progressDiv, promptDiv, reviewDisplayDiv;
let wordTextSpan, wordSyllablesSpan, wordPronunciationSpan, wordMeaningReviewSpan;
let promptDisplayDiv, attemptCounterDiv, modeRadios, actionButtonsDiv;

// Function to rebuild the UI after loading data
function rebuildUI() {
    // Restore the original HTML structure
    document.querySelector('.container').innerHTML = `
        <h1>Vocabulary Practice</h1>

        <div class="mode-selection">
            <label>Select Mode:</label>
            <label><input type="radio" name="mode" value="review" checked> Review</label>
            <label><input type="radio" name="mode" value="dictation"> Dictation (IPA -> Word)</label>
            <label><input type="radio" name="mode" value="listening"> Listening (Audio -> Word)</label>
        </div>

        <div id="review-display" class="display-area">
            <span id="word-text"></span>
            <span id="word-syllables"></span>
            <span id="word-pronunciation"></span>
            <span id="word-meaning-review" style="display: none;"></span>
        </div>
        <div id="prompt-display" class="display-area"></div>

        <div id="prompt">Please select a mode to start.</div>

        <input type="text" id="word-input" placeholder="Type the word here..." autocomplete="off">
        <div id="attempt-counter"></div>

        <div id="action-buttons">
            <button id="speak-button">Speak Again</button>
            <button id="check-button">Check</button>
            <button id="next-word-button" style="display: none;">Next Word</button>
        </div>

        <div id="feedback"></div>

        <div id="result">
            <p id="correct-word"></p>
            <p id="meaning"></p>
        </div>

        <div id="progress"></div>
    `;

    // Re-initialize DOM references
    containerDiv = document.querySelector('.container');
    wordInput = document.getElementById('word-input');
    checkButton = document.getElementById('check-button');
    speakButton = document.getElementById('speak-button');
    nextWordButton = document.getElementById('next-word-button');
    feedbackDiv = document.getElementById('feedback');
    resultDiv = document.getElementById('result');
    correctWordP = document.getElementById('correct-word');
    meaningP = document.getElementById('meaning');
    progressDiv = document.getElementById('progress');
    promptDiv = document.getElementById('prompt');
    reviewDisplayDiv = document.getElementById('review-display');
    wordTextSpan = document.getElementById('word-text');
    wordSyllablesSpan = document.getElementById('word-syllables');
    wordPronunciationSpan = document.getElementById('word-pronunciation');
    wordMeaningReviewSpan = document.getElementById('word-meaning-review');
    promptDisplayDiv = document.getElementById('prompt-display');
    attemptCounterDiv = document.getElementById('attempt-counter');
    modeRadios = document.querySelectorAll('input[name="mode"]');
    actionButtonsDiv = document.getElementById('action-buttons');

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
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentMode = event.target.value;
            currentWordIndex = 0;
            totalProgress = 0; // Reset progress when changing modes
            shuffleArray(shuffledWords);
            loadWord();
        });
    });
}

// --- Congratulation Messages ---
const congratulationMessages = [
    "Good job!", "Excellent!", "Well done!", "Perfect!", "Amazing!",
    "做得好！", "太棒了！", "非常好！", "完美！", "加鸡腿", "真厉害！", "你真牛!", "太厉害了!"
];

// Variables for tracking progress
let currentUnitIndex = 0;
let shuffledWords = [];
let totalProgress = 0; // Track total words completed across units

let currentWordIndex = 0;
let incorrectAttempts = 0;
const MAX_ATTEMPTS = 3;
let currentMode = 'review';
let synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;
let incorrectTimeout = null;
let isSpeaking = false;
const pronunciationPlaceholder = "No IPA available";

    // 加载语音列表
    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
      }

      // 确保语音加载完成
      window.speechSynthesis.onvoiceschanged = loadVoices;

// --- Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
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
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.onend = () => {
        console.log(`Finished speaking: ${text}`);
        currentUtterance = null;
        isSpeaking = false;
    };
    currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        /*
        if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying speech (${retryCount}/${maxRetries})`);
            setTimeout(() => {
                synth.cancel();
                const newUtterance = new SpeechSynthesisUtterance(text);
                newUtterance.onend = () => {
                    currentUtterance = null;
                    isSpeaking = false;
                    console.log(`Retry finished: ${text}`);
                };
                newUtterance.onerror = currentUtterance.onerror;
                if (selectedVoice) {
                    newUtterance.voice = selectedVoice;
                    newUtterance.pitch = 1.1;
                    newUtterance.rate = 0.9;
                }
                newUtterance.volume = 1;
                currentUtterance = newUtterance;
                synth.speak(currentUtterance);
            }, 1000);
        } else {
            feedbackDiv.textContent = '语音合成暂时不可用，请稍后再试';
            feedbackDiv.className = 'incorrect';
            currentUtterance = null;
            isSpeaking = false;
            console.log('Speech synthesis failed after retries');
        }
            //*/
    };
        let selectedVoice = null;
     // 选择适合的语音
     if (/[\u4e00-\u9fa5]/.test(text)) {
        // 中文
        selectedVoice = voices.find(v => v.lang.startsWith('zh') && v.localService);
      } else {
        // 英文
        selectedVoice = voices.find(v => v.lang.startsWith('en') && v.localService);
      }

      if (!selectedVoice) {
        errMessage = "未找到合适语音，请确保启用了语音朗读功能";
        //alert(errMessage);
        console.error(errMessage);
      }

    try {
        currentUtterance.voice = selectedVoice;
        synth.speak(currentUtterance);
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
    if (currentWordIndex >= shuffledWords.length) {
        // Do NOT increment totalProgress here; it should only increment on correct answers
        currentUnitIndex++;
        if (currentUnitIndex >= wordsData.length) {
            promptDiv.textContent = 'Congratulations! You have completed all units!';
            feedbackDiv.textContent = '';
            resultDiv.style.display = 'none';
            reviewDisplayDiv.style.display = 'none';
            promptDisplayDiv.style.display = 'none';
            containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
            progressDiv.textContent = `Mode: ${getModeName(currentMode)} | Total ${totalProgress} words completed.`;
            return;
        }
        shuffledWords = [...wordsData[currentUnitIndex].words];
        currentWordIndex = 0;
    }
    const currentWordData = shuffledWords[currentWordIndex];
    incorrectAttempts = 0;
    feedbackDiv.textContent = ''; feedbackDiv.className = '';
    resultDiv.style.display = 'none';
    wordInput.value = ''; wordInput.disabled = false;
    checkButton.disabled = false; checkButton.style.display = 'inline-block';
    nextWordButton.style.display = 'none';
    speakButton.disabled = false; speakButton.style.display = 'inline-block';
    attemptCounterDiv.textContent = '';
    reviewDisplayDiv.style.display = 'none'; promptDisplayDiv.style.display = 'none';
    promptDisplayDiv.classList.remove('missing-pronunciation');
    wordMeaningReviewSpan.style.display = 'none'; wordMeaningReviewSpan.textContent = '';
    containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
    containerDiv.classList.add('buttons-visible');
    synth.cancel(); // Clear speech queue
    isSpeaking = false; // Reset speaking state
    let hasPronunciation = currentWordData.pronunciation && currentWordData.pronunciation !== pronunciationPlaceholder;

    switch (currentMode) {
        case 'review':
            promptDiv.textContent = 'Review Mode: See the word and IPA, type the word. Click "Speak Again" to hear the word.';
            wordTextSpan.textContent = currentWordData.word;
            wordSyllablesSpan.textContent = currentWordData.syllables;
            wordPronunciationSpan.textContent = currentWordData.pronunciation || pronunciationPlaceholder;
            wordMeaningReviewSpan.textContent = currentWordData.meaning;
            wordMeaningReviewSpan.style.display = 'block';
            reviewDisplayDiv.style.display = 'block';
            containerDiv.classList.add('input-visible');
            checkButton.textContent = 'Check';
            speakButton.style.display = 'inline-block';
            wordInput.focus();
            break;
        case 'dictation':
            promptDiv.textContent = 'Dictation Mode: Type the English word based on the IPA. Click "Speak Again" to hear the word.';
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
            speakButton.style.display = 'inline-block';
            updateAttemptCounter();
            if (!wordInput.disabled) wordInput.focus();
            break;
        case 'listening':
            promptDiv.textContent = 'Listening Mode: Listen to the audio, type the English word. Click "Speak Again" to hear the word.';
            containerDiv.classList.add('input-visible', 'attempts-visible');
            checkButton.textContent = 'Check'; speakButton.style.display = 'inline-block';
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
    progressDiv.textContent = `Mode: ${getModeName(currentMode)} | Progress: ${totalProgress + 1} / ${totalWords}`;
}

function getModeName(modeValue) {
    switch(modeValue) {
        case 'review': return 'Review';
        case 'dictation': return 'Dictation';
        case 'listening': return 'Listening';
        default: return '';
    }
}

// Event listeners are now attached in the rebuildUI() function

// --- Initialization ---
let speechInitialized = false;
function initializeSpeech() {
    if (!speechInitialized) {
        try {
            if (synth.paused) synth.resume();
            const silentUtterance = new SpeechSynthesisUtterance('');
            silentUtterance.volume = 0;
            synth.speak(silentUtterance);
            speechInitialized = true;
            console.log("Speech synthesis potentially initialized.");
            const voices = synth.getVoices();
            if (voices.length === 0) {
                synth.onvoiceschanged = () => {
                    const loadedVoices = synth.getVoices();
                    if (loadedVoices.length > 0) {
                        console.log("Voices loaded:", loadedVoices);
                        loadWord();
                    }
                };
            } else {
                loadWord();
            }
        } catch (error) {
            console.error("Speech synthesis initialization failed:", error);
            promptDiv.textContent = 'Speech synthesis could not be initialized. Click anywhere to try again.';
        }
    }
}

function initializeApp() {
    // Initialize unit index and shuffled words
    currentUnitIndex = 0;
    shuffledWords = [...wordsData[currentUnitIndex].words];
    totalProgress = 0; // Track total words completed across units
    promptDiv.textContent = 'Please select a mode to start.';

    containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
    promptDiv.textContent = 'Please select a mode and click anywhere on the page to activate audio.';
    progressDiv.textContent = `Mode: ${getModeName(currentMode)}`;
    document.body.addEventListener('click', () => {
        if (!speechInitialized) {
            initializeSpeech();
        }
    }, { once: true });
    setTimeout(initializeSpeech, 150);
}

// Start loading data when the page loads
document.addEventListener('DOMContentLoaded', loadVocabularyData);