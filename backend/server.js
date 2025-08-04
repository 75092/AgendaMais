
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Caminho absoluto para a pasta onde estão os ficheiros HTML/CSS
const publicPath = path.join(__dirname, '../Formação');

// Servir ficheiros estáticos
app.use(express.static(publicPath));

// Redirecionar "/" para "index.html"
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
