const db = require('../config/database');

exports.uploadDocumento = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      erro: 'Nenhum arquivo enviado.'
    });
  }

  const usuarioId = req.usuario.id;

  const {
    originalname,
    filename,
    mimetype,
    size
  } = req.file;

  const caminho = req.file.path;

  db.query(
    `INSERT INTO documentos 
    (usuario_id, nome_original, nome_arquivo, caminho, tipo, tamanho)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [usuarioId, originalname, filename, caminho, mimetype, size],
    (erro) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao salvar documento.'
        });
      }

      return res.status(201).json({
        mensagem: 'Documento enviado com sucesso!'
      });
    }
  );
};

exports.listarDocumentos = (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT id, nome_original, tipo, tamanho, criado_em 
     FROM documentos 
     WHERE usuario_id = ? 
     ORDER BY criado_em DESC`,
    [usuarioId],
    (erro, documentos) => {
      if (erro) {
        return res.status(500).json({
          erro: 'Erro ao listar documentos.'
        });
      }

      return res.json(documentos);
    }
  );
};