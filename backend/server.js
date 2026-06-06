require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.send('Ravari Store Running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server on ${PORT}`);
});
