import React, { useState } from 'react';
import { Sparkles, HelpCircle, GraduationCap, Mic, X } from 'lucide-react';
import { CuteKnifeIcon } from './CuteKnifeIcon';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  teacherMode: boolean;
  onToggleTeacherMode: () => void;
  onOpenVoiceStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacherMode,
  onToggleTeacherMode,
  onOpenVoiceStudio,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <header className="w-full bg-white rounded-[28px] sm:rounded-[36px] p-4 sm:p-6 shadow-md border-4 border-sky-200 flex flex-col items-center justify-center text-center gap-3">
      {/* Brand & Logo (Centered) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl shadow-md border-b-4 border-amber-600 active:translate-y-1 shrink-0">
          🇵🇭
        </div>
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-sky-950 tracking-tight font-display">
              KKB: Kaya Kong Bigkasin
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-300 text-yellow-950 border-2 border-yellow-400">
              Alpabetong Filipino
            </span>
          </div>
          <p className="text-xs sm:text-sm text-sky-800/80 font-semibold mt-0.5">
            Paghahalo ng Tunog at Pagpapantig
          </p>
        </div>
      </div>

      {/* Centered Controls Below Title: Voice Studio (Teacher Mode only), Teacher Mode Toggle & Help Info */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
        {/* Voice Studio Button - Only in Teacher Mode */}
        {teacherMode && onOpenVoiceStudio && (
          <button
            type="button"
            id="btn-voice-studio"
            onClick={onOpenVoiceStudio}
            title="I-record ang sariling boses para sa mga titik at salita"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white border-b-4 border-rose-700 text-xs font-black shadow-xs active:translate-y-1 active:border-b-0 transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>I-record ang Boses</span>
          </button>
        )}

        {/* Teacher / Student Mode Toggle */}
        <button
          type="button"
          id="toggle-teacher-mode"
          onClick={onToggleTeacherMode}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all active:translate-y-1 active:border-b-0 ${
            teacherMode
              ? 'bg-indigo-500 text-white border-b-4 border-indigo-700 shadow-sm'
              : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-2 border-b-4 border-sky-300 shadow-xs'
          }`}
        >
          <GraduationCap className={`w-4 h-4 ${teacherMode ? 'text-white' : 'text-indigo-600'}`} />
          <span>{teacherMode ? 'Mode ng Guro' : 'Mode ng Mag-aaral'}</span>
        </button>

        {/* Help / Guide Button */}
        <button
          type="button"
          id="btn-help-guide"
          onClick={() => {
            soundEngine.playPop();
            setShowHelpModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 border-b-4 border-amber-600 text-xs font-black shadow-xs active:translate-y-1 active:border-b-0 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-amber-950" />
          <span className="hidden sm:inline">Gabay</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-sky-300 space-y-4">
            <div className="flex items-center justify-between border-b-2 pb-3 border-sky-100">
              <div className="flex items-center gap-2 text-sky-950 font-black text-lg">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Paano Gamitin ang Filipino Word Blender</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-9 h-9 rounded-2xl bg-sky-100 hover:bg-sky-200 border-b-2 border-sky-300 flex items-center justify-center text-sky-900 font-black transition-all active:translate-y-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <div className="p-3.5 bg-sky-50 rounded-2xl border-2 border-sky-200">
                <h4 className="font-black text-sky-950 mb-1">
                  1. Color-Coded Segments (Halimbawa: 'MAS')
                </h4>
                <p className="text-xs text-sky-900/80 font-medium">
                  Bawat titik ay may sariling kulay (halimbawa, ang <b>M</b> ay Pula, <b>A</b> ay Dilaw, at <b>S</b> ay Berde). Kapag binuo ang salita, lilitaw ang segmented progress bar na kumakatawan sa tagal ng bawat tunog!
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <h4 className="font-black text-emerald-950 mb-1">
                  2. Cute na Kutsilyo at Dotted Line
                </h4>
                <p className="text-xs text-emerald-900/80 font-medium">
                  I-click ang cute na kutsilyo sa gitna ng mga titik upang hiwain ang pantig. Kapag nahiwa na, magdidikit ang mga titik sa loob ng pantig, at magkakaroon ng puting puwang sa progress bar!
                </p>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-2xl border-2 border-rose-200">
                <h4 className="font-black text-rose-950 mb-1">
                  3. Studio ng Pag-record ng Boses
                </h4>
                <p className="text-xs text-rose-900/80 font-medium">
                  Pindutin ang <b>"I-record ang Boses"</b> upang i-record ang sariling boses ng guro o bata para sa bawat isa sa 28 titik ng Alpabetong Filipino o anumang salita!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm border-b-4 border-amber-600 shadow-md transition-all active:translate-y-1 active:border-b-0"
              >
                Naiintindihan ko!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
