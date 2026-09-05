import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Mic,
  Square,
  Volume2,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { CuteKnifeIcon } from './CuteKnifeIcon';
import { soundEngine } from '../utils/audio';

interface PlaybackControlsProps {
  isPlaying: boolean;
  sliceMode: boolean;
  pacingMultiplier: number;
  onTogglePlay: () => void;
  onReplay: () => void;
  onToggleSlice: () => void;
  onChangePacing: (multiplier: number) => void;
  onCheck: () => void;
  isChecking?: boolean;
  disabled: boolean;
  teacherMode?: boolean;
  wordString?: string;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  sliceMode,
  pacingMultiplier,
  onTogglePlay,
  onReplay,
  onToggleSlice,
  onChangePacing,
  onCheck,
  isChecking = false,
  disabled,
  teacherMode = false,
  wordString = '',
}) => {
  // Ephemeral Voice Recording state for student practice (never saved permanently)
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const playAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clears and disposes of the student's recorded audio completely
  const clearRecordedAudio = () => {
    if (playAudioRef.current) {
      try {
        playAudioRef.current.pause();
      } catch {}
      playAudioRef.current = null;
    }
    setIsPlayingRecorded(false);

    if (recordedAudioUrl) {
      try {
        URL.revokeObjectURL(recordedAudioUrl);
      } catch {}
      setRecordedAudioUrl(null);
    }

    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      setIsRecording(false);
    }
  };

  // When word changes, clear any previous recording
  useEffect(() => {
    clearRecordedAudio();
  }, [wordString]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playAudioRef.current) {
        try {
          playAudioRef.current.pause();
        } catch {}
      }
      if (recordedAudioUrl) {
        try {
          URL.revokeObjectURL(recordedAudioUrl);
        } catch {}
      }
    };
  }, [recordedAudioUrl]);

  // Handle Ulitin click: removes the recorded audio and resets playback to start
  const handleReplayClick = () => {
    clearRecordedAudio();
    onReplay();
  };

  const startRecording = async () => {
    try {
      if (playAudioRef.current) {
        playAudioRef.current.pause();
        setIsPlayingRecorded(false);
      }
      // Revoke any previous temporary recording so nothing persists
      if (recordedAudioUrl) {
        try {
          URL.revokeObjectURL(recordedAudioUrl);
        } catch {}
        setRecordedAudioUrl(null);
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Create an ephemeral, in-memory object URL that is NOT saved to disk or server
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Auto start playback so the child can read along with the bar
      if (!isPlaying) {
        onTogglePlay();
      }
    } catch {
      alert('Kailangan ng pahintulot sa mikropuno upang makapagrehistro.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecordedVoice = () => {
    if (recordedAudioUrl) {
      if (playAudioRef.current) {
        playAudioRef.current.pause();
      }
      const audio = new Audio(recordedAudioUrl);
      playAudioRef.current = audio;
      setIsPlayingRecorded(true);
      audio.onended = () => setIsPlayingRecorded(false);
      audio.onerror = () => setIsPlayingRecorded(false);
      audio.play().catch(() => setIsPlayingRecorded(false));
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 sm:gap-4 py-2">
      {/* Primary Row of Large Playful Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {/* Replay Button */}
        <button
          type="button"
          id="btn-replay"
          disabled={disabled}
          onClick={handleReplayClick}
          title="Ulitin mula simula (Replay)"
          className="flex flex-col items-center justify-center w-18 h-18 sm:w-22 sm:h-22 rounded-[28px] sm:rounded-3xl bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-md border-b-6 border-amber-600 active:translate-y-1 active:border-b-2 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-[11px] sm:text-xs font-black uppercase mt-1">Ulitin</span>
        </button>

        {/* Giant Main Play / Pause Button */}
        <motion.button
          type="button"
          id="btn-play-pause"
          disabled={disabled}
          onClick={onTogglePlay}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center justify-center gap-3 px-8 sm:px-14 h-20 sm:h-24 rounded-[32px] sm:rounded-[40px] font-black text-2xl sm:text-3xl shadow-xl transition-all select-none disabled:opacity-40 disabled:pointer-events-none ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-400 text-white border-b-8 border-rose-700 shadow-rose-500/30 active:translate-y-1.5 active:border-b-2'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-8 border-emerald-700 shadow-emerald-500/40 ring-4 ring-emerald-300/60 active:translate-y-1.5 active:border-b-2'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
              <span>IHINTO</span>
            </>
          ) : (
            <>
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              <span>SUBUKAN</span>
            </>
          )}
        </motion.button>

        {/* I-Record Button (Before I-Check so kids can practice and try again) */}
        <motion.button
          type="button"
          id="btn-student-record"
          disabled={disabled}
          onClick={isRecording ? stopRecording : startRecording}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          title={
            isRecording
              ? 'Itigil ang pag-record'
              : recordedAudioUrl
              ? 'I-record Ulit (Subukan Muli)'
              : 'I-record ang sarili habang binabasa'
          }
          className={`flex flex-col items-center justify-center min-w-[88px] sm:min-w-[104px] h-18 sm:h-22 px-3.5 rounded-[28px] sm:rounded-3xl font-black shadow-md border-b-6 transition-all select-none disabled:opacity-40 disabled:pointer-events-none active:translate-y-1 active:border-b-2 ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800 animate-pulse ring-4 ring-rose-300'
              : 'bg-rose-500 hover:bg-rose-400 text-white border-rose-700 shadow-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-1">
            {isRecording ? (
              <Square className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            ) : (
              <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-black uppercase mt-1 leading-tight text-center">
            {isRecording ? 'Itigil' : recordedAudioUrl ? 'I-Record Ulit' : 'I-Record'}
          </span>
        </motion.button>

        {/* Hear Recorded Voice Button (Immediately allows hearing without saving) */}
        {recordedAudioUrl && !isRecording && (
          <motion.button
            type="button"
            id="btn-student-play-own-voice"
            onClick={playRecordedVoice}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            title="Pakinggan ang boses mo!"
            className={`flex flex-col items-center justify-center min-w-[88px] sm:min-w-[104px] h-18 sm:h-22 px-3.5 rounded-[28px] sm:rounded-3xl font-black shadow-md border-b-6 transition-all select-none active:translate-y-1 active:border-b-2 ${
              isPlayingRecorded
                ? 'bg-emerald-400 text-emerald-950 border-emerald-600 ring-4 ring-emerald-200'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700 shadow-emerald-500/30'
            }`}
          >
            <div className="flex items-center gap-1">
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase mt-1 leading-tight text-center">
              {isPlayingRecorded ? 'Nakikinig...' : 'Pakinggan'}
            </span>
          </motion.button>
        )}

        {/* Check Button to Verify Pronunciation */}
        <motion.button
          type="button"
          id="btn-check-pronunciation"
          disabled={disabled || isChecking}
          onClick={onCheck}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          title="I-check kung tama ang pagbasa mo!"
          className={`flex flex-col items-center justify-center min-w-[88px] sm:min-w-[104px] h-18 sm:h-22 px-3.5 rounded-[28px] sm:rounded-3xl font-black shadow-md border-b-6 transition-all select-none disabled:opacity-40 disabled:pointer-events-none active:translate-y-1 active:border-b-2 ${
            isChecking
              ? 'bg-teal-400 text-teal-950 border-teal-600 animate-pulse ring-4 ring-teal-200'
              : 'bg-teal-500 hover:bg-teal-400 text-white border-teal-700 shadow-teal-500/30'
          }`}
        >
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-teal-600" />
          </div>
          <span className="text-[10px] sm:text-xs font-black uppercase mt-1 leading-tight text-center">
            {isChecking ? 'Sinusuri...' : 'I-Check'}
          </span>
        </motion.button>

        {/* Slice Syllables Toggle Button with Cute Child-Friendly Knife */}
        <motion.button
          type="button"
          id="btn-toggle-slice"
          disabled={disabled}
          onClick={() => {
            soundEngine.playSliceSound();
            onToggleSlice();
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className={`flex flex-col items-center justify-center min-w-[84px] sm:min-w-[96px] h-18 sm:h-22 px-3 rounded-[28px] sm:rounded-3xl font-black shadow-md border-b-6 transition-all select-none disabled:opacity-40 disabled:pointer-events-none active:translate-y-1 active:border-b-2 ${
            sliceMode
              ? 'bg-amber-400 text-amber-950 border-amber-600 shadow-amber-500/30 ring-2 ring-white'
              : 'bg-white hover:bg-sky-50 text-sky-950 border-2 border-b-6 border-sky-200 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center gap-1">
            <CuteKnifeIcon className="w-6 h-6 sm:w-7 sm:h-7" isCut={sliceMode} />
            <span className="text-[10px] sm:text-xs font-black uppercase">
              {sliceMode ? 'ON' : 'OFF'}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-black uppercase mt-1 leading-tight text-center">
            Hiwa (Slice)
          </span>
        </motion.button>
      </div>

      {/* Secondary Controls: Pacing Speed Multiplier Selector (Shown ONLY in Mode ng Guro) */}
      {teacherMode && (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
          {/* Pacing Speed Multiplier Selector */}
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-[24px] border-4 border-sky-200 shadow-md">
            <div className="flex items-center gap-1 pl-2 pr-1 text-xs font-black text-sky-950 uppercase">
              <Gauge className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Bilis:</span>
            </div>
            <button
              type="button"
              id="pacing-slow"
              onClick={() => onChangePacing(1.5)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all active:translate-y-0.5 ${
                pacingMultiplier === 1.5
                  ? 'bg-amber-400 text-amber-950 border-b-3 border-amber-600 shadow-xs'
                  : 'bg-sky-50 text-sky-900 hover:bg-sky-100'
              }`}
            >
              🐢 1.5x
            </button>
            <button
              type="button"
              id="pacing-normal"
              onClick={() => onChangePacing(1.0)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all active:translate-y-0.5 ${
                pacingMultiplier === 1.0
                  ? 'bg-amber-400 text-amber-950 border-b-3 border-amber-600 shadow-xs'
                  : 'bg-sky-50 text-sky-900 hover:bg-sky-100'
              }`}
            >
              🚶 1.0x
            </button>
            <button
              type="button"
              id="pacing-fast"
              onClick={() => onChangePacing(0.7)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all active:translate-y-0.5 ${
                pacingMultiplier === 0.7
                  ? 'bg-amber-400 text-amber-950 border-b-3 border-amber-600 shadow-xs'
                  : 'bg-sky-50 text-sky-900 hover:bg-sky-100'
              }`}
            >
              🐇 0.7x
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
