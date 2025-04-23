/**
 * Manages text-to-speech functionality
 */
export class SpeechManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.englishVoices = [];
        this.chineseVoices = [];
        this.englishVoice = null;
        this.chineseVoice = null;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.isInitialized = false;

        // Load saved settings from localStorage
        this.selectedEnglishVoiceName = localStorage.getItem('selectedEnglishVoice') || null;
        this.selectedChineseVoiceName = localStorage.getItem('selectedChineseVoice') || null;
        this.englishRate = parseFloat(localStorage.getItem('englishRate') || '0.7');
        this.chineseRate = parseFloat(localStorage.getItem('chineseRate') || '1.0');

        // Load voices when available
        this.synth.onvoiceschanged = this.loadVoices.bind(this);
        this.loadVoices();
    }

    /**
     * Load available voices
     */
    loadVoices() {
        this.voices = this.synth.getVoices();
        console.log(`Loaded ${this.voices.length} voices`);

        // Filter and cache English and Chinese voices
        if (this.voices.length > 0) {
            // Get all English voices
            this.englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
            console.log(`Found ${this.englishVoices.length} English voices`);

            // Get all Chinese voices
            this.chineseVoices = this.voices.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
            console.log(`Found ${this.chineseVoices.length} Chinese voices`);

            // Try to find the previously selected English voice
            if (this.selectedEnglishVoiceName) {
                const savedEnglishVoice = this.englishVoices.find(v => v.name === this.selectedEnglishVoiceName);
                if (savedEnglishVoice) {
                    this.englishVoice = savedEnglishVoice;
                    console.log(`Using saved English voice: ${savedEnglishVoice.name}`);
                }
            }

            // If no saved English voice or saved voice not found, use the first English voice
            if (!this.englishVoice && this.englishVoices.length > 0) {
                this.englishVoice = this.englishVoices[0];
                console.log(`Using default English voice: ${this.englishVoice.name}`);
            }

            // Try to find the previously selected Chinese voice
            if (this.selectedChineseVoiceName) {
                const savedChineseVoice = this.chineseVoices.find(v => v.name === this.selectedChineseVoiceName);
                if (savedChineseVoice) {
                    this.chineseVoice = savedChineseVoice;
                    console.log(`Using saved Chinese voice: ${savedChineseVoice.name}`);
                }
            }

            // If no saved Chinese voice or saved voice not found, use the first Chinese voice
            if (!this.chineseVoice && this.chineseVoices.length > 0) {
                this.chineseVoice = this.chineseVoices[0];
                console.log(`Using default Chinese voice: ${this.chineseVoice.name}`);
            }

            console.log(`Selected English voice: ${this.englishVoice ? this.englishVoice.name : 'None'}`);
            console.log(`Selected Chinese voice: ${this.chineseVoice ? this.chineseVoice.name : 'None'}`);
        }
    }

    /**
     * Initialize speech synthesis
     * @returns {Promise<boolean>} - Promise resolving to whether initialization was successful
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        // Check if speech synthesis is available
        if (!window.speechSynthesis) {
            console.error("Speech synthesis not supported in this browser");
            return false;
        }

        try {
            // Make sure synth is not paused
            if (this.synth.paused) this.synth.resume();

            // Initialize with a silent utterance
            const silentUtterance = new SpeechSynthesisUtterance('');
            silentUtterance.volume = 0;
            this.synth.speak(silentUtterance);

            // Mark as initialized
            this.isInitialized = true;
            console.log("Speech synthesis initialized.");

            // Make sure voices are loaded
            if (!this.voices || this.voices.length === 0) {
                console.log("No voices loaded yet, trying to load voices...");
                this.loadVoices();

                if (this.voices.length === 0) {
                    // If still no voices, wait for them to load with a timeout
                    return new Promise((resolve) => {
                        // Set a timeout to prevent hanging if voices never load
                        const timeout = setTimeout(() => {
                            console.warn("Voice loading timed out, continuing without voices");
                            resolve(false);
                        }, 3000);

                        this.synth.onvoiceschanged = () => {
                            clearTimeout(timeout);
                            this.loadVoices();
                            resolve(this.voices.length > 0);
                        };
                    });
                }
            }

            return true;
        } catch (error) {
            console.error("Speech synthesis initialization failed:", error);
            return false;
        }
    }

    /**
     * Speak a text
     * @param {string} text - The text to speak
     * @returns {Promise<void>} - Promise resolving when speech is complete or fails
     */
    speak(text) {
        if (!text) {
            console.log('No text to speak');
            return Promise.resolve();
        }

        // Check if speech synthesis is available
        if (!window.speechSynthesis) {
            console.error("Speech synthesis not supported in this browser");
            return Promise.resolve(); // Resolve instead of reject to prevent app from breaking
        }

        // Cancel any ongoing speech
        this.cancel();

        return new Promise((resolve) => {
            // Check if voices are loaded, if not, try to load them
            if (!this.voices || this.voices.length === 0) {
                console.log('No voices available, trying to reload voices');
                this.loadVoices();

                // If still no voices, continue with default voice
                if (!this.voices || this.voices.length === 0) {
                    console.warn('No voices available, using default voice');
                }
            }

            this.currentUtterance = new SpeechSynthesisUtterance(text);

            this.currentUtterance.onend = () => {
                console.log(`Finished speaking: ${text}`);
                this.currentUtterance = null;
                this.isSpeaking = false;
                resolve();
            };

            this.currentUtterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.currentUtterance = null;
                this.isSpeaking = false;
                // Resolve instead of reject to prevent app from breaking
                resolve();
            };

            let selectedVoice = null;

            // Check if the text contains Chinese characters
            if (/[\u4e00-\u9fa5]/.test(text)) {
                // Use cached Chinese voice if available
                if (this.chineseVoice) {
                    selectedVoice = this.chineseVoice;
                    console.log(`Using cached Chinese voice: ${this.chineseVoice.name}`);
                } else if (this.voices && this.voices.length > 0) {
                    // Try to find a Chinese voice
                    selectedVoice = this.voices.find(v => v.lang.startsWith('zh'));
                    if (selectedVoice) {
                        // Cache the voice for future use
                        this.chineseVoice = selectedVoice;
                        console.log(`Found and cached Chinese voice: ${selectedVoice.name}`);
                    }
                }
            } else {
                // Use cached English voice if available
                if (this.englishVoice) {
                    selectedVoice = this.englishVoice;
                    console.log(`Using cached English voice: ${this.englishVoice.name}`);
                } else if (this.voices && this.voices.length > 0) {
                    // Try to find an English voice
                    selectedVoice = this.voices.find(v => v.lang.startsWith('en'));
                    if (selectedVoice) {
                        // Cache the voice for future use
                        this.englishVoice = selectedVoice;
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
                    this.currentUtterance.voice = selectedVoice;
                    // Adjust speech parameters for better quality
                    this.currentUtterance.pitch = 1.0;

                    // Set rate based on language
                    if (!/[\u4e00-\u9fa5]/.test(text)) {
                        // English word - use English rate setting
                        const englishRate = this.englishRate || 0.7; // Default to 0.7 if not set
                        this.currentUtterance.rate = englishRate;
                        console.log(`Speaking English word with rate: ${englishRate}`);
                    } else {
                        // Chinese text - use Chinese rate setting
                        const chineseRate = this.chineseRate || 1.0; // Default to 1.0 if not set
                        this.currentUtterance.rate = chineseRate;
                        console.log(`Speaking Chinese text with rate: ${chineseRate}`);
                    }
                }

                this.currentUtterance.volume = 1.0;
                this.synth.speak(this.currentUtterance);
                this.isSpeaking = true;
                console.log(`Speaking: ${text}`);

                // Add a safety timeout in case the speech synthesis hangs
                setTimeout(() => {
                    if (this.isSpeaking) {
                        console.warn('Speech synthesis timeout, resolving promise');
                        this.isSpeaking = false;
                        resolve();
                    }
                }, 10000); // 10 second timeout
            } catch (error) {
                console.error('Speech synthesis failed:', error);
                this.isSpeaking = false;
                // Resolve instead of reject to prevent app from breaking
                resolve();
            }
        });
    }

    /**
     * Cancel any ongoing speech
     */
    cancel() {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
    }

    /**
     * Check if speech synthesis is speaking
     * @returns {boolean} - Whether speech synthesis is speaking
     */
    isSpeechSynthesisSpeaking() {
        return this.isSpeaking || (this.synth && this.synth.speaking);
    }

    /**
     * Get all available English voices
     * @returns {Array} - Array of English voices
     */
    getEnglishVoices() {
        // If voices aren't loaded yet, try to load them
        if (this.englishVoices.length === 0 && this.voices.length > 0) {
            this.englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
        }
        return this.englishVoices;
    }

    /**
     * Get all available Chinese voices
     * @returns {Array} - Array of Chinese voices
     */
    getChineseVoices() {
        // If voices aren't loaded yet, try to load them
        if (this.chineseVoices.length === 0 && this.voices.length > 0) {
            this.chineseVoices = this.voices.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
        }
        return this.chineseVoices;
    }

    /**
     * Get the currently selected English voice
     * @returns {SpeechSynthesisVoice|null} - The selected English voice or null if none is selected
     */
    getSelectedEnglishVoice() {
        return this.englishVoice;
    }

    /**
     * Get the currently selected Chinese voice
     * @returns {SpeechSynthesisVoice|null} - The selected Chinese voice or null if none is selected
     */
    getSelectedChineseVoice() {
        return this.chineseVoice;
    }

    /**
     * Get the current English speech rate
     * @returns {number} - The current English speech rate
     */
    getEnglishRate() {
        return this.englishRate;
    }

    /**
     * Get the current Chinese speech rate
     * @returns {number} - The current Chinese speech rate
     */
    getChineseRate() {
        return this.chineseRate;
    }

    /**
     * Set the English voice to use
     * @param {string} voiceName - The name of the voice to use
     * @returns {boolean} - Whether the voice was successfully set
     */
    setEnglishVoice(voiceName) {
        // Find the voice by name
        const voice = this.englishVoices.find(v => v.name === voiceName);
        if (voice) {
            this.englishVoice = voice;
            this.selectedEnglishVoiceName = voiceName;
            // Save the selection to localStorage for persistence
            localStorage.setItem('selectedEnglishVoice', voiceName);
            console.log(`English voice set to: ${voiceName}`);
            return true;
        }
        console.warn(`English voice not found: ${voiceName}`);
        return false;
    }

    /**
     * Set the Chinese voice to use
     * @param {string} voiceName - The name of the voice to use
     * @returns {boolean} - Whether the voice was successfully set
     */
    setChineseVoice(voiceName) {
        // Find the voice by name
        const voice = this.chineseVoices.find(v => v.name === voiceName);
        if (voice) {
            this.chineseVoice = voice;
            this.selectedChineseVoiceName = voiceName;
            // Save the selection to localStorage for persistence
            localStorage.setItem('selectedChineseVoice', voiceName);
            console.log(`Chinese voice set to: ${voiceName}`);
            return true;
        }
        console.warn(`Chinese voice not found: ${voiceName}`);
        return false;
    }

    /**
     * Set the English speech rate
     * @param {number} rate - The rate to set (0.5 to 1.5)
     * @returns {boolean} - Whether the rate was successfully set
     */
    setEnglishRate(rate) {
        if (rate >= 0.5 && rate <= 1.5) {
            this.englishRate = rate;
            // Save the selection to localStorage for persistence
            localStorage.setItem('englishRate', rate.toString());
            console.log(`English rate set to: ${rate}`);
            return true;
        }
        console.warn(`Invalid English rate: ${rate}. Must be between 0.5 and 1.5`);
        return false;
    }

    /**
     * Set the Chinese speech rate
     * @param {number} rate - The rate to set (0.5 to 1.5)
     * @returns {boolean} - Whether the rate was successfully set
     */
    setChineseRate(rate) {
        if (rate >= 0.5 && rate <= 1.5) {
            this.chineseRate = rate;
            // Save the selection to localStorage for persistence
            localStorage.setItem('chineseRate', rate.toString());
            console.log(`Chinese rate set to: ${rate}`);
            return true;
        }
        console.warn(`Invalid Chinese rate: ${rate}. Must be between 0.5 and 1.5`);
        return false;
    }
}
