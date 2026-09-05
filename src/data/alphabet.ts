import { FilipinoLetterInfo, PresetWord } from '../types';

// The 28 letters of the modern Alpabetong Filipino (Makabagong Alpabetong Filipino)
// User specification: 'M' is red, 'A' is yellow, 'S' is green
export const FILIPINO_ALPHABET: FilipinoLetterInfo[] = [
  {
    letter: 'A',
    sound: 'ah',
    filipinoName: 'Ey',
    color: '#EAB308', // Yellow (as requested: A is yellow)
    textColor: '#78350F',
    type: 'patinig',
    exampleWord: 'Aso',
    exampleTranslation: 'Dog',
  },
  {
    letter: 'B',
    sound: 'buh',
    filipinoName: 'Biy',
    color: '#3B82F6', // Vibrant Blue
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Bata',
    exampleTranslation: 'Child',
  },
  {
    letter: 'C',
    sound: 'kuh/suh',
    filipinoName: 'Siy',
    color: '#EC4899', // Bright Pink
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Camera',
    exampleTranslation: 'Kamera',
  },
  {
    letter: 'D',
    sound: 'duh',
    filipinoName: 'Diy',
    color: '#8B5CF6', // Purple
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Dahon',
    exampleTranslation: 'Leaf',
  },
  {
    letter: 'E',
    sound: 'eh',
    filipinoName: 'Iy',
    color: '#F97316', // Bright Orange
    textColor: '#78350F',
    type: 'patinig',
    exampleWord: 'Eroplano',
    exampleTranslation: 'Airplane',
  },
  {
    letter: 'F',
    sound: 'fuh',
    filipinoName: 'Ef',
    color: '#14B8A6', // Teal
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Filipino',
    exampleTranslation: 'Filipino',
  },
  {
    letter: 'G',
    sound: 'guh',
    filipinoName: 'Jiy',
    color: '#06B6D4', // Cyan
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Gatas',
    exampleTranslation: 'Milk',
  },
  {
    letter: 'H',
    sound: 'huh',
    filipinoName: 'Eyts',
    color: '#A855F7', // Violet
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Halaman',
    exampleTranslation: 'Plant',
  },
  {
    letter: 'I',
    sound: 'ee',
    filipinoName: 'Ay',
    color: '#F59E0B', // Warm Gold/Amber
    textColor: '#78350F',
    type: 'patinig',
    exampleWord: 'Ibon',
    exampleTranslation: 'Bird',
  },
  {
    letter: 'J',
    sound: 'juh',
    filipinoName: 'Dzey',
    color: '#6366F1', // Indigo
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Jeepney',
    exampleTranslation: 'Jeep',
  },
  {
    letter: 'K',
    sound: 'kuh',
    filipinoName: 'Key',
    color: '#0284C7', // Sky Blue
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Kuting',
    exampleTranslation: 'Kitten',
  },
  {
    letter: 'L',
    sound: 'luh',
    filipinoName: 'El',
    color: '#84CC16', // Lime Green
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Lapis',
    exampleTranslation: 'Pencil',
  },
  {
    letter: 'M',
    sound: 'mmm',
    filipinoName: 'Em',
    color: '#EF4444', // Red (as requested: M is red)
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Mata',
    exampleTranslation: 'Eye',
  },
  {
    letter: 'N',
    sound: 'nnn',
    filipinoName: 'En',
    color: '#0EA5E9', // Ocean Blue
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Nanay',
    exampleTranslation: 'Mother',
  },
  {
    letter: 'Ñ',
    sound: 'nyuh',
    filipinoName: 'Enye',
    color: '#D946EF', // Fuchsia
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Piña',
    exampleTranslation: 'Pineapple',
  },
  {
    letter: 'NG',
    sound: 'nguh',
    filipinoName: 'En-Dzi',
    color: '#10B981', // Emerald
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Ngipin',
    exampleTranslation: 'Tooth',
  },
  {
    letter: 'O',
    sound: 'oh',
    filipinoName: 'Ow',
    color: '#FB923C', // Coral Orange
    textColor: '#78350F',
    type: 'patinig',
    exampleWord: 'Orasan',
    exampleTranslation: 'Clock',
  },
  {
    letter: 'P',
    sound: 'puh',
    filipinoName: 'Piy',
    color: '#F43F5E', // Rose
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Pusa',
    exampleTranslation: 'Cat',
  },
  {
    letter: 'Q',
    sound: 'kwuh',
    filipinoName: 'Kyu',
    color: '#7C3AED', // Deep Violet
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Quezon',
    exampleTranslation: 'Quezon',
  },
  {
    letter: 'R',
    sound: 'rrr',
    filipinoName: 'Ar',
    color: '#2563EB', // Royal Blue
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Relo',
    exampleTranslation: 'Watch',
  },
  {
    letter: 'S',
    sound: 'sss',
    filipinoName: 'Es',
    color: '#22C55E', // Green (as requested: S is green)
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Sapatos',
    exampleTranslation: 'Shoes',
  },
  {
    letter: 'T',
    sound: 'tuh',
    filipinoName: 'Tiy',
    color: '#E11D48', // Crimson Red
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Tatay',
    exampleTranslation: 'Father',
  },
  {
    letter: 'U',
    sound: 'ooh',
    filipinoName: 'Yu',
    color: '#CA8A04', // Bronze Yellow
    textColor: '#78350F',
    type: 'patinig',
    exampleWord: 'Ulap',
    exampleTranslation: 'Cloud',
  },
  {
    letter: 'V',
    sound: 'vuh',
    filipinoName: 'Viy',
    color: '#059669', // Pine Green
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Vinta',
    exampleTranslation: 'Boat',
  },
  {
    letter: 'W',
    sound: 'wuh',
    filipinoName: 'Dabelyu',
    color: '#4F46E5', // Periwinkle Blue
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Watawat',
    exampleTranslation: 'Flag',
  },
  {
    letter: 'X',
    sound: 'eks',
    filipinoName: 'Eks',
    color: '#9333EA', // Orchid
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Xylophone',
    exampleTranslation: 'Silopono',
  },
  {
    letter: 'Y',
    sound: 'yuh',
    filipinoName: 'Way',
    color: '#EA580C', // Amber Orange
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Yoyo',
    exampleTranslation: 'Yo-yo',
  },
  {
    letter: 'Z',
    sound: 'zuh',
    filipinoName: 'Ziy',
    color: '#0D9488', // Deep Teal
    textColor: '#FFFFFF',
    type: 'katinig',
    exampleWord: 'Zebra',
    exampleTranslation: 'Zebra',
  },
];

