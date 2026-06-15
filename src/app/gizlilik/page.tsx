"use client";

import { StaticPage } from "@/components/static/StaticPage";

export default function PrivacyPage() {
  return (
    <StaticPage
      tr={{
        title: "Gizlilik Politikası",
        updated: "Son güncelleme: 2026",
        intro:
          "Gizliliğiniz bizim için önemlidir. Bu politika, ScoresTV'yi kullandığınızda hangi bilgilerin toplandığını, nasıl kullanıldığını ve haklarınızı açıklar.",
        sections: [
          {
            h: "Topladığımız bilgiler",
            body: [
              "Hizmetlerimizi sunabilmek için sınırlı miktarda bilgi işleyebiliriz. Bu bilgiler genel olarak iki gruba ayrılır:",
            ],
            list: [
              "Sizin sağladığınız bilgiler: hesap oluşturduğunuzda veya bizimle iletişime geçtiğinizde paylaştığınız ad, e-posta gibi veriler.",
              "Otomatik toplanan bilgiler: cihaz türü, tarayıcı ve genel kullanım istatistikleri gibi teknik veriler.",
            ],
          },
          {
            h: "Bilgileri nasıl kullanırız?",
            body: [
              "Topladığımız bilgileri hizmetimizi sunmak, geliştirmek ve güvenliğini sağlamak için kullanırız.",
            ],
            list: [
              "Hizmetin sağlanması ve iyileştirilmesi",
              "Kullanıcı deneyiminin kişiselleştirilmesi",
              "Güvenliğin korunması ve kötüye kullanımın önlenmesi",
              "Talep etmeniz hâlinde sizinle iletişim kurulması",
            ],
          },
          {
            h: "Çerezler",
            body: [
              "Deneyiminizi iyileştirmek için çerezler ve benzeri teknolojiler kullanabiliriz. Ayrıntılar için Çerez Politikamızı inceleyebilirsiniz.",
            ],
          },
          {
            h: "Bilgilerin paylaşımı",
            body: [
              "Bilgilerinizi satmayız. Bilgiler yalnızca hizmetin işletilmesi için gerekli olduğunda veya yasal yükümlülükler gereği paylaşılabilir.",
            ],
          },
          {
            h: "Haklarınız",
            body: [
              "Yürürlükteki mevzuata göre kişisel verilerinize erişme, bunları düzeltme veya silinmesini talep etme hakkına sahip olabilirsiniz. Talepleriniz için iletişim sayfamızı kullanabilirsiniz.",
            ],
          },
          {
            h: "Veri güvenliği",
            body: [
              "Bilgilerinizi korumak için makul teknik ve idari önlemler alırız. Ancak internet üzerinden hiçbir aktarımın %100 güvenli olmadığını hatırlatmak isteriz.",
            ],
          },
          {
            h: "Değişiklikler",
            body: [
              "Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikleri bu sayfa üzerinden duyururuz.",
            ],
          },
          {
            h: "İletişim",
            body: [
              "Gizlilikle ilgili sorularınız için iletişim sayfamızdan bize ulaşabilirsiniz.",
            ],
          },
        ],
      }}
      en={{
        title: "Privacy Policy",
        updated: "Last updated: 2026",
        intro:
          "Your privacy matters to us. This policy explains what information is collected when you use ScoresTV, how it is used, and your rights.",
        sections: [
          {
            h: "Information we collect",
            body: [
              "To provide our services, we may process a limited amount of information. This generally falls into two groups:",
            ],
            list: [
              "Information you provide: data such as your name and email shared when you create an account or contact us.",
              "Automatically collected information: technical data such as device type, browser and general usage statistics.",
            ],
          },
          {
            h: "How we use information",
            body: [
              "We use the information we collect to provide, improve and secure our service.",
            ],
            list: [
              "Providing and improving the service",
              "Personalizing the user experience",
              "Protecting security and preventing abuse",
              "Contacting you when you request it",
            ],
          },
          {
            h: "Cookies",
            body: [
              "We may use cookies and similar technologies to improve your experience. See our Cookie Policy for details.",
            ],
          },
          {
            h: "Sharing of information",
            body: [
              "We do not sell your information. Information may only be shared when necessary to operate the service or to meet legal obligations.",
            ],
          },
          {
            h: "Your rights",
            body: [
              "Depending on applicable law, you may have the right to access, correct or request deletion of your personal data. You can use our contact page for such requests.",
            ],
          },
          {
            h: "Data security",
            body: [
              "We take reasonable technical and organizational measures to protect your information. However, please note that no transmission over the internet is 100% secure.",
            ],
          },
          {
            h: "Changes",
            body: [
              "We may update this policy from time to time. We will announce significant changes on this page.",
            ],
          },
          {
            h: "Contact",
            body: [
              "For privacy-related questions, you can reach us through our contact page.",
            ],
          },
        ],
      }}
    />
  );
}
