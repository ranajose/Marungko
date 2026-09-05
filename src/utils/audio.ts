// Audio utility for playful phonetic feedback, speech synthesis, and marimba tones

class SoundEngine {
  private ctx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private filipinoVoice: SpeechSynthesisVoice | null = null;
  private letterRecordings: Record<string, string> = {};
  private wordRecordings: Record<string, string> = {};
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadRecordings();
      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadRecordings() {
    try {
      const savedLetters = localStorage.getItem('filipino_blender_letter_recordings');
      if (savedLetters) {
        this.letterRecordings = JSON.parse(savedLetters);
      }
      const savedWords = localStorage.getItem('filipino_blender_word_recordings');
      if (savedWords) {
        this.wordRecordings = JSON.parse(savedWords);
      }
    } catch {
      // Ignore storage errors
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  hasCustomLetterAudio(letter: string): boolean {
    return Boolean(this.letterRecordings[letter.toUpperCase()]);
  }

  hasCustomWordAudio(word: string): boolean {
    return Boolean(this.wordRecordings[word.toUpperCase()]);
  }

  getLetterAudio(letter: string): string | null {
    return this.letterRecordings[letter.toUpperCase()] || null;
  }

  getWordAudio(word: string): string | null {
    return this.wordRecordings[word.toUpperCase()] || null;
  }

  getAllLetterRecordings(): Record<string, string> {
    return { ...this.letterRecordings };
  }

  getAllWordRecordings(): Record<string, string> {
    return { ...this.wordRecordings };
  }

  saveLetterAudio(letter: string, dataUrl: string) {
    this.letterRecordings[letter.toUpperCase()] = dataUrl;
    try {
      localStorage.setItem(
        'filipino_blender_letter_recordings',
        JSON.stringify(this.letterRecordings)
      );
    } catch {}
    this.notify();
  }

  removeLetterAudio(letter: string) {
    delete this.letterRecordings[letter.toUpperCase()];
    try {
      localStorage.setItem(
        'filipino_blender_letter_recordings',
        JSON.stringify(this.letterRecordings)
      );
    } catch {}
    this.notify();
  }

  saveWordAudio(word: string, dataUrl: string) {
    this.wordRecordings[word.toUpperCase()] = dataUrl;
    try {
      localStorage.setItem(
        'filipino_blender_word_recordings',
        JSON.stringify(this.wordRecordings)
      );
    } catch {}
    this.notify();
  }

  removeWordAudio(word: string) {
    delete this.wordRecordings[word.toUpperCase()];
    try {
      localStorage.setItem(
        'filipino_blender_word_recordings',
        JSON.stringify(this.wordRecordings)
      );
    } catch {}
    this.notify();
  }

  private currentAudioElement: HTMLAudioElement | null = null;

  playAudioDataUrl(dataUrl: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (this.currentAudioElement) {
          this.currentAudioElement.pause();
          this.currentAudioElement = null;
        }
        const audio = new Audio(dataUrl);
        this.currentAudioElement = audio;
        audio.onended = () => {
          this.currentAudioElement = null;
          resolve();
        };
        audio.onerror = () => {
          this.currentAudioElement = null;
          resolve();
        };
        audio.play().catch(() => resolve());
        // Safety timeout
        setTimeout(() => resolve(), 3500);
      } catch {
        resolve();
      }
    });
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    
    // Look for Tagalog / Filipino voice, or Indonesian / Spanish / English clear voice as fallback
    const fil = this.voices.find(
      (v) => v.lang.startsWith('tl') || v.lang.startsWith('fil') || v.name.toLowerCase().includes('filipino') || v.name.toLowerCase().includes('tagalog')
    );
    this.filipinoVoice = fil || this.voices.find((v) => v.lang.startsWith('es') || v.lang.startsWith('id')) || this.voices[0] || null;
  }

  // Play a xylophone/marimba friendly chime for a letter, or user's custom recording if available
  playLetterSound(letter: string) {
    const customAudio = this.getLetterAudio(letter);
    if (customAudio) {
      this.playAudioDataUrl(customAudio);
      return;
    }

    const scale = [
      261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0,
    ];
    const index = Math.abs(letter.charCodeAt(0) % scale.length);
    const freq = scale[index];
    this.playTone(freq, 0.28, 'triangle');
  }

  // Play tone helper
  playTone(frequency: number, duration: number = 0.2, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Play pop effect when adding or clicking
  playPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // Play slice sound effect (crisp snap)
  playSliceSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  // Play celebratory fanfare
  playCelebration() {
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.35, 'triangle');
      }, i * 110);
    });
  }

  // Speak letter phoneme or syllable (checks custom recordings first!)
  speakPhoneme(text: string, rate: number = 0.85): Promise<void> {
    const customAudio = this.getLetterAudio(text);
    if (customAudio) {
      return this.playAudioDataUrl(customAudio);
    }

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.playLetterSound(text);
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Convert letter to spoken phonetic utterance for Filipino learners
      let spokenText = text.toLowerCase();
      if (text.toUpperCase() === 'NG') spokenText = 'nga';
      else if (text.toUpperCase() === 'Ñ') spokenText = 'enye';
      else if (text.toUpperCase() === 'M') spokenText = 'mmm';
      else if (text.toUpperCase() === 'S') spokenText = 'sss';
      else if (text.toUpperCase() === 'R') spokenText = 'rrr';
      else if (text.toUpperCase() === 'A') spokenText = 'ah';
      else if (text.toUpperCase() === 'E') spokenText = 'eh';
      else if (text.toUpperCase() === 'I') spokenText = 'ee';
      else if (text.toUpperCase() === 'O') spokenText = 'oh';
      else if (text.toUpperCase() === 'U') spokenText = 'ooh';

      const utterance = new SpeechSynthesisUtterance(spokenText);
      if (this.filipinoVoice) {
        utterance.voice = this.filipinoVoice;
      }
      utterance.rate = rate;
      utterance.pitch = 1.1; // Friendly slightly higher pitch for kids
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      // Fallback timeout in case speech synth gets stuck
      setTimeout(() => resolve(), 1200);

      window.speechSynthesis.speak(utterance);
    });
  }

  // Speak full word with Tagalog / natural pronunciation (checks custom recordings first!)
  speakWord(word: string, rate: number = 0.9): Promise<void> {
    const customAudio = this.getWordAudio(word);
    if (customAudio) {
      return this.playAudioDataUrl(customAudio);
    }

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.playCelebration();
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
      if (this.filipinoVoice) {
        utterance.voice = this.filipinoVoice;
      }
      utterance.rate = rate;
      utterance.pitch = 1.05;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      setTimeout(() => resolve(), 2000);
      window.speechSynthesis.speak(utterance);
    });
  }

  cancelSpeech() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
