const db = require('../config/database');

exports.criarTransacao = (req, res) => {
  const usuarioId = req.usuario.id;
  const { tipo, valor, categoria, descricao, data_transacao } = req.body;

  if (!tipo || !valor || !categoria || !data_transacao) {
    return res.status(400).json({
      erro: 'Preencha tipo, valor, categoria e data.'
    });
  }

  if (!['receita', 'despesa'].includes(tipo)) {
    return res.status(400).json({
      erro: 'Tipo inválido.'
    });
  }

  db.query(
    `INSERT INTO transacoes 
    (usuario_id, tipo, valor, categoria, descricao, data_transacao)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [usuarioId, tipo, valor, categoria, descricao || null, data_transacao],
    (erro) => {
      if (erro) {
        return res.status(500).json({ erro: 'Erro ao salvar transação.' });
      }

      return res.status(201).json({
        mensagem: 'Transação cadastrada com sucesso!'
      });
    }
  );
};

exports.listarTransacoes = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT id, tipo, valor, categoria, descricao, data_transacao, criado_em
     FROM transacoes
     WHERE usuario_id = ?
     ORDER BY data_transacao DESC, id DESC`,
    [usuarioId],
    (erro, transacoes) => {
      if (erro) {
        return res.status(500).json({ erro: 'Erro ao listar transações.' });
      }

      return res.json(transacoes);
    }
  );
};

exports.resumoFinanceiro = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) AS receitas,
      SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) AS despesas
     FROM transacoes
     WHERE usuario_id = ?`,
    [usuarioId],
    (erro, resultado) => {
      if (erro) {
        return res.status(500).json({ erro: 'Erro ao gerar resumo.' });
      }

      const receitas = Number(resultado[0].receitas || 0);
      const despesas = Number(resultado[0].despesas || 0);

      return res.json({
        receitas,
        despesas,
        saldo: receitas - despesas
      });
    }
  );
};