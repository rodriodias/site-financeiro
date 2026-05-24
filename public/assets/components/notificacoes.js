async function iniciarNotificacoes() {
  const token = localStorage.getItem('token');

  if (!token) return;

  const botao = document.getElementById('botaoNotificacoes');
  const dropdown = document.getElementById('dropdownNotificacoes');
  const lista = document.getElementById('listaNotificacoes');
  const contador = document.getElementById('contadorNotificacoes');
  const marcarTodas = document.getElementById('marcarTodasLidas');
  const limparTodas = document.getElementById('limparNotificacoes');

  if (!botao || !dropdown || !lista || !contador) return;

  async function carregarNotificacoes() {
    const resposta = await fetch('/api/notificacoes', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const notificacoes = await resposta.json();

    if (!resposta.ok) {
      lista.innerHTML = `
        <div class="p-5 text-sm text-red-600">
          Erro ao carregar notificações.
        </div>
      `;
      return;
    }

    const naoLidas = notificacoes.filter((item) => !item.lida);

    if (naoLidas.length > 0) {
      contador.textContent = naoLidas.length;
      contador.classList.remove('hidden');
    } else {
      contador.classList.add('hidden');
    }

    if (notificacoes.length === 0) {
      lista.innerHTML = `
        <div class="p-5 text-sm text-slate-500">
          Nenhuma notificação.
        </div>
      `;
      return;
    }

    lista.innerHTML = notificacoes.map((item) => {
      const destaque = item.lida
        ? 'bg-white'
        : 'bg-emerald-50';

      return `
        <div
          onclick="marcarNotificacaoComoLida(${item.id})"
          class="${destaque} border-b border-slate-100 p-4 cursor-pointer hover:bg-slate-50">

          <div class="flex justify-between gap-3">
            <div>
              <h3 class="font-bold text-sm text-slate-900">
                ${item.titulo}
              </h3>

              <p class="text-sm text-slate-500 mt-1">
                ${item.mensagem}
              </p>

              <p class="text-xs text-slate-400 mt-2">
                ${new Date(item.criado_em).toLocaleString('pt-BR')}
              </p>
            </div>

            <button
              onclick="event.stopPropagation(); excluirNotificacao(${item.id})"
              class="text-red-500 hover:text-red-700 text-sm font-bold">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  botao.addEventListener('click', (e) => {
    e.stopPropagation();

    dropdown.classList.toggle('hidden');

    if (!dropdown.classList.contains('hidden')) {
      carregarNotificacoes();
    }
  });

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
  });

  marcarTodas.addEventListener('click', async () => {
    await fetch('/api/notificacoes/marcar-todas', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    carregarNotificacoes();
  });

  limparTodas.addEventListener('click', async () => {
    await fetch('/api/notificacoes', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    carregarNotificacoes();
  });

  window.marcarNotificacaoComoLida = async (id) => {
    await fetch(`/api/notificacoes/${id}/lida`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    carregarNotificacoes();
  };

  window.excluirNotificacao = async (id) => {
    await fetch(`/api/notificacoes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    carregarNotificacoes();
  };

  carregarNotificacoes();
}

document.addEventListener('DOMContentLoaded', iniciarNotificacoes);