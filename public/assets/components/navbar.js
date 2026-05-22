function criarNavbar() {
  return `
    <header class="bg-white border-b border-slate-100 sticky top-0 z-50">

      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <a href="/" class="text-2xl font-bold text-emerald-600">
          MeuFinanças
        </a>

        <nav class="hidden md:flex items-center gap-8">

          <a href="#ferramentas" class="text-slate-600 hover:text-emerald-600">
            Ferramentas
          </a>

          <a href="#beneficios" class="text-slate-600 hover:text-emerald-600">
            Benefícios
          </a>

          <a href="/imagem-para-pdf.html" class="text-slate-600 hover:text-emerald-600">
            Conversores
          </a>

        </nav>

        <div class="flex items-center gap-3">

          <a
            href="/login.html"
            class="text-slate-700 font-medium">
            Entrar
          </a>

          <a
            href="/cadastro.html"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-semibold">
            Criar conta
          </a>

        </div>

      </div>

    </header>
  `;
}