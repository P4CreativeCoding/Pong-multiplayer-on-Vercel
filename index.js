const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

const WebSocket = require("ws");
const wss = new WebSocket.Server ({ port: 8082})

wss.on("connection", ws => {

  console.log("Client ist connected");

  ws.on("message",  function message(data, isBinary) {
    const message = isBinary ? data : data.toString();

    console.log(message);
    ws.send(message);

  })

  ws.on("close", function close(code, data) {
    
    const reason = data.toString();
    console.log("Client hat disconnected");

  })

})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/Pong.html'));
});

app.get('/Pong.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/Pong.js'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});