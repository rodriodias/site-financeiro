const db = require('../config/database');

exports.listarCategorias = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT id, nome, subcategoria, tipo_gasto, padrao
     FROM categorias
     WHERE padrao = TRUE OR usuario_id = ?
     ORDER BY nome ASC, subcategoria ASC`,
    [usuarioId],
    (erro, categorias) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao listar categorias.'
        });
      }

      return res.json(categorias);
    }
  );
};

exports.criarCategoria = (req, res) => {
  const usuarioId = req.usuario.id;
  const { nome, subcategoria, tipo_gasto } = req.body;

  if (!nome || !subcategoria || !tipo_gasto) {
    return res.status(400).json({
      erro: 'Preencha categoria, subcategoria e tipo de gasto.'
    });
  }

  db.query(
    `INSERT INTO categorias
     (usuario_id, nome, subcategoria, tipo_gasto, padrao)
     VALUES (?, ?, ?, ?, FALSE)`,
    [usuarioId, nome, subcategoria, tipo_gasto],
    (erro) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao criar categoria.'
        });
      }

      return res.status(201).json({
        mensagem: 'Categoria criada com sucesso!'
      });
    }
  );
};

exports.excluirCategoria = (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  db.query(
    `SELECT id, usuario_id, padrao
     FROM categorias
     WHERE id = ?`,
    [id],
    (erro, resultado) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao verificar categoria.'
        });
      }

      if (resultado.length === 0) {
        return res.status(404).json({
          erro: 'Categoria não encontrada.'
        });
      }

      const categoria = resultado[0];

      if (categoria.padrao) {
        return res.status(403).json({
          erro: 'Categorias padrão não podem ser excluídas.'
        });
      }

      if (categoria.usuario_id !== usuarioId) {
        return res.status(403).json({
          erro: 'Você não tem permissão para excluir esta categoria.'
        });
      }

      db.query(
        `DELETE FROM categorias WHERE id = ? AND usuario_id = ?`,
        [id, usuarioId],
        (erro) => {
          if (erro) {
            return res.status(500).json({
              erro: 'Erro ao excluir categoria.'
            });
          }

          return res.json({
            mensagem: 'Categoria excluída com sucesso!'
          });
        }
      );
    }
  );
};