// Map lookup by letter
export const LETTER_MAP = new Map<string, FilipinoLetterInfo>();
FILIPINO_ALPHABET.forEach((item) => {
  LETTER_MAP.set(item.letter.toUpperCase(), item);
});

// Helper to check if a letter is a vowel (Patinig)
export function isVowel(ch: string): boolean {
  const upper = ch.toUpperCase();
  return ['A', 'E', 'I', 'O', 'U'].includes(upper);
}

// Function to split raw text into Alpabetong Filipino units (e.g. 'MAS' -> ['M', 'A', 'S'], 'NGIPIN' -> ['NG', 'I', 'P', 'I', 'N'])
export function tokenizeFilipinoLetters(text: string): string[] {
  const clean = text.toUpperCase().trim();
  const tokens: string[] = [];
  let i = 0;
  while (i < clean.length) {
    // Check for 'NG' digraph
    if (i + 1 < clean.length && clean.substring(i, i + 2) === 'NG') {
      tokens.push('NG');
      i += 2;
    } else {
      const char = clean[i];
      if (LETTER_MAP.has(char)) {
        tokens.push(char);
      } else if (char.trim() !== '') {
        tokens.push(char);
      }
      i += 1;
    }
  }
  return tokens;
}

// Preset words specifically chosen for early literacy practice in Filipino
export const PRESET_WORDS: PresetWord[] = [
  {
    word: 'MAS',
    english: 'More',
    category: 'simple',
    syllables: ['MA', 'S'],
  },
  {
    word: 'ASO',
    english: 'Dog',
    category: 'animal',
    syllables: ['A', 'SO'],
  },
  {
    word: 'BATA',
    english: 'Child',
    category: 'simple',
    syllables: ['BA', 'TA'],
  },
  {
    word: 'MATA',
    english: 'Eye',
    category: 'simple',
    syllables: ['MA', 'TA'],
  },
  {
    word: 'GATAS',
    english: 'Milk',
    category: 'food',
    syllables: ['GA', 'TAS'],
  },
  {
    word: 'PUSA',
    english: 'Cat',
    category: 'animal',
    syllables: ['PU', 'SA'],
  },
  {
    word: 'ARAW',
    english: 'Sun / Day',
    category: 'nature',
    syllables: ['A', 'RAW'],
  },
  {
    word: 'NGIPIN',
    english: 'Tooth',
    category: 'special_ng',
    syllables: ['NGI', 'PIN'],
  },
  {
    word: 'NGANGA',
    english: 'Open mouth',
    category: 'special_ng',
    syllables: ['NGA', 'NGA'],
  },
  {
    word: 'ILAW',
    english: 'Light',
    category: 'nature',
    syllables: ['I', 'LAW'],
  },
  {
    word: 'NANAY',
    english: 'Mother',
    category: 'simple',
    syllables: ['NA', 'NAY'],
  },
  {
    word: 'TATAY',
    english: 'Father',
    category: 'simple',
    syllables: ['TA', 'TAY'],
  },
  {
    word: 'IBON',
    english: 'Bird',
    category: 'animal',
    syllables: ['I', 'BON'],
  },
  {
    word: 'ULAP',
    english: 'Cloud',
    category: 'nature',
    syllables: ['U', 'LAP'],
  },
  {
    word: 'TULAY',
    english: 'Bridge',
    category: 'nature',
    syllables: ['TU', 'LAY'],
  },
];

