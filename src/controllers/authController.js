const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.cadastrar = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      erro: 'Preencha nome, email e senha.'
    });
  }

  if (senha.length < 6) {
    return res.status(400).json({
      erro: 'A senha precisa ter pelo menos 6 caracteres.'
    });
  }

  try {
    db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email],
      async (erro, resultado) => {
        if (erro) {
          return res.status(500).json({ erro: 'Erro ao verificar email.' });
        }

        if (resultado.length > 0) {
          return res.status(400).json({ erro: 'Este email já está cadastrado.' });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        db.query(
          'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
          [nome, email, senhaCriptografada],
          (erro) => {
            if (erro) {
              return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
            }

            return res.status(201).json({
              mensagem: 'Usuário cadastrado com sucesso!'
            });
          }
        );
      }
    );
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      erro: 'Preencha email e senha.'
    });
  }

  db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    async (erro, resultado) => {
      if (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
      }

      if (resultado.length === 0) {
        return res.status(401).json({ erro: 'Email ou senha inválidos.' });
      }

      const usuario = resultado[0];

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Email ou senha inválidos.' });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });
    }
  );
};