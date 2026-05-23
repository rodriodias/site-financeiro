const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token) {
  window.location.href = '/login.html';
}

const usuarioNome = document.getElementById('usuarioNome');
const saldoAtual = document.getElementById('saldoAtual');
const receitasMes = document.getElementById('receitasMes');
const despesasMes = document.getElementById('despesasMes');
const metasAtivas = document.getElementById('metasAtivas');
const ultimasTransacoes = document.getElementById('ultimasTransacoes');
const dicaFinanceira = document.getElementById('dicaFinanceira');

if (usuario && usuario.nome) {
  usuarioNome.textContent = usuario.nome;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

async function carregarResumoGeral() {
  const resposta = await fetch('/api/transacoes/resumo', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const resumo = await resposta.json();

  if (!resposta.ok) return;

  saldoAtual.textContent = formatarMoeda(resumo.saldo);
}

async function carregarResumoMensal() {
  const resposta = await fetch('/api/transacoes/resumo-mensal', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const resumo = await resposta.json();

  if (!resposta.ok) return;

  receitasMes.textContent = formatarMoeda(resumo.receitas);
  despesasMes.textContent = formatarMoeda(resumo.despesas);

  if (resumo.despesas > resumo.receitas) {
    dicaFinanceira.textContent =
      'Suas despesas do mês estão maiores que suas receitas. Vale revisar gastos opcionais.';
  } else if (resumo.receitas > 0) {
    dicaFinanceira.textContent =
      'Você está mantendo receitas acima das despesas neste mês. Continue acompanhando suas categorias.';
  }
}

async function carregarMetas() {
  const resposta = await fetch('/api/metas', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const metas = await resposta.json();

  if (!resposta.ok) return;

  const ativas = metas.filter((meta) => meta.status === 'ativa');

  metasAtivas.textContent = ativas.length;
}

async function carregarUltimasTransacoes() {
  const resposta = await fetch('/api/transacoes', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const transacoes = await resposta.json();

  if (!resposta.ok) {
    ultimasTransacoes.innerHTML = `
      <p class="text-sm text-red-600">Erro ao carregar transações.</p>
    `;
    return;
  }

  const ultimas = transacoes.slice(0, 5);

  if (ultimas.length === 0) {
    ultimasTransacoes.innerHTML = `
      <p class="text-sm text-slate-500">
        Nenhuma transação cadastrada ainda.
      </p>
    `;
    return;
  }

  ultimasTransacoes.innerHTML = ultimas.map((item) => {
    const cor = item.tipo === 'receita'
      ? 'text-emerald-600'
      : 'text-red-500';

    const sinal = item.tipo === 'receita' ? '+' : '-';

    return `
      <div class="flex items-center justify-between border border-slate-100 rounded-2xl p-4">
        <div>
          <h3 class="font-bold text-slate-800">
            ${item.descricao || item.subcategoria || item.categoria}
          </h3>

          <p class="text-sm text-slate-500">
            ${item.categoria} • ${formatarData(item.data_transacao)}
          </p>
        </div>

        <strong class="${cor}">
          ${sinal} ${formatarMoeda(item.valor)}
        </strong>
      </div>
    `;
  }).join('');
}

carregarResumoGeral();
carregarResumoMensal();
carregarMetas();
carregarUltimasTransacoes();