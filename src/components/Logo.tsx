import React from 'react';

export const Logo = ({ className = 'w-12 h-12' }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#6402FF', stopOpacity: 0.1 }}>
            <animate
              attributeName="stopOpacity"
              values="0.1;0.3;0.1"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" style={{ stopColor: '#6402FF', stopOpacity: 0.3 }}>
            <animate
              attributeName="stopOpacity"
              values="0.3;0.5;0.3"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Left Wing */}
      <path
        d="M50,30 C30,30 20,50 30,70 C35,60 45,55 50,55"
        fill="url(#wingGradient)"
        stroke="#6402FF"
        strokeWidth="1"
        filter="url(#glow)"
      >
        <animate
          attributeName="d"
          dur="3s"
          repeatCount="indefinite"
          values="
            M50,30 C30,30 20,50 30,70 C35,60 45,55 50,55;
            M50,30 C25,35 15,50 30,70 C35,60 45,55 50,55;
            M50,30 C30,30 20,50 30,70 C35,60 45,55 50,55
          "
        />
      </path>

      {/* Right Wing */}
      <path
        d="M50,30 C70,30 80,50 70,70 C65,60 55,55 50,55"
        fill="url(#wingGradient)"
        stroke="#6402FF"
        strokeWidth="1"
        filter="url(#glow)"
      >
        <animate
          attributeName="d"
          dur="3s"
          repeatCount="indefinite"
          values="
            M50,30 C70,30 80,50 70,70 C65,60 55,55 50,55;
            M50,30 C75,35 85,50 70,70 C65,60 55,55 50,55;
            M50,30 C70,30 80,50 70,70 C65,60 55,55 50,55
          "
        />
      </path>

      {/* Body */}
      <path
        d="M45,30 L55,30 L55,70 C55,72 52,75 50,75 C48,75 45,72 45,70 Z"
        fill="#6402FF"
        fillOpacity="0.2"
        stroke="#6402FF"
        strokeWidth="1"
        filter="url(#glow)"
      >
        <animate
          attributeName="d"
          dur="3s"
          repeatCount="indefinite"
          values="
            M45,30 L55,30 L55,70 C55,72 52,75 50,75 C48,75 45,72 45,70 Z;
            M45,32 L55,32 L55,72 C55,74 52,77 50,77 C48,77 45,74 45,72 Z;
            M45,30 L55,30 L55,70 C55,72 52,75 50,75 C48,75 45,72 45,70 Z
          "
        />
      </path>

      {/* Antennae */}
      {[1, -1].map((direction) => (
        <path
          key={direction}
          d={`M50,30 Q${50 + direction * 10},20 ${50 + direction * 15},15`}
          fill="none"
          stroke="#6402FF"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        >
          <animate
            attributeName="d"
            dur="3s"
            repeatCount="indefinite"
            values={`
              M50,30 Q${50 + direction * 10},20 ${50 + direction * 15},15;
              M50,30 Q${50 + direction * 12},18 ${50 + direction * 17},13;
              M50,30 Q${50 + direction * 10},20 ${50 + direction * 15},15
            `}
          />
        </path>
      ))}

      <style>
        {`
          @keyframes flutter {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
        `}
      </style>
    </svg>
  );
};
