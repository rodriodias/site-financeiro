const formConversor = document.getElementById('formConversor');
const inputImagens = document.getElementById('imagens');
const listaArquivos = document.getElementById('listaArquivos');
const mensagem = document.getElementById('mensagem');
const downloadLink = document.getElementById('downloadLink');

let arquivosSelecionados = [];

inputImagens.addEventListener('change', () => {
  const novosArquivos = Array.from(inputImagens.files);

  novosArquivos.forEach((arquivo) => {
    const jaExiste = arquivosSelecionados.some((item) =>
      item.name === arquivo.name &&
      item.size === arquivo.size &&
      item.lastModified === arquivo.lastModified
    );

    if (!jaExiste) {
      arquivosSelecionados.push(arquivo);
    }
  });

  inputImagens.value = '';
  renderizarLista();
});

function renderizarLista() {
  if (arquivosSelecionados.length === 0) {
    listaArquivos.innerHTML = `
      <p class="text-sm text-slate-500">
        Nenhuma imagem selecionada.
      </p>
    `;
    return;
  }

  listaArquivos.innerHTML = arquivosSelecionados.map((arquivo, index) => {
    const tamanhoMB = (arquivo.size / 1024 / 1024).toFixed(2);

    return `
      <div class="flex items-center justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50">
        <div>
          <p class="font-semibold text-slate-800">${arquivo.name}</p>
          <p class="text-sm text-slate-500">${tamanhoMB} MB</p>
        </div>

        <button
          type="button"
          onclick="removerArquivo(${index})"
          class="text-red-600 font-semibold text-sm hover:text-red-700">
          Remover
        </button>
      </div>
    `;
  }).join('');
}

function removerArquivo(index) {
  arquivosSelecionados.splice(index, 1);
  renderizarLista();
}

formConversor.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (arquivosSelecionados.length === 0) {
    mensagem.textContent = 'Escolha pelo menos uma imagem antes de converter.';
    mensagem.className = 'mt-5 text-sm text-red-600';
    return;
  }

  const formData = new FormData();

  arquivosSelecionados.forEach((arquivo) => {
    formData.append('imagens', arquivo);
  });

  try {
    mensagem.textContent = 'Convertendo imagens...';
    mensagem.className = 'mt-5 text-sm text-slate-500';
    downloadLink.classList.add('hidden');

    const resposta = await fetch('/api/conversores/imagem-para-pdf', {
      method: 'POST',
      body: formData
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.erro || 'Erro ao converter imagens.';
      mensagem.className = 'mt-5 text-sm text-red-600';
      return;
    }

    mensagem.textContent = dados.mensagem;
    mensagem.className = 'mt-5 text-sm text-emerald-600';

    downloadLink.href = dados.arquivo;
    downloadLink.classList.remove('hidden');

    arquivosSelecionados = [];
    inputImagens.value = '';
    renderizarLista();

  } catch (erro) {
    mensagem.textContent = 'Erro ao converter imagens.';
    mensagem.className = 'mt-5 text-sm text-red-600';
  }
});

renderizarLista();