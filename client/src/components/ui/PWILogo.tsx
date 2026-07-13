interface PWILogoProps {
  className?: string;
  size?: number;
  variant?: 'icon' | 'full';
  color?: 'white' | 'black' | 'gradient';
}

export function PWIIcon({ className = '', size = 32, color = 'white' }: Omit<PWILogoProps, 'variant'>) {
  const fill = color === 'white' ? '#ffffff' : color === 'black' ? '#1a1a2e' : 'url(#pwi-grad)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {color === 'gradient' && (
        <defs>
          <linearGradient id="pwi-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2196F3" />
            <stop offset="100%" stopColor="#9C27B0" />
          </linearGradient>
        </defs>
      )}
      {/* P shape merged with W */}
      <path
        d="M20 15h22c12 0 20 8 20 20s-8 20-20 20H36v30H20V15zm16 28h6c5 0 8-3 8-8s-3-8-8-8h-6v16z"
        fill={fill}
      />
      {/* W shape */}
      <path
        d="M38 50l8 35h3l8-20 8 20h3l8-35h-6l-5 22-7-17h-4l-7 17-5-22h-5z"
        fill={fill}
      />
      {/* i dot */}
      <circle cx="72" cy="12" r="5" fill={fill} />
      <circle cx="72" cy="12" r="3" fill={color === 'white' ? '#1a1a2e' : color === 'black' ? '#ffffff' : '#ffffff'} />
    </svg>
  );
}

export function PWILogoFull({ className = '', color = 'white' }: Omit<PWILogoProps, 'variant' | 'size'>) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <PWIIcon size={36} color={color} />
      <div className="flex flex-col leading-tight">
        <span className={`font-serif font-bold text-base tracking-tight ${
          color === 'white' ? 'text-white' : color === 'black' ? 'text-navy-800' : 'text-navy-800'
        }`}>
          PEOPLE WHO
        </span>
        <span className={`font-serif font-black text-lg -mt-1 tracking-tight ${
          color === 'white' ? 'text-white' : color === 'black' ? 'text-navy-800' : 'text-navy-800'
        }`}>
          INSPIRE
        </span>
      </div>
    </div>
  );
}

export function PWIMonogram({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`rounded-full bg-[#5B4FCF] flex items-center justify-center shadow-lg shadow-navy-950/15 ${className}`}
      style={{ width: size, height: size }}
    >
      <PWIIcon size={size * 0.6} color="white" />
    </div>
  );
}

export default PWIIcon;
