interface AccessGateLogoMarkProps {
  size?: number;
  className?: string;
}

export function AccessGateLogoMark({ size = 22, className }: AccessGateLogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="#f8fafc"
        strokeWidth="1.8"
      />
      <path
        d="M 3 16 C 10 14, 14 18, 16 16 C 18 14, 22 18, 29 16"
        fill="none"
        stroke="#f8fafc"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
