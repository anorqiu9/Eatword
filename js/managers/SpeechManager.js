/**
 * Manages text-to-speech functionality
 */
export class SpeechManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.englishVoice = null;
        this.chineseVoice = null;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.isInitialized = false;

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

        // Cache the English and Chinese voices for future use
        if (this.voices.length > 0) {
            this.englishVoice = this.voices.find(v => v.lang.startsWith('en'));
            this.chineseVoice = this.voices.find(v => v.lang.startsWith('zh'));

            console.log(`Found English voice: ${this.englishVoice ? this.englishVoice.name : 'None'}`);
            console.log(`Found Chinese voice: ${this.chineseVoice ? this.chineseVoice.name : 'None'}`);
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

        return new Promise((resolve, reject) => {
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

                    // Set slower rate for English words, normal rate for Chinese
                    if (!/[\u4e00-\u9fa5]/.test(text)) {
                        // English word - speak more slowly
                        this.currentUtterance.rate = 0.7; // Slower rate for English
                        console.log('Speaking English word slowly with rate: 0.7');
                    } else {
                        // Chinese text - normal rate
                        this.currentUtterance.rate = 1;
                        console.log('Speaking Chinese text with normal rate: 1');
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
}
