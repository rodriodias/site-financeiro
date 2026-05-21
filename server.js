const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');
const perfilRoutes = require('./src/routes/perfilRoutes');
const documentoRoutes = require('./src/routes/documentoRoutes');
const conversorRoutes = require('./src/routes/conversorRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/conversores', conversorRoutes);
app.use('/convertidos', express.static('convertidos'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});