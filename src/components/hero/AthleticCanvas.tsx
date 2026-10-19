import React from "react";

export function AthleticCanvas() {
  return (
    <div
      id="illustration-canvas"
      className="relative w-full h-[300vh] bg-gradient-to-b from-[#4A00E0] via-[#3B00B3] to-[#2E008B]"
    >
      <svg
        viewBox="0 0 1440 2700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Garis Orbit & Lintasan Tipis (Swimming Lanes & Running Tracks) */}
        <circle cx="480" cy="250" r="190" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
        <circle cx="480" cy="250" r="150" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <path d="M 180 780 Q 650 580 1180 980" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" fill="none" />
        <path d="M 300 1650 Q 750 1850 1200 1700" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" fill="none" />

        {/* ================= SCENE 1: AKUATIK & PENGALAMAN AWAL (SWIMMING ACADEMY) ================= */}
        {/* Bola Biru & Orbit Energi Air */}
        <circle cx="490" cy="250" r="95" fill="#5E2BFF" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="515" cy="255" r="58" fill="url(#blueSphereGrad)" />
        <path d="M475 225 L485 205 L500 220 Z" fill="#2A0875" />
        <path d="M515 220 L530 205 L535 225 Z" fill="#2A0875" />

        {/* Hati 3D Pink-Kuning Besar (Semangat & Passion Olahraga) */}
        <g transform="translate(830, 75) rotate(12)">
          <path
            d="M140 60 C140 20 195 0 230 35 C265 0 320 20 320 60 C320 130 230 185 230 235 C230 185 140 130 140 60 Z"
            fill="#FFA800"
            transform="translate(-22, 14)"
          />
          <path
            d="M140 60 C140 20 195 0 230 35 C265 0 320 20 320 60 C320 130 230 185 230 235 C230 185 140 130 140 60 Z"
            fill="#FF5E9E"
          />
          <path
            d="M185 75 C185 55 212 45 230 62 C248 45 275 55 275 75 C275 110 230 138 230 162 C230 138 185 110 185 75 Z"
            fill="#27007A"
          />
        </g>

        {/* ================= SCENE 2: MOTORIK, ARAH & GERAK DASAR ================= */}
        {/* Balon Chat Gelap & Ikon Sensorimotor */}
        <g transform="translate(210, 620) rotate(-18)">
          <rect x="0" y="0" width="240" height="130" rx="18" fill="#1F0066" stroke="#7B42FF" strokeWidth="2" />
          <polygon points="190,130 230,130 250,165" fill="#1F0066" />
          <circle cx="65" cy="65" r="12" fill="#4A1FB8" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="120" cy="65" r="12" fill="#4A1FB8" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="175" cy="65" r="12" fill="#4A1FB8" stroke="#ffffff" strokeWidth="1.5" />
        </g>

        {/* Batang Pensil Kuning Raksasa (Fokus & Pembinaan) */}
        <g transform="translate(560, 560) rotate(32)">
          <rect x="0" y="130" width="125" height="680" fill="#FFE169" />
          <rect x="35" y="130" width="55" height="680" fill="#FFC700" />
          <rect x="90" y="130" width="35" height="680" fill="#E09F00" />
          <polygon points="0,130 62.5,0 125,130" fill="#FF8577" />
          <polygon points="41,45 62.5,0 84,45" fill="#4A0E17" />
        </g>

        {/* Balon Interaksi Komunitas Kanan */}
        <g transform="translate(940, 720)">
          <rect x="50" y="0" width="210" height="140" rx="12" fill="#2A008C" stroke="#FF70A6" strokeWidth="1.5" />
          <circle cx="45" cy="70" r="24" fill="#FFE6EB" />
          <circle cx="105" cy="70" r="24" fill="#FF9E00" />
          <circle cx="165" cy="70" r="24" fill="#6B0F1A" />
        </g>

        {/* ================= SCENE 3: KEKUATAN & PERSIAPAN JASMANI ================= */}
        {/* Mesin Olahraga Ungu berkaki Pink */}
        <g transform="translate(330, 1140) rotate(22)">
          <rect x="0" y="0" width="330" height="220" rx="45" fill="#5928E5" stroke="#230075" strokeWidth="3" />
          <polygon points="60,210 95,210 75,310" fill="#FF66B2" />
          <polygon points="210,210 245,210 225,310" fill="#FF66B2" />
        </g>

        {/* Layar Monitor Isometrik di Kanan (Pemantauan Metrik Fisik) */}
        <g transform="translate(860, 1020) rotate(-14)">
          <rect x="0" y="0" width="450" height="580" rx="28" fill="#4E1EC4" stroke="#7E52FF" strokeWidth="3" />
          <rect x="45" y="45" width="360" height="390" rx="16" fill="#220070" />
          <rect x="80" y="90" width="240" height="110" rx="12" fill="#140047" stroke="#FF66B2" strokeWidth="1.5" />
          <path d="M 160 490 Q 225 535 290 490" stroke="#110038" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="285" cy="505" r="22" fill="#FFF275" />
        </g>

        {/* ================= SCENE 4: SINERGI KOMUNITAS & FESTIVAL 10.10.26 ================= */}
        {/* Karakter Bola Biru-Hijau Besar Tersenyum (Kegembiraan Anak Bergerak Aktif) */}
        <g transform="translate(60, 1460)">
          <circle cx="340" cy="380" r="340" fill="url(#bigSmileGrad)" />
          <ellipse cx="195" cy="275" rx="6" ry="22" fill="#140047" transform="rotate(-12 195 275)" />
          <ellipse cx="295" cy="260" rx="6" ry="22" fill="#140047" transform="rotate(-12 295 260)" />
          <path d="M 110 325 C 140 485, 360 465, 385 295" stroke="#140047" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 98 320 L 122 330" stroke="#140047" strokeWidth="6" strokeLinecap="round" />
          <path d="M 372 292 L 398 300" stroke="#140047" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Topi Kerucut Pesta & Podium Sejarah VOCA 10.10.26 */}
        <g transform="translate(740, 1580)">
          <polygon points="120,0 25,240 215,240" fill="#FF4D8D" />
          <path d="M 62 150 Q 120 180 178 150" stroke="#FFC700" strokeWidth="28" fill="none" />
          <rect x="10" y="240" width="220" height="110" fill="#4A15AD" />
          <circle cx="120" cy="315" r="42" fill="#1A0052" stroke="#FFF275" strokeWidth="8" strokeDasharray="12 12" />
        </g>

        {/* Gradients */}
        <defs>
          <radialGradient id="blueSphereGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#BCE0FD" />
            <stop offset="50%" stopColor="#5E7CE2" />
            <stop offset="100%" stopColor="#2A1B9E" />
          </radialGradient>
          <radialGradient id="bigSmileGrad" cx="25%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#D4FC79" />
            <stop offset="35%" stopColor="#96E6A1" />
            <stop offset="70%" stopColor="#4E65FF" />
            <stop offset="100%" stopColor="#2B0996" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
