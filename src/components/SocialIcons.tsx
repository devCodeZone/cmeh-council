/**
 * Lightweight inline brand icons.
 *
 * The installed lucide-react version no longer ships brand/logo icons
 * (Facebook, Instagram, YouTube, LinkedIn), so these are hand-drawn minimal
 * outline SVGs sized to match lucide's 24x24 / stroke conventions.
 */
type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return ( 
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.3 4.3c-2.1 0-3.55 1.28-3.55 3.63v2.51H8.19v2.96h2.56V21h2.75Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M22 8.4s-.2-1.5-.8-2.2c-.8-.8-1.7-.8-2.1-.9C16.4 5 12 5 12 5s-4.4 0-7.1.3c-.4 0-1.3.1-2.1.9C2.2 6.9 2 8.4 2 8.4S1.8 10.1 1.8 12v1.9c0 1.9.2 3.6.2 3.6s.2 1.5.8 2.2c.8.9 1.9.8 2.4.9 1.7.2 7.3.3 7.3.3s4.4 0 7.1-.3c.4 0 1.3-.1 2.1-.9.6-.7.8-2.2.8-2.2s.2-1.7.2-3.6V12c0-1.9-.2-3.6-.2-3.6Z" />
      <path d="m10 15 5-3-5-3v6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 21h.01v-6.8c0-3.34-.72-5.9-4.62-5.9-1.87 0-3.13 1.03-3.64 2h-.05V8.5H8.9V21h3.38v-6.17c0-1.63.31-3.2 2.32-3.2 2 0 2.03 1.86 2.03 3.3V21h3.81Z" />
    </svg>
  );
}
