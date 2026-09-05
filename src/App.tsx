/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  LETTER_MAP,
  tokenizeFilipinoLetters,
  findAutomaticSyllableBreaks,
  isVowel,
} from './data/alphabet';
import {
  WordSegment,
  SyllableSegmentGroup,
  FilipinoLetterInfo,
} from './types';
import { Header } from './components/Header';
import { PresetWordsBar } from './components/PresetWordsBar';
import { WordDisplay } from './components/WordDisplay';
import { SegmentProgressBar } from './components/SegmentProgressBar';
import { PlaybackControls } from './components/PlaybackControls';
import { AlphabetKeyboard } from './components/AlphabetKeyboard';
import { VoiceStudioModal } from './components/VoiceStudioModal';
import { soundEngine } from './utils/audio';

/**
 * Calculates segment durations according to syllable slicing rules:
 * If the syllables are sliced and a syllable is a Consonant + Vowel (CV) pair:
 * - The consonant duration becomes 1.0 second
 * - The vowel retains the base duration (3.0s)
 * Otherwise, segments retain the base letter duration.
 */
function computeSyllableDurations(
  segs: WordSegment[],
  isSliced: boolean,
  baseDuration: number
): WordSegment[] {
  if (!isSliced || segs.length === 0) {
    return segs.map((s) => ({
      ...s,
      duration: baseDuration,
    }));
  }

  // Identify syllables based on isSyllableBreakAfter boundaries
  const syllables: { startIndex: number; endIndex: number }[] = [];
  let currentStart = 0;
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].isSyllableBreakAfter || i === segs.length - 1) {
      syllables.push({ startIndex: currentStart, endIndex: i });
      currentStart = i + 1;
    }
  }

  return segs.map((seg, idx) => {
    // Find the syllable group containing this segment
    const syl = syllables.find((s) => idx >= s.startIndex && idx <= s.endIndex);
    if (!syl) return { ...seg, duration: baseDuration };

    const firstLetter = segs[syl.startIndex].letter;
    const hasSecond = syl.endIndex >= syl.startIndex + 1;
    const secondLetter = hasSecond ? segs[syl.startIndex + 1].letter : null;

    // Consonant + Vowel (CV) pair at onset of syllable
    // e.g., BA, TA, MA, SO, PU, or TAS in GATAS, RAW in ARAW, PIN in NGIPIN, MAS in MAS
    const hasConsonantVowelPair = !isVowel(firstLetter) && secondLetter !== null && isVowel(secondLetter);

    if (hasConsonantVowelPair) {
      if (idx === syl.startIndex) {
        // Consonant becomes 1.0 second! (scaled with pacing multiplier)
        const consonantDuration = Number((1.0 * (baseDuration / 3.0)).toFixed(1));
        return { ...seg, duration: consonantDuration };
      } else {
        // Vowel and trailing coda consonants retain base duration (3.0s)
        return { ...seg, duration: baseDuration };
      }
    }

    return { ...seg, duration: baseDuration };
  });
}

