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
const receitasMes = document.getElementById('receitasMes');
const despesasMes = document.getElementById('despesasMes');
const saldoMes = document.getElementById('saldoMes');

const categoriaSelect = document.getElementById('categoria');
const subcategoriaSelect = document.getElementById('subcategoria');
const tipoGastoSelect = document.getElementById('tipo_gasto');
const metaSelect = document.getElementById('meta_id');

const novaCategoriaNome = document.getElementById('novaCategoriaNome');
const novaSubcategoria = document.getElementById('novaSubcategoria');
const novoTipoGasto = document.getElementById('novoTipoGasto');

const botaoCriarCategoria = document.getElementById('botaoCriarCategoria');
const mensagemCategoria = document.getElementById('mensagemCategoria');

const dataInput = document.getElementById('data_transacao');
const transacaoIdInput = document.getElementById('transacaoId');

const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelarEdicao = document.getElementById('botaoCancelarEdicao');

const filtroTexto = document.getElementById('filtroTexto');
const filtroTipo = document.getElementById('filtroTipo');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroDataInicio = document.getElementById('filtroDataInicio');
const filtroDataFim = document.getElementById('filtroDataFim');
const limparFiltros = document.getElementById('limparFiltros');
const botaoBuscarFiltros = document.getElementById('botaoBuscarFiltros');

let transacoesCache = [];
let categoriasCache = [];
let graficoCategorias = null;
let metasCache = [];

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

function definirDataHoraAtual() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  dataInput.value = agora.toISOString().slice(0, 16);
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

function converterParaDatetimeLocal(data) {
  const dataObj = new Date(data);
  dataObj.setMinutes(dataObj.getMinutes() - dataObj.getTimezoneOffset());
  return dataObj.toISOString().slice(0, 16);
}

async function atualizarPainelFinanceiro() {
  await carregarResumo();
  await carregarResumoMensal();
  await carregarTransacoes();
  await carregarGraficoCategorias();
}

async function carregarMetas() {
  const resposta = await fetch('/api/metas', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const metas = await resposta.json();

  if (!resposta.ok) return;

  metasCache = metas.filter((meta) => meta.status === 'ativa');

  metaSelect.innerHTML = `
    <option value="">Vincular a uma meta opcional</option>
  `;

  metasCache.forEach((meta) => {
    metaSelect.innerHTML += `
      <option value="${meta.id}">
        ${meta.titulo}
      </option>
    `;
  });
}

async function carregarCategorias() {
  const resposta = await fetch('/api/categorias', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const categorias = await resposta.json();

  if (!resposta.ok) {
    console.error('Erro ao carregar categorias');
    return;
  }

  categoriasCache = categorias;

  const categoriasPrincipais = [
    ...new Set(categorias.map((item) => item.nome))
  ].sort();

  categoriaSelect.innerHTML = `
    <option value="">Selecione a categoria principal</option>
  `;

  filtroCategoria.innerHTML = `
    <option value="">Todas categorias</option>
  `;

  categoriasPrincipais.forEach((categoria) => {
    categoriaSelect.innerHTML += `
      <option value="${categoria}">${categoria}</option>
    `;

    filtroCategoria.innerHTML += `
      <option value="${categoria}">${categoria}</option>
    `;
  });

  subcategoriaSelect.innerHTML = `
    <option value="">Selecione a subcategoria</option>
  `;
}

function carregarSubcategorias(categoriaSelecionada, subcategoriaSelecionada = '') {
  const subcategorias = categoriasCache.filter(
    (item) => item.nome === categoriaSelecionada
  );

  subcategoriaSelect.innerHTML = `
    <option value="">Selecione a subcategoria</option>
  `;

  subcategorias.forEach((item) => {
    subcategoriaSelect.innerHTML += `
      <option value="${item.subcategoria}">
        ${item.subcategoria}
      </option>
    `;
  });

  if (subcategoriaSelecionada) {
    subcategoriaSelect.value = subcategoriaSelecionada;
  }
}

function preencherTipoGasto() {
  const categoriaSelecionada = categoriaSelect.value;
  const subcategoriaSelecionada = subcategoriaSelect.value;

  const categoriaEncontrada = categoriasCache.find(
    (item) =>
      item.nome === categoriaSelecionada &&
      item.subcategoria === subcategoriaSelecionada
  );

  if (categoriaEncontrada) {
    tipoGastoSelect.value = categoriaEncontrada.tipo_gasto;
  }
}

categoriaSelect.addEventListener('change', () => {
  carregarSubcategorias(categoriaSelect.value);
  tipoGastoSelect.value = '';
});

subcategoriaSelect.addEventListener('change', preencherTipoGasto);

botaoCriarCategoria.addEventListener('click', async (event) => {
  event.preventDefault();

  const nome = novaCategoriaNome.value.trim();
  const subcategoria = novaSubcategoria.value.trim();
  const tipo_gasto = novoTipoGasto.value;

  if (!nome || !subcategoria || !tipo_gasto) {
    mensagemCategoria.textContent = 'Preencha todos os campos da categoria.';
    mensagemCategoria.className = 'text-sm text-red-600';
    return;
  }

  const resposta = await fetch('/api/categorias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nome,
      subcategoria,
      tipo_gasto
    })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagemCategoria.textContent = dados.erro || 'Erro ao criar categoria.';
    mensagemCategoria.className = 'text-sm text-red-600';
    return;
  }

  mensagemCategoria.textContent = dados.mensagem;
  mensagemCategoria.className = 'text-sm text-emerald-600';

  await carregarCategorias();

  categoriaSelect.value = nome;
  carregarSubcategorias(nome, subcategoria);
  tipoGastoSelect.value = tipo_gasto;

  novaCategoriaNome.value = '';
  novaSubcategoria.value = '';
  novoTipoGasto.value = '';
});

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
  saldoMes.textContent = formatarMoeda(resumo.saldo);
}

