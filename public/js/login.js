const formLogin = document.getElementById('formLogin');
const mensagem = document.getElementById('mensagem');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  try {
    const resposta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.erro;
      mensagem.className = 'mt-4 text-sm text-red-600';
      return;
    }

    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));

    mensagem.textContent = 'Login realizado com sucesso!';
    mensagem.className = 'mt-4 text-sm text-emerald-600';

    setTimeout(() => {
      window.location.href = '/perfil.html';
    }, 1000);

  } catch (erro) {
    mensagem.textContent = 'Erro ao fazer login. Tente novamente.';
    mensagem.className = 'mt-4 text-sm text-red-600';
  }
});