export default function App() {
  // Primary Word State: segments of letters with duration & colors
  // Default initialized with user's example 'MAS':
  // M (red), A (yellow), S (green)
  const [segments, setSegments] = useState<WordSegment[]>(() => {
    const defaultWord = 'MAS';
    const tokens = tokenizeFilipinoLetters(defaultWord);
    return tokens.map((letter, idx) => {
      const info = LETTER_MAP.get(letter);
      return {
        id: `${letter}-${idx}-${Date.now()}`,
        letter,
        duration: 3.0,
        color: info ? info.color : '#3B82F6',
        textColor: info ? info.textColor : '#FFFFFF',
        isSyllableBreakAfter: false,
      };
    });
  });

  // Playback & Timing state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sliceMode, setSliceMode] = useState(false);
  const [pacingMultiplier, setPacingMultiplier] = useState(1.0);
  const [teacherMode, setTeacherMode] = useState(false);
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const checkingAbortRef = useRef(false);

  // Active highlighted segment index
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1);

  // Animation frame and playback refs
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const previousSegmentIndexRef = useRef<number>(-1);

  // Total duration calculation
  const totalDuration = useMemo(() => {
    return segments.reduce((sum, seg) => sum + seg.duration, 0);
  }, [segments]);

  // Syllable segment groupings when slice mode is on or cuts exist
  const syllableGroups = useMemo<SyllableSegmentGroup[]>(() => {
    if (segments.length === 0) return [];
    const groups: SyllableSegmentGroup[] = [];
    let currentStart = 0;
    let currentText = '';
    let currentDur = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      currentText += seg.letter;
      currentDur += seg.duration;

      // Group boundary is either explicitly marked, or last segment
      if (seg.isSyllableBreakAfter || i === segments.length - 1) {
        groups.push({
          syllableText: currentText,
          startIndex: currentStart,
          endIndex: i,
          totalDuration: currentDur,
          color: seg.color,
        });
        currentStart = i + 1;
        currentText = '';
        currentDur = 0;
      }
    }
    return groups;
  }, [segments]);

  // Current active segment lookup from currentTime
  const currentSegmentIndex = useMemo(() => {
    if (segments.length === 0 || totalDuration === 0) return -1;
    let accum = 0;
    for (let i = 0; i < segments.length; i++) {
      const end = accum + segments[i].duration;
      if (currentTime >= accum && currentTime < end) {
        return i;
      }
      accum = end;
    }
    return segments.length - 1;
  }, [segments, currentTime, totalDuration]);

  // Update activeSegmentIndex visually without auto-playing sound
  // Kids sound them out by themselves as the progression moves!
  useEffect(() => {
    if (isPlaying) {
      setActiveSegmentIndex(currentSegmentIndex);
    } else if (!isChecking) {
      setActiveSegmentIndex(currentSegmentIndex);
    }
  }, [currentSegmentIndex, isPlaying, isChecking]);

  // Main playback animation loop
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimestampRef.current = null;
  }, []);

  const handlePlaybackFinished = useCallback(() => {
    stopPlayback();
    setCurrentTime(totalDuration);
    previousSegmentIndexRef.current = -1;
    // Progression completed silently so child has sounded out the letters.
    // Child can tap "I-Check" button to verify!
  }, [stopPlayback, totalDuration]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const step = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prev) => {
        const nextTime = prev + deltaSec;
        if (nextTime >= totalDuration) {
          handlePlaybackFinished();
          return totalDuration;
        }
        return nextTime;
      });

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDuration, handlePlaybackFinished]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (segments.length === 0) return;

    if (isPlaying) {
      stopPlayback();
      soundEngine.cancelSpeech();
    } else {
      // If at end, start from 0
      if (currentTime >= totalDuration - 0.05) {
        setCurrentTime(0);
        previousSegmentIndexRef.current = -1;
      }
      lastTimestampRef.current = null;
      setIsPlaying(true);
    }
  };

  // Replay / Reset from start
  const handleReplay = () => {
    if (segments.length === 0) return;
    stopPlayback();
    soundEngine.cancelSpeech();
    setCurrentTime(0);
    previousSegmentIndexRef.current = -1;
    setActiveSegmentIndex(-1);
    setIsPlaying(false);
  };

  // Scrub / Seek along progress bar
  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(newTime, totalDuration));
    setCurrentTime(clamped);
    if (!isPlaying) {
      // preview letter sound at seek position
      let accum = 0;
      for (let i = 0; i < segments.length; i++) {
        const end = accum + segments[i].duration;
        if (clamped >= accum && clamped <= end) {
          soundEngine.playLetterSound(segments[i].letter);
          setActiveSegmentIndex(i);
          break;
        }
        accum = end;
      }
    }
  };

  // Elongate or Shorten individual segment duration
  const handleUpdateSegmentDuration = (index: number, newDuration: number) => {
    setSegments((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          duration: newDuration,
        };
      }
      return updated;
    });
  };

  // Toggle syllable cut after segment index
  const handleToggleSliceCut = (index: number) => {
    const baseDuration = pacingMultiplier === 1.5 ? 4.5 : pacingMultiplier === 0.7 ? 1.8 : 3.0;
    setSegments((prev) => {
      const updated = prev.map((seg, i) =>
        i === index ? { ...seg, isSyllableBreakAfter: !seg.isSyllableBreakAfter } : seg
      );
      const hasAnyCut = updated.some((s) => s.isSyllableBreakAfter);
      setSliceMode(hasAnyCut);
      return computeSyllableDurations(updated, hasAnyCut, baseDuration);
    });
  };

  // Toggle Slice Mode
  const handleToggleSliceMode = () => {
    const nextState = !sliceMode;
    setSliceMode(nextState);
    const baseDuration = pacingMultiplier === 1.5 ? 4.5 : pacingMultiplier === 0.7 ? 1.8 : 3.0;

    if (nextState) {
      const tokens = segments.map((s) => s.letter);
      const autoBreaks = findAutomaticSyllableBreaks(tokens);
      const withBreaks = segments.map((seg, i) => ({
        ...seg,
        isSyllableBreakAfter: autoBreaks[i] || false,
      }));
      setSegments(computeSyllableDurations(withBreaks, true, baseDuration));
    } else {
      const withoutBreaks = segments.map((seg) => ({
        ...seg,
        isSyllableBreakAfter: false,
      }));
      setSegments(computeSyllableDurations(withoutBreaks, false, baseDuration));
    }
  };

  // Pacing speed multiplier (applies uniform scaling to all segments with 3.0s base)
  const handleChangePacing = (multiplier: number) => {
    setPacingMultiplier(multiplier);
    const baseDuration = multiplier === 1.5 ? 4.5 : multiplier === 0.7 ? 1.8 : 3.0;
    setSegments((prev) => computeSyllableDurations(prev, sliceMode, baseDuration));
  };

  // Add letter from keyboard (default 3.0s per letter)
  const handleSelectLetter = (letterInfo: FilipinoLetterInfo) => {
    const baseDuration = pacingMultiplier === 1.5 ? 4.5 : pacingMultiplier === 0.7 ? 1.8 : 3.0;
    setSegments((prev) => {
      const newSeg: WordSegment = {
        id: `${letterInfo.letter}-${prev.length}-${Date.now()}`,
        letter: letterInfo.letter,
        duration: baseDuration,
        color: letterInfo.color,
        textColor: letterInfo.textColor,
        isSyllableBreakAfter: false,
      };
      const updated = [...prev, newSeg];

      if (sliceMode) {
        const tokens = updated.map((s) => s.letter);
        const autoBreaks = findAutomaticSyllableBreaks(tokens);
        const withBreaks = updated.map((seg, idx) => ({
          ...seg,
          isSyllableBreakAfter: autoBreaks[idx] || false,
        }));
        return computeSyllableDurations(withBreaks, true, baseDuration);
      }

      return computeSyllableDurations(updated, false, baseDuration);
    });
  };

  // Remove a single letter
  const handleRemoveLetter = (index: number) => {
    const baseDuration = pacingMultiplier === 1.5 ? 4.5 : pacingMultiplier === 0.7 ? 1.8 : 3.0;
    setSegments((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (sliceMode && updated.length > 0) {
        const tokens = updated.map((s) => s.letter);
        const autoBreaks = findAutomaticSyllableBreaks(tokens);
        const withBreaks = updated.map((seg, idx) => ({
          ...seg,
          isSyllableBreakAfter: autoBreaks[idx] || false,
        }));
        return computeSyllableDurations(withBreaks, true, baseDuration);
      }
      return computeSyllableDurations(updated, false, baseDuration);
    });
    if (currentTime > 0) {
      setCurrentTime(0);
    }
  };

  // Backspace: delete last letter
  const handleDeleteLastLetter = () => {
    if (segments.length === 0) return;
    handleRemoveLetter(segments.length - 1);
  };

  // Clear all letters
  const handleClearAll = () => {
    checkingAbortRef.current = true;
    setIsChecking(false);
    stopPlayback();
    soundEngine.cancelSpeech();
    setSegments([]);
    setCurrentTime(0);
    setActiveSegmentIndex(-1);
  };

  // Load a preset word or custom word (default 3.0s per letter; 1.0s for consonant in CV syllable if sliced)
  const handleLoadWord = (wordText: string) => {
    checkingAbortRef.current = true;
    setIsChecking(false);
    stopPlayback();
    soundEngine.cancelSpeech();
    const tokens = tokenizeFilipinoLetters(wordText);
    const autoBreaks = findAutomaticSyllableBreaks(tokens);
    const baseDuration = pacingMultiplier === 1.5 ? 4.5 : pacingMultiplier === 0.7 ? 1.8 : 3.0;

    const initialSegs: WordSegment[] = tokens.map((letter, idx) => {
      const info = LETTER_MAP.get(letter);
      return {
        id: `${letter}-${idx}-${Date.now()}`,
        letter,
        duration: baseDuration,
        color: info ? info.color : '#3B82F6',
        textColor: info ? info.textColor : '#FFFFFF',
        isSyllableBreakAfter: sliceMode ? autoBreaks[idx] || false : false,
      };
    });

    const finalSegs = computeSyllableDurations(initialSegs, sliceMode, baseDuration);
    setSegments(finalSegs);
    setCurrentTime(0);
    setActiveSegmentIndex(-1);
  };

  // Check verification function: child triggers this to verify if they sounded it out right!
  const handleCheckPronunciation = async () => {
    if (segments.length === 0 || isChecking) return;

    // Stop progression playback if active
    stopPlayback();
    soundEngine.cancelSpeech();

    setIsChecking(true);
    checkingAbortRef.current = false;

    try {
      // 1. Sequentially highlight each letter and speak its phonetic sound / custom voice
      for (let i = 0; i < segments.length; i++) {
        if (checkingAbortRef.current) break;
        const seg = segments[i];
        setActiveSegmentIndex(i);
        await soundEngine.speakPhoneme(seg.letter, 0.85);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      // 2. If sliced into syllables, speak each syllable before whole word!
      if (!checkingAbortRef.current && syllableGroups.length > 1) {
        for (const syl of syllableGroups) {
          if (checkingAbortRef.current) break;
          setActiveSegmentIndex(syl.startIndex);
          await soundEngine.speakWord(syl.syllableText, 0.85);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      // 3. Reset letter highlight, speak blended whole word & celebrate!
      if (!checkingAbortRef.current && segments.length > 0) {
        setActiveSegmentIndex(-1);
        const wholeWord = segments.map((s) => s.letter).join('');
        await soundEngine.speakWord(wholeWord, 0.85);
        soundEngine.playCelebration();

        // Confetti celebration for successful sounding and blending!
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#EF4444', '#EAB308', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
          });
        } catch {}
      }
    } finally {
      setIsChecking(false);
      setActiveSegmentIndex(-1);
    }
  };

  // Letter Click: pronounce letter
  const handleLetterClick = (letter: string, index: number) => {
    soundEngine.playLetterSound(letter);
    soundEngine.speakPhoneme(letter);
    setActiveSegmentIndex(index);
  };

  // Keyboard shortcut listener for physical typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        soundEngine.playPop();
        handleDeleteLastLetter();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTogglePlay();
      } else {
        const char = e.key.toUpperCase();
        if (LETTER_MAP.has(char)) {
          const info = LETTER_MAP.get(char)!;
          soundEngine.playLetterSound(info.letter);
          handleSelectLetter(info);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const activeWordString = segments.map((s) => s.letter).join('');

  return (
    <div className="min-h-screen bg-[#E0F2FE] bg-[radial-gradient(#bae6fd_1.5px,transparent_1.5px)] [background-size:24px_24px] p-3 sm:p-6 md:p-8 flex flex-col items-center selection:bg-amber-300 selection:text-amber-950 font-sans">
      <div className="w-full max-w-5xl flex flex-col gap-5 sm:gap-6">
        {/* App Header */}
        <Header
          teacherMode={teacherMode}
          onToggleTeacherMode={() => setTeacherMode((prev) => !prev)}
          onOpenVoiceStudio={() => setIsVoiceStudioOpen(true)}
        />

        {/* Preset Words & Custom Word Input Bar (Simplified in Student Mode) */}
        <PresetWordsBar
          onLoadWord={handleLoadWord}
          activeWord={activeWordString}
          teacherMode={teacherMode}
        />

        {/* Interactive Word Display (Letters sit closer together within syllables, dotted lines & cute knife) */}
        <main className="flex flex-col items-center justify-center w-full gap-4 text-center">
          <WordDisplay
            segments={segments}
            activeSegmentIndex={activeSegmentIndex}
            sliceMode={sliceMode}
            syllableGroups={syllableGroups}
            onRemoveLetter={handleRemoveLetter}
            onToggleSliceCut={handleToggleSliceCut}
            onLetterClick={handleLetterClick}
            onOpenVoiceStudio={() => setIsVoiceStudioOpen(true)}
            teacherMode={teacherMode}
          />

          {/* Color-Coded Segmented Progress Bar with Scrubber & White Space Syllable Division */}
          <SegmentProgressBar
            segments={segments}
            currentTime={currentTime}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            activeSegmentIndex={activeSegmentIndex}
            sliceMode={sliceMode}
            syllableGroups={syllableGroups}
            onSeek={handleSeek}
            onUpdateSegmentDuration={handleUpdateSegmentDuration}
            onToggleSliceCut={handleToggleSliceCut}
            teacherMode={teacherMode}
          />

          {/* Primary Playback, Verification Check, and Student Navigation Controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            sliceMode={sliceMode}
            pacingMultiplier={pacingMultiplier}
            onTogglePlay={handleTogglePlay}
            onReplay={handleReplay}
            onToggleSlice={handleToggleSliceMode}
            onChangePacing={handleChangePacing}
            onCheck={handleCheckPronunciation}
            isChecking={isChecking}
            disabled={segments.length === 0}
            teacherMode={teacherMode}
            wordString={activeWordString}
          />
        </main>

        {/* Alpabetong Filipino 28-Letter Touch Keyboard (Phonetic notes removed for clean layout) */}
        <AlphabetKeyboard
          onSelectLetter={handleSelectLetter}
          onDeleteLastLetter={handleDeleteLastLetter}
          onClearAll={handleClearAll}
          currentWordLength={segments.length}
        />
      </div>

      {/* Voice Studio Modal for Recording All Letters & Blended Words */}
      <VoiceStudioModal
        isOpen={isVoiceStudioOpen}
        onClose={() => setIsVoiceStudioOpen(false)}
        currentWord={activeWordString}
      />
    </div>
  );
}
