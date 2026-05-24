const db = require('../config/database');

exports.listarAlertas = async (req, res) => {
  const usuarioId = req.usuario.id;

  const alertas = [];

  db.query(
    `SELECT 
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
     GROUP BY o.id`,
    [usuarioId],
    (erro, orcamentos) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao gerar alertas.'
        });
      }

      orcamentos.forEach((orcamento) => {
        const gasto = Number(orcamento.valor_gasto || 0);
        const limite = Number(orcamento.valor_limite || 0);

        if (!limite) return;

        const porcentagem = (gasto / limite) * 100;

        if (porcentagem >= 100) {
          alertas.push({
            tipo: 'erro',
            mensagem: `Você ultrapassou o orçamento de ${orcamento.categoria}.`
          });
        } else if (porcentagem >= 80) {
          alertas.push({
            tipo: 'alerta',
            mensagem: `${orcamento.categoria} já consumiu ${porcentagem.toFixed(0)}% do orçamento.`
          });
        }
      });

      db.query(
        `SELECT *
         FROM metas_financeiras
         WHERE usuario_id = ?`,
        [usuarioId],
        (erroMetas, metas) => {
          if (erroMetas) {
            return res.status(500).json({
              erro: 'Erro ao verificar metas.'
            });
          }

          metas.forEach((meta) => {
            const atual = Number(meta.valor_atual || 0);
            const alvo = Number(meta.valor_meta || 0);

            if (!alvo) return;

            const porcentagem =
              (atual / alvo) * 100;

            if (porcentagem >= 100) {
              alertas.push({
                tipo: 'sucesso',
                mensagem: `Meta "${meta.titulo}" concluída com sucesso!`
              });
            }
          });

          return res.json(alertas);
        }
      );
    }
  );
};