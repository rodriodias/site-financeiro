const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token) {
  window.location.href = '/login.html';
}

const authHeaders = {
  Authorization: `Bearer ${token}`
};

let periodoAtual = {
  inicio: null,
  fim: null
};

let filtroSalvoTipo = null;
let filtroSalvoPeriodo = null;

function salvarFiltroDashboard(tipo = 'personalizado', periodo = null) {
  localStorage.setItem(
    'filtroDashboard',
    JSON.stringify({
      tipo,
      periodo,
      inicio: periodoAtual.inicio,
      fim: periodoAtual.fim
    })
  );
}

function carregarFiltroDashboard() {
  const filtroSalvo = localStorage.getItem('filtroDashboard');

  if (!filtroSalvo) return;

  const filtro = JSON.parse(filtroSalvo);

  if (filtro.inicio && filtro.fim) {
    periodoAtual = {
      inicio: filtro.inicio,
      fim: filtro.fim
    };

    filtroSalvoTipo = filtro.tipo;
    filtroSalvoPeriodo = filtro.periodo;
  }
}

carregarFiltroDashboard();

let chartFinanceiro = null;
let chartCategorias = null;
let chartEvolucao = null;

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
const graficoEvolucao = document.getElementById('graficoEvolucao');
const graficoFinanceiroVazio = document.getElementById('graficoFinanceiroVazio');

const graficoCategoriasVazio = document.getElementById('graficoCategoriasVazio');

const graficoEvolucaoVazio = document.getElementById('graficoEvolucaoVazio');

const scoreFinanceiro = document.getElementById('scoreFinanceiro');
const barraScore = document.getElementById('barraScore');
const mensagemScore = document.getElementById('mensagemScore');
const insightsFinanceiros = document.getElementById('insightsFinanceiros');

const botoesFiltroDashboard = document.querySelectorAll('.filtroDashboard');
const botaoPeriodoPersonalizado = document.getElementById('botaoPeriodoPersonalizado');
const periodoPersonalizado = document.getElementById('periodoPersonalizado');
const dataInicioDashboard = document.getElementById('dataInicioDashboard');
const dataFimDashboard = document.getElementById('dataFimDashboard');
const aplicarPeriodoPersonalizado = document.getElementById('aplicarPeriodoPersonalizado');
const limparFiltrosDashboard = document.getElementById('limparFiltrosDashboard');

