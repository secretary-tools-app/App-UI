const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 8080);
// On Railway, set API_URL to the public backend URL, e.g. https://<backend>.up.railway.app/api
const apiUrl = process.env.API_URL || '/api';
const distPath = path.join(__dirname, 'dist');

app.get('/runtime-config.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.__APP_CONFIG__ = { apiUrl: ${JSON.stringify(apiUrl)} };`);
});

app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor pronto na porta ${port}`);
});
