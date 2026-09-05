import React, { useState } from 'react';
import { PRESET_WORDS } from '../data/alphabet';
import { BookOpen, PlusCircle } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PresetWordsBarProps {
  onLoadWord: (word: string) => void;
  activeWord: string;
  teacherMode?: boolean;
}

export const PresetWordsBar: React.FC<PresetWordsBarProps> = ({
  onLoadWord,
  activeWord,
  teacherMode = false,
}) => {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      soundEngine.playCelebration();
      onLoadWord(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="w-full bg-white border-4 border-sky-200 rounded-[28px] sm:rounded-[36px] p-3.5 sm:p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Category Label */}
      <div className="flex items-center gap-2 text-sky-950 shrink-0">
        <div className="w-8 h-8 rounded-2xl bg-amber-400 border-b-2 border-amber-600 text-amber-950 flex items-center justify-center font-black text-xs shadow-xs">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="font-black text-xs sm:text-sm uppercase tracking-wide text-sky-950">
          Mga Halimbawang Salita:
        </span>
      </div>

      {/* Preset Word Pills */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 scrollbar-none">
        {PRESET_WORDS.map((preset) => {
          const isSelected = activeWord.toLowerCase() === preset.word.toLowerCase();
          const lowerWord = preset.word.toLowerCase();
          return (
            <button
              key={preset.word}
              type="button"
              id={`preset-${lowerWord}`}
              onClick={() => {
                soundEngine.playPop();
                onLoadWord(lowerWord);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-black lowercase whitespace-nowrap transition-all select-none active:translate-y-1 active:border-b-0 ${
                isSelected
                  ? 'bg-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-sm ring-2 ring-amber-300'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-2 border-b-4 border-sky-300'
              }`}
            >
              <span>{lowerWord}</span>
              {lowerWord === 'mas' && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black shadow-xs uppercase">
                  Halimbawa
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Word Input Form (Shown in Teacher Mode) */}
      {teacherMode && (
        <form
          onSubmit={handleCustomSubmit}
          className="flex items-center gap-2 w-full md:w-auto shrink-0"
        >
          <input
            type="text"
            id="custom-word-input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="mag-type ng salita..."
            className="px-3.5 py-2 rounded-2xl bg-sky-50 border-2 border-sky-300 text-sky-950 text-xs sm:text-sm font-bold lowercase placeholder:text-sky-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 w-full md:w-44 shadow-inner text-left"
          />
          <button
            type="submit"
            id="btn-load-custom"
            disabled={!customInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xs border-b-4 border-emerald-700 shadow-sm transition-all active:translate-y-1 active:border-b-0 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ibuo</span>
          </button>
        </form>
      )}
    </div>
  );
};
