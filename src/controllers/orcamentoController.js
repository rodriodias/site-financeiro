const db = require('../config/database');

exports.criarOrcamento = (req, res) => {
  const usuarioId = req.usuario.id;

  const {
    categoria,
    valor_limite,
    mes,
    ano
  } = req.body;

  if (!categoria || !valor_limite || !mes || !ano) {
    return res.status(400).json({
      erro: 'Preencha categoria, valor limite, mês e ano.'
    });
  }

  db.query(
    `INSERT INTO orcamentos_mensais
    (usuario_id, categoria, valor_limite, mes, ano)
    VALUES (?, ?, ?, ?, ?)`,
    [
      usuarioId,
      categoria,
      valor_limite,
      mes,
      ano
    ],
    (erro) => {
      if (erro) {
        console.log(erro);

        return res.status(500).json({
          erro: 'Erro ao criar orçamento.'
        });
      }

      return res.status(201).json({
        mensagem: 'Orçamento criado com sucesso!'
      });
    }
  );
};

exports.listarOrcamentos = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT 
      o.*,
      COALESCE(SUM(t.valor), 0) AS valor_gasto
     FROM orcamentos_mensais o
     LEFT JOIN transacoes t
      ON t.usuario_id = o.usuario_id
      AND t.categoria = o.categoria
      AND t.tipo = 'despesa'
      AND MONTH(t.data_transacao) = o.mes
      AND YEAR(t.data_transacao) = o.ano
     WHERE o.usuario_id = ?
     GROUP BY o.id
     ORDER BY o.ano DESC, o.mes DESC`,
    [usuarioId],
    (erro, orcamentos) => {
      if (erro) {
        console.log(erro);

        return res.status(500).json({
          erro: 'Erro ao listar orçamentos.'
        });
      }

      return res.json(orcamentos);
    }
  );
};