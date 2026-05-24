const db = require('../config/database');

exports.listarNotificacoes = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT *
     FROM notificacoes
     WHERE usuario_id = ?
     ORDER BY criado_em DESC`,
    [usuarioId],
    (erro, notificacoes) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao carregar notificações.'
        });
      }

      return res.json(notificacoes);
    }
  );
};

exports.marcarComoLida = (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  db.query(
    `UPDATE notificacoes
     SET lida = TRUE
     WHERE id = ? AND usuario_id = ?`,
    [id, usuarioId],
    (erro) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao atualizar notificação.'
        });
      }

      return res.json({
        mensagem: 'Notificação marcada como lida.'
      });
    }
  );
};

exports.marcarTodasComoLidas = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `UPDATE notificacoes
     SET lida = TRUE
     WHERE usuario_id = ?`,
    [usuarioId],
    (erro) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao atualizar notificações.'
        });
      }

      return res.json({
        mensagem: 'Todas notificações marcadas como lidas.'
      });
    }
  );
};

exports.excluirNotificacao = (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  db.query(
    `DELETE FROM notificacoes
     WHERE id = ? AND usuario_id = ?`,
    [id, usuarioId],
    (erro) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao excluir notificação.'
        });
      }

      return res.json({
        mensagem: 'Notificação removida.'
      });
    }
  );
};

exports.limparNotificacoes = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `DELETE FROM notificacoes
     WHERE usuario_id = ?`,
    [usuarioId],
    (erro) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao limpar notificações.'
        });
      }

      return res.json({
        mensagem: 'Notificações removidas.'
      });
    }
  );
};