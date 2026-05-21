const formCadastro = document.getElementById('formCadastro');
const mensagem = document.getElementById('mensagem');

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  try {
    const resposta = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.erro;
      mensagem.className = 'mt-4 text-sm text-red-600';
      return;
    }

    mensagem.textContent = dados.mensagem;
    mensagem.className = 'mt-4 text-sm text-emerald-600';

    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1200);

  } catch (erro) {
    mensagem.textContent = 'Erro ao cadastrar. Tente novamente.';
    mensagem.className = 'mt-4 text-sm text-red-600';
  }
});