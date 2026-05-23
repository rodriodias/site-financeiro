const db = require('../config/database');

exports.criarTransacao = (req, res) => {
  const usuarioId = req.usuario.id;

  const {
    tipo,
    valor,
    categoria,
    subcategoria,
    tipo_gasto,
    meta_id,
    descricao,
    data_transacao
  } = req.body;

  if (!tipo || !valor || !categoria || !subcategoria || !tipo_gasto || !data_transacao) {
    return res.status(400).json({
      erro: 'Preencha tipo, valor, categoria, subcategoria, tipo de gasto e data.'
    });
  }

  if (!['receita', 'despesa'].includes(tipo)) {
    return res.status(400).json({
      erro: 'Tipo inválido.'
    });
  }

  db.query(
    `INSERT INTO transacoes 
    (usuario_id, tipo, valor, categoria, subcategoria, tipo_gasto, meta_id, descricao, data_transacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      usuarioId,
      tipo,
      valor,
      categoria,
      subcategoria,
      tipo_gasto,
      meta_id || null,
      descricao || null,
      data_transacao
    ],
    (erro) => {
      if (erro) {
        console.log(erro);
        return res.status(500).json({ erro: 'Erro ao salvar transação.' });
      }

      if (tipo === 'receita' && meta_id) {
        db.query(
          `UPDATE metas_financeiras
           SET valor_atual = valor_atual + ?
           WHERE id = ?
           AND usuario_id = ?
           AND status = 'ativa'`,
          [valor, meta_id, usuarioId],
          () => {
            return res.status(201).json({
              mensagem: 'Transação cadastrada e meta atualizada com sucesso!'
            });
          }
        );
      } else {
        return res.status(201).json({
          mensagem: 'Transação cadastrada com sucesso!'
        });
      }
    }
  );
};

exports.listarTransacoes = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT 
      id,
      tipo,
      valor,
      categoria,
      subcategoria,
      tipo_gasto,
      meta_id,
      descricao,
      data_transacao,
      criado_em
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

exports.resumoMensal = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) AS receitas,
      SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) AS despesas
     FROM transacoes
     WHERE usuario_id = ?
     AND MONTH(data_transacao) = MONTH(CURRENT_DATE())
     AND YEAR(data_transacao) = YEAR(CURRENT_DATE())`,
    [usuarioId],
    (erro, resultado) => {
      if (erro) {
        return res.status(500).json({ erro: 'Erro ao gerar resumo mensal.' });
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

exports.gastosPorCategoria = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT categoria, SUM(valor) AS total
     FROM transacoes
     WHERE usuario_id = ?
     AND tipo = 'despesa'
     AND MONTH(data_transacao) = MONTH(CURRENT_DATE())
     AND YEAR(data_transacao) = YEAR(CURRENT_DATE())
     GROUP BY categoria
     ORDER BY total DESC`,
    [usuarioId],
    (erro, categorias) => {
      if (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar categorias.' });
      }

      return res.json(categorias);
    }
  );
};

exports.editarTransacao = (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  const {
    tipo,
    valor,
    categoria,
    subcategoria,
    tipo_gasto,
    meta_id,
    descricao,
    data_transacao
  } = req.body;

  if (!tipo || !valor || !categoria || !subcategoria || !tipo_gasto || !data_transacao) {
    return res.status(400).json({
      erro: 'Preencha tipo, valor, categoria, subcategoria, tipo de gasto e data.'
    });
  }

  if (!['receita', 'despesa'].includes(tipo)) {
    return res.status(400).json({
      erro: 'Tipo inválido.'
    });
  }

  db.query(
    `UPDATE transacoes
     SET tipo = ?, valor = ?, categoria = ?, subcategoria = ?, tipo_gasto = ?, meta_id = ?, descricao = ?, data_transacao = ?
     WHERE id = ? AND usuario_id = ?`,
    [
      tipo,
      valor,
      categoria,
      subcategoria,
      tipo_gasto,
      meta_id || null,
      descricao || null,
      data_transacao,
      id,
      usuarioId
    ],
    (erro, resultado) => {
      if (erro) {
        console.log(erro);
        return res.status(500).json({ erro: 'Erro ao editar transação.' });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: 'Transação não encontrada.' });
      }

      return res.json({
        mensagem: 'Transação atualizada com sucesso!'
      });
    }
  );
};

exports.excluirTransacao = (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  db.query(
    'DELETE FROM transacoes WHERE id = ? AND usuario_id = ?',
    [id, usuarioId],
    (erro, resultado) => {
      if (erro) {
        return res.status(500).json({ erro: 'Erro ao excluir transação.' });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ erro: 'Transação não encontrada.' });
      }

      return res.json({
        mensagem: 'Transação excluída com sucesso!'
      });
    }
  );
};