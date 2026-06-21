import type { SVGProps } from "react";

type IP = { s?: number } & SVGProps<SVGSVGElement>;
const base = (s: number) => ({
  width: s,
  height: s,
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
});

export function IconSearch({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  );
}
export function IconUser({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
export function IconStar({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" {...p}>
      <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.8 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z" />
    </svg>
  );
}
export function IconBell({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 19a2 2 0 004 0" />
    </svg>
  );
}
export function IconChevronDown({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}
export function IconSun({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...p}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19" />
    </svg>
  );
}
export function IconMoon({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  );
}
export function IconClose({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
export function IconMenu({ s = 22, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
export function IconHome({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" />
    </svg>
  );
}
export function IconMail({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}
export function IconLock({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </svg>
  );
}
export function IconCalendar({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}
export function IconGlobe({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}
export function IconEye({ off, s = 18, ...p }: IP & { off?: boolean }) {
  return off ? (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.4 5.2A9.3 9.3 0 0112 5c5 0 9 4.5 9 7-.4 1-1.2 2.2-2.4 3.3M6.1 6.2C3.8 7.6 2.4 9.7 2 11c.7 1.8 4 6 10 6 .9 0 1.8-.1 2.6-.3" />
    </svg>
  ) : (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function IconLogout({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M15 12H4M8 8l-4 4 4 4" />
      <path d="M11 4h7a1 1 0 011 1v14a1 1 0 01-1 1h-7" />
    </svg>
  );
}
export function GoogleMark({ s = 19 }: { s?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export function AppleMark({ s = 19 }: { s?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true" fill="currentColor">
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.82 0-2.07-.92-3.41-.9-1.75.03-3.37 1.02-4.27 2.59-1.83 3.17-.47 7.86 1.31 10.43.87 1.26 1.9 2.67 3.26 2.62 1.31-.05 1.8-.85 3.39-.85 1.57 0 2.03.85 3.41.82 1.41-.02 2.3-1.28 3.16-2.55.99-1.46 1.4-2.88 1.43-2.95-.03-.01-2.74-1.05-2.77-4.16zM14.6 4.5c.72-.88 1.21-2.09 1.07-3.3-1.04.04-2.3.69-3.05 1.56-.67.78-1.26 2.02-1.1 3.21 1.16.09 2.35-.59 3.08-1.47z" />
    </svg>
  );
}

export function IconChevronLeft({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
export function IconChevronRight({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
export function IconBall({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l4.7 3.4-1.8 5.6H9.1l-1.8-5.6z" fill="currentColor" stroke="none" opacity=".9" />
      <path d="M12 3v4M3.6 9.5l3.7 2.6M20.4 9.5l-3.7 2.6M6.3 20l1.8-4M17.7 20l-1.8-4" />
    </svg>
  );
}
export function IconPlay({ s = 12, ...p }: IP) {
  return (
    <svg {...base(s)} fill="currentColor" {...p}>
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}

export function IconPin({ s = 12, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconStadium({ s = 15, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="12" rx="9.5" ry="6" />
      <ellipse cx="12" cy="12" rx="4.5" ry="2.6" />
      <path d="M2.6 12v3.2c0 1.9 4.2 3.4 9.4 3.4s9.4-1.5 9.4-3.4V12" />
    </svg>
  );
}

export function IconInfo({ s = 15, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.2v4.8" />
      <path d="M12 7.7h.01" />
    </svg>
  );
}

export function IconFlame({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="currentColor" {...p}>
      <path d="M13 2c.7 2.6-.8 4-1.9 5.5-1 1.4-1.4 2.8-.2 4 .6.6 1 .2 1.2-.7.2-.9.1-1.6.1-1.6 1.7 1.1 3 2.9 3 5.1a5 5 0 11-10 0c0-2.3 1.4-4 2.8-5.6C10 11 11 8.5 9.7 5.6 12 6.4 13 4.4 13 2z" />
    </svg>
  );
}
export function IconChevronUp({ s = 20, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 15l7-7 7 7" />
    </svg>
  );
}

export function IconX({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="currentColor" {...p}>
      <path d="M17.5 3h3l-7.1 8.1L21.5 21h-6.3l-4.5-5.9L5.5 21h-3l7.6-8.7L2.5 3h6.4l4.1 5.4L17.5 3zm-1 16h1.7L7.5 4.7H5.7L16.5 19z" />
    </svg>
  );
}
export function IconVerified({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="currentColor" {...p}>
      <path d="M22.5 12c0-1.3-.8-2.5-2-3 .3-1.3-.1-2.7-1.1-3.6-.9-1-2.3-1.4-3.6-1.1-.5-1.2-1.7-2-3-2s-2.5.8-3 2c-1.3-.3-2.7.1-3.6 1.1-1 .9-1.4 2.3-1.1 3.6-1.2.5-2 1.7-2 3s.8 2.5 2 3c-.3 1.3.1 2.7 1.1 3.6.9 1 2.3 1.4 3.6 1.1.5 1.2 1.7 2 3 2s2.5-.8 3-2c1.3.3 2.7-.1 3.6-1.1 1-.9 1.4-2.3 1.1-3.6 1.2-.5 2-1.7 2-3zm-11.8 4-3.5-3.5 1.5-1.5 2 2 4.6-4.6 1.5 1.5-6.1 6.1z" />
    </svg>
  );
}
export function IconReply({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z" />
    </svg>
  );
}
export function IconRetweet({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 8l3-3 3 3M7 5v9a2 2 0 002 2h7M20 16l-3 3-3-3M17 19v-9a2 2 0 00-2-2H8" />
    </svg>
  );
}
export function IconHeart({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20s-7-4.4-9-8.5C1.5 8 3 5 6 5c2 0 3 1.2 4 2.5C11 6.2 12 5 14 5c3 0 4.5 3 3 6.5-2 4.1-9 8.5-9 8.5z" />
    </svg>
  );
}
export function IconArrowUpRight({ s = 13, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

export function IconChevronsRight({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 5l7 7-7 7M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconBasket({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.7} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M5.6 5.6c3.5 2.5 3.5 10.3 0 12.8M18.4 5.6c-3.5 2.5-3.5 10.3 0 12.8" />
    </svg>
  );
}
export function IconTennis({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.7} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.4 5.4c4 2 5.2 9 1.6 13.2M18.6 5.4c-4 2-5.2 9-1.6 13.2" />
    </svg>
  );
}
export function IconVolley({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.7} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-3 5-3 9 0 18M3.5 8c5 1 9 4 11.5 9M20.5 8c-5 1-9 4-11.5 9" />
    </svg>
  );
}
export function IconNews({ s = 17, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 5h13v14a1 1 0 001-1V8h2v10a3 3 0 01-3 3H5a1 1 0 01-1-1z" />
      <path d="M7 9h7M7 12.5h7M7 16h4" />
    </svg>
  );
}

export function IconSettings({ s = 18, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
    </svg>
  );
}

export function IconVolume({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 9v6h3.5L13 19V5L7.5 9z" />
      <path d="M16.5 8.5a5 5 0 010 7M19 6a8 8 0 010 12" />
    </svg>
  );
}

// ───── Mac detay tab + event ikonlari ─────

export function IconList({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconBars({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="13" width="4" height="8" />
      <rect x="10" y="8" width="4" height="13" />
      <rect x="17" y="3" width="4" height="18" />
    </svg>
  );
}

export function IconLineup({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconTrophy({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
      <path d="M7 7H4v2a3 3 0 003 3M17 7h3v2a3 3 0 01-3 3" />
      <path d="M10 16h4v3h-4zM8 20h8" />
    </svg>
  );
}

export function IconSwap({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="7 4 4 7 7 10" />
      <line x1="4" y1="7" x2="20" y2="7" />
      <polyline points="17 14 20 17 17 20" />
      <line x1="20" y1="17" x2="4" y2="17" />
    </svg>
  );
}

export function IconChart({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="3" y1="20" x2="21" y2="20" />
      <polyline points="5 16 9 11 13 14 19 6" />
    </svg>
  );
}

export function IconMed({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="3" width="6" height="18" rx="1.5" />
      <rect x="3" y="9" width="18" height="6" rx="1.5" />
    </svg>
  );
}

export function IconChat({ s = 16, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

export function IconCard({ s = 14, color, ...p }: IP & { color?: string }) {
  return (
    <svg {...base(s)} fill={color ?? "currentColor"} {...p}>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
    </svg>
  );
}

export function IconWhistle({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="12" r="5" />
      <path d="M14 11l7-4M14 13l7 4" />
    </svg>
  );
}

export function IconHeart2({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="currentColor" {...p}>
      <path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5c1.7 0 3.3.9 4.2 2.3l1.3 1.7 1.3-1.7C14.2 5.9 15.8 5 17.5 5 21 5 23 8.5 21.5 12 19 16.5 12 21 12 21z" />
    </svg>
  );
}


export function IconOdds({ s = 14, ...p }: IP) {
  return (
    <svg {...base(s)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5c0-1 .8-1.5 3-1.5s3 .8 3 1.8c0 1.2-1.2 1.6-3 1.7-1.8.1-3 .5-3 1.7 0 1 1 1.8 3 1.8s3-.5 3-1.5" />
    </svg>
  );
}
