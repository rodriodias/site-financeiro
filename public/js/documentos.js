const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

const formUpload = document.getElementById('formUpload');
const inputDocumento = document.getElementById('documento');
const mensagem = document.getElementById('mensagem');
const listaDocumentos = document.getElementById('listaDocumentos');

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

async function carregarDocumentos() {
  try {
    const resposta = await fetch('/api/documentos', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const documentos = await resposta.json();

    if (!resposta.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login.html';
      return;
    }

    if (documentos.length === 0) {
      listaDocumentos.innerHTML = `
        <p class="text-slate-500 text-sm">
          Nenhum documento enviado ainda.
        </p>
      `;
      return;
    }

    listaDocumentos.innerHTML = documentos.map((doc) => {
      const tamanhoMB = (doc.tamanho / 1024 / 1024).toFixed(2);

      return `
        <div class="border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-slate-800">${doc.nome_original}</h3>
            <p class="text-sm text-slate-500">${doc.tipo} • ${tamanhoMB} MB</p>
          </div>
          <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            Salvo
          </span>
        </div>
      `;
    }).join('');

  } catch (erro) {
    listaDocumentos.innerHTML = `
      <p class="text-red-600 text-sm">
        Erro ao carregar documentos.
      </p>
    `;
  }
}

formUpload.addEventListener('submit', async (e) => {
  e.preventDefault();

  const arquivo = inputDocumento.files[0];

  if (!arquivo) {
    mensagem.textContent = 'Escolha um arquivo antes de enviar.';
    mensagem.className = 'mt-4 text-sm text-red-600';
    return;
  }

  const formData = new FormData();
  formData.append('documento', arquivo);

  try {
    const resposta = await fetch('/api/documentos/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.erro || 'Erro ao enviar documento.';
      mensagem.className = 'mt-4 text-sm text-red-600';
      return;
    }

    mensagem.textContent = dados.mensagem;
    mensagem.className = 'mt-4 text-sm text-emerald-600';

    inputDocumento.value = '';
    carregarDocumentos();

  } catch (erro) {
    mensagem.textContent = 'Erro ao enviar documento.';
    mensagem.className = 'mt-4 text-sm text-red-600';
  }
});

carregarDocumentos();