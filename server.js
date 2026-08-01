const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 8080);
// On Railway, set API_URL to the public backend URL, e.g. https://<backend>.up.railway.app/api
const apiUrl = process.env.API_URL || 'https://atas-app-api-production.up.railway.app/api';
const distCandidates = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'dist', 'atas-ui'),
  path.join(__dirname, 'dist', 'atas-ui', 'browser'),
];
const distPath = distCandidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html'))) || distCandidates[0];
const indexPath = path.join(distPath, 'index.html');

app.get('/runtime-config.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.__APP_CONFIG__ = { apiUrl: ${JSON.stringify(apiUrl)} };`);
});

app.use(express.static(distPath));
app.use((_req, res) => {
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`Servidor pronto na porta ${port}`);
});