async function carregarGraficoCategorias() {
  const resposta = await fetch('/api/transacoes/gastos-categoria', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const categorias = await resposta.json();

  if (!resposta.ok) return;

  const labels = categorias.map((item) => item.categoria);
  const valores = categorias.map((item) => Number(item.total));
  const total = valores.reduce((acc, valor) => acc + valor, 0);

  const canvas = document.getElementById('graficoCategorias');

  if (!canvas) return;

  if (graficoCategorias) {
    graficoCategorias.destroy();
  }

  graficoCategorias = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: valores
      }]
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },

        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 12
          },
          formatter(value) {
            const porcentagem = total
              ? ((value / total) * 100).toFixed(1)
              : 0;

            return `${porcentagem}%`;
          }
        },

        tooltip: {
          callbacks: {
            label(context) {
              const valor = Number(context.raw);
              const porcentagem = total
                ? ((valor / total) * 100).toFixed(1)
                : 0;

              return `${context.label}: ${formatarMoeda(valor)} (${porcentagem}%)`;
            }
          }
        }
      }
    }
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

  transacoesCache = transacoes;
  renderizarTransacoes(transacoesCache);
}

function aplicarFiltros() {
  const texto = filtroTexto.value.toLowerCase().trim();
  const tipo = filtroTipo.value;
  const categoria = filtroCategoria.value.toLowerCase();
  const dataInicio = filtroDataInicio.value;
  const dataFim = filtroDataFim.value;

  const filtradas = transacoesCache.filter((item) => {
    const descricao = (item.descricao || '').toLowerCase();
    const categoriaItem = (item.categoria || '').toLowerCase();
    const subcategoriaItem = (item.subcategoria || '').toLowerCase();

    const dataObj = new Date(item.data_transacao);
    dataObj.setMinutes(dataObj.getMinutes() - dataObj.getTimezoneOffset());
    const dataItem = dataObj.toISOString().slice(0, 10);

    return (
      (!texto ||
        descricao.includes(texto) ||
        categoriaItem.includes(texto) ||
        subcategoriaItem.includes(texto)) &&
      (!tipo || item.tipo === tipo) &&
      (!categoria || categoriaItem === categoria) &&
      (!dataInicio || dataItem >= dataInicio) &&
      (!dataFim || dataItem <= dataFim)
    );
  });

  renderizarTransacoes(filtradas);
}

