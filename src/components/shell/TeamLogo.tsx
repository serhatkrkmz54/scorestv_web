"use client";

import { useState } from "react";
import { colorFromName, teamMonogram } from "@/lib/fixtures";

export function TeamLogo({
  name,
  logo,
  size = 26,
}: {
  name: string;
  logo: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = logo && !failed;

  if (showImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- harici CDN logoları (remotePatterns gerektirmez)
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      />
    );
  }

  return (
    <span
      className="badge"
      aria-label={name}
      style={{
        width: size,
        height: size,
        background: colorFromName(name),
        fontSize: size * 0.37,
      }}
    >
      {teamMonogram(name)}
    </span>
  );
}
