const formConversor = document.getElementById('formConversor');
const inputImagem = document.getElementById('imagem');
const mensagem = document.getElementById('mensagem');
const downloadLink = document.getElementById('downloadLink');

formConversor.addEventListener('submit', async (e) => {
  e.preventDefault();

  const arquivo = inputImagem.files[0];

  if (!arquivo) {
    mensagem.textContent = 'Escolha uma imagem antes de converter.';
    mensagem.className = 'mt-5 text-sm text-red-600';
    return;
  }

  const formData = new FormData();
  formData.append('imagem', arquivo);

  try {
    mensagem.textContent = 'Convertendo...';
    mensagem.className = 'mt-5 text-sm text-slate-500';
    downloadLink.classList.add('hidden');

    const resposta = await fetch('/api/conversores/imagem-para-pdf', {
      method: 'POST',
      body: formData
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.erro || 'Erro ao converter imagem.';
      mensagem.className = 'mt-5 text-sm text-red-600';
      return;
    }

    mensagem.textContent = dados.mensagem;
    mensagem.className = 'mt-5 text-sm text-emerald-600';

    downloadLink.href = dados.arquivo;
    downloadLink.classList.remove('hidden');

  } catch (erro) {
    mensagem.textContent = 'Erro ao converter imagem.';
    mensagem.className = 'mt-5 text-sm text-red-600';
  }
});