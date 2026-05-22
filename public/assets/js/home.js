const banners = [
  {
    tag: "Radar financeiro",
    titulo: "Atualizações do seu dinheiro",
    texto: "Dicas simples para tomar decisões melhores sem complicar sua rotina.",
    imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80"
  },
  {
    tag: "Conversores",
    titulo: "Transforme imagens em PDF rapidamente",
    texto: "Use ferramentas práticas para organizar documentos, recibos e comprovantes.",
    imagem: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
  },
  {
    tag: "Área privada",
    titulo: "Salve documentos no seu perfil",
    texto: "Crie uma conta gratuita para manter arquivos e histórico organizados.",
    imagem: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=80"
  },
  {
    tag: "Finanças sem medo",
    titulo: "Controle, clareza e tranquilidade",
    texto: "A proposta é simplificar sua relação com dinheiro, sem pedir dados bancários.",
    imagem: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80"
  }
];

let atual = 0;

const heroBanner = document.getElementById("heroBanner");
const bannerTag = document.getElementById("bannerTag");
const bannerTitulo = document.getElementById("bannerTitulo");
const bannerTexto = document.getElementById("bannerTexto");

function trocarBanner() {
  const item = banners[atual];

  heroBanner.style.opacity = 0.5;

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