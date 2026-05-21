const banners = [
  {
    tag: "Radar financeiro",
    titulo: "Organize sua vida financeira sem complicação",
    texto: "Controle gastos, acompanhe metas e entenda seu dinheiro com uma linguagem simples.",
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80"
  },
  {
    tag: "Conversores inteligentes",
    titulo: "Converta documentos e salve no seu perfil",
    texto: "Use ferramentas gratuitas e, ao criar sua conta, mantenha seus arquivos organizados.",
    imagem: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=80"
  },
  {
    tag: "Dica do dia",
    titulo: "Pequenos ajustes no mês podem virar grandes economias",
    texto: "Acompanhe dicas simples para melhorar sua organização sem pressão.",
    imagem: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80"
  },
  {
    tag: "Imposto de Renda",
    titulo: "Guarde comprovantes ao longo do ano",
    texto: "Evite correria na declaração organizando documentos e valores em um só lugar.",
    imagem: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
  }
];

let atual = 0;

const heroBanner = document.getElementById("heroBanner");
const bannerTag = document.getElementById("bannerTag");
const bannerTitulo = document.getElementById("bannerTitulo");
const bannerTexto = document.getElementById("bannerTexto");

function trocarBanner() {
  const item = banners[atual];

  heroBanner.style.opacity = 0.4;

  setTimeout(() => {
    bannerTag.textContent = item.tag;
    bannerTitulo.textContent = item.titulo;
    bannerTexto.textContent = item.texto;

    heroBanner.style.backgroundImage =
      `linear-gradient(90deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.35)), url("${item.imagem}")`;

    heroBanner.style.opacity = 1;

    atual++;
    if (atual >= banners.length) atual = 0;
  }, 350);
}

trocarBanner();
setInterval(trocarBanner, 6000);