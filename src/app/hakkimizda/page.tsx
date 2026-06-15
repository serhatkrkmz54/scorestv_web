"use client";

import { StaticPage } from "@/components/static/StaticPage";

export default function AboutPage() {
  return (
    <StaticPage
      tr={{
        title: "Hakkımızda",
        intro:
          "ScoresTV; futbol başta olmak üzere spor severleri canlı skorlar, puan durumları, kadrolar ve maç istatistikleriyle buluşturan bir dijital platformdur. Amacımız, takip etmek istediğiniz her şeyi hızlı ve sade bir deneyimle tek yerde sunmak.",
        sections: [
          {
            h: "Misyonumuz",
            body: [
              "Spor takibini herkes için hızlı, anlaşılır ve erişilebilir kılmak istiyoruz. Karmaşık verileri sade bir arayüzde toplayarak, kullanıcılarımızın saniyeler içinde aradığı bilgiye ulaşmasını hedefliyoruz.",
            ],
          },
          {
            h: "Neler sunuyoruz?",
            body: [
              "Canlı skorlardan puan durumlarına, diziliş ve kadrolardan maç istatistiklerine kadar geniş bir içerik yelpazesini tek çatı altında topluyoruz.",
            ],
            list: [
              "Canlı skorlar ve maç anlık takibi",
              "Lig puan durumları ve fikstürler",
              "Takım ve oyuncu bilgileri",
              "Dizilişler, istatistikler ve maç detayları",
            ],
          },
          {
            h: "Vizyonumuz",
            body: [
              "Spor severlerin ilk tercih ettiği, güvenilir ve kullanıcı dostu bir skor platformu olmak. Sürekli geliştirdiğimiz ürünümüzle daha fazla branş ve daha zengin içeriklere ulaşmayı amaçlıyoruz.",
            ],
          },
          {
            h: "İletişim",
            body: [
              "Soru, görüş ve önerileriniz bizim için değerli. İletişim sayfamız üzerinden bize her zaman ulaşabilirsiniz.",
            ],
          },
        ],
      }}
      en={{
        title: "About Us",
        intro:
          "ScoresTV is a digital platform that brings sports fans live scores, standings, squads and match statistics — with a focus on football. Our goal is to deliver everything you want to follow in one place, with a fast and clean experience.",
        sections: [
          {
            h: "Our Mission",
            body: [
              "We want to make following sports fast, clear and accessible for everyone. By gathering complex data into a simple interface, we help our users find what they are looking for in seconds.",
            ],
          },
          {
            h: "What We Offer",
            body: [
              "From live scores and standings to line-ups, squads and detailed match statistics, we bring a wide range of content together under one roof.",
            ],
            list: [
              "Live scores and real-time match tracking",
              "League standings and fixtures",
              "Team and player information",
              "Line-ups, statistics and match details",
            ],
          },
          {
            h: "Our Vision",
            body: [
              "To become the first choice of sports fans — a reliable and user-friendly score platform. We continuously improve our product to reach more sports and richer content.",
            ],
          },
          {
            h: "Contact",
            body: [
              "Your questions, feedback and suggestions matter to us. You can always reach us through our contact page.",
            ],
          },
        ],
      }}
    />
  );
}
