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
const listaAlertas = document.getElementById('listaAlertas');
const graficoFinanceiro = document.getElementById('graficoFinanceiro');

const graficoCategorias = document.getElementById('graficoCategorias');

const scoreFinanceiro = document.getElementById('scoreFinanceiro');

const barraScore = document.getElementById('barraScore');

const mensagemScore = document.getElementById('mensagemScore');

const insightsFinanceiros = document.getElementById('insightsFinanceiros');

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
      <div class="
  flex flex-col sm:flex-row
  sm:items-center
  justify-between
  gap-3
  border border-slate-100
  rounded-2xl
  p-4
">
        <div>
          <h3 class="font-bold text-slate-800">
            ${item.descricao || item.subcategoria || item.categoria}
          </h3>

          <p class="text-sm text-slate-500">
            ${item.categoria} • ${formatarData(item.data_transacao)}
          </p>
        </div>

        <strong class="${cor} text-lg sm:text-base shrink-0">
          ${sinal} ${formatarMoeda(item.valor)}
        </strong>
      </div>
    `;
  }).join('');
}

async function carregarAlertas() {
  const resposta = await fetch('/api/alertas', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const alertas = await resposta.json();

  if (!resposta.ok) {
    listaAlertas.innerHTML = `
      <p class="text-sm text-red-600">
        Erro ao carregar alertas.
      </p>
    `;
    return;
  }

  if (alertas.length === 0) {
    listaAlertas.innerHTML = `
      <div class="bg-emerald-50 text-emerald-700 rounded-2xl p-4 text-sm font-medium">
        ✅ Nenhum alerta importante no momento.
      </div>
    `;
    return;
  }

  listaAlertas.innerHTML = alertas.map((alerta) => {

    const estilos = {
      erro: 'bg-red-50 text-red-600 border-red-100',
      alerta: 'bg-amber-50 text-amber-700 border-amber-100',
      sucesso: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    };

    const icones = {
      erro: '🚨',
      alerta: '⚠️',
      sucesso: '🎯'
    };

    return `
      <div class="
        border rounded-2xl p-4 text-sm font-medium
        ${estilos[alerta.tipo]}
      ">
        <div class="flex items-start gap-3">
          <span class="text-lg">
            ${icones[alerta.tipo]}
          </span>

          <span>
            ${alerta.mensagem}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

carregarResumoGeral();
carregarResumoMensal();
carregarMetas();
carregarUltimasTransacoes();
carregarAlertas();

async function carregarGraficos() {

  const respostaResumo = await fetch('/api/transacoes/resumo-mensal', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const resumo = await respostaResumo.json();

  const receitas =
    Number(resumo.receitas || 0);

  const despesas =
    Number(resumo.despesas || 0);

  new Chart(graficoFinanceiro, {
    type: 'bar',

    data: {
      labels: ['Receitas', 'Despesas'],

      datasets: [{
        label: 'Valor',
        data: [receitas, despesas],
        borderRadius: 12
      }]
    },

    options: {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false
    },

    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      borderRadius: 12,
      titleColor: '#fff',
      bodyColor: '#fff'
    }
  },

  scales: {

    x: {
      grid: {
        display: false
      },

      ticks: {
        color: '#64748b'
      }
    },

    y: {
      grid: {
        color: '#f1f5f9'
      },

      ticks: {
        color: '#64748b'
      }
    }
  }
}
  });

  const respostaCategorias = await fetch('/api/transacoes/gastos-categoria', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const categorias = await respostaCategorias.json();

new Chart(graficoCategorias, {
    type: 'doughnut',

    data: {
      labels: categorias.map((item) => item.categoria),

      datasets: [{
        data: categorias.map((item) => item.total),
        borderWidth: 0
      }]
    },

    options: {
  responsive: true,
  maintainAspectRatio: false
}
  });

  calcularScore(receitas, despesas);
}

function calcularScore(receitas, despesas) {

  let score = 100;

  if (despesas > receitas) {
    score = 30;
  } else if (despesas >= receitas * 0.8) {
    score = 60;
  } else if (despesas >= receitas * 0.5) {
    score = 80;
  }

  scoreFinanceiro.textContent =
    `${score}%`;

  barraScore.style.width =
    `${score}%`;

  if (score >= 80) {

    mensagemScore.textContent =
      'Sua saúde financeira está excelente.';

    barraScore.className =
      'bg-emerald-500 h-3 rounded-full transition-all duration-500';

  } else if (score >= 60) {

    mensagemScore.textContent =
      'Sua saúde financeira está razoável, mas há espaço para melhorar.';

    barraScore.className =
      'bg-amber-500 h-3 rounded-full transition-all duration-500';

  } else {

    mensagemScore.textContent =
      'Suas despesas estão comprometendo sua saúde financeira.';

    barraScore.className =
      'bg-red-500 h-3 rounded-full transition-all duration-500';

  }

  gerarInsights(receitas, despesas, score);
}

function gerarInsights(receitas, despesas, score) {

  const insights = [];

  if (despesas > receitas) {
    insights.push(
      '⚠️ Você gastou mais do que recebeu neste mês.'
    );
  }

  if (score >= 80) {
    insights.push(
      '🎯 Seu controle financeiro está muito saudável.'
    );
  }

  if (receitas > 0 && despesas <= receitas * 0.5) {
    insights.push(
      '💰 Você conseguiu economizar boa parte da sua renda.'
    );
  }

  if (insights.length === 0) {
    insights.push(
      '📊 Continue registrando movimentações para receber análises inteligentes.'
    );
  }

  insightsFinanceiros.innerHTML =
    insights.map((item) => `
      <div class="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700">
        ${item}
      </div>
    `).join('');
}

carregarGraficos();