import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FILIPINO_ALPHABET } from '../data/alphabet';
import { FilipinoLetterInfo, LetterType } from '../types';
import { Delete, Trash2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface AlphabetKeyboardProps {
  onSelectLetter: (letterInfo: FilipinoLetterInfo) => void;
  onDeleteLastLetter: () => void;
  onClearAll: () => void;
  currentWordLength: number;
}

export const AlphabetKeyboard: React.FC<AlphabetKeyboardProps> = ({
  onSelectLetter,
  onDeleteLastLetter,
  onClearAll,
  currentWordLength,
}) => {
  const [filter, setFilter] = useState<'all' | 'patinig' | 'katinig'>('all');

  const filteredLetters = FILIPINO_ALPHABET.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="w-full bg-white rounded-[32px] sm:rounded-[40px] p-4 sm:p-6 shadow-lg border-4 border-sky-200 space-y-4">
      {/* Keyboard Header & Categorization Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 border-b-2 border-amber-600 text-amber-950 flex items-center justify-center font-black text-sm shadow-xs">
            28
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg text-sky-950 leading-tight font-display">
              Alpabetong Filipino
            </h3>
            <p className="text-xs text-sky-800/80 font-semibold">Pindutin ang titik upang idagdag sa salita</p>
          </div>
        </div>

        {/* Filter Chips (Lahat / Patinig / Katinig) */}
        <div className="flex items-center gap-1.5 bg-sky-50 p-1.5 rounded-2xl border-2 border-sky-200 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              setFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all active:translate-y-0.5 ${
              filter === 'all'
                ? 'bg-amber-400 text-amber-950 border-b-2 border-amber-600 shadow-xs'
                : 'text-sky-900 hover:bg-sky-100'
            }`}
          >
            Lahat (28)
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              setFilter('patinig');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all active:translate-y-0.5 ${
              filter === 'patinig'
                ? 'bg-amber-400 text-amber-950 border-b-2 border-amber-600 shadow-xs'
                : 'text-sky-900 hover:bg-sky-100'
            }`}
          >
            Patinig (A, E, I, O, U)
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              setFilter('katinig');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all active:translate-y-0.5 ${
              filter === 'katinig'
                ? 'bg-amber-400 text-amber-950 border-b-2 border-amber-600 shadow-xs'
                : 'text-sky-900 hover:bg-sky-100'
            }`}
          >
            Katinig (23)
          </button>
        </div>

        {/* Action Buttons: Delete Last & Clear All */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-delete-letter"
            disabled={currentWordLength === 0}
            onClick={() => {
              soundEngine.playPop();
              onDeleteLastLetter();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-black text-xs border-b-3 border-sky-300 disabled:opacity-40 disabled:pointer-events-none transition-all active:translate-y-0.5 active:border-b"
            title="Burahin ang huling titik (Backspace)"
          >
            <Delete className="w-4 h-4" />
            <span className="hidden sm:inline">Bawi</span>
          </button>

          <button
            type="button"
            id="btn-clear-all"
            disabled={currentWordLength === 0}
            onClick={() => {
              soundEngine.playPop();
              onClearAll();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs border-b-3 border-rose-700 disabled:opacity-40 disabled:pointer-events-none transition-all active:translate-y-0.5 active:border-b shadow-xs"
            title="Burahin lahat (Clear Word)"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Burahin Lahat</span>
          </button>
        </div>
      </div>

      {/* Grid of Large Alpabetong Filipino Buttons */}
      <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10 gap-2 sm:gap-2.5">
        {filteredLetters.map((item) => (
          <motion.button
            key={item.letter}
            type="button"
            id={`keyboard-key-${item.letter}`}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              soundEngine.playLetterSound(item.letter);
              onSelectLetter(item);
            }}
            style={{
              backgroundColor: item.color,
              color: item.textColor,
            }}
            className="relative flex flex-col items-center justify-center h-15 sm:h-17 rounded-2xl shadow-md border-2 border-white border-b-4 border-b-black/25 active:border-b-0 active:translate-y-1 select-none transition-all focus:outline-hidden"
          >
            {/* Gloss shine */}
            <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/30 rounded-full pointer-events-none" />

            {/* Letter character */}
            <span
              className={`font-black font-display tracking-tight leading-none drop-shadow-sm lowercase ${
                item.letter.length > 1 ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'
              }`}
            >
              {item.letter.toLowerCase()}
            </span>

            {/* Custom voice indicator if recorded */}
            {soundEngine.hasCustomLetterAudio(item.letter) && (
              <div
                title="May sariling boses na nirekord"
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white shadow-xs"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
