/**
 * SpeechManager.js - Handles speech synthesis functionality
 * Manages voice loading, selection, and text-to-speech operations
 */
class SpeechManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.englishVoice = null;
    this.chineseVoice = null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.pronunciationPlaceholder = "No IPA available";
    
    // Initialize voices
    this.loadVoices();
    
    // Set up voice change event listener
    if (this.synth) {
      this.synth.onvoiceschanged = this.loadVoices.bind(this);
    }
  }
  
  /**
   * Load available voices and cache English and Chinese voices
   */
  loadVoices() {
    if (!this.synth) return;
    
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
   * Speak text using the appropriate voice
   * @param {string} text - The text to speak
   * @param {HTMLElement} feedbackDiv - Optional element to show feedback if there's an error
   */
  speak(text, feedbackDiv = null) {
    if (!text) {
      console.log('No text to speak');
      return;
    }

    // Check if voices are loaded, if not, try to load them
    if (!this.voices || this.voices.length === 0) {
      console.log('No voices available, trying to reload voices');
      this.loadVoices();

      // If still no voices, show error and return
      if (!this.voices || this.voices.length === 0) {
        console.error('Failed to load voices');
        if (feedbackDiv) {
          feedbackDiv.textContent = '语音功能初始化失败，请刷新页面重试';
          feedbackDiv.className = 'incorrect';
        }
        return;
      }
    }

    // Cancel any ongoing speech
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Set up event handlers
    this.currentUtterance.onend = () => {
      console.log(`Finished speaking: ${text}`);
      this.currentUtterance = null;
      this.isSpeaking = false;
    };
    
    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      if (feedbackDiv) {
        feedbackDiv.textContent = '语音合成暂时不可用，请稍后再试';
        feedbackDiv.className = 'incorrect';
      }
      this.currentUtterance = null;
      this.isSpeaking = false;
    };
    
    // Select appropriate voice based on language
    let selectedVoice = null;
    
    // Check if the text contains Chinese characters
    if (/[\u4e00-\u9fa5]/.test(text)) {
      // Use cached Chinese voice if available
      if (this.chineseVoice) {
        selectedVoice = this.chineseVoice;
        console.log(`Using cached Chinese voice: ${this.chineseVoice.name}`);
      } else {
        // Try to find a Chinese voice
        selectedVoice = this.voices.find(voice => voice.lang.startsWith('zh'));
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
      } else {
        // Try to find an English voice
        selectedVoice = this.voices.find(voice => voice.lang.startsWith('en'));
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
          this.currentUtterance.rate = 0.8; // Slower rate for English
          console.log('Speaking English word slowly with rate: 0.8');
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
    } catch (error) {
      console.error('Speech synthesis initialization failed:', error);
      if (feedbackDiv) {
        feedbackDiv.textContent = '语音功能初始化失败，请刷新页面重试';
        feedbackDiv.className = 'incorrect';
      }
      this.isSpeaking = false;
    }
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
   * Check if speech synthesis is currently active
   * @returns {boolean} True if speaking, false otherwise
   */
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }
}

export default SpeechManager;
