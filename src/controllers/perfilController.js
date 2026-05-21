exports.meuPerfil = (req, res) => {
  return res.json({
    mensagem: 'Área privada acessada com sucesso.',
    usuario: req.usuario
  });
};