import React from 'react';

interface CuteKnifeIconProps {
  className?: string;
  isCut?: boolean;
}

export const CuteKnifeIcon: React.FC<CuteKnifeIconProps> = ({
  className = 'w-6 h-6',
  isCut = false,
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300 ${
        isCut ? 'rotate-[-32deg] scale-110 drop-shadow-md' : 'rotate-[-12deg] hover:rotate-[-22deg]'
      }`}
    >
      <defs>
        {/* Steel blade gradient with bright metallic sheen */}
        <linearGradient id="knifeSteelGrad" x1="18" y1="14" x2="44" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E0F2FE" />
          <stop offset="70%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>

        {/* Sharp cutting bevel gradient */}
        <linearGradient id="bevelGrad" x1="20" y1="26" x2="43" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>

        {/* Rich polished wood handle gradient */}
        <linearGradient id="knifeWoodGrad" x1="4" y1="20" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="40%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
      </defs>

      {/* Knife Handle (Classic wooden kitchen knife grip) */}
      <path
        d="M 5,22.5 C 5,20 7,18.5 10.5,18.5 L 17.5,18.5 L 17.5,30.5 L 10.5,30.5 C 7,30.5 5,29 5,26.5 Z"
        fill="url(#knifeWoodGrad)"
        stroke="#431407"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Brass Rivet pins on the wooden handle */}
      <circle cx="9" cy="24.5" r="1.5" fill="#FEF08A" stroke="#854D0E" strokeWidth="0.8" />
      <circle cx="14" cy="24.5" r="1.5" fill="#FEF08A" stroke="#854D0E" strokeWidth="0.8" />

      {/* Metal Bolster / Collar (Separates handle from blade) */}
      <rect
        x="17.5"
        y="17"
        width="3"
        height="15"
        rx="1.5"
        fill="#94A3B8"
        stroke="#334155"
        strokeWidth="2"
      />

      {/* Primary Chef's Knife Blade: Flat spine, curved belly tip, straight heel drop */}
      <path
        d="M 20.5,17.5 L 37.5,17.5 C 41.5,18.5 44,21 44.5,23 C 43.5,26.5 39,29.5 33,30.8 C 27,32 20.5,31 20.5,31 Z"
        fill="url(#knifeSteelGrad)"
        stroke="#0284C7"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Polished Bottom Cutting Bevel (Shows sharpness) */}
      <path
        d="M 20.5,29.5 C 26,30.5 32,29.8 38,27.5 C 41.5,25.8 43.5,24.2 44.5,23"
        stroke="url(#bevelGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Blade Spine Highlight Gleam */}
      <path
        d="M 21.5,19 L 36.5,19"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Child-friendly cute facial expression on the blade */}
      {/* Eyes */}
      <circle cx="27" cy="22" r="1.4" fill="#0369A1" />
      {isCut ? (
        // Winking eye when sliced
        <path
          d="M 31,22.5 Q 32.5,21 34,22.5"
          stroke="#0369A1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <circle cx="32.5" cy="22" r="1.4" fill="#0369A1" />
      )}
      {/* Cheeks */}
      <circle cx="25" cy="24.5" r="1.2" fill="#F472B6" opacity="0.85" />
      <circle cx="34.5" cy="24.5" r="1.2" fill="#F472B6" opacity="0.85" />
      {/* Smile */}
      <path
        d="M 28.5,24 Q 30,26 31.5,24"
        stroke="#0369A1"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Slicing Action Burst when Cut */}
      {isCut && (
        <g>
          {/* Sparkle star at blade tip */}
          <path
            d="M 43,14 L 44,16.5 L 46.5,17.5 L 44,18.5 L 43,21 L 42,18.5 L 39.5,17.5 L 42,16.5 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="0.8"
          />
          {/* Swoosh slice trail */}
          <path
            d="M 18,12 C 24,7 33,6 40,9"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeDasharray="2 2"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};

