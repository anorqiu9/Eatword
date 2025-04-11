// --- DOM References ---
const containerDiv = document.querySelector('.container');
const wordInput = document.getElementById('word-input');
const checkButton = document.getElementById('check-button');
const speakButton = document.getElementById('speak-button');
const nextWordButton = document.getElementById('next-word-button');
const feedbackDiv = document.getElementById('feedback');
const resultDiv = document.getElementById('result');
const correctWordP = document.getElementById('correct-word');
const meaningP = document.getElementById('meaning');
const progressDiv = document.getElementById('progress');
const promptDiv = document.getElementById('prompt');
const reviewDisplayDiv = document.getElementById('review-display');
const wordTextSpan = document.getElementById('word-text');
const wordSyllablesSpan = document.getElementById('word-syllables');
const wordPronunciationSpan = document.getElementById('word-pronunciation');
const wordMeaningReviewSpan = document.getElementById('word-meaning-review');
const promptDisplayDiv = document.getElementById('prompt-display');
const attemptCounterDiv = document.getElementById('attempt-counter');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const actionButtonsDiv = document.getElementById('action-buttons');

// --- Congratulation Messages ---
const congratulationMessages = [
    // English messages
    "Good job!",
    "Excellent!",
    "Well done!",
    "Perfect!",
    "Amazing!",
    // Chinese messages
    "做得好！",
    "太棒了！",
    "非常好！",
    "完美！",
    "加鸡腿",
    "真厉害！",
    "你真牛!",
    "太厉害了!"
];

// --- Word Data with IPA Pronunciation (General American) ---
const wordsData = [
  {
    "unit": "Unit 1",
    "words": [
      {
        "word": "sci-fi movie",
        "syllables": "sci / fi · moo / vie",
        "pronunciation": "/ˈsaɪ.faɪ ˈmuːvi/",
        "meaning": "科幻电影"
      },
      {
        "word": "mystery",
        "syllables": "mys / ter / y",
        "pronunciation": "/ˈmɪstəri/",
        "meaning": "悬疑片"
      },
      {
        "word": "adventure movie",
        "syllables": "ad / ven / ture · moo / vie",
        "pronunciation": "/ədˈventʃər ˈmuːvi/",
        "meaning": "冒险电影"
      },
      {
        "word": "action movie",
        "syllables": "ac / tion · moo / vie",
        "pronunciation": "/ˈækʃən ˈmuːvi/",
        "meaning": "动作电影"
      },
      {
        "word": "fantasy movie",
        "syllables": "fan / ta / sy · moo / vie",
        "pronunciation": "/ˈfæntəsi ˈmuːvi/",
        "meaning": "奇幻电影"
      },
      {
        "word": "horror movie",
        "syllables": "hor / ror · moo / vie",
        "pronunciation": "/ˈhɔrər ˈmuːvi/",
        "meaning": "恐怖电影"
      },
      {
        "word": "stuntwoman",
        "syllables": "stunt / wo / man",
        "pronunciation": "/ˈstʌntˌwʊmən/",
        "meaning": "女特技演员"
      },
      {
        "word": "actress",
        "syllables": "act / ress",
        "pronunciation": "/ˈæktrəs/",
        "meaning": "女演员"
      },
      {
        "word": "cameraman",
        "syllables": "ca / me / ra / man",
        "pronunciation": "/ˈkæmərəˌmæn/",
        "meaning": "摄影师"
      },
      {
        "word": "director",
        "syllables": "di / rec / tor",
        "pronunciation": "/dəˈrektər/",
        "meaning": "导演"
      },
      {
        "word": "actor",
        "syllables": "ac / tor",
        "pronunciation": "/ˈæktər/",
        "meaning": "男演员"
      },
      {
        "word": "martial arts",
        "syllables": "mar / tial · arts",
        "pronunciation": "/ˈmɑrʃəl ɑrts/",
        "meaning": "武术"
      },
      {
        "word": "animated movie",
        "syllables": "an / i / ma / ted · moo / vie",
        "pronunciation": "/ˈænɪmeɪtɪd ˈmuːvi/",
        "meaning": "动画电影"
      },
      {
        "word": "comedy",
        "syllables": "com / e / dy",
        "pronunciation": "/ˈkɑmədi/",
        "meaning": "喜剧"
      },
      {
        "word": "romantic movie",
        "syllables": "ro / man / tic · moo / vie",
        "pronunciation": "/roʊˈmæntɪk ˈmuːvi/",
        "meaning": "爱情电影"
      },
      {
        "word": "exciting",
        "syllables": "ex / cit / ing",
        "pronunciation": "/ɪkˈsaɪtɪŋ/",
        "meaning": "令人兴奋的"
      }
    ]
  }
];



// Initialize unit index and shuffled words
let currentUnitIndex = 0;
shuffledWords = [...wordsData[currentUnitIndex].words];
promptDiv.textContent = 'Please select a mode to start.';


// Remove the old words array
// const words = [...];
// --- End Word Data ---

