function criarSidebar(paginaAtual = '') {
  return `
    <aside class="hidden md:flex w-72 bg-slate-900 text-white p-6 flex-col">

      <div class="text-2xl font-bold text-emerald-400 mb-10">
        MeuFinanças
      </div>

      <nav class="space-y-3">

        <a
          class="block px-4 py-3 rounded-xl ${
            paginaAtual === 'dashboard'
              ? 'bg-emerald-600 font-semibold'
              : 'hover:bg-slate-800'
          }"
          href="/perfil.html">
          Dashboard
        </a>

        <a
          class="block px-4 py-3 rounded-xl ${
            paginaAtual === 'financeiro'
              ? 'bg-emerald-600 font-semibold'
              : 'hover:bg-slate-800'
          }"
          href="/financeiro.html">
          Minhas finanças
        </a>

        <a
  class="block px-4 py-3 rounded-xl ${
    paginaAtual === 'metas'
      ? 'bg-emerald-600 font-semibold'
      : 'hover:bg-slate-800'
  }"
  href="/metas.html">
  Metas financeiras
</a>
<a
  class="block px-4 py-3 rounded-xl ${
    paginaAtual === 'orcamentos'
      ? 'bg-emerald-600 font-semibold'
      : 'hover:bg-slate-800'
  }"
  href="/orcamentos.html">
  Orçamentos mensais
</a>

        <a
          class="block px-4 py-3 rounded-xl ${
            paginaAtual === 'documentos'
              ? 'bg-emerald-600 font-semibold'
              : 'hover:bg-slate-800'
          }"
          href="/documentos.html">
          Documentos
        </a>

        <a
          class="block px-4 py-3 rounded-xl hover:bg-slate-800"
          href="/imagem-para-pdf.html">
          Conversores
        </a>
        

      </nav>

      <button
        onclick="logout()"
        class="mt-auto bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl">
        Sair
      </button>

    </aside>
  `;
}