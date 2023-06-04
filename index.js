const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/Pong.html'));
});

app.get('/Pong.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/Pong.js'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});