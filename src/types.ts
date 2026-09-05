export type LetterType = 'patinig' | 'katinig'; // Vowel (Patinig) or Consonant (Katinig)

export interface FilipinoLetterInfo {
  letter: string; // A, B, C, ... Ñ, NG, ...
  sound: string; // Phonetic sound description, e.g. "/m/", "/ah/"
  filipinoName: string; // e.g. "Em", "Ey", "En-Dye"
  color: string; // Hex color for the segment & letter
  textColor: string; // High contrast text color
  type: LetterType;
  exampleWord: string;
  exampleTranslation: string;
}

export interface WordSegment {
  id: string;
  letter: string; // The letter string, e.g. 'M', 'A', 'S', 'NG'
  duration: number; // Duration in seconds, e.g. 1.0
  color: string;
  textColor: string;
  isSyllableBreakAfter: boolean; // True if a syllable slice cut is placed after this segment
}

export interface SyllableSegmentGroup {
  syllableText: string;
  startIndex: number;
  endIndex: number;
  totalDuration: number;
  color: string;
}

export type PacingPreset = 'slow' | 'normal' | 'fast' | 'custom';

export interface PresetWord {
  word: string;
  english: string;
  category: 'simple' | 'animal' | 'nature' | 'food' | 'special_ng';
  syllables: string[];
}
