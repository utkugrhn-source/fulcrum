interface Props { className?: string; size?: number }

/** Andry sapling + Fulcrum pivot — designer's primary mark, inlined as React component. */
export function BrandMark({ className, size = 44 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 256 256"
      role="img"
      aria-label="Fulcrum mark"
    >
      <rect width="224" height="224" x="16" y="16" rx="36" fill="#F4ECDB" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M54 188 H202" stroke="#B89968" strokeWidth="7" />
        <path d="M102 188 L128 139 L154 188 Z" fill="#B89968" stroke="#F4ECDB" strokeWidth="4" />
        <circle cx="128" cy="139" r="7.5" fill="#9E2A2B" stroke="#F4ECDB" strokeWidth="3" />
        <path d="M113 176 V64" stroke="#B89968" strokeWidth="10" />
        <path d="M130 177 C139 155 142 139 135 121 C127 101 136 84 160 66" stroke="#0F2540" strokeWidth="8" />
        <path d="M158 66 C178 49 198 52 207 68 C189 76 172 77 158 66Z" fill="#0F2540" stroke="#F4ECDB" strokeWidth="3" />
        <path d="M137 102 C153 88 170 89 179 102 C163 110 150 111 137 102Z" fill="#0F2540" stroke="#F4ECDB" strokeWidth="3" />
        <path d="M132 126 C112 112 92 116 82 132 C102 140 119 140 132 126Z" fill="#0F2540" stroke="#F4ECDB" strokeWidth="3" />
        <path d="M96 99 C108 92 121 92 132 99" stroke="#9E2A2B" strokeWidth="5" />
        <path d="M96 113 C108 106 121 106 132 113" stroke="#9E2A2B" strokeWidth="5" />
      </g>
    </svg>
  );
}

/** Editor's seal — circular framed mark with perimeter text. */
export function EditorSeal({ className, size = 84 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={(size / 72) * 80}
      viewBox="0 0 72 80"
      role="img"
      aria-label="Editor seal"
    >
      <circle cx="36" cy="40" r="34" fill="none" stroke="#9E2A2B" strokeWidth="1.2" />
      <circle cx="36" cy="40" r="29" fill="none" stroke="#9E2A2B" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      <line x1="14" y1="62" x2="58" y2="62" stroke="#B89968" strokeWidth="0.8" />
      <path d="M28 62 L36 50 L44 62 Z" fill="#B89968" />
      <line x1="36" y1="50" x2="36" y2="18" stroke="#B89968" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M42 56 Q26 48 42 38 Q58 28 42 20 Q34 16 40 12" stroke="#0F2540" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="36" y1="56" x2="42" y2="56" stroke="#9E2A2B" strokeWidth="1" />
      <line x1="36" y1="46" x2="42" y2="46" stroke="#9E2A2B" strokeWidth="1" />
      <line x1="36" y1="36" x2="42" y2="36" stroke="#9E2A2B" strokeWidth="1" />
      <circle cx="40" cy="12" r="2.4" fill="#0F2540" />
      <text x="36" y="76" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5" letterSpacing="1" fill="#9E2A2B">
        EDİTÖR · SEÇİM
      </text>
    </svg>
  );
}