let currentWordIndex = 0;
let incorrectAttempts = 0;
const MAX_ATTEMPTS = 3;
let currentMode = 'review'; // Default mode
let synth = window.speechSynthesis;
let currentUtterance = null;
const pronunciationPlaceholder = "No IPA available"; // English Placeholder



// --- Functions ---

function shuffleArray(array) { /* ... (same) ... */
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function speakWord(text) {
    if (!text) return;

    // 确保用户已经有交互行为
    if (!document.hasFocus()) {
        console.log('等待用户交互...');
        feedbackDiv.textContent = '请点击页面任意位置以启用语音';
        feedbackDiv.className = 'info';
        return;
    }

    // 取消当前正在播放的语音
    if (synth.speaking) synth.cancel();
    if (currentUtterance) synth.cancel();

    // 确保voices已加载
    let voices = synth.getVoices();
    if (voices.length === 0) {
        synth.onvoiceschanged = () => {
            voices = synth.getVoices();
            if (voices.length > 0) {
                synth.onvoiceschanged = null;
                speakWord(text);
            }
        };
        return;
    }

    // 创建新的语音合成实例
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // 设置事件处理器
    currentUtterance.onend = () => { 
        currentUtterance = null; 
    };

    let retryCount = 0;
    const maxRetries = 3;

    currentUtterance.onerror = (event) => {
        console.error('语音合成错误:', event);
        
        if (retryCount < maxRetries) {
            retryCount++;
            console.log(`尝试重新合成语音 (${retryCount}/${maxRetries})`);
            setTimeout(() => {
                if (synth.speaking) synth.cancel();
                // 重新创建utterance实例
                const newUtterance = new SpeechSynthesisUtterance(text);
                newUtterance.onend = () => { currentUtterance = null; };
                newUtterance.onerror = currentUtterance.onerror;
                
                // 复制所有必要的属性
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
        }
    };

    // 优先选择中文语音，如果没有则使用英文语音
    let selectedVoice = voices.find(voice => voice.lang.startsWith('zh-')) ||
                       voices.find(voice => voice.lang.startsWith('zh_')) ||
                       voices.find(voice => voice.lang.startsWith('en-')) ||
                       voices.find(voice => voice.lang.startsWith('en_'));

    if (selectedVoice) {
        currentUtterance.voice = selectedVoice;
        currentUtterance.pitch = 1.1;  // 略微提高音调
        currentUtterance.rate = 0.9;   // 略微降低语速
    }

    currentUtterance.volume = 1;
    
    try {
        synth.speak(currentUtterance);
    } catch (error) {
        console.error('语音合成初始化失败:', error);
        feedbackDiv.textContent = '语音功能初始化失败，请刷新页面重试';
        feedbackDiv.className = 'incorrect';
    }
}

function showResultDetails() { /* ... (same) ... */
    const currentWordData = shuffledWords[currentWordIndex];
    if (!currentWordData) return;
    resultDiv.style.display = 'block';
    const pronunciationText = currentWordData.pronunciation && currentWordData.pronunciation !== pronunciationPlaceholder ? ` ${currentWordData.pronunciation}` : '';
    correctWordP.textContent = `Word: ${currentWordData.word}${pronunciationText}`;
    meaningP.textContent = currentWordData.meaning ? `Meaning: ${currentWordData.meaning}` : 'Meaning: Not available';
    meaningP.style.display = 'block';
}

function loadWord() {
    // Check if finished
    if (currentWordIndex >= shuffledWords.length) {
        currentUnitIndex++;
        if (currentUnitIndex >= wordsData.length) {
            promptDiv.textContent = 'Congratulations! You have completed all units!';
            feedbackDiv.textContent = '';
            resultDiv.style.display = 'none';
            reviewDisplayDiv.style.display = 'none';
            promptDisplayDiv.style.display = 'none';
            containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
            progressDiv.textContent = `Mode: ${getModeName(currentMode)} | Total ${shuffledWords.length} words completed.`;
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
    let hasPronunciation = currentWordData.pronunciation && currentWordData.pronunciation !== pronunciationPlaceholder;

    switch (currentMode) {
        case 'review':
            promptDiv.textContent = 'Review Mode: See the word and IPA, type the word.';
            wordTextSpan.textContent = currentWordData.word;
            // Add syllable splitting
            const syllables = currentWordData.syllables;
            wordSyllablesSpan.textContent = syllables;
            wordPronunciationSpan.textContent = currentWordData.pronunciation || pronunciationPlaceholder;
            wordMeaningReviewSpan.textContent = currentWordData.meaning;
            wordMeaningReviewSpan.style.display = 'block';
            reviewDisplayDiv.style.display = 'block';
            containerDiv.classList.add('input-visible');
            checkButton.textContent = 'Check';
            speakButton.style.display = 'inline-block';
            wordInput.focus();
            speakWord(currentWordData.word);
            break;
        case 'dictation':
            promptDiv.textContent = 'Dictation Mode: Type the English word based on the IPA.';
            if (hasPronunciation) {
                promptDisplayDiv.textContent = currentWordData.pronunciation;
                speakWord(currentWordData.word);
            }
            else {
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
            promptDiv.textContent = 'Listening Mode: Listen to the audio, type the English word.';
            containerDiv.classList.add('input-visible', 'attempts-visible');
            checkButton.textContent = 'Check'; speakButton.style.display = 'inline-block';
            updateAttemptCounter();
            wordInput.focus();
            // Use a slight delay to ensure any previous speech has time to potentially clear
            setTimeout(() => speakWord(currentWordData.word), 150);
            break;
    }
    updateProgress();
}

function handleCheckAction() {
    if (currentWordIndex >= shuffledWords.length || checkButton.disabled || checkButton.style.display === 'none') return;

    const currentWordData = shuffledWords[currentWordIndex];
    const userInput = wordInput.value.trim().toLowerCase();
    const correctWordLower = currentWordData.word.toLowerCase();
    const nextWordData = currentWordIndex + 1 < shuffledWords.length ? shuffledWords[currentWordIndex + 1] : null;

    if (userInput === correctWordLower) {
        feedbackDiv.textContent = 'Correct!';
        feedbackDiv.className = 'correct';
        if (nextWordData) {
            const randomMessage = congratulationMessages[Math.floor(Math.random() * congratulationMessages.length)];
            speakWord(randomMessage);
            setTimeout(() => {
                currentWordIndex++;
                loadWord();
            }, 1000);
        } else {
            currentWordIndex++;
            loadWord();
        }
        return;
    } else {
        feedbackDiv.textContent = 'Incorrect, please try again.';
        feedbackDiv.className = 'incorrect';
        wordInput.value = '';
        wordInput.focus();
        speakWord("Uh-oh, try again");
        setTimeout(() => speakWord(currentWordData.word), 2000);
        /*
        if (currentMode === 'listening' || currentMode === 'review') {
            setTimeout(() => speakWord(currentWordData.word), 1000);
        }
            */
        if (currentMode === 'listening') {
            incorrectAttempts++;
            updateAttemptCounter();
            if (incorrectAttempts >= MAX_ATTEMPTS) {
                feedbackDiv.textContent = `Attempts exceeded! The correct word was: ${currentWordData.word}`;
                feedbackDiv.className = 'reveal';
                showResultDetails();
                wordInput.disabled = true;
                checkButton.style.display = 'none';
                nextWordButton.style.display = 'inline-block';
                containerDiv.classList.remove('attempts-visible');
            }
        }
    }
}

function updateAttemptCounter() { /* ... (same) ... */
     if ((currentMode === 'dictation' || currentMode === 'listening') && !wordInput.disabled) {
       attemptCounterDiv.textContent = `Attempts remaining: ${MAX_ATTEMPTS - incorrectAttempts}`;
     } else {
       attemptCounterDiv.textContent = '';
     }
}
function updateProgress() { /* ... (same) ... */
     progressDiv.textContent = `Mode: ${getModeName(currentMode)} | Progress: ${currentWordIndex + 1} / ${shuffledWords.length}`;
 }
function getModeName(modeValue) { /* ... (same) ... */
     switch(modeValue) { case 'review': return 'Review'; case 'dictation': return 'Dictation'; case 'listening': return 'Listening'; default: return ''; }
 }

// --- Event Listeners ---

checkButton.addEventListener('click', handleCheckAction);
wordInput.addEventListener('keypress', (event) => { /* ... (same) ... */
    if (event.key === 'Enter' && !wordInput.disabled && checkButton.style.display !== 'none') {
        event.preventDefault(); handleCheckAction();
    }
});
speakButton.addEventListener('click', () => { /* ... (same) ... */
    if (currentWordIndex < shuffledWords.length) {
        speakWord(shuffledWords[currentWordIndex].word);
        if (containerDiv.classList.contains('input-visible') && !wordInput.disabled) { wordInput.focus(); }
    }
});
nextWordButton.addEventListener('click', () => { /* ... (same) ... */
    currentWordIndex++; loadWord();
});
modeRadios.forEach(radio => { /* ... (same) ... */
    radio.addEventListener('change', (event) => {
        currentMode = event.target.value; currentWordIndex = 0; shuffleArray(shuffledWords); loadWord();
    });
});

// --- Initialization ---
let speechInitialized = false;
function initializeSpeech() { /* ... (same as V4.1) ... */
    if (!speechInitialized) {
        try { if (synth.paused) synth.resume(); const silentUtterance = new SpeechSynthesisUtterance(''); silentUtterance.volume = 0; synth.speak(silentUtterance); speechInitialized = true; console.log("Speech synthesis potentially initialized."); }
        catch (error) { console.error("Speech synthesis initialization failed:", error); promptDiv.textContent = 'Speech synthesis could not be initialized. Audio might not work.'; }
        finally { currentMode = document.querySelector('input[name="mode"]:checked').value; shuffleArray(shuffledWords); loadWord(); }
    }
}
containerDiv.classList.remove('input-visible', 'attempts-visible', 'buttons-visible');
promptDiv.textContent = 'Please select a mode and click anywhere on the page to activate audio.';
progressDiv.textContent = `Mode: ${getModeName(currentMode)}`;
document.body.addEventListener('click', initializeSpeech, { once: true });
setTimeout(initializeSpeech, 150);