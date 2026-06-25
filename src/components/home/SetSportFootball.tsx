"use client";

import { useEffect } from "react";
import { useSportOptional } from "@/context/sport-context";

// Futbol anasayfasi her zaman FUTBOL gostermeli. Basketbol/voleybol artik
// kendi URL'lerine (/basketbol vb.) sahip oldugundan, "/" mount olunca
// spor-context'i futbola sabitleriz; boylece baska bir sporda gezinip "/"e
// donen kullanici futbol fikstur + rail'lerini gorur (regression koruma).
export function SetSportFootball() {
  const sportCtx = useSportOptional();
  useEffect(() => {
    if (sportCtx && sportCtx.sport !== "football") sportCtx.setSport("football");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
