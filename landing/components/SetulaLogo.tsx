type SetulaLogoProps = {
  className?: string;
  theme?: "light" | "dark";
};

export function SetulaLogo({ className, theme = "light" }: SetulaLogoProps) {
  const foreground = theme === "dark" ? "#F6F5F2" : "#0A1B2E";

  return (
    <svg
      className={className}
      viewBox="0 0 320 90"
      role="img"
      aria-label="Setula"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(0 5) scale(.62)">
        <path d="M92 30 C92 12, 66 12, 50 22 C34 32, 34 48, 50 56 C66 64, 66 64, 66 64" fill="none" stroke={foreground} strokeWidth="10" strokeLinecap="round" />
        <path d="M28 90 C28 108, 54 108, 70 98 C86 88, 86 72, 70 64 C54 56, 54 56, 54 56" fill="none" stroke="#0FBF8F" strokeWidth="10" strokeLinecap="round" />
        <circle cx="60" cy="60" r="7" fill={foreground} />
      </g>
      <text x="86" y="56" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="38" letterSpacing=".5" fill={foreground}>setula</text>
      <rect x="216" y="27" width="13" height="4" fill="#0FBF8F" />
    </svg>
  );
}
