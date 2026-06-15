"use client";

import { useState } from "react";
import { useLang } from "@/context/lang-context";

type Status = "idle" | "sending" | "ok" | "error";

export function ContactForm() {
  const { lang } = useLang();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(t("Lütfen zorunlu alanları doldurun.", "Please fill in the required fields."));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t("Geçerli bir e-posta girin.", "Please enter a valid email."));
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setError(
        t(
          "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.",
          "Could not send the message. Please try again later.",
        ),
      );
    }
  }

  if (status === "ok") {
    return (
      <div className="contact-success">
        <h3>{t("Mesajınız alındı", "Message received")}</h3>
        <p>
          {t(
            "Bize ulaştığınız için teşekkürler. En kısa sürede dönüş yapacağız.",
            "Thanks for reaching out. We will get back to you as soon as possible.",
          )}
        </p>
        <button className="login-btn" onClick={() => setStatus("idle")}>
          {t("Yeni mesaj gönder", "Send another message")}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-row">
        <label className="contact-field">
          <span>
            {t("Ad Soyad", "Full name")} <i>*</i>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Adınız", "Your name")}
            maxLength={120}
            required
          />
        </label>
        <label className="contact-field">
          <span>
            {t("E-posta", "Email")} <i>*</i>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("ornek@eposta.com", "you@example.com")}
            maxLength={180}
            required
          />
        </label>
      </div>

      <label className="contact-field">
        <span>{t("Konu", "Subject")}</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t("Konu başlığı", "Subject")}
          maxLength={160}
        />
      </label>

      <label className="contact-field">
        <span>
          {t("Mesaj", "Message")} <i>*</i>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("Mesajınızı yazın…", "Write your message…")}
          rows={6}
          maxLength={4000}
          required
        />
      </label>

      {error && <p className="contact-error">{error}</p>}

      <button className="login-btn contact-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? t("Gönderiliyor…", "Sending…") : t("Gönder", "Send")}
      </button>
    </form>
  );
}
