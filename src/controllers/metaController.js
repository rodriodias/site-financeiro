const db = require('../config/database');

exports.criarMeta = (req, res) => {
  const usuarioId = req.usuario.id;

  const {
    titulo,
    valor_meta,
    valor_atual,
    prazo,
    categoria_relacionada
  } = req.body;

  if (!titulo || !valor_meta) {
    return res.status(400).json({
      erro: 'Título e valor da meta são obrigatórios.'
    });
  }

  db.query(
    `INSERT INTO metas_financeiras
    (usuario_id, titulo, valor_meta, valor_atual, prazo, categoria_relacionada)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      usuarioId,
      titulo,
      valor_meta,
      valor_atual || 0,
      prazo || null,
      categoria_relacionada || null
    ],
    (erro) => {
      if (erro) {
        console.log(erro);

        return res.status(500).json({
          erro: 'Erro ao criar meta.'
        });
      }

      return res.status(201).json({
        mensagem: 'Meta criada com sucesso!'
      });
    }
  );
};

exports.listarMetas = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT *
     FROM metas_financeiras
     WHERE usuario_id = ?
     ORDER BY criado_em DESC`,
    [usuarioId],
    (erro, metas) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao listar metas.'
        });
      }

      return res.json(metas);
    }
  );
};

exports.editarMeta = (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  const {
    titulo,
    valor_meta,
    valor_atual,
    prazo,
    categoria_relacionada,
    status
  } = req.body;

  if (!titulo || !valor_meta) {
    return res.status(400).json({
      erro: 'Título e valor da meta são obrigatórios.'
    });
  }

  db.query(
    `UPDATE metas_financeiras
     SET titulo = ?, valor_meta = ?, valor_atual = ?, prazo = ?, categoria_relacionada = ?, status = ?
     WHERE id = ? AND usuario_id = ?`,
    [
      titulo,
      valor_meta,
      valor_atual || 0,
      prazo || null,
      categoria_relacionada || null,
      status || 'ativa',
      id,
      usuarioId
    ],
    (erro, resultado) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao editar meta.'
        });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          erro: 'Meta não encontrada.'
        });
      }

      return res.json({
        mensagem: 'Meta atualizada com sucesso!'
      });
    }
  );
};

exports.excluirMeta = (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  db.query(
    `DELETE FROM metas_financeiras
     WHERE id = ? AND usuario_id = ?`,
    [id, usuarioId],
    (erro, resultado) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao excluir meta.'
        });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          erro: 'Meta não encontrada.'
        });
      }

      return res.json({
        mensagem: 'Meta excluída com sucesso!'
      });
    }
  );
};