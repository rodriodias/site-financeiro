const token = localStorage.getItem('token');
const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));

if (!token || !usuarioLocal) {
  window.location.href = '/login.html';
}

async function carregarPerfil() {
  try {
    const resposta = await fetch('/api/perfil', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login.html';
      return;
    }

    document.getElementById('usuarioNome').textContent = dados.usuario.nome;

  } catch (erro) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');

  window.location.href = '/login.html';
}

carregarPerfil();