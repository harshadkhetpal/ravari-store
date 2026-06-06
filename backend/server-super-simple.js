#!/usr/bin/env node
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`STARTED ON PORT ${port}`);
});
