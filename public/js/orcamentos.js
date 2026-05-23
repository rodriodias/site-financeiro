const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

const formOrcamento = document.getElementById('formOrcamento');
const mensagem = document.getElementById('mensagem');
const listaOrcamentos = document.getElementById('listaOrcamentos');
const categoriaSelect = document.getElementById('categoria');

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
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

  categoriaSelect.innerHTML = `
    <option value="">Selecione uma categoria</option>
  `;

  categoriasPrincipais.forEach((categoria) => {
    categoriaSelect.innerHTML += `
      <option value="${categoria}">
        ${categoria}
      </option>
    `;
  });
}

async function carregarOrcamentos() {
  const resposta = await fetch('/api/orcamentos', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const orcamentos = await resposta.json();

  if (!resposta.ok) {
    listaOrcamentos.innerHTML = `
      <p class="text-sm text-red-600">
        Erro ao carregar orçamentos.
      </p>
    `;
    return;
  }

  if (orcamentos.length === 0) {
    listaOrcamentos.innerHTML = `
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <p class="text-slate-500 text-sm">
          Nenhum orçamento cadastrado ainda.
        </p>
      </div>
    `;
    return;
  }

  listaOrcamentos.innerHTML = orcamentos.map((orcamento) => {
    const meses = {
      1: 'Janeiro',
      2: 'Fevereiro',
      3: 'Março',
      4: 'Abril',
      5: 'Maio',
      6: 'Junho',
      7: 'Julho',
      8: 'Agosto',
      9: 'Setembro',
      10: 'Outubro',
      11: 'Novembro',
      12: 'Dezembro'
    };

    const valorGasto = Number(orcamento.valor_gasto || 0);
    const valorLimite = Number(orcamento.valor_limite || 0);

    const porcentagem = valorLimite > 0
      ? Math.min(((valorGasto / valorLimite) * 100).toFixed(1), 100)
      : 0;

    const restante = valorLimite - valorGasto;

    const corBarra = porcentagem >= 100
      ? 'bg-red-500'
      : porcentagem >= 80
        ? 'bg-amber-500'
        : 'bg-emerald-500';

    const statusTexto = porcentagem >= 100
      ? 'Estourado'
      : porcentagem >= 80
        ? 'Atenção'
        : 'Dentro do limite';

    const statusClasse = porcentagem >= 100
      ? 'bg-red-50 text-red-600'
      : porcentagem >= 80
        ? 'bg-amber-50 text-amber-700'
        : 'bg-emerald-50 text-emerald-700';

    return `
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">

        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              ${orcamento.categoria}
            </h3>

            <p class="text-sm text-slate-500 mt-1">
              ${meses[orcamento.mes]} / ${orcamento.ano}
            </p>
          </div>

          <span class="${statusClasse} text-xs font-bold px-3 py-1 rounded-full">
            ${statusTexto}
          </span>
        </div>

        <div class="mt-6 space-y-4">

          <div>
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-slate-500">
                Utilizado
              </span>

              <strong class="text-slate-900">
                ${porcentagem}%
              </strong>
            </div>

            <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full ${corBarra} rounded-full"
                style="width: ${porcentagem}%;">
              </div>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Gasto</span>
              <strong class="text-red-500">${formatarMoeda(valorGasto)}</strong>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500">Limite</span>
              <strong class="text-slate-900">${formatarMoeda(valorLimite)}</strong>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500">Restante</span>
              <strong class="${restante < 0 ? 'text-red-500' : 'text-emerald-600'}">
                ${formatarMoeda(restante)}
              </strong>
            </div>
          </div>

        </div>

      </div>
    `;
  }).join('');
}

formOrcamento.addEventListener('submit', async (e) => {
  e.preventDefault();

  const categoria = categoriaSelect.value;
  const valor_limite = document.getElementById('valor_limite').value;
  const mes = document.getElementById('mes').value;
  const ano = document.getElementById('ano').value;

  const resposta = await fetch('/api/orcamentos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      categoria,
      valor_limite,
      mes,
      ano
    })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagem.textContent =
      dados.erro || 'Erro ao salvar orçamento.';

    mensagem.className =
      'mt-4 text-sm text-red-600';

    return;
  }

  mensagem.textContent = dados.mensagem;

  mensagem.className =
    'mt-4 text-sm text-emerald-600';

  formOrcamento.reset();

  document.getElementById('ano').value =
    new Date().getFullYear();

  document.getElementById('mes').value =
    new Date().getMonth() + 1;

  carregarOrcamentos();
});

document.getElementById('ano').value =
  new Date().getFullYear();

document.getElementById('mes').value =
  new Date().getMonth() + 1;

carregarCategorias();
carregarOrcamentos();