// Automatic Filipino Syllabication (Pagpapantig ng Salitang Filipino)
// DepEd / KWF Rules:
// 1. Matches predefined dictionary/preset syllables if available
// 2. Monosyllabic CVC word (like MAS, TAS): breaks into CV | C (onset-vowel pair + coda)
// 3. Two consecutive vowels (V-V): break between vowels (e.g. TA-O, BA-ON, KA-IN, PA-A)
// 4. Vowel followed by single consonant followed by vowel (V-C-V): break after vowel (e.g. BA-TA, MA-TA, GA-TAS, A-SO)
// 5. Vowel followed by two consonants followed by vowel (V-C1-C2-V):
//    - If C1-C2 is a cluster (kambal-katinig: BR, BL, DR, GR, KR, KL, PL, PR, TR, TS): break before cluster (e.g. SO-BRE, LI-BRO)
//    - Otherwise: break between C1 and C2 (e.g. IS-DA, KAN-TA, TAK-BO, PIN-TA)
// Note: 'NG' counts as a SINGLE consonant!
export function findAutomaticSyllableBreaks(tokens: string[]): boolean[] {
  const breaks = new Array(tokens.length).fill(false);
  if (tokens.length <= 1) return breaks;

  // 1. Check if word matches preset word dictionary
  const fullWord = tokens.join('').toUpperCase();
  const preset = PRESET_WORDS.find((p) => p.word.toUpperCase() === fullWord);
  if (preset && preset.syllables.length > 1) {
    let tokenIdx = 0;
    for (let s = 0; s < preset.syllables.length - 1; s++) {
      const sylTokens = tokenizeFilipinoLetters(preset.syllables[s]);
      tokenIdx += sylTokens.length;
      if (tokenIdx - 1 < tokens.length - 1) {
        breaks[tokenIdx - 1] = true;
      }
    }
    return breaks;
  }

  // 2. CVC single-syllable word (e.g. M-A-S, T-A-S, B-A-T, P-U-T)
  // In early literacy (Marungko approach), split between the CV pair and coda (e.g. MA | S)
  if (tokens.length === 3 && !isVowel(tokens[0]) && isVowel(tokens[1]) && !isVowel(tokens[2])) {
    breaks[1] = true;
    return breaks;
  }

  // 3. General syllabication algorithm
  for (let i = 0; i < tokens.length - 1; i++) {
    const curr = tokens[i];
    const next = tokens[i + 1];
    const nextNext = i + 2 < tokens.length ? tokens[i + 2] : null;
    const next3 = i + 3 < tokens.length ? tokens[i + 3] : null;

    const currIsV = isVowel(curr);
    const nextIsV = isVowel(next);

    // Rule 1: V-V (Two consecutive vowels -> break between them: e.g. TA-O, BA-ON)
    if (currIsV && nextIsV) {
      breaks[i] = true;
      continue;
    }

    // Rule 2: V-C-V (Vowel, single consonant, vowel -> break after vowel: e.g. BA-TA, A-SO)
    if (currIsV && !nextIsV && nextNext && isVowel(nextNext)) {
      breaks[i] = true;
      continue;
    }

    // Rule 3: V-C1-C2-V (Vowel, two consonants, vowel)
    if (currIsV && !nextIsV && nextNext && !isVowel(nextNext) && next3 && isVowel(next3)) {
      const cluster = (next + nextNext).toUpperCase();
      const isBlendedCluster = ['BR', 'BL', 'DR', 'GR', 'KR', 'KL', 'PL', 'PR', 'TR', 'TS'].includes(cluster);
      if (isBlendedCluster) {
        // Break before the cluster (e.g. SO | BRE, LI | BRO)
        breaks[i] = true;
      } else {
        // Break between C1 and C2 (e.g. IS | DA, KAN | TA, TAK | BO)
        breaks[i + 1] = true;
      }
      continue;
    }
  }

  // Ensure last token cannot have break
  breaks[tokens.length - 1] = false;
  return breaks;
}
