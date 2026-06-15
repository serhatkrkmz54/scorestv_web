"use client";

import { StaticPage } from "@/components/static/StaticPage";

export default function KvkkPage() {
  return (
    <StaticPage
      tr={{
        title: "KVKK Aydınlatma Metni",
        updated: "Son güncelleme: 2026",
        intro:
          "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kişisel verilerinizin işlenmesine ilişkin olarak sizi bilgilendirmek isteriz.",
        sections: [
          {
            h: "Veri sorumlusu",
            body: [
              "Kişisel verileriniz, veri sorumlusu sıfatıyla ScoresTV tarafından, aşağıda açıklanan amaçlar ve hukuki sebepler çerçevesinde işlenmektedir.",
            ],
          },
          {
            h: "İşlenen kişisel veriler",
            body: [
              "Hizmetlerimizi sunabilmek için sınırlı kişisel veri işleyebiliriz:",
            ],
            list: [
              "Kimlik ve iletişim bilgileri (ör. ad, e-posta)",
              "Hesap ve kullanım bilgileri",
              "İşlem güvenliğine ilişkin teknik veriler",
            ],
          },
          {
            h: "İşleme amaçları",
            body: [
              "Kişisel verileriniz; hizmetin sunulması ve iyileştirilmesi, kullanıcı taleplerinin karşılanması, güvenliğin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.",
            ],
          },
          {
            h: "Hukuki sebep",
            body: [
              "Verileriniz; sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaat ve gerektiğinde açık rızanız gibi KVKK'da öngörülen hukuki sebeplere dayanılarak işlenir.",
            ],
          },
          {
            h: "Haklarınız (KVKK m. 11)",
            body: [
              "Kanun kapsamında aşağıdaki haklara sahipsiniz:",
            ],
            list: [
              "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
              "İşlenmişse buna ilişkin bilgi talep etme",
              "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
              "Şartları oluştuğunda silinmesini veya yok edilmesini isteme",
              "İşlemenin kanuna aykırı olması hâlinde itiraz etme",
            ],
          },
          {
            h: "Başvuru",
            body: [
              "Haklarınıza ilişkin taleplerinizi iletişim sayfamız üzerinden bize iletebilirsiniz. Talepleriniz mevzuatta öngörülen süreler içinde değerlendirilir.",
            ],
          },
        ],
      }}
      en={{
        title: "Data Protection (GDPR / KVKK)",
        updated: "Last updated: 2026",
        intro:
          "We would like to inform you about the processing of your personal data in accordance with applicable data protection law (GDPR and Türkiye's KVKK).",
        sections: [
          {
            h: "Data controller",
            body: [
              "Your personal data is processed by ScoresTV as the data controller, within the scope of the purposes and legal bases described below.",
            ],
          },
          {
            h: "Personal data we process",
            body: ["We may process a limited amount of personal data to provide our services:"],
            list: [
              "Identity and contact details (e.g. name, email)",
              "Account and usage information",
              "Technical data related to transaction security",
            ],
          },
          {
            h: "Purposes of processing",
            body: [
              "Your personal data is processed to provide and improve the service, respond to user requests, ensure security, and fulfill legal obligations.",
            ],
          },
          {
            h: "Legal basis",
            body: [
              "Your data is processed on legal bases such as the formation or performance of a contract, compliance with legal obligations, legitimate interest, and, where required, your explicit consent.",
            ],
          },
          {
            h: "Your rights",
            body: ["Under applicable law, you have the following rights:"],
            list: [
              "To learn whether your personal data is processed",
              "To request information about the processing",
              "To request correction of incomplete or inaccurate data",
              "To request erasure where the conditions are met",
              "To object to processing that is unlawful",
            ],
          },
          {
            h: "How to apply",
            body: [
              "You can submit requests regarding your rights through our contact page. Your requests are evaluated within the periods set out by law.",
            ],
          },
        ],
      }}
    />
  );
}
