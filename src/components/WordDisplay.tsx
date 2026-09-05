import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordSegment, SyllableSegmentGroup } from '../types';
import { Volume2, X, Mic, CheckCircle2 } from 'lucide-react';
import { CuteKnifeIcon } from './CuteKnifeIcon';
import { soundEngine } from '../utils/audio';

interface WordDisplayProps {
  segments: WordSegment[];
  activeSegmentIndex: number;
  sliceMode: boolean;
  syllableGroups: SyllableSegmentGroup[];
  onRemoveLetter: (index: number) => void;
  onToggleSliceCut: (index: number) => void;
  onLetterClick: (letter: string, index: number) => void;
  onOpenVoiceStudio?: () => void;
  teacherMode?: boolean;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  segments,
  activeSegmentIndex,
  sliceMode,
  syllableGroups,
  onRemoveLetter,
  onToggleSliceCut,
  onLetterClick,
  onOpenVoiceStudio,
  teacherMode = false,
}) => {
  if (segments.length === 0) return null;

  const wholeWord = segments.map((s) => s.letter).join('');
  const hasCustomWordVoice = soundEngine.hasCustomWordAudio(wholeWord);

  const isMoreThanFive = segments.length > 5;
  const isVeryLong = segments.length > 7;

  // Responsive dynamic tile sizing to ensure the word fits cleanly in one line
  const tileSizeClass = isVeryLong
    ? 'w-11 h-16 sm:w-13 sm:h-18 md:w-15 md:h-22 rounded-[16px] sm:rounded-[20px] border-2 sm:border-3 border-white border-b-4 sm:border-b-5 border-b-black/20'
    : isMoreThanFive
    ? 'w-13 h-18 sm:w-16 sm:h-22 md:w-18 md:h-26 rounded-[20px] sm:rounded-[26px] border-3 sm:border-4 border-white border-b-4 sm:border-b-6 border-b-black/20'
    : 'w-20 h-24 sm:w-24 sm:h-30 md:w-28 md:h-34 rounded-[28px] sm:rounded-[36px] border-4 border-white border-b-8 border-b-black/20';

  const fontClass = (isMultiChar: boolean) => {
    if (isVeryLong) {
      return isMultiChar ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl';
    }
    if (isMoreThanFive) {
      return isMultiChar ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl';
    }
    return isMultiChar ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-4xl sm:text-5xl md:text-6xl';
  };

  const durationBadgeClass = isVeryLong
    ? 'mt-0.5 px-1.5 py-0.2 text-[8px] sm:text-[9px]'
    : isMoreThanFive
    ? 'mt-1 px-2 py-0.5 text-[9px] sm:text-[10px]'
    : 'mt-1.5 px-2.5 py-0.5 text-[10px] sm:text-xs';

  const removeButtonClass = isVeryLong
    ? '-top-1.5 -left-1.5 w-5 h-5'
    : isMoreThanFive
    ? '-top-2 -left-2 w-6 h-6'
    : '-top-2 -left-2 w-7 h-7';

  const dividerHeightClass = isVeryLong
    ? 'h-16 sm:h-18 md:h-22 mx-0.5 sm:mx-1'
    : isMoreThanFive
    ? 'h-18 sm:h-22 md:h-26 mx-0.5 sm:mx-1'
    : 'h-24 sm:h-30 md:h-34 mx-1 sm:mx-2';

  const cutSpaceClass = isVeryLong
    ? 'w-8 sm:w-10 md:w-12 h-16 sm:h-18 md:h-22 mx-1'
    : isMoreThanFive
    ? 'w-10 sm:w-12 md:w-14 h-18 sm:h-22 md:h-26 mx-1 sm:mx-1.5'
    : 'w-14 sm:w-18 md:w-22 h-24 sm:h-30 md:h-34 mx-2 sm:mx-3';

  const knifeButtonSizeClass = isVeryLong
    ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl'
    : isMoreThanFive
    ? 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl'
    : 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl';

  const knifeIconSizeClass = isVeryLong
    ? 'w-4 h-4 sm:w-5 sm:h-5'
    : isMoreThanFive
    ? 'w-5 h-5 sm:w-6 sm:h-6'
    : 'w-7 h-7 sm:w-8 sm:h-8';

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 my-2">
      {/* Whole Word Reading / Phonetic Preview Bar & Syllables */}
      <div className="flex items-center flex-wrap justify-center gap-3">
        <span className="text-xs uppercase font-black tracking-widest text-sky-900/80">
          Buong Salita:
        </span>
        <button
          type="button"
          onClick={() => {
            soundEngine.speakWord(wholeWord);
          }}
          className="group inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-lg sm:text-xl border-b-4 border-amber-600 shadow-md transition-all active:translate-y-1 active:border-b-0 lowercase"
        >
          <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>{wholeWord.toLowerCase()}</span>
          {hasCustomWordVoice && teacherMode && (
            <span
              title="May sariling boses na nirekord para sa salitang ito"
              className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold ml-1 flex items-center gap-1 uppercase"
            >
              <CheckCircle2 className="w-3 h-3" />
              Boses
            </span>
          )}
        </button>

        {/* Syllable Pills when sliced into syllables */}
        {syllableGroups.length > 1 && (
          <div className="flex items-center gap-1.5 bg-sky-100/90 border-2 border-sky-300 px-3 py-1.5 rounded-2xl shadow-xs">
            <span className="text-xs uppercase font-black tracking-wider text-sky-900">
              Pantig:
            </span>
            <div className="flex items-center gap-1.5">
              {syllableGroups.map((syl, sIdx) => (
                <button
                  key={`syl-badge-${sIdx}`}
                  type="button"
                  title={`Pakinggan ang pantig "${syl.syllableText}"`}
                  onClick={() => {
                    soundEngine.speakWord(syl.syllableText);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-300 hover:bg-amber-200 text-amber-950 font-black text-sm border border-amber-500 shadow-xs transition-all active:scale-95 lowercase"
                >
                  {syl.syllableText.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Voice Studio trigger in Teacher Mode or everywhere */}
        {teacherMode && onOpenVoiceStudio && (
          <button
            type="button"
            onClick={onOpenVoiceStudio}
            title="I-record ang pagbigkas ng salitang ito o ng mga titik"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 font-black text-xs border-2 border-b-4 border-rose-300 hover:border-rose-400 shadow-xs transition-all active:translate-y-0.5"
          >
            <Mic className="w-4 h-4 text-rose-500" />
            <span>I-record ang Salita</span>
          </button>
        )}
      </div>

      {/* Main Letter Cards Row with Dotted Lines and Cute Child-Friendly Knife Slicers */}
      <div className="relative flex flex-nowrap items-center justify-center max-w-full px-1 sm:px-2 py-4 overflow-x-auto">
        <AnimatePresence>
          {segments.map((seg, idx) => {
            const isActive = activeSegmentIndex === idx;
            const isCutAfter = seg.isSyllableBreakAfter;
            const nextSeg = idx < segments.length - 1 ? segments[idx + 1] : null;

            return (
              <React.Fragment key={seg.id}>
                {/* Individual Letter Card */}
                <motion.div
                  layout
                  initial={{ scale: 0.5, opacity: 0, y: 20 }}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: 1,
                    y: isActive ? -6 : 0,
                  }}
                  exit={{ scale: 0.5, opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className="relative group mr-0 sm:mr-0.5 shrink-0"
                >
                  {/* The Big Letter Tile */}
                  <button
                    type="button"
                    id={`letter-tile-${idx}`}
                    title={`Pakinggan ang titik ${seg.letter}`}
                    onClick={() => onLetterClick(seg.letter, idx)}
                    style={{
                      backgroundColor: seg.color,
                      color: seg.textColor,
                    }}
                    className={`relative ${tileSizeClass} flex flex-col items-center justify-center transition-all select-none shadow-xl active:translate-y-1 ${
                      isActive
                        ? 'ring-3 sm:ring-4 ring-yellow-400 ring-offset-2 ring-offset-sky-100 shadow-2xl scale-105'
                        : 'hover:brightness-105'
                    }`}
                  >
                    {/* Active letter star effect */}
                    {isActive && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                        className="absolute -top-3 -right-3 w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-yellow-300 text-yellow-950 flex items-center justify-center shadow-lg text-xs sm:text-sm font-black border border-white"
                      >
                        ✨
                      </motion.div>
                    )}

                    {/* Top gloss highlight */}
                    <div className="absolute top-1.5 left-2 right-2 h-3 sm:h-4 bg-white/30 rounded-full pointer-events-none" />

                    {/* Letter Character */}
                    <span
                      className={`font-black font-display tracking-tight leading-none drop-shadow-md lowercase ${fontClass(
                        seg.letter.length > 1
                      )}`}
                    >
                      {seg.letter.toLowerCase()}
                    </span>

                    {/* Duration badge */}
                    <div
                      className={`${durationBadgeClass} rounded-full bg-black/25 font-black font-mono text-white backdrop-blur-xs`}
                    >
                      {seg.duration.toFixed(1)}s
                    </div>
                  </button>

                  {/* Remove letter button (top-left badge) */}
                  <button
                    type="button"
                    title={`Alisin ang titik ${seg.letter}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playPop();
                      onRemoveLetter(idx);
                    }}
                    className={`absolute ${removeButtonClass} rounded-xl sm:rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md border-b-2 border-rose-700 opacity-0 group-hover:opacity-100 transition-all active:translate-y-0.5 z-20`}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </motion.div>

                {/* Slicing Divider between letters: Dotted Line (when uncut) OR Sliced Open Space (when cut) */}
                {idx < segments.length - 1 && nextSeg && (
                  <>
                    {!isCutAfter ? (
                      /* Uncut state: Vertical Dotted Line Guide with Cute Child-Friendly Knife */
                      <motion.div
                        layout
                        title={`Hiwain ang pantig sa pagitan ng "${seg.letter}" at "${nextSeg.letter}"`}
                        onClick={() => {
                          soundEngine.playSliceSound();
                          onToggleSliceCut(idx);
                        }}
                        className={`relative flex flex-col items-center justify-center ${dividerHeightClass} cursor-pointer group select-none shrink-0`}
                      >
                        {/* Vertical Dotted Line Guide */}
                        <div className="w-0 h-full border-r-2 sm:border-r-3 border-dashed border-sky-300/80 group-hover:border-sky-500 transition-colors" />

                        {/* Cute Child-friendly Knife Button */}
                        <button
                          type="button"
                          id={`btn-slice-${idx}`}
                          title={`Hiwain ang pantig sa pagitan ng "${seg.letter}" at "${nextSeg.letter}"`}
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playSliceSound();
                            onToggleSliceCut(idx);
                          }}
                          className={`absolute top-1/2 -translate-y-1/2 z-20 ${knifeButtonSizeClass} flex items-center justify-center transition-all border-2 border-b-4 bg-white hover:bg-sky-50 border-sky-300 hover:border-sky-400 shadow-xs hover:scale-110 active:translate-y-0.5`}
                        >
                          <CuteKnifeIcon className={knifeIconSizeClass} isCut={false} />
                        </button>
                      </motion.div>
                    ) : (
                      /* Cut state: Open Syllable Space with centered Knife (gradient bar removed, spacing preserved) */
                      <motion.div
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        id={`word-slice-space-${idx}`}
                        title={`Alisin ang hiwa sa pagitan ng "${seg.letter}" at "${nextSeg.letter}"`}
                        onClick={() => {
                          soundEngine.playSliceSound();
                          onToggleSliceCut(idx);
                        }}
                        className={`relative flex flex-col items-center justify-center ${cutSpaceClass} cursor-pointer select-none group transition-transform hover:scale-105 active:scale-95 shrink-0`}
                      >
                        {/* Subtle vertical dotted line in the center of the open space */}
                        <div className="w-0 h-full border-r-2 sm:border-r-3 border-dashed border-amber-400/80 transition-colors" />

                        {/* Knife Button centered in the open space */}
                        <button
                          type="button"
                          id={`btn-slice-${idx}`}
                          title={`Ibalik ang pantig (Alisin ang hiwa)`}
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playSliceSound();
                            onToggleSliceCut(idx);
                          }}
                          className={`absolute top-1/2 -translate-y-1/2 z-20 ${knifeButtonSizeClass} flex items-center justify-center transition-all border-2 border-b-4 bg-amber-400 border-amber-600 text-amber-950 shadow-md ring-2 ring-white scale-110 group-hover:scale-120 active:translate-y-0.5 active:border-b-2`}
                        >
                          <CuteKnifeIcon className={knifeIconSizeClass} isCut={true} />
                        </button>

                        {/* Hiwa status badge */}
                        <span className="absolute -bottom-2 z-20 text-[8px] sm:text-[9px] font-black uppercase text-amber-950 bg-amber-300 px-2 py-0.2 rounded-full border border-amber-500 tracking-wider shadow-xs">
                          Hiwa
                        </span>
                      </motion.div>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
