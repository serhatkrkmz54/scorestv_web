"use client";

import { StaticPage } from "@/components/static/StaticPage";

export default function AdvertisePage() {
  return (
    <StaticPage
      tr={{
        title: "Reklam",
        intro:
          "Markanızı etkileşimi yüksek, spora tutkulu bir kitleyle buluşturun. Scores TV üzerinde reklam vererek doğru kullanıcıya doğru anda ulaşabilirsiniz.",
        sections: [
          {
            h: "Neden Scores TV?",
            body: [
              "Platformumuz, maç günlerinde yoğunlaşan, içerikle aktif şekilde etkileşen bir kitleye sahiptir. Bu, mesajınızın görünürlüğünü ve etkisini artırır.",
            ],
            list: [
              "Spora ilgili, hedeflenebilir kitle",
              "Maç günü zirve yapan trafik",
              "Web ve mobil üzerinde geniş erişim",
            ],
          },
          {
            h: "Reklam çözümleri",
            body: [
              "İhtiyacınıza göre farklı formatlar sunuyoruz. Kampanyanızı hedeflerinize göre birlikte planlayabiliriz.",
            ],
            list: [
              "Görüntülü (banner) reklam alanları",
              "Sponsorlu içerik ve iş birlikleri",
              "Kampanya bazlı özel çözümler",
            ],
          },
          {
            h: "Nasıl başlarım?",
            body: [
              "Reklam ve iş birliği talepleriniz için iletişim sayfamızdan bize ulaşın. Talebinizi aldıktan sonra ekibimiz en kısa sürede sizinle iletişime geçer.",
            ],
          },
        ],
      }}
      en={{
        title: "Advertise",
        intro:
          "Connect your brand with a highly engaged, sports-passionate audience. By advertising on Scores TV, you can reach the right user at the right moment.",
        sections: [
          {
            h: "Why Scores TV?",
            body: [
              "Our platform has an audience that peaks on match days and actively engages with content. This increases the visibility and impact of your message.",
            ],
            list: [
              "Sports-focused, targetable audience",
              "Traffic that peaks on match days",
              "Wide reach across web and mobile",
            ],
          },
          {
            h: "Advertising solutions",
            body: [
              "We offer different formats depending on your needs. We can plan your campaign together according to your goals.",
            ],
            list: [
              "Display (banner) ad placements",
              "Sponsored content and partnerships",
              "Custom, campaign-based solutions",
            ],
          },
          {
            h: "How do I get started?",
            body: [
              "Reach out to us through our contact page for advertising and partnership requests. Once we receive your request, our team will get in touch as soon as possible.",
            ],
          },
        ],
      }}
    />
  );
}
