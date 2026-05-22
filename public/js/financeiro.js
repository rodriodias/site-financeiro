const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

const formTransacao = document.getElementById('formTransacao');
const mensagem = document.getElementById('mensagem');
const listaTransacoes = document.getElementById('listaTransacoes');

const totalReceitas = document.getElementById('totalReceitas');
const totalDespesas = document.getElementById('totalDespesas');
const saldoFinal = document.getElementById('saldoFinal');

const categoriaSelect = document.getElementById('categoria');
const novaCategoriaInput = document.getElementById('novaCategoria');
const dataInput = document.getElementById('data_transacao');

function definirDataHoraAtual() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  dataInput.value = agora.toISOString().slice(0, 16);
}

definirDataHoraAtual();

categoriaSelect.addEventListener('change', () => {
  if (categoriaSelect.value === 'nova') {
    novaCategoriaInput.classList.remove('hidden');
  } else {
    novaCategoriaInput.classList.add('hidden');
    novaCategoriaInput.value = '';
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarDataHoraBrasil(data) {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function carregarResumo() {
  const resposta = await fetch('/api/transacoes/resumo', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const resumo = await resposta.json();

  if (!resposta.ok) return;

  totalReceitas.textContent = formatarMoeda(resumo.receitas);
  totalDespesas.textContent = formatarMoeda(resumo.despesas);
  saldoFinal.textContent = formatarMoeda(resumo.saldo);
}

async function carregarTransacoes() {
  const resposta = await fetch('/api/transacoes', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const transacoes = await resposta.json();

  if (!resposta.ok) {
    listaTransacoes.innerHTML = `
      <p class="text-sm text-red-600">Erro ao carregar transações.</p>
    `;
    return;
  }

  if (transacoes.length === 0) {
    listaTransacoes.innerHTML = `
      <p class="text-sm text-slate-500">Nenhuma transação cadastrada.</p>
    `;
    return;
  }

  listaTransacoes.innerHTML = transacoes.map((item) => {
    const cor = item.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500';
    const sinal = item.tipo === 'receita' ? '+' : '-';
    const tipoLabel = item.tipo === 'receita' ? 'Receita' : 'Despesa';

    return `
      <div class="flex justify-between items-center border border-slate-100 rounded-2xl p-4">
        <div>
          <h3 class="font-bold text-slate-800">
            ${item.descricao || tipoLabel}
          </h3>

          <p class="text-sm text-slate-500">
            ${tipoLabel} • ${item.categoria} • ${formatarDataHoraBrasil(item.data_transacao)}
          </p>
        </div>

        <strong class="${cor}">
          ${sinal} ${formatarMoeda(item.valor)}
        </strong>
      </div>
    `;
  }).join('');
}

formTransacao.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tipo = document.getElementById('tipo').value;
  const valor = document.getElementById('valor').value;
  let categoria = categoriaSelect.value;
  const novaCategoria = novaCategoriaInput.value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const data_transacao = dataInput.value;

  if (categoria === 'nova') {
    categoria = novaCategoria;
  }

  const resposta = await fetch('/api/transacoes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      tipo,
      valor,
      categoria,
      descricao,
      data_transacao
    })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagem.textContent = dados.erro || 'Erro ao salvar transação.';
    mensagem.className = 'mt-4 text-sm text-red-600';
    return;
  }

  mensagem.textContent = dados.mensagem;
  mensagem.className = 'mt-4 text-sm text-emerald-600';

  formTransacao.reset();
  novaCategoriaInput.classList.add('hidden');
  definirDataHoraAtual();

  carregarResumo();
  carregarTransacoes();
});

carregarResumo();
carregarTransacoes();