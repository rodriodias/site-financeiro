const db = require('../config/database');

function criarNotificacao(usuarioId, tipo, titulo, mensagem, origem = 'financeiro') {
  db.query(
    `INSERT INTO notificacoes
     (usuario_id, tipo, titulo, mensagem, origem)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, tipo, titulo, mensagem, origem],
    (erro) => {
      if (erro) {
        console.log('Erro ao criar notificação:', erro);
      }
    }
  );
}

function verificarOrcamento(usuarioId, categoria, dataTransacao) {
  const data = new Date(dataTransacao);
  const mes = data.getMonth() + 1;
  const ano = data.getFullYear();

  db.query(
    `SELECT 
      o.id,
      o.categoria,
      o.valor_limite,
      COALESCE(SUM(t.valor), 0) AS valor_gasto
     FROM orcamentos_mensais o
     LEFT JOIN transacoes t
      ON t.usuario_id = o.usuario_id
      AND t.categoria = o.categoria
      AND t.tipo = 'despesa'
      AND MONTH(t.data_transacao) = o.mes
      AND YEAR(t.data_transacao) = o.ano
     WHERE o.usuario_id = ?
     AND o.categoria = ?
     AND o.mes = ?
     AND o.ano = ?
     GROUP BY o.id`,
    [usuarioId, categoria, mes, ano],
    (erro, orcamentos) => {
      if (erro) {
        console.log('Erro ao verificar orçamento:', erro);
        return;
      }

      if (!orcamentos || orcamentos.length === 0) return;

      const orcamento = orcamentos[0];

      const limite = Number(orcamento.valor_limite || 0);
      const gasto = Number(orcamento.valor_gasto || 0);

      if (!limite) return;

      const porcentagem = (gasto / limite) * 100;

      if (porcentagem >= 100) {
        criarNotificacao(
          usuarioId,
          'erro',
          'Orçamento estourado',
          `Você ultrapassou o orçamento de ${orcamento.categoria}.`,
          'orcamento'
        );
      } else if (porcentagem >= 80) {
        criarNotificacao(
          usuarioId,
          'alerta',
          'Orçamento quase no limite',
          `${orcamento.categoria} já consumiu ${porcentagem.toFixed(0)}% do orçamento.`,
          'orcamento'
        );
      }
    }
  );
}

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

      if (tipo === 'despesa') {
        verificarOrcamento(usuarioId, categoria, data_transacao);
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

      db.query(
        `SELECT
          id,
          titulo,
          valor_meta,
          valor_atual,
          status
         FROM metas_financeiras
         WHERE id = ?
         AND usuario_id = ?`,
        [meta_id, usuarioId],
        (erroMeta, metas) => {

          if (erroMeta || metas.length === 0) {
            return res.status(201).json({
              mensagem: 'Transação cadastrada e meta atualizada com sucesso!'
            });
          }

          const meta = metas[0];

          const valorMeta =
            Number(meta.valor_meta || 0);

          const valorAtual =
            Number(meta.valor_atual || 0);

          if (
            valorMeta > 0 &&
            valorAtual >= valorMeta &&
            meta.status !== 'concluida'
          ) {

            db.query(
              `UPDATE metas_financeiras
               SET status = 'concluida'
               WHERE id = ?
               AND usuario_id = ?`,
              [meta_id, usuarioId],
              () => {

                criarNotificacao(
                  usuarioId,
                  'sucesso',
                  'Meta concluída',
                  `Parabéns! Você concluiu a meta "${meta.titulo}".`,
                  'metas'
                );

                return res.status(201).json({
                  mensagem:
                    'Transação cadastrada, meta concluída com sucesso!'
                });

              }
            );

          } else {

            return res.status(201).json({
              mensagem:
                'Transação cadastrada e meta atualizada com sucesso!'
            });

          }

        }
      );

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