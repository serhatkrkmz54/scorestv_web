"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { HOME_META } from "@/lib/seo";

/** Dil JS ile değiştirildiğinde ana sayfanın <title> ve meta description'ını
 *  anında günceller. Sadece "/" yolunda çalışır; detay sayfaları (takım, oyuncu,
 *  maç) kendi başlıklarını yönettiği için onlara dokunmaz. */
export function DynamicSeo() {
  const { lang } = useLang();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const m = HOME_META[lang];
    document.title = m.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", m.description);
  }, [lang, pathname]);

  return null;
}