function renderizarTransacoes(transacoes) {
  if (transacoes.length === 0) {
    listaTransacoes.innerHTML = `
      <p class="text-sm text-slate-500">Nenhuma transação encontrada.</p>
    `;
    return;
  }

  listaTransacoes.innerHTML = transacoes.map((item) => {
    const cor = item.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500';
    const sinal = item.tipo === 'receita' ? '+' : '-';
    const tipoLabel = item.tipo === 'receita' ? 'Receita' : 'Despesa';

    return `
      <div class="border border-slate-100 rounded-2xl p-4">
        <div class="flex justify-between items-start gap-4">
          <div>
            <h3 class="font-bold text-slate-800">${item.descricao || tipoLabel}</h3>

            <p class="text-sm text-slate-500">
              ${tipoLabel} • ${item.categoria} • ${item.subcategoria || 'Sem subcategoria'} • ${item.tipo_gasto || 'Sem tipo'} • ${formatarDataHoraBrasil(item.data_transacao)}
            </p>
          </div>

          <strong class="${cor}">
            ${sinal} ${formatarMoeda(item.valor)}
          </strong>
        </div>

        <div class="flex gap-3 mt-4">
          <button
            onclick="iniciarEdicao(${item.id})"
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold">
            Editar
          </button>

          <button
            onclick="excluirTransacao(${item.id})"
            class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold">
            Excluir
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function iniciarEdicao(id) {
  const transacao = transacoesCache.find((item) => item.id === id);

  if (!transacao) return;

  transacaoIdInput.value = transacao.id;
  document.getElementById('tipo').value = transacao.tipo;
  document.getElementById('valor').value = transacao.valor;
  document.getElementById('descricao').value = transacao.descricao || '';
  dataInput.value = converterParaDatetimeLocal(transacao.data_transacao);

  categoriaSelect.value = transacao.categoria;
  carregarSubcategorias(transacao.categoria, transacao.subcategoria);
  tipoGastoSelect.value = transacao.tipo_gasto;
  metaSelect.value = transacao.meta_id || '';

  botaoSalvar.textContent = 'Atualizar transação';
  botaoCancelarEdicao.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
  formTransacao.reset();
  transacaoIdInput.value = '';
  botaoSalvar.textContent = 'Salvar transação';
  botaoCancelarEdicao.classList.add('hidden');
  metaSelect.value = '';

  subcategoriaSelect.innerHTML = `
    <option value="">Selecione a subcategoria</option>
  `;

  definirDataHoraAtual();
}

botaoCancelarEdicao.addEventListener('click', limparFormulario);

async function excluirTransacao(id) {
  const confirmar = confirm('Tem certeza que deseja excluir esta transação?');

  if (!confirmar) return;

  const resposta = await fetch(`/api/transacoes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.erro || 'Erro ao excluir transação.');
    return;
  }

  atualizarPainelFinanceiro();
}

formTransacao.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = transacaoIdInput.value;
  const tipo = document.getElementById('tipo').value;
  const valor = document.getElementById('valor').value;
  const categoria = categoriaSelect.value;
  const subcategoria = subcategoriaSelect.value;
  const tipo_gasto = tipoGastoSelect.value;
  const meta_id = metaSelect.value;
  const descricao = document.getElementById('descricao').value.trim();
  const data_transacao = dataInput.value;

  const url = id ? `/api/transacoes/${id}` : '/api/transacoes';
  const metodo = id ? 'PUT' : 'POST';

  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      tipo,
      valor,
      categoria,
      subcategoria,
      tipo_gasto,
      meta_id,
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

  limparFormulario();
  atualizarPainelFinanceiro();
});

botaoBuscarFiltros.addEventListener('click', aplicarFiltros);

[filtroTexto, filtroCategoria, filtroDataInicio, filtroDataFim]
  .forEach((campo) => {
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aplicarFiltros();
      }
    });
  });

filtroTipo.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    aplicarFiltros();
  }
});

limparFiltros.addEventListener('click', () => {
  filtroTexto.value = '';
  filtroTipo.value = '';
  filtroCategoria.value = '';
  filtroDataInicio.value = '';
  filtroDataFim.value = '';

  renderizarTransacoes(transacoesCache);
});

definirDataHoraAtual();
carregarCategorias();
carregarMetas();
atualizarPainelFinanceiro();