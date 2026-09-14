import React from 'react';
import { AvatarConfig } from '../types';

interface AvatarDisplayProps {
  avatar: AvatarConfig;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  size = 140,
  className = '',
  animate = false,
}) => {
  const {
    skin = '#8d5524',
    hair = '#21160f',
    hairStyle = 'long',
    shirt = '#10b981',
    outfit = 'hoodie',
    accessory = 'headset',
    accessoryColor = '#ffd447',
    face = 'smile',
    eyes = 'round',
    gender = 'female',
  } = avatar || {};

  // Expressão dos olhos
  let eyesSvg = (
    <g className={animate ? 'animate-pulse' : ''}>
      <ellipse cx="48" cy="48" rx="3.5" ry="4" fill="#0f172a" />
      <ellipse cx="72" cy="48" rx="3.5" ry="4" fill="#0f172a" />
      <circle cx="49.5" cy="46.5" r="1.3" fill="#ffffff" />
      <circle cx="73.5" cy="46.5" r="1.3" fill="#ffffff" />
    </g>
  );

  if (eyes === 'soft') {
    eyesSvg = (
      <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M43 49 Q48 53 53 49" />
        <path d="M67 49 Q72 53 77 49" />
      </g>
    );
  } else if (eyes === 'bright') {
    eyesSvg = (
      <g>
        <circle cx="48" cy="48" r="4.5" fill="#0f172a" />
        <circle cx="72" cy="48" r="4.5" fill="#0f172a" />
        <circle cx="49" cy="46" r="2" fill="#38bdf8" />
        <circle cx="73" cy="46" r="2" fill="#38bdf8" />
        <circle cx="50" cy="45" r="1" fill="#ffffff" />
        <circle cx="74" cy="45" r="1" fill="#ffffff" />
      </g>
    );
  }

  // Sorriso / Expressão
  let mouthSvg = <path d="M51 60 Q60 66 69 60" fill="none" stroke="#4a1508" strokeWidth="3" strokeLinecap="round" />;
  if (face === 'happy') {
    mouthSvg = (
      <g>
        <path d="M49 58 Q60 70 71 58 Z" fill="#b91c1c" />
        <path d="M51 58 Q60 62 69 58" stroke="#ffffff" strokeWidth="2" fill="none" />
      </g>
    );
  } else if (face === 'cool') {
    mouthSvg = <path d="M52 61 Q61 63 68 60" fill="none" stroke="#4a1508" strokeWidth="3" strokeLinecap="round" />;
  }

  // Penteado detalhado
  let hairSvg = null;
  if (hairStyle === 'curly') {
    hairSvg = (
      <g fill={hair}>
        <circle cx="38" cy="28" r="10" />
        <circle cx="50" cy="18" r="11" />
        <circle cx="64" cy="17" r="11" />
        <circle cx="78" cy="24" r="10" />
        <circle cx="86" cy="35" r="9" />
        <circle cx="32" cy="39" r="9" />
        <circle cx="30" cy="52" r="8" />
        <circle cx="88" cy="50" r="8" />
        <path d="M34 42 Q60 20 86 42 Q60 27 34 42 Z" opacity="0.9" />
      </g>
    );
  } else if (hairStyle === 'long') {
    hairSvg = (
      <g fill={hair}>
        <path d="M28 48 Q28 14 60 14 Q92 14 92 48 V85 H28 Z" />
        <path d="M38 32 Q60 22 82 32" stroke="#ffffff33" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M34 50 Q24 75 30 92 Q34 80 38 65" fill={hair} />
        <path d="M86 50 Q96 75 90 92 Q86 80 82 65" fill={hair} />
      </g>
    );
  } else if (hairStyle === 'bob') {
    hairSvg = (
      <g fill={hair}>
        <path d="M29 48 Q29 16 60 16 Q91 16 91 48 V72 Q78 78 60 70 Q42 78 29 72 Z" />
        <path d="M35 34 Q60 25 85 34" stroke="#ffffff26" strokeWidth="3" fill="none" />
      </g>
    );
  } else if (hairStyle === 'fade') {
    hairSvg = (
      <g fill={hair}>
        <path d="M35 40 Q38 18 60 18 Q82 18 85 40 Q74 34 60 34 Q46 34 35 40 Z" />
        <path d="M36 38 Q42 28 54 26" stroke="#ffffff33" strokeWidth="2.5" fill="none" />
      </g>
    );
  } else if (hairStyle === 'braids') {
    hairSvg = (
      <g fill={hair}>
        <path d="M31 46 Q31 16 60 16 Q89 16 89 46 V65 H31 Z" />
        <path d="M32 50 Q18 78 30 102 M88 50 Q102 78 90 102" stroke={hair} strokeWidth="10" strokeLinecap="round" fill="none" />
        <circle cx="30" cy="100" r="4" fill={accessoryColor} />
        <circle cx="90" cy="100" r="4" fill={accessoryColor} />
      </g>
    );
  } else {
    // Spikes / Clássico
    hairSvg = (
      <g fill={hair}>
        <path d="M30 45 Q32 18 60 18 Q88 18 90 45 Q75 33 60 33 Q45 33 30 45 Z" />
        <polygon points="40,22 34,8 48,16" />
        <polygon points="52,17 60,6 68,17" />
        <polygon points="72,17 84,9 78,23" />
      </g>
    );
  }

  // Traje / Roupa
  let outfitSvg = (
    <g>
      <path d="M26 88 Q60 68 94 88 L105 140 H15 Z" fill={shirt} />
      <path d="M46 88 Q60 98 74 88" stroke="#ffffff55" strokeWidth="3" fill="none" />
    </g>
  );

  if (outfit === 'hoodie') {
    outfitSvg = (
      <g>
        <path d="M25 87 Q60 64 95 87 L107 142 H13 Z" fill={shirt} />
        <path d="M46 87 Q60 100 74 87" fill="#0f172a44" stroke="#ffffff44" strokeWidth="2.5" />
        <path d="M49 94 V116 M71 94 V116" stroke="#ffffffaa" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="49" cy="117" r="2.5" fill="#f8fafc" />
        <circle cx="71" cy="117" r="2.5" fill="#f8fafc" />
      </g>
    );
  } else if (outfit === 'jacket') {
    outfitSvg = (
      <g>
        <path d="M24 86 Q60 65 96 86 L108 142 H12 Z" fill={shirt} />
        <path d="M60 86 V142" stroke="#e2e8f0" strokeWidth="3.5" />
        <path d="M30 92 L22 138 M90 92 L98 138" stroke="#ffffff33" strokeWidth="4" />
        <rect x="52" y="104" width="16" height="4" rx="2" fill="#ffd447" />
      </g>
    );
  } else if (outfit === 'tech') {
    outfitSvg = (
      <g>
        <path d="M23 86 Q60 63 97 86 L109 142 H11 Z" fill="#0f172a" />
        <path d="M23 86 Q60 63 97 86 L109 142 H11 Z" fill={shirt} opacity="0.3" />
        <rect x="36" y="98" width="48" height="22" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="46" cy="109" r="3.5" fill="#22c55e" />
        <circle cx="60" cy="109" r="3.5" fill="#ffd447" />
        <circle cx="74" cy="109" r="3.5" fill="#38bdf8" />
      </g>
    );
  }

  // Acessórios
  let accSvg = null;
  if (accessory === 'headset') {
    accSvg = (
      <g>
        <path d="M28 46 Q28 14 60 14 Q92 14 92 46" fill="none" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
        <rect x="19" y="38" width="13" height="26" rx="6" fill={accessoryColor} stroke="#1e293b" strokeWidth="2" />
        <rect x="88" y="38" width="13" height="26" rx="6" fill={accessoryColor} stroke="#1e293b" strokeWidth="2" />
        <path d="M26 58 Q34 76 50 76" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="51" cy="76" r="3.5" fill="#22c55e" />
      </g>
    );
  } else if (accessory === 'glasses') {
    accSvg = (
      <g>
        <rect x="33" y="41" width="24" height="17" rx="5" fill="#38bdf822" stroke={accessoryColor} strokeWidth="2.5" />
        <rect x="63" y="41" width="24" height="17" rx="5" fill="#38bdf822" stroke={accessoryColor} strokeWidth="2.5" />
        <path d="M57 48 H63" stroke={accessoryColor} strokeWidth="2.5" />
        <path d="M33 46 H27 M87 46 H93" stroke={accessoryColor} strokeWidth="2" />
      </g>
    );
  } else if (accessory === 'cap') {
    accSvg = (
      <g>
        <path d="M30 35 Q60 12 90 35 L86 42 H34 Z" fill={accessoryColor} />
        <path d="M68 40 L102 44" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="60" cy="22" r="3" fill="#1e293b" />
      </g>
    );
  } else if (accessory === 'visor') {
    accSvg = (
      <g>
        <path d="M28 40 Q60 28 92 40 V50 Q60 40 28 50 Z" fill="#38bdf844" stroke={accessoryColor} strokeWidth="2.5" />
        <line x1="38" y1="44" x2="82" y2="44" stroke="#ffffff66" strokeWidth="1.5" />
      </g>
    );
  } else if (accessory === 'earrings') {
    accSvg = (
      <g>
        <circle cx="28" cy="58" r="3.5" fill={accessoryColor} />
        <circle cx="92" cy="58" r="3.5" fill={accessoryColor} />
      </g>
    );
  } else if (accessory === 'badge') {
    accSvg = (
      <g>
        <circle cx="86" cy="98" r="9" fill={accessoryColor} stroke="#0f172a" strokeWidth="2" />
        <text x="82.5" y="102" fontSize="9" fontWeight="bold" fill="#0f172a">
          ★
        </text>
      </g>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: (size * 160) / 120 }}
    >
      <svg
        viewBox="0 0 120 160"
        width={size}
        height={(size * 160) / 120}
        role="img"
        aria-label={`Avatar estilizado ${gender}`}
        className="overflow-visible drop-shadow-md"
      >
        {/* Sombra base */}
        <ellipse cx="60" cy="150" rx="34" ry="8" fill="#00000033" />

        {/* Cabelo de fundo (para estilos longos) */}
        {hairStyle === 'long' && (
          <path d="M26 48 Q26 12 60 12 Q94 12 94 48 V92 H26 Z" fill={hair} />
        )}

        {/* Pescoço */}
        <rect x="53" y="70" width="14" height="18" rx="4" fill={skin} />

        {/* Cabeça */}
        <circle cx="60" cy="50" r="28" fill={skin} />

        {/* Cabelo frontal */}
        {hairSvg}

        {/* Olhos e Expressão */}
        {eyesSvg}
        {mouthSvg}

        {/* Bochechas sutis */}
        <circle cx="41" cy="55" r="3.5" fill="#f43f5e" opacity="0.25" />
        <circle cx="79" cy="55" r="3.5" fill="#f43f5e" opacity="0.25" />

        {/* Traje */}
        {outfitSvg}

        {/* Braços / Ombros */}
        <path d="M30 102 L14 135" stroke={skin} strokeWidth="10" strokeLinecap="round" />
        <path d="M90 102 L106 135" stroke={skin} strokeWidth="10" strokeLinecap="round" />

        {/* Acessório */}
        {accSvg}
      </svg>
    </div>
  );
};
