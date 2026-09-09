const IMG = {
    mie: "images/niasudbuiabsd783b23ub3e78dweqb723.jpeg",
    ceker: "images/742c3349-25f5-460a-846f-fbcddabf9584.jpeg",
    es: "images/b4ad98c7-828d-499b-b4ec-6e59b9c9f9f8.jpeg",
    pisang: "images/abf1cda9-154c-4165-b349-592b2ac39fcd.jpeg"
  };

  // Nomor WhatsApp format internasional tanpa tanda +
  const WHATSAPP_NUMBER = "6281376396258";

  const MENU = [
    {
      id: "mie",
      name: "Mie Jebew",
      description: "Mie gurih pedas dengan racikan bumbu yang bikin susah berhenti.",
      img: IMG.mie,
      variants: [
        { key: "normal", label: "Normal", price: 10000 },
        { key: "sedang", label: "Sedang", price: 15000 }
      ]
    },
    {
      id: "ceker",
      name: "Ceker Mercon Daun Jeruk",
      description: "Ceker pedas berbumbu dengan aroma daun jeruk yang wangi dan nendang.",
      img: IMG.ceker,
      variants: [
        { key: "normal", label: "Normal", price: 10000 },
        { key: "sedang", label: "Sedang", price: 15000 },
        { key: "tanpatulang", label: "Tanpa Tulang", price: 18000 }
      ]
    },
    {
      id: "es",
      name: "Es Alpukat Kocok",
      description: "Alpukat creamy yang dikocok segar untuk penutup yang manis dan dingin.",
      img: IMG.es,
      variants: [
        { key: "normal", label: "Normal", price: 10000 },
        { key: "spesial", label: "Spesial", price: 15000 }
      ]
    },
    {
      id: "pisang",
      name: "Pisang Ijo",
      description: "Pisang ijo lembut dengan sensasi manis dan segar yang pas.",
      img: IMG.pisang,
      variants: [
        { key: "normal", label: "Normal", price: 15000 },
        { key: "spesial", label: "Spesial", price: 18000 }
      ]
    }
  ];
