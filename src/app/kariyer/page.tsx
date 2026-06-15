"use client";

import { StaticPage } from "@/components/static/StaticPage";

export default function CareersPage() {
  return (
    <StaticPage
      tr={{
        title: "Kariyer",
        intro:
          "Spora ve teknolojiye tutkuyla bağlı bir ekibin parçası olun. ScoresTV'de birlikte öğrenen, üreten ve büyüyen bir ekip kuruyoruz.",
        sections: [
          {
            h: "Neden bizimle?",
            body: [
              "Açık iletişimi, öğrenmeyi ve sorumluluk almayı önemseyen bir kültürümüz var. Yaptığınız işin doğrudan etkisini görebileceğiniz bir ortam sunuyoruz.",
            ],
            list: [
              "Esnek ve iş birlikçi çalışma kültürü",
              "Gelişim ve öğrenme fırsatları",
              "Gerçek kullanıcılara dokunan ürünler",
            ],
          },
          {
            h: "Açık pozisyonlar",
            body: [
              "Şu anda yayında olan belirli bir ilanımız bulunmasa da, yetenekli kişilerle tanışmaya her zaman açığız. Kendinize uygun bir alan görüyorsanız genel başvurunuzu iletebilirsiniz.",
            ],
          },
          {
            h: "Başvuru",
            body: [
              "Başvurularınızı ve özgeçmişinizi iletişim sayfamız üzerinden bize iletebilirsiniz. İlginiz için şimdiden teşekkür ederiz.",
            ],
          },
        ],
      }}
      en={{
        title: "Careers",
        intro:
          "Join a team passionate about sports and technology. At ScoresTV we are building a team that learns, builds and grows together.",
        sections: [
          {
            h: "Why join us?",
            body: [
              "We value open communication, learning and taking ownership. We offer an environment where you can see the direct impact of your work.",
            ],
            list: [
              "Flexible and collaborative culture",
              "Opportunities to grow and learn",
              "Products that reach real users",
            ],
          },
          {
            h: "Open positions",
            body: [
              "While we may not have a specific opening listed right now, we are always open to meeting talented people. If you see an area that fits you, feel free to send a general application.",
            ],
          },
          {
            h: "How to apply",
            body: [
              "You can send your application and resume through our contact page. Thank you in advance for your interest.",
            ],
          },
        ],
      }}
    />
  );
}
