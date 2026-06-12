"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { IconChevronUp } from "@/components/icons";

export function ScrollToTop() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);
  const [hot, setHot] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShow(y > 400);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const heat = max > 0 ? Math.min(1, y / max) : 0;
      ref.current?.style.setProperty("--heat", heat.toFixed(3));
      setHot(heat > 0.55);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      ref={ref}
      className={"to-top" + (show ? " show" : "") + (hot ? " hot" : "")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={HOME_STR[lang].toTop}
    >
      <IconChevronUp s={20} />
    </button>
  );
}
