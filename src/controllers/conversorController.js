const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.imagemParaPdf = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        erro: 'Nenhuma imagem enviada.'
      });
    }

    const pastaConvertidos = path.join(__dirname, '../../convertidos');

    if (!fs.existsSync(pastaConvertidos)) {
      fs.mkdirSync(pastaConvertidos, { recursive: true });
    }

    const nomePdf = `convertido-${Date.now()}.pdf`;
    const caminhoPdf = path.join(pastaConvertidos, nomePdf);

    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = fs.createWriteStream(caminhoPdf);

    doc.pipe(stream);

    req.files.forEach((arquivo) => {
      doc.addPage({
        size: 'A4',
        margin: 40
      });

      doc.image(arquivo.path, {
        fit: [515, 760],
        align: 'center',
        valign: 'center'
      });
    });

    doc.end();

    stream.on('finish', () => {
      return res.json({
        mensagem: 'PDF criado com sucesso!',
        arquivo: `/convertidos/${nomePdf}`
      });
    });

  } catch (erro) {
    console.log('Erro no conversor:', erro);

    return res.status(500).json({
      erro: 'Erro interno ao converter imagens.'
    });
  }
};