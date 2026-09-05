import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Square,
  Play,
  Trash2,
  CheckCircle2,
  X,
  Volume2,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import { FILIPINO_ALPHABET } from '../data/alphabet';
import { soundEngine } from '../utils/audio';

interface VoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWord: string;
}

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
  isOpen,
  onClose,
  currentWord,
}) => {
  const [activeTab, setActiveTab] = useState<'letters' | 'words'>('letters');
  const [recordingTarget, setRecordingTarget] = useState<{
    type: 'letter' | 'word';
    key: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [customWordInput, setCustomWordInput] = useState('');
  const [recordingCountdown, setRecordingCountdown] = useState<number | null>(null);

  // Re-render trigger when soundEngine updates
  const [, setTick] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = soundEngine.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsub();
  }, []);

  const startRecordingFor = async (type: 'letter' | 'word', key: string) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Hindi sinusuportahan ang mikropono sa browser na ito.');
        return;
      }

      setRecordingTarget({ type, key });
      setRecordingCountdown(3);

      let count = 3;
      countdownTimerRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setRecordingCountdown(count);
          soundEngine.playTone(600, 0.1, 'sine');
        } else {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setRecordingCountdown(null);
          soundEngine.playTone(880, 0.25, 'sine');
          executeRecording(type, key);
        }
      }, 700);
    } catch {
      alert('Kailangan ng pahintulot sa mikropuno.');
      setRecordingTarget(null);
      setRecordingCountdown(null);
    }
  };

  const executeRecording = async (type: 'letter' | 'word', key: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          if (type === 'letter') {
            soundEngine.saveLetterAudio(key, base64Data);
          } else {
            soundEngine.saveWordAudio(key, base64Data);
          }
          soundEngine.playCelebration();
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setRecordingTarget(null);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      alert('Hindi makapagsimula ng pag-record.');
      setIsRecording(false);
      setRecordingTarget(null);
    }
  };

  const stopRecording = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setRecordingCountdown(null);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      setRecordingTarget(null);
    }
  };

  const previewAudio = async (type: 'letter' | 'word', key: string) => {
    setPlayingKey(key);
    if (type === 'letter') {
      await soundEngine.speakPhoneme(key);
    } else {
      await soundEngine.speakWord(key);
    }
    setPlayingKey(null);
  };

  if (!isOpen) return null;

  const letterRecordings = soundEngine.getAllLetterRecordings();
  const wordRecordings = soundEngine.getAllWordRecordings();
  const recordedLettersCount = Object.keys(letterRecordings).length;
  const recordedWordsCount = Object.keys(wordRecordings).length;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[36px] sm:rounded-[44px] shadow-2xl border-4 border-sky-300 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-100 via-sky-50 to-amber-50 border-b-4 border-sky-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 border-b-4 border-amber-600 flex items-center justify-center text-2xl shadow-sm text-amber-950">
              🎙️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-sky-950 font-display">
                Studio ng Pagbigkas at Boses
              </h2>
              <p className="text-xs sm:text-sm text-sky-800 font-semibold">
                I-record ang iyong sariling boses para sa mga titik at pinaghalong salita
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopRecording();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-sky-100 hover:bg-rose-100 text-sky-900 hover:text-rose-700 flex items-center justify-center border-b-3 border-sky-300 hover:border-rose-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Recording Overlay / Alert */}
        <AnimatePresence>
          {(recordingCountdown !== null || isRecording) && recordingTarget && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500 text-white px-6 py-4 flex items-center justify-between flex-wrap gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                <span className="font-black text-base sm:text-lg">
                  {recordingCountdown !== null
                    ? `Humanda sa pagbigkas... ${recordingCountdown}`
                    : `Kasalukuyang nagre-record para sa: "${recordingTarget.key}"`}
                </span>
                <span className="text-xs bg-rose-700/80 px-2.5 py-1 rounded-full font-bold">
                  Sabihin nang malinaw ang tunog
                </span>
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="px-5 py-2 rounded-2xl bg-white text-rose-700 font-black text-sm border-b-3 border-rose-200 shadow-md hover:bg-rose-50 transition-all flex items-center gap-2 active:translate-y-0.5"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Tapusin ang Pag-record</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Studio Navigation Tabs & Stats */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 pt-4 pb-2 bg-sky-50/60 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('letters')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all border-b-3 ${
                activeTab === 'letters'
                  ? 'bg-amber-400 text-amber-950 border-amber-600 shadow-sm'
                  : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-100/70'
              }`}
            >
              <span>Mga Titik (28)</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-black/10">
                {recordedLettersCount}/28
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('words')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all border-b-3 ${
                activeTab === 'words'
                  ? 'bg-amber-400 text-amber-950 border-amber-600 shadow-sm'
                  : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-100/70'
              }`}
            >
              <span>Mga Salita</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-black/10">
                {recordedWordsCount}
              </span>
            </button>
          </div>

          <div className="text-xs text-sky-800 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Ang mga nirekord ay agad maririnig ng bata sa pagpindot</span>
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeTab === 'letters' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border-2 border-amber-200 text-xs text-amber-950 font-semibold">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  I-click ang <b>"I-record"</b> sa bawat titik upang irekord ang wastong ponetikong tunog (hal. /m/, /a/, /s/). Awtomatiko itong magiging boses ng bawat letra!
                </span>
              </div>

              {/* 28 Letters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {FILIPINO_ALPHABET.map((item) => {
                  const hasRecord = Boolean(letterRecordings[item.letter]);
                  const isCurrentRecording =
                    recordingTarget?.type === 'letter' && recordingTarget.key === item.letter;
                  const isPlaying = playingKey === item.letter;

                  return (
                    <div
                      key={item.letter}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-2.5 ${
                        hasRecord
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                          : 'bg-white border-sky-200 hover:border-sky-300'
                      }`}
                    >
                      {/* Top Row: Letter badge & status */}
                      <div className="flex items-center justify-between">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-xs border-2 border-white lowercase"
                          style={{
                            backgroundColor: item.color,
                            color: item.textColor,
                          }}
                        >
                          {item.letter.toLowerCase()}
                        </div>

                        {hasRecord ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            May Boses
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">
                            Default TTS
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {/* Listen preview button */}
                        <button
                          type="button"
                          onClick={() => previewAudio('letter', item.letter)}
                          title="Pakinggan ang kasalukuyang tunog"
                          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all active:translate-y-0.5 ${
                            isPlaying
                              ? 'bg-amber-400 text-amber-950 border-amber-600'
                              : 'bg-sky-100 hover:bg-sky-200 text-sky-950 border-sky-300'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Pakinggan</span>
                        </button>

                        {/* Record button */}
                        <button
                          type="button"
                          onClick={() => startRecordingFor('letter', item.letter)}
                          title="Mag-record ng bagong boses para sa titik na ito"
                          className={`py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all active:translate-y-0.5 ${
                            isCurrentRecording
                              ? 'bg-rose-600 text-white border-rose-800 animate-pulse'
                              : 'bg-rose-500 hover:bg-rose-400 text-white border-rose-700'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{hasRecord ? 'Palitan' : 'I-record'}</span>
                        </button>

                        {/* Delete custom recording */}
                        {hasRecord && (
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playPop();
                              soundEngine.removeLetterAudio(item.letter);
                            }}
                            title="Ibalik sa default na tunog"
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border border-slate-200 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'words' && (
            <div className="space-y-6">
              {/* Quick Record for the Current Word in Blender */}
              {currentWord && (
                <div className="p-5 rounded-[28px] bg-gradient-to-r from-amber-100/90 to-yellow-50 border-4 border-amber-300 shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3 py-1 rounded-full">
                        Kasalukuyang Salita sa Blender
                      </span>
                      <h3 className="text-3xl font-black text-sky-950 font-display mt-1 lowercase">
                        "{currentWord.toLowerCase()}"
                      </h3>
                      <p className="text-xs text-sky-800/80 font-semibold mt-0.5">
                        {soundEngine.hasCustomWordAudio(currentWord)
                          ? '✅ May sarili nang nirekord na boses ang salitang ito!'
                          : 'I-record ang pagbasa ng buong salita upang maging gabay sa bata.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => previewAudio('word', currentWord)}
                        className="px-4 py-2.5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-black text-sm border-b-3 border-sky-300 flex items-center gap-1.5 transition-all active:translate-y-0.5"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Pakinggan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startRecordingFor('word', currentWord)}
                        className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-b-3 border-rose-700 shadow-sm flex items-center gap-2 transition-all active:translate-y-0.5"
                      >
                        <Mic className="w-4 h-4" />
                        <span>
                          {soundEngine.hasCustomWordAudio(currentWord)
                            ? 'I-record Muli'
                            : 'I-record ang Salitang Ito'}
                        </span>
                      </button>

                      {soundEngine.hasCustomWordAudio(currentWord) && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playPop();
                            soundEngine.removeWordAudio(currentWord);
                          }}
                          title="Burahin ang rekord ng salita"
                          className="p-2.5 rounded-2xl bg-white hover:bg-rose-100 text-rose-600 border-2 border-rose-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Add and record another blended word */}
              <div className="p-5 rounded-[28px] bg-white border-2 border-sky-200 space-y-3">
                <h4 className="font-black text-base text-sky-950">
                  Magdagdag ng Bagong Salita para I-record
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customWordInput}
                    onChange={(e) => setCustomWordInput(e.target.value.toUpperCase())}
                    placeholder="Hal. MAMA, BATA, GATAS, ASO..."
                    className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-sky-200 focus:border-amber-400 focus:outline-hidden font-black text-sm text-sky-950 uppercase"
                  />
                  <button
                    type="button"
                    disabled={!customWordInput.trim()}
                    onClick={() => {
                      if (customWordInput.trim()) {
                        startRecordingFor('word', customWordInput.trim());
                        setCustomWordInput('');
                      }
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm border-b-3 border-emerald-700 disabled:opacity-40 transition-all active:translate-y-0.5"
                  >
                    I-record
                  </button>
                </div>
              </div>

              {/* List of all saved word recordings */}
              <div className="space-y-3">
                <h4 className="font-black text-base text-sky-950 flex items-center justify-between">
                  <span>Mga Naka-save na Salita ({recordedWordsCount})</span>
                </h4>

                {recordedWordsCount === 0 ? (
                  <div className="p-8 text-center bg-sky-50 rounded-2xl border-2 border-dashed border-sky-200 text-sky-800 text-sm font-semibold">
                    Wala pang nai-record na salita. Mag-record ng salita sa itaas upang masubukan!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(wordRecordings).map((wordKey) => (
                      <div
                        key={wordKey}
                        className="p-3.5 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-300 text-amber-950 flex items-center justify-center font-black text-sm border-b-2 border-amber-500">
                            🗣️
                          </div>
                          <div>
                            <span className="font-black text-base text-sky-950 lowercase">
                              {wordKey.toLowerCase()}
                            </span>
                            <span className="block text-[10px] text-emerald-700 font-bold">
                              May sariling boses
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => previewAudio('word', wordKey)}
                            className="p-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-black text-xs transition-all"
                            title="Pakinggan"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startRecordingFor('word', wordKey)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs transition-all"
                            title="I-record muli"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playPop();
                              soundEngine.removeWordAudio(wordKey);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-all"
                            title="Burahin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Close */}
        <div className="p-4 bg-sky-50 border-t-2 border-sky-100 flex items-center justify-between flex-wrap gap-2 text-xs text-sky-800 font-semibold">
          <span>Lahat ng boses ay ligtas na naka-save sa iyong browser cache.</span>
          <button
            type="button"
            onClick={() => {
              stopRecording();
              onClose();
            }}
            className="px-5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black border-b-3 border-amber-600 transition-all active:translate-y-0.5"
          >
            I-save at Isara
          </button>
        </div>
      </motion.div>
    </div>
  );
};
