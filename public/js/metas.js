const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

const formMeta = document.getElementById('formMeta');
const mensagem = document.getElementById('mensagem');
const listaMetas = document.getElementById('listaMetas');

const metaIdInput = document.getElementById('metaId');
const statusSelect = document.getElementById('status');
const botaoCancelarEdicao = document.getElementById('botaoCancelarEdicao');
const categoriaRelacionada = document.getElementById('categoria_relacionada');

let metasCache = [];

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function calcularPorcentagem(valorAtual, valorMeta) {
  if (!valorMeta || valorMeta <= 0) return 0;

  return Math.min(
    ((valorAtual / valorMeta) * 100).toFixed(1),
    100
  );
}

async function carregarCategorias() {
  const resposta = await fetch('/api/categorias', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const categorias = await resposta.json();

  if (!resposta.ok) return;

  const categoriasPrincipais = [
    ...new Set(categorias.map((item) => item.nome))
  ].sort();

  categoriaRelacionada.innerHTML = `
    <option value="">Categoria relacionada</option>
  `;

  categoriasPrincipais.forEach((categoria) => {
    categoriaRelacionada.innerHTML += `
      <option value="${categoria}">${categoria}</option>
    `;
  });
}

async function carregarMetas() {
  const resposta = await fetch('/api/metas', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const metas = await resposta.json();

  if (!resposta.ok) {
    listaMetas.innerHTML = `
      <p class="text-sm text-red-600">
        Erro ao carregar metas.
      </p>
    `;
    return;
  }

  metasCache = metas;

  if (metas.length === 0) {
    listaMetas.innerHTML = `
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <p class="text-slate-500 text-sm">
          Nenhuma meta cadastrada ainda.
        </p>
      </div>
    `;
    return;
  }

  listaMetas.innerHTML = metas.map((meta) => {
    const valorAtual = Number(meta.valor_atual || 0);
    const valorMeta = Number(meta.valor_meta || 0);
    const porcentagem = calcularPorcentagem(valorAtual, valorMeta);
    const falta = valorMeta - valorAtual;
    let statusAtual = meta.status;

if (porcentagem >= 100) {
  statusAtual = 'concluida';
}

    const statusTexto = {
      ativa: 'Ativa',
      concluida: 'Concluída',
      pausada: 'Pausada'
    };

    const statusClasses = {
  ativa: 'bg-emerald-50 text-emerald-700',
  pausada: 'bg-red-50 text-red-600',
  concluida: 'bg-blue-50 text-blue-600'
};

    return `
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">

        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              ${meta.titulo}
            </h3>

            <p class="text-sm text-slate-500 mt-1">
              ${meta.categoria_relacionada || 'Sem categoria'}
            </p>
          </div>

          <span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
            ${porcentagem}%
          </span>
        </div>

        <div class="mt-5">
          <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-emerald-500 rounded-full"
              style="width: ${porcentagem}%;">
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm">
          <span class="text-slate-500">Faltam</span>

          <strong class="text-slate-900">
            ${formatarMoeda(falta > 0 ? falta : 0)}
          </strong>
        </div>

        <div class="mt-5 space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Atual</span>

            <strong class="text-slate-900">
              ${formatarMoeda(meta.valor_atual)}
            </strong>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-500">Meta</span>

            <strong class="text-slate-900">
              ${formatarMoeda(meta.valor_meta)}
            </strong>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-500">Prazo</span>

            <strong class="text-slate-900">
              ${
                meta.prazo
                  ? new Date(meta.prazo).toLocaleDateString('pt-BR')
                  : 'Não definido'
              }
            </strong>
          </div>

          <div class="flex items-center justify-between">
  <span class="text-slate-500">Status</span>

  <span class="
    px-3 py-1 rounded-full text-xs font-bold
    ${statusClasses[statusAtual] || 'bg-slate-100 text-slate-700'}
  ">
    ${statusTexto[statusAtual] || statusAtual}
  </span>
</div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            onclick="editarMeta(${meta.id})"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold">
            Editar
          </button>

          <button
            onclick="excluirMeta(${meta.id})"
            class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-sm font-bold">
            Excluir
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function limparFormulario() {
  formMeta.reset();
  metaIdInput.value = '';
  statusSelect.value = 'ativa';
  botaoCancelarEdicao.classList.add('hidden');
}

botaoCancelarEdicao.addEventListener('click', limparFormulario);

function editarMeta(id) {
  const meta = metasCache.find((item) => item.id === id);

  if (!meta) return;

  metaIdInput.value = meta.id;

  document.getElementById('titulo').value = meta.titulo;
  document.getElementById('valor_meta').value = meta.valor_meta;
  document.getElementById('valor_atual').value = meta.valor_atual;

  document.getElementById('prazo').value =
    meta.prazo
      ? new Date(meta.prazo).toISOString().split('T')[0]
      : '';

  categoriaRelacionada.value = meta.categoria_relacionada || '';
  statusSelect.value = meta.status || 'ativa';

  botaoCancelarEdicao.classList.remove('hidden');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

async function excluirMeta(id) {
  const resposta = await fetch(`/api/metas/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.erro || 'Erro ao excluir meta.');
    return;
  }

  carregarMetas();
}

formMeta.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = metaIdInput.value;

  const titulo = document.getElementById('titulo').value.trim();
  const valor_meta = document.getElementById('valor_meta').value;
  const valor_atual = document.getElementById('valor_atual').value;
  const prazo = document.getElementById('prazo').value;
  const categoria_relacionada = categoriaRelacionada.value;
  const status = statusSelect.value;

  const url = id
    ? `/api/metas/${id}`
    : '/api/metas';

  const metodo = id ? 'PUT' : 'POST';

  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      titulo,
      valor_meta,
      valor_atual,
      prazo,
      categoria_relacionada,
      status
    })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagem.textContent =
      dados.erro || 'Erro ao salvar meta.';

    mensagem.className =
      'mt-4 text-sm text-red-600';

    return;
  }

  mensagem.textContent = dados.mensagem;

  mensagem.className =
    'mt-4 text-sm text-emerald-600';

  limparFormulario();
  carregarMetas();
});

carregarCategorias();
carregarMetas();