if (usuario && usuario.nome && usuarioNome) {
  usuarioNome.textContent = usuario.nome;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

function montarUrl(base) {
  if (periodoAtual.inicio && periodoAtual.fim) {
    return `${base}?inicio=${periodoAtual.inicio}&fim=${periodoAtual.fim}`;
  }

  return base;
}

function definirPeriodo(dias) {
  const hoje = new Date();
  const inicio = new Date();

  inicio.setDate(hoje.getDate() - dias);

  periodoAtual = {
    inicio: inicio.toISOString().split('T')[0],
    fim: hoje.toISOString().split('T')[0]
  };
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarData(data) {
  if (!data) return '';

  const dataTexto = String(data).split('T')[0];
  const partes = dataTexto.split('-');

  if (partes.length !== 3) {
    return dataTexto;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function textoPeriodoAtual() {
  if (!periodoAtual.inicio || !periodoAtual.fim) {
    return '';
  }

  return `Período selecionado: ${formatarData(periodoAtual.inicio)} até ${formatarData(periodoAtual.fim)}`;
}

function atualizarIndicadoresPeriodo() {
  const indicadorGlobal = document.getElementById('indicadorPeriodoGlobal');
  const indicadores = document.querySelectorAll('.periodoInfo');

  if (!periodoAtual.inicio || !periodoAtual.fim) {
    if (indicadorGlobal) {
      indicadorGlobal.classList.add('hidden');
      indicadorGlobal.textContent = '';
    }

    indicadores.forEach((item) => {
      item.classList.add('hidden');
      item.textContent = '';
    });

    if (limparFiltrosDashboard) {
      limparFiltrosDashboard.classList.add('hidden');
    }

    return;
  }

  const texto = textoPeriodoAtual();

  if (indicadorGlobal) {
    indicadorGlobal.textContent = texto;
    indicadorGlobal.classList.remove('hidden');
  }

  indicadores.forEach((item) => {
    item.textContent = texto;
    item.classList.remove('hidden');
  });

  if (limparFiltrosDashboard) {
    limparFiltrosDashboard.classList.remove('hidden');
  }
}

function atualizarVisualFiltros(botaoAtivo = null) {
  botoesFiltroDashboard.forEach((item) => {
    item.classList.remove('bg-emerald-600', 'text-white');

    item.classList.add(
      'bg-white',
      'border',
      'border-slate-200',
      'text-slate-700'
    );
  });

  botaoPeriodoPersonalizado.classList.remove(
    'bg-emerald-600',
    'text-white'
  );

  botaoPeriodoPersonalizado.classList.add(
    'bg-emerald-50',
    'border',
    'border-emerald-100',
    'text-emerald-700'
  );

  if (botaoAtivo) {
    botaoAtivo.classList.remove(
      'bg-white',
      'border',
      'border-slate-200',
      'text-slate-700',
      'bg-emerald-50',
      'border-emerald-100',
      'text-emerald-700'
    );

    botaoAtivo.classList.add('bg-emerald-600', 'text-white');
  }
}

async function carregarResumoGeral() {
  const endpoint = periodoAtual.inicio && periodoAtual.fim
    ? montarUrl('/api/transacoes/resumo-mensal')
    : '/api/transacoes/resumo';

  const resposta = await fetch(endpoint, {
    headers: authHeaders
  });

  const resumo = await resposta.json();

  if (!resposta.ok) return;

  saldoAtual.textContent = formatarMoeda(resumo.saldo);
}

async function carregarResumoMensal() {
  const resposta = await fetch(montarUrl('/api/transacoes/resumo-mensal'), {
    headers: authHeaders
  });

  const resumo = await resposta.json();

  if (!resposta.ok) return;

  receitasMes.textContent = formatarMoeda(resumo.receitas);
  despesasMes.textContent = formatarMoeda(resumo.despesas);

  if (resumo.despesas > resumo.receitas) {
    dicaFinanceira.textContent =
      'Suas despesas estão maiores que suas receitas neste período. Vale revisar gastos opcionais.';
  } else if (resumo.receitas > 0) {
    dicaFinanceira.textContent =
      'Você está mantendo receitas acima das despesas neste período. Continue acompanhando suas categorias.';
  } else {
    dicaFinanceira.textContent =
      'Registre suas movimentações para receber uma análise financeira mais precisa.';
  }
}

async function carregarMetas() {
  const resposta = await fetch('/api/metas', {
    headers: authHeaders
  });

  const metas = await resposta.json();

  if (!resposta.ok) return;

  const ativas = metas.filter((meta) => meta.status === 'ativa');

  metasAtivas.textContent = ativas.length;
}

async function carregarUltimasTransacoes() {
  const resposta = await fetch('/api/transacoes', {
    headers: authHeaders
  });

  const transacoes = await resposta.json();

  if (!resposta.ok) {
    ultimasTransacoes.innerHTML = `
      <p class="text-sm text-red-600">
        Erro ao carregar transações.
      </p>
    `;
    return;
  }

  let transacoesFiltradas = transacoes;

  if (periodoAtual.inicio && periodoAtual.fim) {
    transacoesFiltradas = transacoes.filter((item) => {
      const data = item.data_transacao.split('T')[0];

      return data >= periodoAtual.inicio && data <= periodoAtual.fim;
    });
  }

  const ultimas = transacoesFiltradas.slice(0, 5);

  if (ultimas.length === 0) {
    ultimasTransacoes.innerHTML = `
      <p class="text-sm text-slate-500">
        Nenhuma transação encontrada para este período.
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
        sm:items-center justify-between
        gap-3 border border-slate-100
        rounded-2xl p-4
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
    headers: authHeaders
  });

  const alertas = await resposta.json();

  if (!resposta.ok || !listaAlertas) return;

  if (alertas.length === 0) {
    listaAlertas.innerHTML = `
      <div class="bg-emerald-50 text-emerald-700 rounded-2xl p-4 text-sm font-medium">
        ✅ Nenhum alerta importante no momento.
      </div>
    `;
    return;
  }

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

  listaAlertas.innerHTML = alertas.map((alerta) => `
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
  `).join('');
}

async function carregarGraficos() {
  const respostaResumo = await fetch(montarUrl('/api/transacoes/resumo-mensal'), {
    headers: authHeaders
  });

  const resumo = await respostaResumo.json();

  if (!respostaResumo.ok) return;

  const receitas = Number(resumo.receitas || 0);
  const despesas = Number(resumo.despesas || 0);

  const semResumo =
  receitas === 0 &&
  despesas === 0;

graficoFinanceiroVazio.classList.toggle('hidden', !semResumo);
graficoFinanceiro.classList.toggle('opacity-0', semResumo);

  if (chartFinanceiro) {
    chartFinanceiro.destroy();
  }

  if (chartCategorias) {
    chartCategorias.destroy();
  }

  chartFinanceiro = new Chart(graficoFinanceiro, {
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

  const respostaCategorias = await fetch(montarUrl('/api/transacoes/gastos-categoria'), {
    headers: authHeaders
  });

  const categorias = await respostaCategorias.json();

  if (!respostaCategorias.ok) return;

  const semCategorias =
  categorias.length === 0;

graficoCategoriasVazio.classList.toggle('hidden', !semCategorias);
graficoCategorias.classList.toggle('opacity-0', semCategorias);

  chartCategorias = new Chart(graficoCategorias, {
    type: 'doughnut',

    data: {
      labels: categorias.map((item) => item.categoria),

      datasets: [{
        data: categorias.map((item) => item.total),
        borderWidth: 0,
        borderRadius: 8,
        spacing: 4,
        hoverOffset: 12,
        cutout: '68%'
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: 'bottom',

          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            color: '#475569',
            font: {
              size: 12
            }
          }
        },

        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          borderRadius: 12,
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      }
    }
  });

  calcularScore(receitas, despesas);
}

async function carregarEvolucaoMensal() {

  const resposta = await fetch(
  montarUrl('/api/transacoes/evolucao-mensal'),
  {
    headers: authHeaders
  }
);

  const dados = await resposta.json();

  if (!resposta.ok) return;

  const semEvolucao =
  dados.length === 0;

graficoEvolucaoVazio.classList.toggle('hidden', !semEvolucao);
graficoEvolucao.classList.toggle('opacity-0', semEvolucao);

if (semEvolucao) return;

  const labels = dados.map((item) => {

    const [ano, mes] =
      item.mes.split('-');

    return `${mes}/${ano}`;

  });

  const receitas =
    dados.map((item) => item.receitas);

  const despesas =
    dados.map((item) => item.despesas);

  const saldo =
    dados.map((item) => item.saldo);

  if (chartEvolucao) {
    chartEvolucao.destroy();
  }

  chartEvolucao = new Chart(
    graficoEvolucao,
    {

      type: 'line',

      data: {

        labels,

        datasets: [

          {
            label: 'Receitas',
            data: receitas,
            tension: 0.4
          },

          {
            label: 'Despesas',
            data: despesas,
            tension: 0.4
          },

          {
            label: 'Saldo',
            data: saldo,
            tension: 0.4
          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            position: 'bottom'
          }

        },

        scales: {

          x: {
            grid: {
              display: false
            }
          },

          y: {
            grid: {
              color: '#f1f5f9'
            }
          }

        }

      }

    }
  );

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

  scoreFinanceiro.textContent = `${score}%`;
  barraScore.style.width = `${score}%`;

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

async function carregarComparativo() {
  if (!periodoAtual.inicio || !periodoAtual.fim) {
    return null;
  }

  const resposta = await fetch(
    montarUrl('/api/transacoes/comparativo'),
    {
      headers: authHeaders
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    return null;
  }

  return dados;
}

async function carregarComparativoCategorias() {

  if (
    !periodoAtual.inicio ||
    !periodoAtual.fim
  ) {
    return null;
  }

  const resposta = await fetch(

    montarUrl(
      '/api/transacoes/comparativo-categorias'
    ),

    {
      headers: authHeaders
    }

  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    return null;
  }

  return dados;

}

async function gerarInsights(receitas, despesas, score) {
  const insights = [];

  const comparativo = await carregarComparativo();
  const comparativoCategorias = await carregarComparativoCategorias();

  if (comparativo) {
    const receitasAtual = Number(comparativo.atual.receitas || 0);
    const receitasAnterior = Number(comparativo.anterior.receitas || 0);

    const despesasAtual = Number(comparativo.atual.despesas || 0);
    const despesasAnterior = Number(comparativo.anterior.despesas || 0);

    if (receitasAnterior > 0) {
      const variacaoReceitas =
        ((receitasAtual - receitasAnterior) / receitasAnterior) * 100;

      if (variacaoReceitas > 0) {
        insights.push(
          `📈 Suas receitas aumentaram ${variacaoReceitas.toFixed(0)}% em relação ao período anterior.`
        );
      } else if (variacaoReceitas < 0) {
        insights.push(
          `📉 Suas receitas reduziram ${Math.abs(variacaoReceitas).toFixed(0)}% em relação ao período anterior.`
        );
      }
    }

    if (despesasAnterior > 0) {
      const variacaoDespesas =
        ((despesasAtual - despesasAnterior) / despesasAnterior) * 100;

      if (variacaoDespesas > 0) {
        insights.push(
          `⚠️ Suas despesas aumentaram ${variacaoDespesas.toFixed(0)}% em relação ao período anterior.`
        );
      } else if (variacaoDespesas < 0) {
        insights.push(
          `✅ Suas despesas reduziram ${Math.abs(variacaoDespesas).toFixed(0)}% em relação ao período anterior.`
        );
      }
    }
  }

  if (comparativoCategorias) {

  const categoriasAtuais =
    comparativoCategorias.atual;

  const categoriasAnteriores =
    comparativoCategorias.anterior;

  categoriasAtuais.forEach((categoriaAtual) => {

    const categoriaAnterior =
      categoriasAnteriores.find(
        (item) =>
          item.categoria ===
          categoriaAtual.categoria
      );

    if (!categoriaAnterior) return;

    const atual =
      Number(categoriaAtual.total || 0);

    const anterior =
      Number(categoriaAnterior.total || 0);

    if (anterior <= 0) return;

    const variacao =
      ((atual - anterior) / anterior) * 100;

    if (Math.abs(variacao) < 10) return;

    if (variacao > 0) {

      insights.push(
        `📈 ${categoriaAtual.categoria} aumentou ${variacao.toFixed(0)}% em relação ao período anterior.`
      );

    } else {

      insights.push(
        `📉 ${categoriaAtual.categoria} reduziu ${Math.abs(variacao).toFixed(0)}% em relação ao período anterior.`
      );

    }

  });

  const maiorCategoria =
    categoriasAtuais.reduce(
      (maior, atual) => {

        return Number(atual.total)
          > Number(maior.total)
          ? atual
          : maior;

      },
      categoriasAtuais[0]
    );

  if (maiorCategoria) {

    insights.push(
      `💸 ${maiorCategoria.categoria} foi sua categoria com maior gasto no período.`
    );

  }

}

  if (despesas > receitas) {
    insights.push('⚠️ Você gastou mais do que recebeu neste período.');
  }

  if (score >= 80) {
    insights.push('🎯 Seu controle financeiro está muito saudável.');
  }

  if (receitas > 0 && despesas <= receitas * 0.5) {
    insights.push('💰 Você conseguiu economizar boa parte da sua renda.');
  }

  if (insights.length === 0) {
    insights.push(
      '📊 Continue registrando movimentações para receber análises inteligentes.'
    );
  }

  insightsFinanceiros.innerHTML = insights.map((item) => `
    <div class="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700">
      ${item}
    </div>
  `).join('');
}

async function atualizarDashboardCompleto() {
  await carregarResumoGeral();
  await carregarResumoMensal();
  await carregarUltimasTransacoes();
  await carregarGraficos();
  await carregarEvolucaoMensal();
  atualizarIndicadoresPeriodo();
}

botaoPeriodoPersonalizado.addEventListener('click', () => {
  periodoPersonalizado.classList.toggle('hidden');
});

aplicarPeriodoPersonalizado.addEventListener('click', async () => {
  const inicio = dataInicioDashboard.value;
  const fim = dataFimDashboard.value;

  if (!inicio || !fim) {
    alert('Selecione a data inicial e a data final.');
    return;
  }

  if (inicio > fim) {
    alert('A data inicial não pode ser maior que a data final.');
    return;
  }

  periodoAtual = {
    inicio,
    fim
  };

  salvarFiltroDashboard('personalizado');
  atualizarVisualFiltros(botaoPeriodoPersonalizado);
  await atualizarDashboardCompleto();
});

botoesFiltroDashboard.forEach((botao) => {
  botao.addEventListener('click', async () => {
    const dias = Number(botao.dataset.periodo);

    definirPeriodo(dias);
    salvarFiltroDashboard('rapido', dias);
    atualizarVisualFiltros(botao);

    await atualizarDashboardCompleto();
  });
});

limparFiltrosDashboard.addEventListener('click', async () => {
  periodoAtual = {
    inicio: null,
    fim: null
  };

  localStorage.removeItem('filtroDashboard');

  dataInicioDashboard.value = '';
  dataFimDashboard.value = '';

  atualizarVisualFiltros();
  await atualizarDashboardCompleto();
});

if (periodoAtual.inicio && periodoAtual.fim) {
  dataInicioDashboard.value = periodoAtual.inicio;
  dataFimDashboard.value = periodoAtual.fim;

  if (filtroSalvoTipo === 'rapido') {
    const botaoSalvo = document.querySelector(
      `.filtroDashboard[data-periodo="${filtroSalvoPeriodo}"]`
    );

    atualizarVisualFiltros(botaoSalvo);
  } else {
    atualizarVisualFiltros(botaoPeriodoPersonalizado);
  }
}

carregarResumoGeral();
carregarResumoMensal();
carregarMetas();
carregarUltimasTransacoes();
carregarAlertas();
carregarGraficos();
carregarEvolucaoMensal();
atualizarIndicadoresPeriodo();