"use client";

import { StaticPage } from "@/components/static/StaticPage";

export default function CookiePage() {
  return (
    <StaticPage
      tr={{
        title: "Çerez Politikası",
        updated: "Son güncelleme: 2026",
        intro:
          "Bu politika, Scores TV'de çerezlerin ve benzeri teknolojilerin nasıl kullanıldığını açıklar.",
        sections: [
          {
            h: "Çerez nedir?",
            body: [
              "Çerezler, bir web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Sitenin sizi hatırlamasına ve deneyiminizi iyileştirmesine yardımcı olurlar.",
            ],
          },
          {
            h: "Hangi çerezleri kullanıyoruz?",
            body: [
              "Farklı amaçlarla sınırlı sayıda çerez kullanırız:",
            ],
            list: [
              "Zorunlu çerezler: sitenin temel işlevleri (oturum, güvenlik, dil/tema tercihi) için gereklidir.",
              "Tercih çerezleri: seçimlerinizi hatırlayarak deneyimi kişiselleştirir.",
              "Analitik çerezler: sitenin nasıl kullanıldığını anlamamıza ve onu iyileştirmemize yardımcı olur.",
            ],
          },
          {
            h: "Çerezleri yönetme",
            body: [
              "Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ancak bazı çerezleri devre dışı bırakmanız, sitenin bazı bölümlerinin düzgün çalışmamasına yol açabilir.",
            ],
          },
          {
            h: "Değişiklikler",
            body: [
              "Bu çerez politikasını zaman zaman güncelleyebiliriz. Güncel sürüm her zaman bu sayfada yer alır.",
            ],
          },
          {
            h: "İletişim",
            body: [
              "Çerezlerle ilgili sorularınız için iletişim sayfamızdan bize ulaşabilirsiniz.",
            ],
          },
        ],
      }}
      en={{
        title: "Cookie Policy",
        updated: "Last updated: 2026",
        intro:
          "This policy explains how cookies and similar technologies are used on Scores TV.",
        sections: [
          {
            h: "What is a cookie?",
            body: [
              "Cookies are small text files saved to your device when you visit a website. They help the site remember you and improve your experience.",
            ],
          },
          {
            h: "Which cookies do we use?",
            body: ["We use a limited number of cookies for different purposes:"],
            list: [
              "Essential cookies: required for the site's core functions (session, security, language/theme preference).",
              "Preference cookies: personalize the experience by remembering your choices.",
              "Analytics cookies: help us understand how the site is used and improve it.",
            ],
          },
          {
            h: "Managing cookies",
            body: [
              "You can delete or block cookies from your browser settings. However, disabling some cookies may cause parts of the site to not work properly.",
            ],
          },
          {
            h: "Changes",
            body: [
              "We may update this cookie policy from time to time. The current version is always available on this page.",
            ],
          },
          {
            h: "Contact",
            body: [
              "For questions about cookies, you can reach us through our contact page.",
            ],
          },
        ],
      }}
    />
  );
}
