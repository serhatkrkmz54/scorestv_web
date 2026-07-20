// Geçici mockup veriler — API bağlanınca buradan beslenmeyecek, gerçek uca bağlanacak.

export interface MockTweet {
  name: string;
  handle: string;
  time: string;
  text: string;
  color: string;
  verified?: boolean;
  replies: number;
  retweets: number;
  likes: number;
}

export const MOCK_TWEETS: MockTweet[] = [
  {
    name: "Scores TV",
    handle: "scorestv",
    time: "12d",
    text: "Güney Kore, Çekya karşısında 2-1 öne geçti! Maçın kalan dakikaları nefes kesecek.",
    color: "#E0123A",
    verified: true,
    replies: 42,
    retweets: 318,
    likes: 1900,
  },
  {
    name: "Transfer Merkezi",
    handle: "transfermerkezi",
    time: "35d",
    text: "Resmi: Yıldız orta saha 5 yıllık sözleşmeye imza attı. Açıklama birazdan.",
    color: "#1FA95B",
    verified: true,
    replies: 128,
    retweets: 1200,
    likes: 5400,
  },
  {
    name: "Saha İçi",
    handle: "sahaici",
    time: "1s",
    text: "Bu akşamki dev maç için ilk 11'ler açıklandı. Sürpriz isim kadroda yok.",
    color: "#0A6CB0",
    replies: 19,
    retweets: 86,
    likes: 540,
  },
];

export interface MockNews {
  title: string;
  category: string;
  time: string;
  seed: string;
}

export const MOCK_NEWS: MockNews[] = [
  { title: "Derbi öncesi son gelişmeler: İki takımda da eksikler belli oldu", category: "Süper Lig", time: "18 dk önce", seed: "derbi" },
  { title: "Şampiyonlar Ligi kura çekimi yarın: Olası eşleşmeler", category: "UCL", time: "1 saat önce", seed: "ucl" },
  { title: "Milli takımda kamp kadrosu açıklandı, 3 yeni isim var", category: "Milli Takım", time: "2 saat önce", seed: "milli" },
  { title: "Teknik direktörden flaş açıklama: 'Hedefimiz şampiyonluk'", category: "Transfer", time: "3 saat önce", seed: "teknik" },
  { title: "Haftanın 11'i belli oldu: Listeye damga vuran performans", category: "Analiz", time: "5 saat önce", seed: "analiz" },
];
