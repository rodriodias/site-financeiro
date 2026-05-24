function criarTopbar(titulo, subtitulo = '') {
  return `
    <header class="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          ${titulo}
        </h1>

        <p class="text-sm text-slate-500">
          ${subtitulo}
        </p>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative">
          <button
            id="botaoNotificacoes"
            class="relative bg-slate-100 hover:bg-slate-200 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition">
            🔔

            <span
              id="contadorNotificacoes"
              class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
              0
            </span>
          </button>

          <div
            id="dropdownNotificacoes"
            class="hidden absolute right-0 mt-3 w-[380px] bg-white border border-slate-100 rounded-3xl shadow-xl z-50 overflow-hidden">

            <div class="p-5 border-b border-slate-100">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-bold text-slate-900">
                    Notificações
                  </h2>

                  <p class="text-xs text-slate-500 mt-1">
                    Alertas e atualizações do sistema.
                  </p>
                </div>

                <span class="text-xl">🔔</span>
              </div>
            </div>

            <div
              id="listaNotificacoes"
              class="max-h-[420px] overflow-y-auto">
              <div class="p-5 text-sm text-slate-500">
                Nenhuma notificação.
              </div>
            </div>

            <div class="border-t border-slate-100 p-3 flex gap-2">
              <button
                id="marcarTodasLidas"
                class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold transition">
                Marcar todas
              </button>

              <button
                id="limparNotificacoes"
                class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-sm font-bold transition">
                Limpar tudo
              </button>
            </div>
          </div>
        </div>

        <button
          onclick="logout()"
          class="md:hidden bg-slate-900 text-white px-4 py-2 rounded-xl">
          Sair
        </button>
      </div>
    </header>
  `;
}