const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      erro: 'Token não informado.'
    });
  }

  const partes = authHeader.split(' ');

  if (partes.length !== 2) {
    return res.status(401).json({
      erro: 'Token inválido.'
    });
  }

  const [tipo, token] = partes;

  if (tipo !== 'Bearer') {
    return res.status(401).json({
      erro: 'Formato do token inválido.'
    });
  }

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = usuario;

    next();
  } catch (erro) {
    return res.status(401).json({
      erro: 'Token expirado ou inválido.'
    });
  }
}

module.exports = autenticarToken;