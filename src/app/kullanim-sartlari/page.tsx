"use client";

import { StaticPage } from "@/components/static/StaticPage";

export default function TermsPage() {
  return (
    <StaticPage
      tr={{
        title: "Kullanım Şartları",
        updated: "Son güncelleme: 2026",
        intro:
          "Scores TV'yi kullanarak aşağıdaki şartları kabul etmiş olursunuz. Lütfen hizmeti kullanmadan önce bu şartları dikkatlice okuyun.",
        sections: [
          {
            h: "Şartların kabulü",
            body: [
              "Bu platforma erişerek veya onu kullanarak, bu kullanım şartlarına ve yürürlükteki ilgili mevzuata uymayı kabul edersiniz. Şartları kabul etmiyorsanız hizmeti kullanmamanız gerekir.",
            ],
          },
          {
            h: "Hizmetin kullanımı",
            body: [
              "Hizmeti yalnızca yasal amaçlarla ve bu şartlara uygun şekilde kullanmayı kabul edersiniz. Platformun işleyişini bozacak, güvenliğini tehlikeye atacak veya başkalarının kullanımını engelleyecek davranışlardan kaçınmalısınız.",
            ],
          },
          {
            h: "Hesap",
            body: [
              "Bazı özellikler için hesap oluşturmanız gerekebilir. Hesap bilgilerinizin gizliliğinden ve hesabınız altında gerçekleşen etkinliklerden siz sorumlusunuz.",
            ],
          },
          {
            h: "İçerik ve fikri mülkiyet",
            body: [
              "Platform üzerindeki logo, tasarım ve içerikler ilgili hak sahiplerine aittir ve izinsiz kullanılamaz. Kullanıcı tarafından oluşturulan içeriklerden ise ilgili kullanıcı sorumludur.",
            ],
          },
          {
            h: "Veri doğruluğu ve sorumluluk reddi",
            body: [
              "Skorlar, istatistikler ve diğer veriler mümkün olan en yüksek doğrulukla sunulmaya çalışılır; ancak gecikme veya hata olabileceğinden kesintisizlik ve tam doğruluk garanti edilmez. Veriler bilgilendirme amaçlıdır.",
            ],
          },
          {
            h: "Sorumluluğun sınırlandırılması",
            body: [
              "Yürürlükteki mevzuatın izin verdiği ölçüde, hizmetin kullanımından doğabilecek dolaylı veya sonuç niteliğindeki zararlardan sorumlu tutulamayız.",
            ],
          },
          {
            h: "Değişiklikler",
            body: [
              "Bu şartları zaman zaman güncelleyebiliriz. Güncel sürüm bu sayfada yayımlanır; hizmeti kullanmaya devam etmeniz güncel şartları kabul ettiğiniz anlamına gelir.",
            ],
          },
          {
            h: "İletişim",
            body: [
              "Kullanım şartlarıyla ilgili sorularınız için iletişim sayfamızdan bize ulaşabilirsiniz.",
            ],
          },
        ],
      }}
      en={{
        title: "Terms of Use",
        updated: "Last updated: 2026",
        intro:
          "By using Scores TV, you agree to the terms below. Please read these terms carefully before using the service.",
        sections: [
          {
            h: "Acceptance of terms",
            body: [
              "By accessing or using this platform, you agree to comply with these terms of use and applicable law. If you do not accept the terms, you should not use the service.",
            ],
          },
          {
            h: "Use of the service",
            body: [
              "You agree to use the service only for lawful purposes and in accordance with these terms. You must avoid any behavior that disrupts the platform, compromises its security, or interferes with others' use.",
            ],
          },
          {
            h: "Account",
            body: [
              "Some features may require you to create an account. You are responsible for keeping your account information confidential and for activities that occur under your account.",
            ],
          },
          {
            h: "Content and intellectual property",
            body: [
              "Logos, design and content on the platform belong to their respective rights holders and may not be used without permission. Users are responsible for the content they create.",
            ],
          },
          {
            h: "Data accuracy and disclaimer",
            body: [
              "Scores, statistics and other data are provided with the highest possible accuracy; however, as delays or errors may occur, uninterrupted availability and complete accuracy are not guaranteed. Data is provided for informational purposes.",
            ],
          },
          {
            h: "Limitation of liability",
            body: [
              "To the extent permitted by applicable law, we cannot be held liable for indirect or consequential damages arising from the use of the service.",
            ],
          },
          {
            h: "Changes",
            body: [
              "We may update these terms from time to time. The current version is published on this page; continuing to use the service means you accept the updated terms.",
            ],
          },
          {
            h: "Contact",
            body: [
              "For questions about these terms of use, you can reach us through our contact page.",
            ],
          },
        ],
      }}
    />
  );
}
