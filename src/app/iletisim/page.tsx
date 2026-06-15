"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";
import { ContactForm } from "@/components/static/ContactForm";

export default function ContactPage() {
  const { lang } = useLang();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  return (
    <div className="static-page">
      <article className="static-page-inner">
        <nav className="static-breadcrumb" aria-label="breadcrumb">
          <Link href="/">{t("Ana sayfa", "Home")}</Link>
          <span aria-hidden="true">/</span>
          <span className="cur">{t("İletişim", "Contact")}</span>
        </nav>

        <h1>{t("İletişim", "Contact")}</h1>
        <p className="static-intro">
          {t(
            "Soru, görüş, öneri ya da iş birliği talepleriniz için aşağıdaki formu doldurun. Mesajınız bize ulaşır ulaşmaz en kısa sürede dönüş yaparız.",
            "Fill in the form below for any questions, feedback, suggestions or partnership requests. We will get back to you as soon as your message reaches us.",
          )}
        </p>

        <ContactForm />
      </article>
    </div>
  );
}
