"use client";

import { useState } from "react";

export function CountryFlag({
  flag,
  country,
  size = 24,
}: {
  flag: string | null;
  country: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = flag && !failed;

  return (
    <span className="flag" style={{ width: size, height: size }} aria-label={country ?? "Ülke"}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- harici bayrak CDN'i
        <img
          src={flag}
          alt={country ?? ""}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <svg viewBox="0 0 24 24">
          <rect width="24" height="24" fill="var(--surface-3)" />
        </svg>
      )}
    </span>
  );
}
