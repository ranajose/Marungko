import React, { useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { WordSegment, SyllableSegmentGroup } from '../types';
import { Plus, Minus, Clock } from 'lucide-react';
import { CuteKnifeIcon } from './CuteKnifeIcon';
import { soundEngine } from '../utils/audio';

interface SegmentProgressBarProps {
  segments: WordSegment[];
  currentTime: number; // in seconds
  totalDuration: number;
  isPlaying: boolean;
  activeSegmentIndex: number;
  sliceMode: boolean;
  syllableGroups: SyllableSegmentGroup[];
  onSeek: (time: number) => void;
  onUpdateSegmentDuration: (index: number, newDuration: number) => void;
  onToggleSliceCut: (index: number) => void;
  teacherMode: boolean;
}

export const SegmentProgressBar: React.FC<SegmentProgressBarProps> = ({
  segments,
  currentTime,
  totalDuration,
  isPlaying,
  activeSegmentIndex,
  sliceMode,
  syllableGroups,
  onSeek,
  onUpdateSegmentDuration,
  onToggleSliceCut,
  teacherMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const dragStartXRef = useRef<number>(0);
  const startDurationRef = useRef<number>(0);

  // Count active cuts between letters
  const cutCount = useMemo(() => {
    return segments.reduce(
      (count, seg, i) => (seg.isSyllableBreakAfter && i < segments.length - 1 ? count + 1 : count),
      0
    );
  }, [segments]);

  // Space percentage per cut (e.g. ~6.5% for 1 cut, distributed proportionally)
  const spacePercent = cutCount > 0 ? Math.max(4, Math.min(6.5, 20 / cutCount)) : 0;
  const totalSpacePercent = cutCount * spacePercent;
  const availableSegmentPercent = Math.max(20, 100 - totalSpacePercent);

  // Precompute segment widths and visual offsets
  const segmentLayout = useMemo(() => {
    if (totalDuration <= 0 || segments.length === 0) return [];
    let currentVisualLeft = 0;
    let currentDurationStart = 0;

    return segments.map((seg, idx) => {
      const segWidthPercent = (seg.duration / totalDuration) * availableSegmentPercent;
      const visualLeft = currentVisualLeft;
      const visualRight = visualLeft + segWidthPercent;
      const durationStart = currentDurationStart;
      const durationEnd = durationStart + seg.duration;

      const isCutAfter = seg.isSyllableBreakAfter && idx < segments.length - 1;
      currentDurationStart = durationEnd;
      currentVisualLeft = visualRight + (isCutAfter ? spacePercent : 0);

      return {
        seg,
        idx,
        widthPercent: segWidthPercent,
        visualLeft,
        visualRight,
        durationStart,
        durationEnd,
        isCutAfter,
      };
    });
  }, [segments, totalDuration, availableSegmentPercent, spacePercent]);

  // Compute exact visual progress percent for playhead and mascot
  const progressPercent = useMemo(() => {
    if (totalDuration <= 0 || segmentLayout.length === 0) return 0;
    if (currentTime <= 0) return 0;
    if (currentTime >= totalDuration) return 100;

    for (let i = 0; i < segmentLayout.length; i++) {
      const item = segmentLayout[i];
      if (currentTime >= item.durationStart && currentTime <= item.durationEnd) {
        const segDuration = item.durationEnd - item.durationStart;
        const progressInSeg = segDuration > 0 ? (currentTime - item.durationStart) / segDuration : 0;
        return Math.min(100, item.visualLeft + progressInSeg * item.widthPercent);
      }
    }
    return 100;
  }, [currentTime, totalDuration, segmentLayout]);

  // Handle clicking or scrubbing along the progress bar
  const handleBarInteraction = useCallback(
    (clientX: number) => {
      if (!containerRef.current || totalDuration <= 0 || segmentLayout.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (clickX / rect.width) * 100;

      for (let i = 0; i < segmentLayout.length; i++) {
        const item = segmentLayout[i];
        if (percentage >= item.visualLeft && percentage <= item.visualRight) {
          const frac = item.widthPercent > 0 ? (percentage - item.visualLeft) / item.widthPercent : 0;
          const newTime = item.durationStart + frac * (item.durationEnd - item.durationStart);
          onSeek(Math.max(0, Math.min(newTime, totalDuration)));
          return;
        } else if (item.isCutAfter && percentage > item.visualRight && percentage < item.visualRight + spacePercent) {
          const nextItem = segmentLayout[i + 1];
          if (nextItem) {
            onSeek(nextItem.durationStart);
            return;
          }
        }
      }

      const simpleTime = (clickX / rect.width) * totalDuration;
      onSeek(Math.max(0, Math.min(simpleTime, totalDuration)));
    },
    [totalDuration, segmentLayout, spacePercent, onSeek]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.no-seek') || target.closest('button')) return;

    setIsDraggingPlayhead(true);
    handleBarInteraction(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPlayhead) {
      handleBarInteraction(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPlayhead) {
      setIsDraggingPlayhead(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Drag-to-resize segment duration handlers
  const handleResizePointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setResizingIndex(index);
    dragStartXRef.current = e.clientX;
    startDurationRef.current = segments[index].duration;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (resizingIndex === null || !containerRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const barWidth = containerRef.current.clientWidth;
    const durationDelta = (deltaX / (barWidth || 600)) * totalDuration;
    const newDuration = Math.max(
      0.3,
      Math.min(4.0, Math.round((startDurationRef.current + durationDelta) * 10) / 10)
    );
    onUpdateSegmentDuration(resizingIndex, newDuration);
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (resizingIndex !== null) {
      setResizingIndex(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Playhead percentage position is calculated via useMemo above

  if (segments.length === 0) {
    return (
      <div
        id="empty-progress-bar-placeholder"
        className="w-full bg-gradient-to-br from-sky-50/80 via-white to-sky-100/60 rounded-[32px] sm:rounded-[40px] border-4 border-dashed border-sky-300 p-8 text-center shadow-md"
      >
        <div className="flex flex-col items-center justify-center gap-3 text-sky-950">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 border-b-4 border-amber-600 flex items-center justify-center text-3xl shadow-sm">
            🔤
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display text-sky-950">
            Pumili ng mga titik upang mabuo ang bar ng salita
          </h3>
          <p className="text-sm text-sky-800/80 font-semibold max-w-md">
            Pindutin ang mga letra ng Alpabetong Filipino sa ibaba (hal. <b>M - A - S</b>) upang lumitaw ang kulay na progress bar!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-sky-50/80 via-white to-sky-100/60 rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 shadow-lg border-4 border-sky-200 space-y-4">
      {/* Top Bar Header with Title & Duration info (Kulay ng Salita & May Hati buttons removed) */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-sky-950">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-sky-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block" />
            Progression Board
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm font-black text-sky-900">
          <div className="flex items-center gap-1.5 bg-white/90 border-2 border-sky-200 px-3.5 py-1.5 rounded-2xl text-xs font-mono shadow-xs">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>{currentTime.toFixed(1)}s</span>
            <span className="text-sky-300 font-normal">/</span>
            <span className="text-sky-950 font-black">{totalDuration.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* The Main Segmented Progress Bar Container */}
      <div className="relative pt-6 pb-2">
        {/* Animated Bouncing Mascot/Star on the Scrubber */}
        <div
          className="absolute top-0 pointer-events-none z-30 will-change-[left]"
          style={{
            left: `${progressPercent}%`,
            transform: 'translateX(-50%) translateZ(0)',
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Mascot Icon */}
            <motion.div
              animate={
                isPlaying
                  ? {
                      y: [0, -6, 0],
                      scale: [1, 1.2, 1],
                      rotate: [0, 6, -6, 0],
                    }
                  : { y: 0, scale: 1 }
              }
              transition={{
                repeat: isPlaying ? Infinity : 0,
                duration: 0.5,
                ease: 'easeInOut',
              }}
              className="w-9 h-9 rounded-2xl bg-yellow-300 text-yellow-950 flex items-center justify-center text-lg font-black shadow-lg border-2 border-white ring-2 ring-yellow-400"
            >
              ⭐
            </motion.div>
            {/* Arrow pointer down */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-yellow-400 drop-shadow-xs -mt-0.5" />
          </div>
        </div>

        {/* The Track with Letter Segments and Syllable Divisions */}
        <div
          ref={containerRef}
          id="segmented-audio-progress-bar"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-18 sm:h-22 w-full rounded-[24px] overflow-hidden cursor-pointer shadow-inner bg-sky-100 border-4 border-sky-300 flex select-none touch-none"
        >
          {segments.map((seg, idx) => {
            const layout = segmentLayout[idx];
            const widthPercent = layout ? layout.widthPercent : (seg.duration / totalDuration) * 100;
            const isActive = activeSegmentIndex === idx;
            const isCutAfter = seg.isSyllableBreakAfter && idx < segments.length - 1;
            const nextSeg = idx < segments.length - 1 ? segments[idx + 1] : null;

            return (
              <React.Fragment key={seg.id}>
                {/* Individual Segment */}
                <div
                  id={`progress-segment-${idx}`}
                  className="relative h-full flex flex-col items-center justify-center transition-colors border-r border-white/40"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: seg.color,
                    color: seg.textColor,
                  }}
                >
                  {/* Active Highlight Overlay (Glow/Pulse) */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.4, 0.85, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="absolute inset-0 bg-white/35 pointer-events-none mix-blend-overlay"
                    />
                  )}

                  {/* Subtle striped pattern for texture */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)',
                    }}
                  />

                  {/* Letter Text Display inside segment */}
                  <div className="relative z-10 flex flex-col items-center justify-center leading-none">
                    <span
                      className={`font-black tracking-tight font-display transition-transform lowercase ${
                        isActive ? 'scale-125 drop-shadow-lg' : 'scale-100'
                      } ${
                        seg.letter.length > 1
                          ? 'text-xl sm:text-2xl'
                          : 'text-2xl sm:text-3xl'
                      }`}
                    >
                      {seg.letter.toLowerCase()}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black opacity-95 mt-1 px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-xs">
                      {seg.duration.toFixed(1)}s
                    </span>
                  </div>

                  {/* Syllable Slice Divider Trigger (Cute Knife) when NOT cut yet */}
                  {!isCutAfter && idx < segments.length - 1 && (
                    <button
                      type="button"
                      title="Maglagay ng Hati"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playSliceSound();
                        onToggleSliceCut(idx);
                      }}
                      className="no-seek absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-md transition-all border-2 bg-white text-sky-700 border-sky-300 opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
                    >
                      <CuteKnifeIcon className="w-4 h-4 sm:w-5 sm:h-5" isCut={false} />
                    </button>
                  )}

                  {/* Interactive Drag Handle on Right Boundary to Elongate / Shorten (Teacher Mode) */}
                  {teacherMode && idx < segments.length - 1 && !isCutAfter && (
                    <div
                      title="I-drag upang pahabain o paikliin ang oras"
                      onPointerDown={(e) => handleResizePointerDown(idx, e)}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      className="no-seek absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-white/40 active:bg-white/70 z-10 flex items-center justify-center group"
                    >
                      <div className="w-1 h-8 bg-white/70 rounded-full group-hover:bg-white group-hover:h-12 transition-all shadow-xs" />
                    </div>
                  )}
                </div>

                {/* Sliced Space Divider with Gradient of the 2 colors of the letters between */}
                {isCutAfter && nextSeg && (
                  <div
                    key={`bar-slice-space-${idx}`}
                    id={`slice-space-${idx}`}
                    title={`Puwang ng Hati sa Pagitan ng "${seg.letter}" at "${nextSeg.letter}"`}
                    className="no-seek relative h-full shrink-0 flex items-center justify-center border-x-2 border-dashed border-white/80 shadow-inner group overflow-visible"
                    style={{
                      width: `${spacePercent}%`,
                      background: `linear-gradient(to right, ${seg.color}, ${nextSeg.color})`,
                    }}
                  >
                    {/* Subtle dark notch overlay to emphasize the cut opening */}
                    <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                    <div className="w-0.5 h-8 bg-white/80 rounded-full z-10 shadow-xs" />

                    {/* Cute Knife Button centered directly in the gradient space */}
                    <button
                      type="button"
                      title="Alisin ang Hati"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playSliceSound();
                        onToggleSliceCut(idx);
                      }}
                      className="no-seek z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-md transition-all border-2 bg-amber-400 text-amber-950 border-amber-600 ring-2 ring-white scale-110 active:scale-95 hover:scale-120"
                    >
                      <CuteKnifeIcon className="w-4 h-4 sm:w-5 sm:h-5" isCut={true} />
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Vertical Needle line marking exact current time */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-white shadow-xl shadow-black/40 z-20 pointer-events-none will-change-[left]"
            style={{
              left: `${progressPercent}%`,
              transform: 'translateX(-50%) translateZ(0)',
            }}
          >
            <div className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-white absolute top-1/2 -translate-y-1/2 -translate-x-[3px]" />
          </div>
        </div>
      </div>

      {/* Segment Pacing & Duration Controls: Kept in Teacher Mode to preserve simplicity in Student Mode */}
      {teacherMode && (
        <div className="pt-3 border-t-2 border-sky-100">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-sky-950 uppercase tracking-wide">
              <span>Oras ng bawat letra (Elongate / Shorten):</span>
            </div>
            <span className="text-xs text-sky-800/80 font-semibold">
              I-click ang <b>+</b> o <b>-</b> upang baguhin ang bilis ng pagbasa ng bawat titik
            </span>
          </div>

          {/* Letter Duration Stepper Pill Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {segments.map((seg, idx) => (
              <div
                key={`dur-control-${seg.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 border-b-4 transition-all ${
                  activeSegmentIndex === idx
                    ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                    : 'border-sky-200 bg-sky-50/70 hover:bg-sky-100/70'
                }`}
              >
                {/* Colored letter dot */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-xs lowercase"
                  style={{ backgroundColor: seg.color }}
                >
                  {seg.letter[0].toLowerCase()}
                </div>
                <span className="font-black text-sm text-sky-950 lowercase">
                  {seg.letter.toLowerCase()}
                </span>

                {/* Shorten Button (-) */}
                <button
                  type="button"
                  id={`btn-shorten-${idx}`}
                  title={`Paikliin ang tunog ng ${seg.letter} (-0.2s)`}
                  onClick={() => {
                    soundEngine.playPop();
                    onUpdateSegmentDuration(idx, Math.max(0.3, seg.duration - 0.2));
                  }}
                  className="w-7 h-7 rounded-xl bg-white hover:bg-sky-100 text-sky-950 border-2 border-b-3 border-sky-300 flex items-center justify-center text-xs font-black active:translate-y-0.5 active:border-b transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Duration Value */}
                <span className="w-12 text-center font-mono text-xs font-black text-sky-950">
                  {seg.duration.toFixed(1)}s
                </span>

                {/* Elongate Button (+) */}
                <button
                  type="button"
                  id={`btn-elongate-${idx}`}
                  title={`Pahabain ang tunog ng ${seg.letter} (+0.2s)`}
                  onClick={() => {
                    soundEngine.playPop();
                    onUpdateSegmentDuration(idx, Math.min(4.0, seg.duration + 0.2));
                  }}
                  className="w-7 h-7 rounded-xl bg-white hover:bg-sky-100 text-sky-950 border-2 border-b-3 border-sky-300 flex items-center justify-center text-xs font-black active:translate-y-0.5 active:border-b transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
